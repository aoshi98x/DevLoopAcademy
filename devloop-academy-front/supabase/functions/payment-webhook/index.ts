import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Llave maestra para saltar RLS
    )

    const body = await req.json()
    console.log("Evento recibido:", body)

    let reference = ""
    let status = ""
    let paymentMethod = ""

    // --- LÓGICA PARA WOMPI ---
    if (body.event === "transaction.updated") {
      const { transaction } = body.data
      reference = transaction.reference
      status = transaction.status // "APPROVED", "DECLINED", "VOIDED"
      paymentMethod = "wompi"
    } 
    // --- LÓGICA PARA PAYPAL ---
    else if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      reference = body.resource.custom_id // Aquí guardamos nuestra referencia personalizada
      status = "APPROVED"
      paymentMethod = "paypal"
    }

    if (status === "APPROVED") {
      // 1. Buscar los detalles del pago en nuestro log
      const { data: log, error: logError } = await supabase
        .from('payments_log')
        .select('*')
        .eq('reference', reference)
        .single()

      if (logError || !log) throw new Error("Referencia de pago no encontrada en log")

      // 2. Actualizar estado del log
      await supabase.from('payments_log').update({ status: 'approved' }).eq('reference', reference)

      // 3. ACTIVAR PRODUCTO
      if (log.product_type === 'subscription') {
        // Calcular fecha de fin según el plan
        let daysToAdd = 30
        if (log.product_id === 'quarterly') daysToAdd = 90
        if (log.product_id === 'semiannual') daysToAdd = 180
        if (log.product_id === 'annual') daysToAdd = 365

        const endDate = new Date()
        endDate.setDate(endDate.getDate() + daysToAdd)

        await supabase.from('profiles').update({
          is_active: true,
          subscription_end_date: endDate.toISOString()
        }).eq('id', log.user_id)

      } else if (log.product_type === 'lifetime') {
        // Registrar compra vitalicia de curso
        await supabase.from('course_purchases').insert({
          user_id: log.user_id,
          course_id: log.product_id,
          purchase_price: log.amount
        })
      }

      return new Response(JSON.stringify({ message: "Acceso activado correctamente" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ message: "Evento procesado sin cambios" }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})