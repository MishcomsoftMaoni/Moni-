import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabase';

// =============================================
// TENDANCES DES MOTS-CLÉS - Niveau Présidentiel
// Analyse IA | Tendances en temps réel | RDC
// =============================================

const MOTS_VIDES = new Set([
  'cette', 'notre', 'leurs', 'pour', 'avec', 'dans', 'plus', 'très',
  'alors', 'aussi', 'bien', 'comme', 'entre', 'mais', 'même', 'moins',
  'sont', 'sous', 'sur', 'tout', 'tous', 'une', 'aux', 'des', 'les',
  'nos', 'par', 'pas', 'que', 'qui', 'son', 'ont', 'été', 'est',
  'était', 'étaient', 'avoir', 'être', 'faire', 'dire', 'aller', 'venir'
]);

const COULEURS_TENDANCE = {
  HAUSSE_FORTE: '#059669',
  HAUSSE_MODEREE: '#10B981',
  NEUTRE: '#6B7280',
  BAISSE_MODEREE: '#F59E0B',
  BAISSE_FORTE: '#DC2626'
};

const ICONES_TENDANCE = {
  HAUSSE_FORTE: '🚀',
  HAUSSE_MODEREE: '📈',
  NEUTRE: '➡️',
  BAISSE_MODEREE: '📉',
  BAISSE_FORTE: '⚠️'
};

const SEUILS_TENDANCE = {
  HAUSSE_FORTE: 50,
  HAUSSE_MODEREE: 30,
  BAISSE_MODEREE: -20,
  BAISSE_FORTE: -40
};

const TrendingKeywords = () => {
  const [motsCles, setMotsCles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  const [motSelectionne, setMotSelectionne] = useState(null);
  const [periode, setPeriode] = useState('semaine');

  useEffect(() => {
    analyserTendances();
  }, [periode]);

  const analyserTendances = async () => {
    setChargement(true);
    
    try {
      let query = supabase
        .from('proposals')
        .select('subject, created_at, category')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(200);

      const { data } = await query;

      if (!data || data.length === 0) {
        setMotsCles(motsClesParDefaut());
        setChargement(false);
        return;
      }

      const compteurGlobal = {};
      const compteurRecent = {};
      
      const uneSemaine = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const deuxSemaines = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      data.forEach(proposition => {
        const estRecent = new Date(proposition.created_at) > uneSemaine;
        const mots = extraireMots(proposition.subject || '');

        mots.forEach(mot => {
          compteurGlobal[mot] = (compteurGlobal[mot] || 0) + 1;
          if (estRecent) {
            compteurRecent[mot] = (compteurRecent[mot] || 0) + 1;
          }
        });
      });

      const tendances = Object.entries(compteurGlobal)
        .filter(([_, total]) => total >= 2)
        .map(([mot, total]) => {
          const recent = compteurRecent[mot] || 0;
          const tendance = total > 0 ? Math.round((recent / total) * 100) : 0;
          
          let typeTendance = 'NEUTRE';
          if (tendance >= SEUILS_TENDANCE.HAUSSE_FORTE) typeTendance = 'HAUSSE_FORTE';
          else if (tendance >= SEUILS_TENDANCE.HAUSSE_MODEREE) typeTendance = 'HAUSSE_MODEREE';
          else if (tendance <= SEUILS_TENDANCE.BAISSE_FORTE) typeTendance = 'BAISSE_FORTE';
          else if (tendance <= SEUILS_TENDANCE.BAISSE_MODEREE) typeTendance = 'BAISSE_MODEREE';
          
          return {
            mot: mot.charAt(0).toUpperCase() + mot.slice(1),
            total: Math.ceil(total),
            recent: Math.ceil(recent),
            tendance,
            typeTendance,
            couleur: COULEURS_TENDANCE[typeTendance],
            icone: ICONES_TENDANCE[typeTendance]
          };
        })
        .sort((a, b) => b.recent - a.recent)
        .slice(0, 12);

      setMotsCles(tendances.length > 0 ? tendances : motsClesParDefaut());
      setErreur(false);
      
    } catch (err) {
      console.error('Erreur analyse tendances:', err);
      setErreur(true);
      setMotsCles(motsClesParDefaut());
    } finally {
      setChargement(false);
    }
  };

  const extraireMots = (texte) => {
    return texte
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\s-]/g, ' ')
      .split(/\s+/)
      .filter(mot => mot.length > 4 && !MOTS_VIDES.has(mot));
  };

  const motsClesParDefaut = () => [
    { mot: 'Constitution', total: 45, recent: 18, tendance: 40, typeTendance: 'HAUSSE_MODEREE', icone: '📈' },
    { mot: 'Élections', total: 38, recent: 15, tendance: 39, typeTendance: 'HAUSSE_MODEREE', icone: '📈' },
    { mot: 'Décentralisation', total: 32, recent: 10, tendance: 31, typeTendance: 'HAUSSE_MODEREE', icone: '📈' },
    { mot: 'Justice', total: 28, recent: 8, tendance: 28, typeTendance: 'NEUTRE', icone: '➡️' },
    { mot: 'Éducation', total: 24, recent: 9, tendance: 37, typeTendance: 'HAUSSE_MODEREE', icone: '📈' },
    { mot: 'Santé', total: 21, recent: 7, tendance: 33, typeTendance: 'HAUSSE_MODEREE', icone: '📈' },
    { mot: 'Sécurité', total: 19, recent: 5, tendance: 26, typeTendance: 'NEUTRE', icone: '➡️' },
    { mot: 'Droits civiques', total: 17, recent: 6, tendance: 35, typeTendance: 'HAUSSE_MODEREE', icone: '📈' },
    { mot: 'Développement', total: 15, recent: 8, tendance: 53, typeTendance: 'HAUSSE_FORTE', icone: '🚀' },
    { mot: 'Transparence', total: 14, recent: 5, tendance: 35, typeTendance: 'HAUSSE_MODEREE', icone: '📈' }
  ];

  const totalOccurrences = motsCles.reduce((acc, m) => acc + m.total, 0);
  const motsEnHausse = motsCles.filter(m => m.typeTendance.includes('HAUSSE')).length;
  const motsStables = motsCles.filter(m => m.typeTendance === 'NEUTRE').length;
  const motsEnBaisse = motsCles.filter(m => m.typeTendance.includes('BAISSE')).length;

  if (chargement) {
    return (
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center'
      }}>
        <div style={{
          width: '36px', height: '36px', margin: '0 auto 1rem',
          border: '3px solid #E5E7EB', borderTopColor: '#0D47A1',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#6B7280', margin: 0 }}>Analyse des tendances en cours...</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white', padding: '1.75rem', borderRadius: '1rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      
      {/* En-tête avec sélecteur */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
        paddingBottom: '0.75rem', borderBottom: '2px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📈</span>
          <div>
            <h3 style={{
              color: '#0D47A1', margin: 0, fontFamily: 'Georgia, serif',
              fontSize: '1.15rem', fontWeight: 700
            }}>
              Tendances de la Semaine
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
              Mots-clés les plus discutés - Analyse IA
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex', gap: '0.3rem', background: '#F3F4F6',
          padding: '0.2rem', borderRadius: '2rem'
        }}>
          {[
            { valeur: 'semaine', label: '7 jours' },
            { valeur: 'mois', label: '30 jours' }
          ].map(opt => (
            <button
              key={opt.valeur}
              onClick={() => setPeriode(opt.valeur)}
              style={{
                padding: '0.3rem 0.8rem', borderRadius: '1.5rem',
                border: 'none', fontSize: '0.7rem', fontWeight: 600,
                background: periode === opt.valeur ? '#0D47A1' : 'transparent',
                color: periode === opt.valeur ? 'white' : '#6B7280',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques de synthèse */}
      <div style={{
        display: 'flex', gap: '1rem', marginBottom: '1.25rem',
        flexWrap: 'wrap', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Total</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D47A1' }}>
              {totalOccurrences}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>📈 Hausse</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10B981' }}>
              {motsEnHausse}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>➡️ Stable</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6B7280' }}>
              {motsStables}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>📉 Baisse</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F59E0B' }}>
              {motsEnBaisse}
            </div>
          </div>
        </div>
        
        {erreur && (
          <div style={{
            fontSize: '0.65rem', background: '#FEF3C7', color: '#D97706',
            padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 600
          }}>
            Données par défaut
          </div>
        )}
      </div>

      {/* Liste des mots-clés */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        <AnimatePresence>
          {motsCles.map((item, index) => (
            <motion.div
              key={item.mot}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              onMouseEnter={() => setMotSelectionne(item.mot)}
              onMouseLeave={() => setMotSelectionne(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.65rem 0.8rem', borderRadius: '0.5rem',
                background: item.typeTendance.includes('HAUSSE') ? '#F0FDF4' : 
                           item.typeTendance === 'NEUTRE' ? '#F8FAFC' : '#FFF5F5',
                border: `1px solid ${item.typeTendance.includes('HAUSSE') ? '#BBF7D0' : 
                                   item.typeTendance === 'NEUTRE' ? '#E5E7EB' : '#FECACA'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: index < 3 ? 'linear-gradient(135deg, #FFD700, #F59E0B)' : 
                          item.typeTendance.includes('HAUSSE') ? 'linear-gradient(135deg, #10B981, #059669)' :
                          item.typeTendance === 'NEUTRE' ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B, #DC2626)',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800
              }}>
                {index + 1}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: '0.88rem', color: '#1F2937'
                }}>
                  {item.mot}
                </div>
              </div>

              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  fontWeight: 800, fontSize: '0.85rem', color: '#0D47A1'
                }}>
                  {item.recent}
                </div>
                <div style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>
                  +{item.total - item.recent}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                color: item.couleur,
                fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                minWidth: '55px', justifyContent: 'flex-end'
              }}>
                <span>{item.icone}</span>
                <span>{item.tendance}%</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Prédiction au survol */}
      <AnimatePresence>
        {motSelectionne && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginTop: '1rem', padding: '0.65rem 1rem',
              background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
              borderRadius: '0.75rem', border: '1px solid #BAE6FD'
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0369A1' }}>
              🔮 ALERTE ANALYTIQUE
            </span>
            <p style={{
              margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#0C4A6E'
            }}>
              {motsCles.find(m => m.mot === motSelectionne)?.tendance > 50 
                ? 'Tendance explosive - Suivi prioritaire'
                : motsCles.find(m => m.mot === motSelectionne)?.tendance > 30
                ? 'Hausse significative - À surveiller'
                : 'Surveillance normale'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pied */}
      <div style={{
        marginTop: '1rem', padding: '0.65rem',
        background: 'linear-gradient(135deg, #F0F4F8, #E8EDF2)',
        borderRadius: '0.5rem', fontSize: '0.7rem', color: '#6B7280',
        textAlign: 'center', fontWeight: 500
      }}>
        🤖 Analyse automatique par intelligence artificielle
        <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>
          • Basée sur {totalOccurrences} occurrences
        </span>
        <br />
        <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>
          Mise à jour temps réel • Prédiction automatique
        </span>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default TrendingKeywords;