import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('COP');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isForeign, setIsForeign] = useState(false);
  const [loadingCurrency, setLoadingCurrency] = useState(true);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        // 1. Intentamos con una API más estable y amigable con CORS
        const geoRes = await fetch('https://ipwho.is/');
        
        // Si la API falla o da error de límite, lanzamos error para ir al catch
        if (!geoRes.ok) throw new Error("Límite de API alcanzado");

        const geoData = await geoRes.json();
        const userCurrency = geoData.currency_code || 'COP';

        // 2. Si es extranjero, buscamos la tasa
        if (userCurrency !== 'COP') {
          const rateRes = await fetch('https://open.er-api.com/v6/latest/COP');
          const rateData = await rateRes.json();
          
          if (rateData && rateData.rates[userCurrency]) {
            setIsForeign(true);
            setCurrency(userCurrency);
            setExchangeRate(rateData.rates[userCurrency]);
          }
        }
      } catch (error) {
        // PARACAÍDAS: Si algo falla, dejamos todo en COP y no bloqueamos al usuario
        console.warn('Detección de moneda falló, usando COP por defecto:', error.message);
        setCurrency('COP');
        setExchangeRate(1);
        setIsForeign(false);
      } finally {
        setLoadingCurrency(false);
      }
    };

    fetchCurrencyData();
  }, []);

  const formatPrice = (priceInCop) => {
    const converted = priceInCop * exchangeRate;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: currency === 'COP' ? 0 : 2
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, isForeign, formatPrice, loadingCurrency, exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);