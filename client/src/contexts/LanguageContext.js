import React, { createContext, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext({});

export const useLanguage = () => {
  const contexte = useContext(LanguageContext);
  if (!contexte) throw new Error('useLanguage doit être utilisé dans LanguageProvider');
  return contexte;
};

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();

  const changerLangue = useCallback((langue) => {
    i18n.changeLanguage(langue);
    localStorage.setItem('maoni-langue', langue);
    document.documentElement.lang = langue;
  }, [i18n]);

  const valeur = {
    langueActuelle: i18n.language,
    changerLangue,
    t,
    languesDisponibles: [
      { code: 'fr', nom: 'Français', drapeau: '🇫🇷' },
      { code: 'sw', nom: 'Kiswahili', drapeau: '🇨🇩' },
      { code: 'ln', nom: 'Lingála', drapeau: '🇨🇩' },
      { code: 'tsh', nom: 'Tshiluba', drapeau: '🇨🇩' },
      { code: 'kik', nom: 'Kikongo', drapeau: '🇨🇩' },
    ]
  };

  return (
    <LanguageContext.Provider value={valeur}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;