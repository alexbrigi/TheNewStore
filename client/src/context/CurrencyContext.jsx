import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'tcg_currency_v1';

const defaultState = {
  currency: 'EUR', // EUR, USD, GBP
  language: 'ES', // ES, EN, etc. (UI only)
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const setCurrency = (currency) => setState((s) => ({ ...s, currency }));
  const setLanguage = (language) => setState((s) => ({ ...s, language }));

  return (
    <CurrencyContext.Provider value={{ ...state, setCurrency, setLanguage }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);

export default CurrencyContext;
