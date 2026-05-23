import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabase';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// =============================================
// CARROUSEL DES PROPOSITIONS - Niveau Présidentiel
// Défilement automatique | Pause au survol | Animations
// =============================================

const INTERVALLE_DEFILEMENT = 10000;
const NOMBRE_MAX_PROPOSITIONS = 15;
const ANIMATION_DUREE = 0.5;

const ScrollingProposals = () => {
  const [propositions, setPropositions] = useState([]);
  const [indexActuel, setIndexActuel] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [pause, setPause] = useState(false);
  const [erreur, setErreur] = useState(false);
  const [direction, setDirection] = useState('next');
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const chargerPropositions = useCallback(async () => {
    try {
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('id, subject, one_sentence, content, yes_count, no_count, user_id, created_at, category')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(NOMBRE_MAX_PROPOSITIONS);

      if (proposalsError) throw proposalsError;

      if (proposalsData && proposalsData.length > 0) {
        const userIds = [...new Set(proposalsData.map(p => p.user_id))];
        
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, portrait_url, province, profession')
          .in('id', userIds);

        if (usersError) throw usersError;

        const userMap = new Map();
        usersData?.forEach(user => {
          userMap.set(user.id, user);
        });

        const propositionsEnrichies = proposalsData.map(proposal => ({
          ...proposal,
          utilisateur: userMap.get(proposal.user_id) || {},
          total_votes: (proposal.yes_count || 0) + (proposal.no_count || 0),
          pourcentage_oui: ((proposal.yes_count || 0) + (proposal.no_count || 0)) > 0
            ? Math.round((proposal.yes_count / ((proposal.yes_count || 0) + (proposal.no_count || 0))) * 100)
            : 0,
          temps: formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true, locale: fr })
        }));

        setPropositions(propositionsEnrichies);
        setErreur(false);
      } else {
        setPropositions([]);
      }
    } catch (err) {
      console.error('Erreur chargement propositions:', err);
      setErreur(true);
    } finally {
      setChargement(false);
    }
  }, []);

  const propositionSuivante = useCallback(() => {
    if (propositions.length === 0) return;
    setDirection('next');
    setIndexActuel(prev => (prev + 1) % propositions.length);
  }, [propositions.length]);

  const propositionPrecedente = useCallback(() => {
    if (propositions.length === 0) return;
    setDirection('prev');
    setIndexActuel(prev => (prev - 1 + propositions.length) % propositions.length);
  }, [propositions.length]);

  const demarrerDefilement = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(propositionSuivante, INTERVALLE_DEFILEMENT);
  }, [propositionSuivante]);

  const arreterDefilement = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const redemarrerApresPause = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!pause) demarrerDefilement();
    }, 5000);
  }, [pause, demarrerDefilement]);

  useEffect(() => {
    chargerPropositions();
  }, [chargerPropositions]);

  useEffect(() => {
    if (propositions.length > 0 && !pause) {
      demarrerDefilement();
    }
    return () => arreterDefilement();
  }, [propositions.length, pause, demarrerDefilement, arreterDefilement]);

  const handleMouseEnter = useCallback(() => {
    setPause(true);
    arreterDefilement();
  }, [arreterDefilement]);

  const handleMouseLeave = useCallback(() => {
    setPause(false);
    redemarrerApresPause();
  }, [redemarrerApresPause]);

  if (chargement) {
    return (
      <div style={{
        textAlign: 'center', padding: '2rem', color: '#9CA3AF',
        background: 'white', borderRadius: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          width: '36px', height: '36px', margin: '0 auto 0.75rem',
          border: '3px solid #E5E7EB', borderTopColor: '#0D47A1',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontWeight: 500 }}>Chargement des propositions citoyennes...</p>
      </div>
    );
  }

  if (erreur || propositions.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '2rem', color: '#9CA3AF',
        background: 'white', borderRadius: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
        <p style={{ fontWeight: 600, margin: 0 }}>
          Aucune proposition pour le moment.
        </p>
        <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
          Soyez le premier à soumettre une proposition pour la réforme constitutionnelle !
        </p>
        <Link to="/submit-proposal" className="btn btn-primary btn-sm" style={{
          display: 'inline-block', marginTop: '1rem',
          padding: '0.5rem 1.5rem', background: '#0D47A1',
          color: 'white', borderRadius: '2rem', textDecoration: 'none'
        }}>
          ✍️ Soumettre une proposition
        </Link>
      </div>
    );
  }

  const actuelle = propositions[indexActuel];
  const utilisateur = actuelle.utilisateur || {};
  const categorieLabels = {
    constitutional: 'Constitution',
    electoral: 'Élections',
    decentralization: 'Décentralisation',
    justice: 'Justice',
    economy: 'Économie',
    security: 'Sécurité',
    education: 'Éducation',
    health: 'Santé'
  };
  const categorieNom = categorieLabels[actuelle.category] || 'Proposition citoyenne';
  
  const animationsVariants = {
    next: { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -60 } },
    prev: { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 60 } }
  };

  return (
    <div style={{ position: 'relative', maxWidth: '850px', margin: '0 auto' }}>
      
      <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={actuelle.id}
            custom={direction}
            variants={animationsVariants[direction]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: ANIMATION_DUREE, ease: 'easeInOut' }}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.25rem 1.5rem', background: 'white',
              borderRadius: '1rem', borderLeft: `4px solid ${actuelle.pourcentage_oui > 50 ? '#16A34A' : '#0D47A1'}`,
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              cursor: 'default'
            }}
          >
            <img
              src={utilisateur.portrait_url || '/images/default-avatar.png'}
              alt={`${utilisateur.first_name || 'Citoyen'} ${utilisateur.last_name || 'Congolais'}`}
              style={{
                width: '55px', height: '55px', borderRadius: '50%',
                border: '3px solid #FFD700', flexShrink: 0,
                objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                background: '#F3F4F6'
              }}
              onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              
              <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap',
                gap: '0.5rem', marginBottom: '0.35rem'
              }}>
                <span style={{
                  fontWeight: 700, fontSize: '0.9rem', color: '#0D47A1'
                }}>
                  {utilisateur.first_name || 'Citoyen'} {utilisateur.last_name || 'Congolais'}
                </span>
                
                {utilisateur.province && (
                  <span style={{
                    fontSize: '0.65rem', color: '#6B7280', fontWeight: 500,
                    background: '#F3F4F6', padding: '2px 8px', 
                    borderRadius: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                  }}>
                    📍 {utilisateur.province}
                  </span>
                )}
                
                <span style={{
                  fontSize: '0.65rem', color: '#0D47A1', fontWeight: 600,
                  background: '#E0F2FE', padding: '2px 8px', 
                  borderRadius: '1rem'
                }}>
                  📋 {categorieNom}
                </span>
              </div>

              <div style={{
                fontWeight: 700, fontSize: '1rem', color: '#1F2937',
                marginBottom: '0.25rem', lineHeight: 1.4
              }}>
                {actuelle.subject}
              </div>

              <div style={{
                color: '#6B7280', fontSize: '0.82rem',
                marginBottom: '0.5rem', lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {actuelle.one_sentence}
              </div>

              <div style={{
                display: 'flex', gap: '1rem', fontSize: '0.75rem',
                alignItems: 'center', flexWrap: 'wrap'
              }}>
                <span style={{ color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>✅</span> {actuelle.yes_count || 0} OUI
                </span>
                <span style={{ color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>❌</span> {actuelle.no_count || 0} NON
                </span>
                <span style={{ color: '#9CA3AF', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>🗳️</span> {actuelle.total_votes} votes
                </span>
                <span style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                  • {actuelle.temps}
                </span>
              </div>

              <div style={{
                marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <div style={{
                  flex: 1, height: '4px', background: '#F3F4F6',
                  borderRadius: '2px', overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${actuelle.pourcentage_oui}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #16A34A, #22C55E)',
                      borderRadius: '2px'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>
                  {actuelle.pourcentage_oui}%
                </span>
              </div>
            </div>

            <Link
              to={`/proposals/${actuelle.id}`}
              style={{
                padding: '0.5rem 1.2rem', background: '#0D47A1',
                color: 'white', borderRadius: '2rem', textDecoration: 'none',
                fontSize: '0.8rem', fontWeight: 600, flexShrink: 0,
                transition: 'all 0.3s ease', whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(13,71,161,0.25)',
                display: 'flex', alignItems: 'center', gap: '0.3rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1565C0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0D47A1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Voir <span style={{ fontSize: '0.9rem' }}>→</span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: '0.6rem', marginTop: '1rem'
      }}>
        <button
          onClick={propositionPrecedente}
          aria-label="Proposition précédente"
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: 'none', background: '#F3F4F6', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
        >
          ←
        </button>

        {propositions.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > indexActuel ? 'next' : 'prev');
              setIndexActuel(index);
            }}
            aria-label={`Proposition ${index + 1}`}
            title={`Voir la proposition ${index + 1}`}
            style={{
              width: index === indexActuel ? '24px' : '8px',
              height: '8px', borderRadius: '4px', border: 'none',
              background: index === indexActuel
                ? 'linear-gradient(90deg, #0D47A1, #1565C0)'
                : '#D1D5DB',
              cursor: 'pointer', transition: 'all 0.3s ease',
              boxShadow: index === indexActuel
                ? '0 0 8px rgba(13,71,161,0.4)'
                : 'none'
            }}
          />
        ))}

        <button
          onClick={propositionSuivante}
          aria-label="Proposition suivante"
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: 'none', background: '#F3F4F6', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
        >
          →
        </button>
      </div>

      {pause && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', top: '-20px', right: '0',
            fontSize: '0.7rem', color: '#6B7280',
            background: '#F3F4F6', padding: '0.2rem 0.6rem',
            borderRadius: '1rem'
          }}
        >
          ⏸️ Lecture en pause
        </motion.div>
      )}

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

export default ScrollingProposals;