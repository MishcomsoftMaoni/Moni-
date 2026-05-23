import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// =============================================
// PAGE MODE HORS LIGNE - Niveau Militaire
// Continuité opérationnelle | Synchronisation automatique
// Version: 100.0.4
// =============================================

const Offline = () => {
  const [compteurReconnexion, setCompteurReconnexion] = useState(0);
  const [reconnexionAuto, setReconnexionAuto] = useState(true);
  const [derniereVerification, setDerniereVerification] = useState(null);

  // Vérification automatique de la connexion
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) {
        setCompteurReconnexion(prev => prev + 1);
        if (reconnexionAuto) {
          window.location.reload();
        }
      } else {
        setDerniereVerification(new Date().toLocaleTimeString('fr-FR'));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [reconnexionAuto]);

  // Écouter l'événement de reconnexion
  useEffect(() => {
    const handleOnline = () => {
      setCompteurReconnexion(prev => prev + 1);
      if (reconnexionAuto) {
        setTimeout(() => window.location.reload(), 500);
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [reconnexionAuto]);

  const tenterReconnexion = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setDerniereVerification(new Date().toLocaleTimeString('fr-FR'));
      const btn = document.querySelector('.retry-btn');
      if (btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (btn) btn.style.transform = 'scale(1)';
        }, 200);
      }
    }
  };

  const fonctionnalitesOffline = [
    { icone: '📖', titre: 'Consultation', description: 'Propositions sauvegardées' },
    { icone: '✍️', titre: 'Rédaction', description: 'Propositions hors ligne' },
    { icone: '🔄', titre: 'Synchronisation', description: 'Automatique à la reconnexion' },
    { icone: '🗳️', titre: 'Votes', description: 'En attente de synchronisation' },
    { icone: '🔐', titre: 'Sécurité', description: 'Données chiffrées localement' },
    { icone: '📱', titre: 'USSD', description: '*123# sans internet' }
  ];

  return (
    <>
      <Helmet>
        <title>MAONI 🇨🇩 - Mode Hors Ligne | Continuité Opérationnelle</title>
        <meta name="description" content="Mode hors ligne - MAONI préserve vos données localement. Synchronisation automatique à la reconnexion." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A3D8F 0%, #0D47A1 50%, #1B5E8C 100%)',
        padding: '2rem',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Filigrane militaire */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          fontSize: '8rem',
          fontWeight: 900,
          opacity: 0.03,
          color: '#FFD700',
          pointerEvents: 'none',
          fontFamily: 'Georgia, serif'
        }}>
          OFFLINE
        </div>

        {/* Effet de grille militaire */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px)',
          pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', damping: 25 }}
          style={{
            textAlign: 'center',
            color: 'white',
            maxWidth: '550px',
            width: '100%',
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* Logo avec animation */}
          <motion.img
            src="/images/logo-drc-map.png"
            alt="MAONI - République Démocratique du Congo"
            style={{ height: '90px', marginBottom: '1.5rem', filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.3))' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Badge de statut */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(220,38,38,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '0.35rem 1rem',
              borderRadius: '2rem',
              marginBottom: '1rem',
              border: '1px solid rgba(220,38,38,0.4)'
            }}
          >
            <span style={{
              width: '10px',
              height: '10px',
              background: '#DC2626',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite'
            }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
              MODE HORS LIGNE • CONNEXION INTERROMPUE
            </span>
          </motion.div>

          {/* Icône principale */}
          <div style={{
            fontSize: '5rem',
            marginBottom: '0.5rem',
            filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.3))'
          }}>
            📡🔒
          </div>

          {/* Titre */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
            color: '#FFD700',
            marginBottom: '0.5rem',
            fontWeight: 800
          }}>
            Connexion Interrompue
          </h1>

          <p style={{
            fontSize: '0.9rem',
            lineHeight: 1.7,
            opacity: 0.9,
            marginBottom: '0.5rem',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Votre connexion Internet est momentanément indisponible.
          </p>

          <p style={{
            fontSize: '0.85rem',
            lineHeight: 1.6,
            opacity: 0.7,
            marginBottom: '1.5rem'
          }}>
            MAONI préserve vos données localement. Aucune information n'est perdue.
            <br />
            <strong style={{ color: '#FFD700' }}>Synchronisation automatique à la reconnexion.</strong>
          </p>

          {/* Fonctionnalités hors ligne */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '1rem',
            padding: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            {fonctionnalitesOffline.map((item, index) => (
              <motion.div
                key={item.titre}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  padding: '0.5rem',
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{item.icone}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>{item.titre}</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>{item.description}</div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            <motion.button
              onClick={tenterReconnexion}
              className="retry-btn"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '0.8rem 1.8rem',
                background: 'linear-gradient(135deg, #FFD700, #F59E0B)',
                color: '#0D47A1',
                fontWeight: 800,
                border: 'none',
                borderRadius: '2rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(255,215,0,0.3)'
              }}
            >
              🔄 Vérifier la connexion
            </motion.button>
            
            <motion.button
              onClick={() => window.history.back()}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '0.8rem 1.8rem',
                background: 'transparent',
                color: 'white',
                fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '2rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              ← Page précédente
            </motion.button>
          </div>

          {/* Option de reconnexion automatique */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <input
              type="checkbox"
              id="autoReconnect"
              checked={reconnexionAuto}
              onChange={(e) => setReconnexionAuto(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#FFD700' }}
            />
            <label htmlFor="autoReconnect" style={{ fontSize: '0.7rem', opacity: 0.8, cursor: 'pointer' }}>
              Reconnexion automatique
            </label>
          </div>

          {/* Dernière vérification */}
          {derniereVerification && !navigator.onLine && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '0.65rem',
                opacity: 0.5,
                marginBottom: '1rem'
              }}
            >
              Dernière vérification: {derniereVerification}
            </motion.p>
          )}

          {/* Informations de sécurité */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', opacity: 0.6 }}>
              <span>🔒</span> Données chiffrées
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', opacity: 0.6 }}>
              <span>📀</span> Cache local actif
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', opacity: 0.6 }}>
              <span>🔄</span> Sync auto
            </div>
          </div>

          {/* Pied de page */}
          <div style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.7rem',
            opacity: 0.6
          }}>
            <div>🇨🇩 MAONI - Plateforme Présidentielle de Consultation Citoyenne</div>
            <div style={{ marginTop: '0.25rem' }}>
              📱 Sans internet ? Composez <strong style={{ color: '#FFD700', fontSize: '0.8rem' }}>*123#</strong> pour participer
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.6rem' }}>
              Version 100.04 • Mode dégradé • Continuité assurée
            </div>
          </div>
        </motion.div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.2);
            }
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </>
  );
};

export default Offline;