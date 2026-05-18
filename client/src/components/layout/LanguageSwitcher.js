import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [ouvert, setOuvert] = useState(false);
  const menuRef = useRef(null);

  const langues = [
    { code: 'fr', label: 'Français', drapeau: '🇫🇷', court: 'FR' },
    { code: 'sw', label: 'Kiswahili', drapeau: '🇨🇩', court: 'SW' },
    { code: 'ln', label: 'Lingála', drapeau: '🇨🇩', court: 'LN' },
  ];

  const langueActuelle = langues.find(l => l.code === currentLanguage) || langues[0];

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const gererClic = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', gererClic);
    return () => document.removeEventListener('mousedown', gererClic);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOuvert(!ouvert)}
        aria-label={`Langue actuelle : ${langueActuelle.label}`}
        aria-expanded={ouvert}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.4rem 0.7rem', borderRadius: '2rem',
          border: '1px solid rgba(255,255,255,0.3)',
          background: ouvert ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
          color: 'white', cursor: 'pointer', fontSize: '0.82rem',
          fontWeight: 500, transition: 'all 0.2s ease',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <span style={{ fontSize: '1rem' }}>{langueActuelle.drapeau}</span>
        <span>{langueActuelle.court}</span>
        <span style={{
          fontSize: '0.6rem', marginLeft: '0.1rem',
          transform: ouvert ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ▼
        </span>
      </button>

      {/* Menu déroulant */}
      {ouvert && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'white', borderRadius: '0.75rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden', zIndex: 1100,
          minWidth: '170px', animation: 'fadeIn 0.2s ease'
        }}>
          {langues.map((langue) => (
            <button
              key={langue.code}
              onClick={() => {
                changeLanguage(langue.code);
                setOuvert(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                width: '100%', padding: '0.7rem 1rem',
                border: 'none', background: langue.code === currentLanguage
                  ? '#F0F4F8' : 'transparent',
                color: '#1F2937', cursor: 'pointer',
                fontSize: '0.88rem', fontWeight: langue.code === currentLanguage ? 700 : 500,
                transition: 'all 0.15s ease', textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (langue.code !== currentLanguage) {
                  e.target.style.background = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (langue.code !== currentLanguage) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{langue.drapeau}</span>
              <span>{langue.label}</span>
              {langue.code === currentLanguage && (
                <span style={{ marginLeft: 'auto', color: '#16A34A', fontSize: '0.8rem' }}>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;