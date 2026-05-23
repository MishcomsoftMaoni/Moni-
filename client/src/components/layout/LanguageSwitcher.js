import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================
// SÉLECTEUR DE LANGUES - Niveau Présidentiel
// 5 Langues Officielles de la République Démocratique du Congo
// =============================================

const LANGUES = [
  { code: 'fr', label: 'Français', drapeau: '🇫🇷', court: 'FR', description: 'Langue officielle' },
  { code: 'sw', label: 'Kiswahili', drapeau: '🇨🇩', court: 'SW', description: 'Langue nationale' },
  { code: 'ln', label: 'Lingála', drapeau: '🇨🇩', court: 'LN', description: 'Langue nationale' },
  { code: 'tsh', label: 'Tshiluba', drapeau: '🇨🇩', court: 'TSH', description: 'Langue nationale' },
  { code: 'kik', label: 'Kikongo', drapeau: '🇨🇩', court: 'KIK', description: 'Langue nationale' }
];

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [ouvert, setOuvert] = useState(false);
  const [direction, setDirection] = useState('down');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const langueActuelle = LANGUES.find(l => l.code === currentLanguage) || LANGUES[0];

  const verifierEspace = useCallback(() => {
    if (buttonRef.current && menuRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const espaceBas = window.innerHeight - rect.bottom;
      const espaceHaut = rect.top;
      setDirection(espaceBas > 200 ? 'down' : 'up');
    }
  }, []);

  useEffect(() => {
    const gererClic = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && 
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', gererClic);
    return () => document.removeEventListener('mousedown', gererClic);
  }, []);

  useEffect(() => {
    if (ouvert) {
      verifierEspace();
      window.addEventListener('resize', verifierEspace);
    } else {
      window.removeEventListener('resize', verifierEspace);
    }
    return () => window.removeEventListener('resize', verifierEspace);
  }, [ouvert, verifierEspace]);

  const handleChange = useCallback((code) => {
    changeLanguage(code);
    setOuvert(false);
    console.log(`[MAONI] Changement de langue: ${currentLanguage} → ${code}`);
  }, [changeLanguage, currentLanguage]);

  const menuVariants = {
    hidden: { 
      opacity: 0, 
      y: direction === 'down' ? -10 : 10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: direction === 'down' ? -10 : 10,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => setOuvert(!ouvert)}
        aria-label={`Langue actuelle : ${langueActuelle.label}`}
        aria-expanded={ouvert}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.9rem',
          borderRadius: '2rem',
          border: `1px solid ${ouvert ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.25)'}`,
          background: ouvert ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: "'Inter', sans-serif",
          backdropFilter: 'blur(4px)'
        }}
        onMouseEnter={(e) => {
          if (!ouvert) {
            e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,215,0,0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!ouvert) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{langueActuelle.drapeau}</span>
        <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
          {langueActuelle.court}
        </span>
        <motion.span
          animate={{ rotate: ouvert ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: '0.65rem',
            marginLeft: '0.1rem',
            opacity: 0.8
          }}
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            ref={menuRef}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'absolute',
              [direction === 'down' ? 'top' : 'bottom']: 'calc(100% + 8px)',
              right: 0,
              background: 'linear-gradient(135deg, #FFFFFF, #F8FAFC)',
              borderRadius: '1rem',
              boxShadow: '0 15px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,215,0,0.2)',
              overflow: 'hidden',
              zIndex: 1100,
              minWidth: '220px',
              backdropFilter: 'blur(8px)'
            }}
          >
            {/* En-tête du menu */}
            <div style={{
              padding: '0.7rem 1rem',
              background: 'linear-gradient(135deg, #0D47A1, #0A3D8F)',
              borderBottom: '2px solid #FFD700'
            }}>
              <div style={{
                fontSize: '0.7rem',
                color: '#FFD700',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Langues officielles
              </div>
              <div style={{
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.7)',
                marginTop: '2px'
              }}>
                République Démocratique du Congo
              </div>
            </div>

            {/* Liste des langues */}
            {LANGUES.map((langue, index) => (
              <motion.button
                key={langue.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleChange(langue.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  width: '100%',
                  padding: '0.7rem 1rem',
                  border: 'none',
                  background: langue.code === currentLanguage
                    ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)'
                    : 'transparent',
                  color: '#1F2937',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: langue.code === currentLanguage ? 700 : 500,
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  borderLeft: langue.code === currentLanguage
                    ? '3px solid #FFD700'
                    : '3px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (langue.code !== currentLanguage) {
                    e.currentTarget.style.background = '#F8FAFC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (langue.code !== currentLanguage) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{langue.drapeau}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{
                    fontWeight: langue.code === currentLanguage ? 800 : 600,
                    fontSize: '0.85rem'
                  }}>
                    {langue.label}
                  </div>
                  <div style={{
                    fontSize: '0.6rem',
                    color: '#9CA3AF',
                    marginTop: '1px'
                  }}>
                    {langue.description}
                  </div>
                </div>
                {langue.code === currentLanguage && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      color: '#16A34A',
                      fontSize: '0.9rem',
                      fontWeight: 800
                    }}
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            ))}

            {/* Pied de menu - Information USSD */}
            <div style={{
              padding: '0.5rem 1rem',
              background: '#F3F4F6',
              borderTop: '1px solid #E5E7EB',
              fontSize: '0.6rem',
              color: '#6B7280',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}>
              <span>📡</span> Composez <strong style={{ color: '#0D47A1' }}>*123#</strong> pour changer de langue
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
          @keyframes fadeInLang {
            from {
              opacity: 0;
              transform: translateY(-5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .lang-menu-item {
            transition: all 0.2s ease;
          }
          
          .lang-menu-item:hover {
            padding-left: 0.5rem;
          }
        `}
      </style>
    </div>
  );
};

export default LanguageSwitcher;