import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSettings() {
    const [mode, setMode] = useState('test'); // por defecto test
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('payment_mode').single();
            if (data) setMode(data.payment_mode);
            setLoading(false);
        };
        fetchSettings();
    }, []);

    // Función para obtener las llaves correctas según el modo
    const getPaymentKeys = () => {
        const isProd = mode === 'prod';
        return {
            wompi: isProd ? import.meta.env.VITE_WOMPI_PUBLIC_KEY_PROD : import.meta.env.VITE_WOMPI_PUBLIC_KEY_TEST,
            paypal: isProd ? import.meta.env.VITE_PAYPAL_CLIENT_ID_PROD : import.meta.env.VITE_PAYPAL_CLIENT_ID_TEST,
            mode: mode
        };
    };

    return { mode, getPaymentKeys, loading };
}