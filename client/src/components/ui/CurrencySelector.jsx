import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext.jsx';

const CURRENCIES = [
  { code: 'EUR', label: '€ Euro' },
  { code: 'USD', label: '$ Dollar' },
  { code: 'GBP', label: '£ Pound' },
];

const LANGS = [
  { code: 'ES', label: 'ES' },
  { code: 'EN', label: 'EN' },
  { code: 'FR', label: 'FR' },
];

const CurrencySelector = () => {
  const { currency, language, setCurrency, setLanguage } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
        <span className="text-sm font-semibold">{currency}</span>
        <span className="text-xs text-gray-400">/</span>
        <span className="text-sm">{language}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-1">Moneda</div>
            {CURRENCIES.map((c) => (
              <button key={c.code} onClick={() => { setCurrency(c.code); setOpen(false); }} className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 ${currency === c.code ? 'font-bold' : ''}`}>{c.label}</button>
            ))}

            <hr className="my-2 border-t dark:border-slate-700" />

            <div className="text-xs text-gray-500 mb-1">Idioma (UI)</div>
            <div className="flex gap-2">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => { setLanguage(l.code); setOpen(false); }} className={`px-2 py-1 rounded ${language === l.code ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200'}`}>{l.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
