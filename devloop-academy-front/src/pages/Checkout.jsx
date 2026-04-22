import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabaseClient';
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function Checkout() {
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('wompi'); // 'wompi' o 'paypal'
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice, currency, isForeign, loadingCurrency, exchangeRate } = useCurrency();
  const { getPaymentKeys } = useSettings();
  const keys = getPaymentKeys();
  useEffect(() => {
    const savedOrder = localStorage.getItem('devloop_checkout');
    if (savedOrder) setOrder(JSON.parse(savedOrder));
    else navigate('/');
  }, [navigate]);

  // Lógica para Wompi (Igual a la anterior)
  const handleWompi = async () => {
    setIsProcessing(true);
    const reference = `DL-W-${user.id.slice(0,4)}-${Date.now()}`;
    
    try {
      await supabase.from('payments_log').insert([{
        user_id: user.id, reference, amount: order.price,
        currency: 'COP', product_id: order.id, product_type: order.type, payment_method: 'wompi'
      }]);

      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: Math.round(order.price * 100), // Usar Math.round evita decimales extraños que Wompi rechaza
        reference: reference,
        publicKey: keys.wompi,
        redirectUrl: `${window.location.origin}/dashboard`,
      });
      checkout.open((res) => { if(res.transaction.status === 'APPROVED') navigate('/dashboard'); });
    } catch (e) { setIsProcessing(false); }
  };

  if (!order || loadingCurrency) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div></div>;

  return (
    <div className="min-h-screen py-12 md:py-20 px-4 flex justify-center items-center">
      <div className="max-w-5xl w-full bg-black/80 backdrop-blur-md rounded-3xl border border-gray-800 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-10">
        
        {/* COLUMNA IZQUIERDA: Resumen */}
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl font-extrabold text-white">Finalizar Suscripción</h1>
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-blue-400 font-bold uppercase mb-2">{order.type}</p>
            <h2 className="text-xl font-bold text-white mb-4">{order.name}</h2>
            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
              <span className="text-gray-400">Total:</span>
              <span className="text-3xl font-extrabold text-white">{formatPrice(order.price)}</span>
            </div>
          </div>
          {isForeign && <p className="text-[10px] text-gray-500 italic">El cobro se procesa en COP. PayPal convertirá a USD automáticamente.</p>}
        </div>

        {/* COLUMNA DERECHA: Selector de Pago */}
        <div className="flex-1 space-y-6">
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button onClick={() => setMethod('wompi')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${method === 'wompi' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Wompi (COP)</button>
            <button onClick={() => setMethod('paypal')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${method === 'paypal' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>PayPal (USD)</button>
          </div>

          <div className="min-h-[200px] flex flex-col justify-center">
            {method === 'wompi' ? (
              <button 
                onClick={handleWompi}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-3"
              >
                <img src="https://public-assets.wompi.com/brand_wompi/logos/logo-primary.svg" className="h-4 invert" alt="Wompi" />
                Pagar con Wompi
              </button>
            ) : (
              <PayPalButtons 
                style={{ layout: "vertical", color: "gold", shape: "rect" }}
                options={{ "client-id": keys.paypal }}
                createOrder={(data, actions) => {
                  // Convertimos el precio de COP a USD para PayPal
                  const priceUSD = (order.price / 4000).toFixed(2); // Ajuste manual o usar exchangeRate
                  return actions.order.create({
                    purchase_units: [{
                      amount: { value: priceUSD },
                      description: order.name,
                      custom_id: order.id
                    }]
                  });
                }}
                onApprove={async (data, actions) => {
                  const details = await actions.order.capture();
                  // Aquí llamaríamos a Supabase para activar el curso
                  alert("Pago exitoso vía PayPal, " + details.payer.name.given_name);
                  navigate('/dashboard');
                }}
              />
            )}
          </div>

          <p className="text-[10px] text-center text-gray-500">Transacción protegida con cifrado SSL de 256 bits.</p>
        </div>

      </div>
    </div>
  );
}