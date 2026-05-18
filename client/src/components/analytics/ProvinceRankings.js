import React from 'react';
import { motion } from 'framer-motion';

const ProvinceRankings = ({ provinces = [] }) => {
  const triees = [...provinces]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 10);

  const maxCount = triees.length > 0 ? triees[0].count || 1 : 1;

  const COULEURS_MEDAILLES = ['#FFD700', '#C0C0C0', '#CD7F32'];

  const couleurBarre = (index) => {
    if (index === 0) return 'linear-gradient(90deg, #0D47A1, #1565C0)';
    if (index === 1) return 'linear-gradient(90deg, #1565C0, #1976D2)';
    if (index === 2) return 'linear-gradient(90deg, #1976D2, #2196F3)';
    return 'linear-gradient(90deg, #2196F3, #42A5F5)';
  };

  if (triees.length === 0) {
    return (
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📊</div>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '0.95rem' }}>
          Aucune donnée disponible pour le moment.
        </p>
        <p style={{ color: '#9CA3AF', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
          Les statistiques s'afficheront dès que des citoyens s'inscriront.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white', padding: '1.75rem', borderRadius: '1rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%'
    }}>
      {/* En-tête */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem',
        paddingBottom: '0.75rem', borderBottom: '2px solid #F3F4F6'
      }}>
        <span style={{ fontSize: '1.5rem' }}>🏆</span>
        <div>
          <h3 style={{
            color: '#0D47A1', margin: 0, fontFamily: 'Georgia, serif',
            fontSize: '1.15rem', fontWeight: 700
          }}>
            Participation par Province
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
            Classement des 10 provinces les plus actives
          </p>
        </div>
      </div>

      {/* Liste des provinces */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {triees.map((province, index) => {
          const pourcentage = maxCount > 0 ? Math.round(((province.count || 0) / maxCount) * 100) : 0;
          const tauxParticipation = province.population
            ? ((province.count / province.population) * 100).toFixed(2)
            : null;

          return (
            <motion.div
              key={province.name}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              {/* Rang + Nom + Compteur */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '6px'
              }}>
                {/* Médaillon de rang */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: index < 3 ? COULEURS_MEDAILLES[index] : '#F3F4F6',
                  color: index < 3 ? (index === 0 ? '#7C2D12' : '#374151') : '#6B7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800,
                  boxShadow: index < 3 ? `0 2px 8px ${COULEURS_MEDAILLES[index]}40` : 'none'
                }}>
                  {index + 1}
                </div>

                {/* Nom de la province */}
                <span style={{
                  flex: 1, fontWeight: 600, fontSize: '0.88rem', color: '#1F2937',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {province.name}
                </span>

                {/* Nombre de citoyens */}
                <span style={{
                  fontWeight: 700, fontSize: '0.9rem', color: '#0D47A1', flexShrink: 0
                }}>
                  {(province.count || 0).toLocaleString('fr-FR')}
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 400, marginLeft: '2px' }}>
                    cit.
                  </span>
                </span>
              </div>

              {/* Barre de progression */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '34px'
              }}>
                <div style={{
                  flex: 1, height: '8px', background: '#F3F4F6',
                  borderRadius: '4px', overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pourcentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: index * 0.06, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: couleurBarre(index),
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <span style={{
                  fontSize: '0.73rem', color: '#6B7280', flexShrink: 0,
                  minWidth: '48px', textAlign: 'right', fontWeight: 500
                }}>
                  {tauxParticipation ? `${tauxParticipation}%` : `${pourcentage}%`}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pied de carte */}
      <div style={{
        marginTop: '1.25rem', padding: '0.75rem',
        background: 'linear-gradient(135deg, #F0F4F8, #E8EDF2)',
        borderRadius: '0.5rem', fontSize: '0.76rem', color: '#6B7280',
        textAlign: 'center', fontWeight: 500
      }}>
        Basé sur le nombre de citoyens inscrits par province
      </div>
    </div>
  );
};

export default ProvinceRankings;