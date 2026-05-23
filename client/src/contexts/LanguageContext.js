import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// =============================================
// CONTEXTE MULTILINGUE - Niveau Présidentiel
// 5 Langues Officielles de la République Démocratique du Congo
// Version: 100.0.4
// =============================================

// Configuration des langues officielles de la RDC
const LANGUES_DISPONIBLES = [
  { 
    code: 'fr', 
    nom: 'Français', 
    nomLocal: 'Français',
    drapeau: '🇫🇷', 
    region: 'Officielle',
    ordre: 1,
    direction: 'ltr'
  },
  { 
    code: 'sw', 
    nom: 'Kiswahili', 
    nomLocal: 'Kiswahili',
    drapeau: '🇨🇩', 
    region: 'Est',
    ordre: 2,
    direction: 'ltr'
  },
  { 
    code: 'ln', 
    nom: 'Lingála', 
    nomLocal: 'Lingála',
    drapeau: '🇨🇩', 
    region: 'Nord-Ouest',
    ordre: 3,
    direction: 'ltr'
  },
  { 
    code: 'tsh', 
    nom: 'Tshiluba', 
    nomLocal: 'Tshiluba',
    drapeau: '🇨🇩', 
    region: 'Centre',
    ordre: 4,
    direction: 'ltr'
  },
  { 
    code: 'kik', 
    nom: 'Kikongo', 
    nomLocal: 'Kikongo',
    drapeau: '🇨🇩', 
    region: 'Ouest',
    ordre: 5,
    direction: 'ltr'
  }
];

// Clé de stockage localStorage
const STORAGE_KEY = 'maoni_language';
const DEFAULT_LANGUAGE = 'fr';

const LanguageContext = createContext({});

export const useLanguage = () => {
  const contexte = useContext(LanguageContext);
  if (!contexte) {
    throw new Error('useLanguage doit être utilisé dans LanguageProvider');
  }
  return contexte;
};

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [langueChargee, setLangueChargee] = useState(false);
  const [langueCourante, setLangueCourante] = useState(DEFAULT_LANGUAGE);

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const langueSauvegardee = localStorage.getItem(STORAGE_KEY);
    const langueNavigateur = navigator.language?.split('-')[0];
    
    // Vérifier si la langue sauvegardée est valide
    const langueValide = LANGUES_DISPONIBLES.some(l => l.code === langueSauvegardee);
    const langueNavigateurValide = LANGUES_DISPONIBLES.some(l => l.code === langueNavigateur);
    
    let langueInitiale = DEFAULT_LANGUAGE;
    
    if (langueValide) {
      langueInitiale = langueSauvegardee;
    } else if (langueNavigateurValide) {
      langueInitiale = langueNavigateur;
    }
    
    // Appliquer la langue
    i18n.changeLanguage(langueInitiale);
    setLangueCourante(langueInitiale);
    document.documentElement.lang = langueInitiale;
    document.documentElement.dir = 'ltr';
    
    setLangueChargee(true);
    
    console.log(`[Langue] 🌍 Langue initialisée: ${langueInitiale} - ${LANGUES_DISPONIBLES.find(l => l.code === langueInitiale)?.nom}`);
  }, [i18n]);

  // Changer la langue
  const changerLangue = useCallback(async (codeLangue) => {
    if (!codeLangue) return;
    
    const langue = LANGUES_DISPONIBLES.find(l => l.code === codeLangue);
    if (!langue) {
      console.error(`[Langue] ❌ Langue non supportée: ${codeLangue}`);
      return false;
    }
    
    try {
      // Changer la langue dans i18n
      await i18n.changeLanguage(codeLangue);
      
      // Sauvegarder la préférence
      localStorage.setItem(STORAGE_KEY, codeLangue);
      
      // Mettre à jour les attributs du document
      document.documentElement.lang = codeLangue;
      document.documentElement.dir = langue.direction || 'ltr';
      
      // Mettre à jour l'état local
      setLangueCourante(codeLangue);
      
      // Émettre un événement personnalisé
      window.dispatchEvent(new CustomEvent('language-change', { 
        detail: { language: codeLangue, timestamp: new Date().toISOString() }
      }));
      
      console.log(`[Langue] ✅ Langue changée: ${langue.nom} (${codeLangue})`);
      return true;
      
    } catch (error) {
      console.error(`[Langue] ❌ Erreur changement langue:`, error);
      return false;
    }
  }, [i18n]);

  // Obtenir les informations d'une langue
  const getInfosLangue = useCallback((codeLangue) => {
    return LANGUES_DISPONIBLES.find(l => l.code === codeLangue) || LANGUES_DISPONIBLES[0];
  }, []);

  // Vérifier si une langue est disponible
  const langueDisponible = useCallback((codeLangue) => {
    return LANGUES_DISPONIBLES.some(l => l.code === codeLangue);
  }, []);

  // Traduction avec fallback
  const traduire = useCallback((cle, options = {}) => {
    try {
      return t(cle, options);
    } catch (error) {
      console.warn(`[Langue] Clé manquante: ${cle}`);
      return cle;
    }
  }, [t]);

  const valeur = {
    // Langue courante
    langueActuelle: langueCourante,
    langueCourante: langueCourante,
    currentLanguage: langueCourante,
    
    // Fonctions
    changerLangue,
    changeLanguage: changerLangue,
    traduire,
    t: traduire,
    
    // Utilitaires
    getInfosLangue,
    langueDisponible,
    
    // Liste des langues
    languesDisponibles: LANGUES_DISPONIBLES,
    supportedLanguages: LANGUES_DISPONIBLES,
    
    // État
    langueChargee,
    isLoaded: langueChargee,
    
    // Compatibilité i18next
    i18n,
    
    // Statistiques
    stats: {
      totalLangues: LANGUES_DISPONIBLES.length,
      langueDefaut: DEFAULT_LANGUAGE,
      langueCourante: langueCourante,
    }
  };

  // Afficher un indicateur de chargement si nécessaire
  if (!langueChargee) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D47A1, #0A3D8F)',
        color: 'white'
      }
    }, [
      React.createElement('div', { key: 'spinner', style: {
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTopColor: '#FFD700',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      } }),
      React.createElement('style', { key: 'style', children: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      ` })
    ]);
  }

  return React.createElement(
    LanguageContext.Provider,
    { value: valeur },
    children
  );
};

// Hook personnalisé avec gestion d'erreur améliorée
export const useLanguageSafe = () => {
  try {
    return useLanguage();
  } catch (error) {
    console.error('[Langue] Erreur hook useLanguageSafe:', error);
    return {
      langueActuelle: DEFAULT_LANGUAGE,
      currentLanguage: DEFAULT_LANGUAGE,
      changerLangue: () => {},
      changeLanguage: () => {},
      traduire: (key) => key,
      t: (key) => key,
      languesDisponibles: LANGUES_DISPONIBLES,
      supportedLanguages: LANGUES_DISPONIBLES,
      langueChargee: true,
      isLoaded: true,
    };
  }
};

// HOC pour wrapper les composants avec la langue
export const withLanguage = (WrappedComponent) => {
  return function WithLanguageComponent(props) {
    const languageProps = useLanguage();
    return React.createElement(WrappedComponent, { ...props, ...languageProps });
  };
};

export default LanguageContext;