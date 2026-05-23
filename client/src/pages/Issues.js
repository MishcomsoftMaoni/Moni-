import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// =============================================
// PAGE DES SIGNALEMENTS CONSTITUTIONNELS
// Problèmes identifiés dans la Constitution actuelle
// Niveau Militaire - Audit Constitutionnel
// Version: 100.0.4
// =============================================

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [categorieFiltre, setCategorieFiltre] = useState('all');
  const [statistiques, setStatistiques] = useState({ total: 0, parCategorie: {} });

  const chargerIssues = useCallback(async () => {
    try {
      let query = supabase
        .from('reports')
        .select('*, auteur:profiles(id, first_name, last_name, province, portrait_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (error) throw error;

      setIssues(data || []);

      // Calculer les statistiques
      const stats = { total: data?.length || 0, parCategorie: {} };
      data?.forEach(issue => {
        const cat = issue.category || 'general';
        stats.parCategorie[cat] = (stats.parCategorie[cat] || 0) + 1;
      });
      setStatistiques(stats);

    } catch (err) { 
      console.error('Erreur chargement signalements:', err); 
    } finally { 
      setChargement(false); 
    }
  }, []);

  useEffect(() => {
    chargerIssues();
  }, [chargerIssues]);

  const categories = [
    { valeur: 'all', label: 'Tous', icone: '📋', couleur: '#0D47A1' },
    { valeur: 'constitutional', label: 'Constitution', icone: '📜', couleur: '#0D47A1' },
    { valeur: 'electoral', label: 'Élections', icone: '🗳️', couleur: '#16A34A' },
    { valeur: 'justice', label: 'Justice', icone: '⚖️', couleur: '#7C3AED' },
    { valeur: 'decentralization', label: 'Décentralisation', icone: '🏛️', couleur: '#D97706' },
    { valeur: 'rights', label: 'Droits', icone: '🕊️', couleur: '#C62828' },
    { valeur: 'economic', label: 'Économie', icone: '💰', couleur: '#0891B2' },
  ];

  const issuesFiltres = categorieFiltre === 'all' 
    ? issues 
    : issues.filter(i => i.category === categorieFiltre);

  const getCategorieInfo = (category) => {
    return categories.find(c => c.valeur === category) || categories[0];
  };

  const getNiveauUrgence = (issue) => {
    const texte = `${issue.subject} ${issue.content}`.toLowerCase();
    if (texte.includes('blocage') || texte.includes('crise') || texte.includes('urgence')) return { niveau: 'CRITIQUE', couleur: '#DC2626' };
    if (texte.includes('violation') || texte.includes('droit') || texte.includes('liberté')) return { niveau: 'ÉLEVÉ', couleur: '#F59E0B' };
    return { niveau: 'MODÉRÉ', couleur: '#10B981' };
  };

  if (chargement) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>⚠️ Signalements Constitutionnels | MAONI RDC</title>
        <meta name="description" content="Problèmes identifiés dans la Constitution de la RDC. Signalements citoyens pour la réforme constitutionnelle." />
        <meta name="keywords" content="signalements, problèmes constitutionnels, RDC, réforme, constitution" />
      </Helmet>

      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        {/* En-tête */}
        <div style={{ 
          background: 'linear-gradient(135deg, #C62828, #DC2626, #B91C1C)', 
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
            opacity: 0.05,
            color: '#FFFFFF',
            pointerEvents: 'none'
          }}>
            ⚠️
          </div>
          
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{ fontSize: '4rem', marginBottom: '0.5rem' }}
            >
              ⚠️📜
            </motion.div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif", 
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', 
              margin: 0,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Signalements Constitutionnels
            </h1>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
              Problèmes identifiés dans la Constitution actuelle par les citoyens congolais
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '-1.5rem auto 0', padding: '0 1.5rem' }}>
          
          {/* Carte de statistiques */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'white', 
              borderRadius: '1rem', 
              padding: '1rem 1.5rem', 
              marginBottom: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>📊</div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>TOTAL SIGNALEMENTS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626' }}>
                  {statistiques.total}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {Object.entries(statistiques.parCategorie).slice(0, 4).map(([cat, count]) => {
                const catInfo = getCategorieInfo(cat);
                return (
                  <div key={cat} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem' }}>{catInfo.icone}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: catInfo.couleur }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              justifyContent: 'center'
            }}
          >
            {categories.map(cat => (
              <button
                key={cat.valeur}
                onClick={() => setCategorieFiltre(cat.valeur)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  border: categorieFiltre === cat.valeur ? `2px solid ${cat.couleur}` : '1px solid #E5E7EB',
                  background: categorieFiltre === cat.valeur ? `${cat.couleur}10` : 'white',
                  color: categorieFiltre === cat.valeur ? cat.couleur : '#6B7280',
                  fontWeight: categorieFiltre === cat.valeur ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span>{cat.icone}</span> {cat.label}
                {categorieFiltre === cat.valeur && cat.valeur !== 'all' && (
                  <span style={{ 
                    background: cat.couleur, 
                    color: 'white', 
                    borderRadius: '1rem', 
                    padding: '0.1rem 0.4rem', 
                    fontSize: '0.6rem' 
                  }}>
                    {statistiques.parCategorie[cat.valeur] || 0}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Liste des signalements */}
          <AnimatePresence mode="wait">
            {issuesFiltres.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ 
                  textAlign: 'center', 
                  padding: '4rem', 
                  background: 'white', 
                  borderRadius: '1rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>📭</div>
                <h3 style={{ color: '#0D47A1', marginBottom: '0.5rem' }}>Aucun signalement trouvé</h3>
                <p style={{ color: '#9CA3AF' }}>
                  {categorieFiltre !== 'all' 
                    ? `Aucun signalement dans la catégorie "${categories.find(c => c.valeur === categorieFiltre)?.label}"`
                    : 'Aucun signalement pour le moment. Soyez le premier à signaler un problème constitutionnel !'}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {issuesFiltres.map((issue, index) => {
                  const niveauUrgence = getNiveauUrgence(issue);
                  const catInfo = getCategorieInfo(issue.category);
                  
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.12)' }}
                      style={{ 
                        background: 'white', 
                        borderRadius: '1rem', 
                        padding: '1.5rem', 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', 
                        borderLeft: `5px solid ${niveauUrgence.couleur}`,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: niveauUrgence.couleur, fontSize: '1rem' }}>
                            {catInfo.icone} {issue.subject}
                          </span>
                          <span style={{ 
                            background: `${niveauUrgence.couleur}15`, 
                            color: niveauUrgence.couleur, 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '1rem', 
                            fontSize: '0.65rem', 
                            fontWeight: 700 
                          }}>
                            {niveauUrgence.niveau}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                          {issue.created_at ? formatDistanceToNow(new Date(issue.created_at), { addSuffix: true, locale: fr }) : ''}
                        </span>
                      </div>

                      <p style={{ color: '#6B7280', fontStyle: 'italic', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        💡 {issue.one_sentence}
                      </p>

                      <div style={{ 
                        color: '#374151', 
                        fontSize: '0.85rem', 
                        marginBottom: '0.75rem', 
                        lineHeight: 1.6,
                        background: '#F8FAFC',
                        padding: '0.75rem',
                        borderRadius: '0.5rem'
                      }}>
                        {issue.content?.substring(0, 300)}
                        {issue.content?.length > 300 && '...'}
                      </div>

                      {issue.consequence && (
                        <div style={{ 
                          background: '#FEF2F2', 
                          padding: '0.75rem', 
                          borderRadius: '0.5rem', 
                          marginBottom: '0.75rem',
                          borderLeft: '3px solid #DC2626'
                        }}>
                          <span style={{ fontWeight: 700, color: '#DC2626', fontSize: '0.8rem' }}>
                            ⚠️ Conséquence identifiée :
                          </span>
                          <p style={{ color: '#991B1B', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                            {issue.consequence?.substring(0, 200)}
                            {issue.consequence?.length > 200 && '...'}
                          </p>
                        </div>
                      )}

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #F3F4F6'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img 
                            src={issue.auteur?.portrait_url || '/images/default-avatar.png'} 
                            alt="" 
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                            Par {issue.auteur?.first_name || 'Citoyen'} {issue.auteur?.last_name || 'Congolais'}
                          </span>
                          {issue.auteur?.province && (
                            <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>📍 {issue.auteur.province}</span>
                          )}
                        </div>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          background: `${catInfo.couleur}10`, 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '1rem',
                          color: catInfo.couleur
                        }}>
                          {catInfo.icone} {catInfo.label}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton pour signaler un problème */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link
              to="/submit-issue"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 2rem',
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                color: 'white',
                borderRadius: '3rem',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 4px 15px rgba(220,38,38,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(220,38,38,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(220,38,38,0.3)';
              }}
            >
              ⚠️ Signaler un problème constitutionnel
            </Link>
          </div>
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

export default Issues;