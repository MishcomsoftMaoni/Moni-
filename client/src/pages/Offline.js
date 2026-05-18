import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Offline = () => {
  return (
    <>
      <Helmet>
        <title>MAONI - Mode Hors Ligne</title>
      </Helmet>
      
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a5fb4 0%, #1550a0 100%)',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            color: 'white',
            maxWidth: '500px'
          }}
        >
          {/* Logo */}
          <motion.img
            src="/images/logo-drc-map.png"
            alt="MAONI"
            style={{ height: '80px', marginBottom: '2rem' }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Icône */}
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📡</div>
          
          {/* Titre */}
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.8rem',
            color: '#FFD700',
            marginBottom: '1rem'
          }}>
            Mode Hors Ligne
          </h1>
          
          {/* Message */}
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            opacity: 0.9,
            marginBottom: '2rem'
          }}>
            Vous n'êtes pas connecté à Internet. 
            MAONI fonctionne en mode limité. 
            Vos actions seront synchronisées automatiquement 
            dès votre reconnexion.
          </p>
          
          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'linear-gradient(135deg, #FFD700, #F9A825)',
                color: '#0D47A1',
                fontWeight: 700,
                border: 'none',
                borderRadius: '2rem',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              🔄 Réessayer
            </motion.button>
            
            <motion.button
              onClick={() => window.history.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'transparent',
                color: 'white',
                fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '2rem',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              ← Retour
            </motion.button>
          </div>
          
          {/* Pied */}
          <p style={{
            marginTop: '2rem',
            fontSize: '0.8rem',
            opacity: 0.6
          }}>
            🇨🇩 MAONI | Fabriqué en RDC<br />
            Composez <strong>*123#</strong> pour participer sans Internet
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Offline;