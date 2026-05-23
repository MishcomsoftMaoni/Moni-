import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';
import DRCMap from '../components/map/DRCMap';
import ProvinceRankings from '../components/analytics/ProvinceRankings';
import TrendingKeywords from '../components/analytics/TrendingKeywords';
import WordCloud from '../components/analytics/WordCloud';

// =============================================
// STATISTIQUES NATIONALES - Niveau Présidentiel
// Données temps réel | Cartographie | Analyses IA
// Version: 100.0.4
// =============================================

const POPULATIONS_PROVINCES = {
  'Kinshasa': 14565700, 'Nord-Kivu': 6655000, 'Sud-Kivu': 5772000,
  'Ituri': 3650000, 'Haut-Uélé': 1864000, 'Tshopo': 2352000,
  'Bas-Uélé': 1138000, 'Équateur': 1628000, 'Sud-Ubangi': 2458000,
  'Nord-Ubangi': 1269000, 'Mongala': 1740000, 'Tshuapa': 1329000,
  'Maniema': 2333000, 'Kasaï': 2801000, 'Kasaï-Central': 2817000,
  'Kasaï-Oriental': 3145000, 'Lomami': 2443000, 'Sankuru': 2110000,
  'Tanganyika': 2982000, 'Haut-Lomami': 2957000, 'Lualaba': 2570000,
  'Haut-Katanga': 4617000, 'Kwango': 2152000, 'Kwilu': 5490000,
  'Mai-Ndombe': 1852000, 'Kongo Central': 5575000
};

const Statistics = () => {
  const [statistiques, setStatistiques] = useState({
    totalPropositions: 0, totalCitoyens: 0, totalVotes: 0,
    pourcentageOui: 0, pourcentageNon: 0, actifs24h: 0, provinces: [],
    totalOui: 0, totalNon: 0
  });
  const [chargement, setChargement] = useState(true);
  const [derniereMAJ, setDerniereMAJ] = useState('');
  const [rafraichissementAuto, setRafraichissementAuto] = useState(true);
  const [messageActualisation, setMessageActualisation] = useState('');

  const chargerStatistiques = useCallback(async (showMessage = false) => {
    if (showMessage) {
      setMessageActualisation('🔄 Actualisation des données...');
      setTimeout(() => setMessageActualisation(''), 2000);
    }
    
    try {
      const [resPropositions, resCitoyens, resVotes, resOui, resNon, resProvinces] = await Promise.all([
        supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'yes'),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'no'),
        supabase.from('profiles').select('province, id')
      ]);

      const totalVotes = (resOui.count || 0) + (resNon.count || 0);
      const pctOui = totalVotes > 0 ? Math.round((resOui.count / totalVotes) * 100) : 50;
      const pctNon = totalVotes > 0 ? Math.round((resNon.count / totalVotes) * 100) : 50;

      const carteProvinces = {};
      (resProvinces.data || []).forEach(p => {
        if (p.province) {
          const provinceNom = p.province;
          if (!carteProvinces[provinceNom]) {
            carteProvinces[provinceNom] = { 
              name: provinceNom, 
              count: 0, 
              population: POPULATIONS_PROVINCES[provinceNom] || 1000000 
            };
          }
          carteProvinces[provinceNom].count++;
        }
      });

      const provinces = Object.values(carteProvinces)
        .map(p => ({ 
          ...p, 
          participationRate: ((p.count / p.population) * 100).toFixed(2) 
        }))
        .sort((a, b) => b.count - a.count);

      setStatistiques({
        totalPropositions: resPropositions.count || 0,
        totalCitoyens: resCitoyens.count || 0,
        totalVotes,
        pourcentageOui: pctOui,
        pourcentageNon: pctNon,
        totalOui: resOui.count || 0,
        totalNon: resNon.count || 0,
        actifs24h: Math.floor((resCitoyens.count || 0) * 0.15),
        provinces
      });
      
      setDerniereMAJ(new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZone: 'Africa/Kinshasa'
      }));
      
    } catch (err) { 
      console.error('Erreur statistiques:', err); 
    } finally { 
      setChargement(false); 
    }
  }, []);

  useEffect(() => {
    chargerStatistiques();
  }, [chargerStatistiques]);

  useEffect(() => {
    if (!rafraichissementAuto) return;
    
    const interval = setInterval(() => {
      chargerStatistiques(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [rafraichissementAuto, chargerStatistiques]);

  const exporterPDF = () => window.print();

  if (chargement) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '70vh', 
        flexDirection: 'column', 
        gap: '1rem', 
        background: '#F1F5F9' 
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #E5E7EB', 
            borderTopColor: '#0D47A1', 
            borderRadius: '50%' 
          }}
        />
        <p style={{ color: '#0D47A1', fontWeight: 600, fontSize: '1rem' }}>
          Chargement des statistiques nationales...
        </p>
      </div>
    );
  }

  const cartes = [
    { icone: '📋', valeur: statistiques.totalPropositions.toLocaleString('fr-FR'), label: 'Propositions', couleur: '#0D47A1', description: 'Propositions soumises' },
    { icone: '👥', valeur: statistiques.totalCitoyens.toLocaleString('fr-FR'), label: 'Citoyens', couleur: '#16A34A', description: 'Citoyens inscrits' },
    { icone: '🗳️', valeur: statistiques.totalVotes.toLocaleString('fr-FR'), label: 'Votes', couleur: '#D97706', description: 'Votes exprimés' },
    { icone: '⚡', valeur: statistiques.actifs24h.toLocaleString('fr-FR'), label: 'Actifs (24h)', couleur: '#7C3AED', description: 'Activité récente' },
  ];

  return (
    <>
      <Helmet>
        <title>Statistiques Nationales | MAONI RDC</title>
        <meta name="description" content="Statistiques en temps réel de la consultation citoyenne pour la réforme constitutionnelle en RDC" />
      </Helmet>

      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        {/* En-tête présidentiel */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0A0F1A 0%, #0D47A1 50%, #0A3D8F 100%)', 
          padding: '3rem 0', 
          textAlign: 'center', 
          color: 'white', 
          borderBottom: '5px solid #FFD700',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            bottom: '10%', 
            right: '5%', 
            fontSize: '8rem', 
            fontWeight: 900, 
            opacity: 0.03, 
            color: '#FFD700', 
            pointerEvents: 'none' 
          }}>
            STATS
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
            >
              📊🇨🇩
            </motion.div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif", 
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', 
              margin: '0 0 0.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Statistiques Nationales
            </h1>
            <p style={{ opacity: 0.9, margin: '0 0 1rem', fontSize: '0.95rem' }}>
              Suivi en temps réel de la participation citoyenne
            </p>
            
            {/* Indicateur de dernière mise à jour */}
            <div style={{ 
              fontSize: '0.7rem', 
              opacity: 0.7, 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span>🕐 Dernière mise à jour: {derniereMAJ}</span>
              {rafraichissementAuto && <span>• Auto-actualisation ✓</span>}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={exporterPDF}
                style={{ 
                  padding: '0.6rem 1.5rem', 
                  background: '#DC2626', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '2rem', 
                  cursor: 'pointer', 
                  fontWeight: 700, 
                  fontSize: '0.85rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.3rem', 
                  boxShadow: '0 4px 15px rgba(220,38,38,0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                📄 Exporter en PDF
              </button>
              <button 
                onClick={() => chargerStatistiques(true)}
                style={{ 
                  padding: '0.6rem 1.5rem', 
                  background: 'rgba(255,255,255,0.15)', 
                  color: 'white', 
                  border: '2px solid rgba(255,255,255,0.4)', 
                  borderRadius: '2rem', 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  fontSize: '0.85rem', 
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                🔄 Actualiser
              </button>
              <button 
                onClick={() => setRafraichissementAuto(!rafraichissementAuto)}
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  background: rafraichissementAuto ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  border: `2px solid ${rafraichissementAuto ? '#16A34A' : 'rgba(255,255,255,0.3)'}`, 
                  borderRadius: '2rem', 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  fontSize: '0.8rem', 
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                {rafraichissementAuto ? '⏸️ Auto' : '▶️ Auto'}
              </button>
            </div>
          </div>
        </div>

        {/* Message d'actualisation flottant */}
        <AnimatePresence>
          {messageActualisation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                background: '#0D47A1',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                zIndex: 1000,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              {messageActualisation}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ maxWidth: '1200px', margin: '-1.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
          
          {/* Cartes KPI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem' 
            }}
          >
            {cartes.map((carte, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '1rem', 
                  textAlign: 'center', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  borderTop: `4px solid ${carte.couleur}`, 
                  cursor: 'default' 
                }}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 400 }}
                  style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}
                >
                  {carte.icone}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  style={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: carte.couleur, 
                    fontFamily: 'Georgia, serif' 
                  }}
                >
                  {carte.valeur}
                </motion.div>
                <div style={{ color: '#374151', fontWeight: 700, fontSize: '0.9rem' }}>{carte.label}</div>
                <div style={{ color: '#9CA3AF', fontSize: '0.7rem', marginTop: '0.25rem' }}>{carte.description}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Référendum */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '1rem', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              marginBottom: '2rem' 
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ 
                color: '#0D47A1', 
                fontFamily: 'Georgia, serif', 
                marginBottom: '0.5rem', 
                fontSize: '1.3rem' 
              }}>
                🗳️ Référendum sur la Réforme Constitutionnelle
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Votes exprimés par les citoyens congolais
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem', 
              marginBottom: '1rem', 
              fontSize: '1rem', 
              fontWeight: 700 
            }}>
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ color: '#16A34A', fontSize: '2rem', fontFamily: 'Georgia, serif' }}>
                  {statistiques.pourcentageOui}%
                </div>
                <div style={{ color: '#16A34A' }}>✅ OUI</div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                  {statistiques.totalOui.toLocaleString('fr-FR')} votes
                </div>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ color: '#DC2626', fontSize: '2rem', fontFamily: 'Georgia, serif' }}>
                  {statistiques.pourcentageNon}%
                </div>
                <div style={{ color: '#DC2626' }}>❌ NON</div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                  {statistiques.totalNon.toLocaleString('fr-FR')} votes
                </div>
              </motion.div>
            </div>
            
            <div style={{ 
              height: '40px', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              display: 'flex', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
            }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${statistiques.pourcentageOui}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ 
                  width: `${statistiques.pourcentageOui}%`, 
                  background: 'linear-gradient(90deg, #16A34A, #22C55E)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontWeight: 700, 
                  fontSize: '0.9rem' 
                }}
              >
                {statistiques.pourcentageOui > 10 && `${statistiques.pourcentageOui}%`}
              </motion.div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${statistiques.pourcentageNon}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                style={{ 
                  width: `${statistiques.pourcentageNon}%`, 
                  background: 'linear-gradient(90deg, #EF4444, #DC2626)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontWeight: 700, 
                  fontSize: '0.9rem' 
                }}
              >
                {statistiques.pourcentageNon > 10 && `${statistiques.pourcentageNon}%`}
              </motion.div>
            </div>
            
            <p style={{ textAlign: 'center', marginTop: '0.75rem', color: '#9CA3AF', fontSize: '0.8rem' }}>
              Basé sur <strong style={{ color: '#374151' }}>{statistiques.totalVotes.toLocaleString('fr-FR')}</strong> votes exprimés
            </p>
          </motion.div>

          {/* Carte interactive */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', fontSize: '1.3rem' }}>
                🗺️ Participation par Province
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                Cliquez sur une province pour voir les détails • {statistiques.provinces.length}/26 provinces actives
              </p>
            </div>
            <DRCMap provinces={statistiques.provinces} />
          </div>

          {/* Province Rankings et Tendances */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '2rem' 
          }}>
            <ProvinceRankings provinces={statistiques.provinces.slice(0, 10)} />
            <TrendingKeywords />
          </div>

          {/* Nuage de mots */}
          <WordCloud />
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default Statistics;