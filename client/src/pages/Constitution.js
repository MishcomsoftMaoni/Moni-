import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Constitution = () => {
  return (
    <>
      <Helmet><title>Constitution de la RDC | MAONI</title></Helmet>
      
      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        {/* En-tête */}
        <div style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #0D47A1 100%)', padding: '3rem 0', textAlign: 'center', color: 'white', borderBottom: '5px solid #FFD700' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', margin: '0 0 0.5rem' }}>
              📜 Constitution de la République Démocratique du Congo
            </h1>
            <p style={{ opacity: 0.9, fontSize: '1rem', margin: 0 }}>
              Modifiée par la Loi n° 11/002 du 20 janvier 2011 portant révision de certains articles
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
          
          {/* Aperçu PDF */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
            <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>Document Officiel</h2>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
              Journal Officiel - Numéro Spécial - Kinshasa, 5 février 2011
            </p>
            <a href="/constitution-rdc.pdf" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#DC2626', color: 'white', borderRadius: '2rem', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 15px rgba(220,38,38,0.3)' }}>
              📥 Télécharger la Constitution (PDF)
            </a>
          </motion.div>

          {/* Articles clés */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1.5rem', textAlign: 'center' }}>
              Articles Clés de la Constitution
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { article: 'Article 2', titre: 'Provinces', contenu: 'La RDC est composée de la ville de Kinshasa et de 25 provinces dotées de la personnalité juridique.' },
                { article: 'Article 5', titre: 'Souveraineté', contenu: 'La souveraineté nationale appartient au peuple. Tout pouvoir émane du peuple qui l\'exerce directement par voie de référendum ou d\'élections.' },
                { article: 'Article 70', titre: 'Mandat Présidentiel', contenu: 'Le Président de la République est élu au suffrage universel direct pour un mandat de cinq ans renouvelable une seule fois.' },
                { article: 'Article 220', titre: 'Dispositions Intangibles', contenu: 'La forme républicaine de l\'Etat, le principe du suffrage universel, le nombre et la durée des mandats du Président ne peuvent faire l\'objet d\'aucune révision constitutionnelle.' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '1rem 1.25rem', background: '#F8FAFC', borderRadius: '0.5rem', borderLeft: '4px solid #0D47A1' }}>
                  <div style={{ fontWeight: 700, color: '#0D47A1', marginBottom: '0.25rem' }}>{item.article} - {item.titre}</div>
                  <p style={{ color: '#374151', fontSize: '0.9rem', margin: 0 }}>{item.contenu}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/" style={{ color: '#0D47A1', fontWeight: 700, textDecoration: 'none' }}>← Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Constitution;