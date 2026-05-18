import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const PresidentialDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Tableau de Bord | MAONI</title>
      </Helmet>
      
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            maxWidth: '600px',
            background: 'white',
            padding: '3rem 2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏛️</div>
          
          <h1 style={{
            fontFamily: 'Georgia, serif',
            color: '#0D47A1',
            fontSize: '1.8rem',
            marginBottom: '1rem'
          }}>
            Tableau de Bord
          </h1>
          
          <p style={{
            color: '#6B7280',
            fontSize: '1.05rem',
            lineHeight: 1.7,
            marginBottom: '1.5rem'
          }}>
            Statistiques et analyses réservées aux autorités compétentes 
            pour le suivi de la consultation citoyenne sur les réformes 
            constitutionnelles en République Démocratique du Congo.
          </p>
          
          <div style={{
            padding: '1rem',
            background: '#F0F4F8',
            borderRadius: '0.75rem',
            fontSize: '0.9rem',
            color: '#6B7280'
          }}>
            🔐 Accès restreint aux personnes autorisées
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PresidentialDashboard;