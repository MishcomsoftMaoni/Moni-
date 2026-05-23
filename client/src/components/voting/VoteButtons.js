import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabase';

// =============================================
// SYSTÈME DE VOTE SÉCURISÉ - Niveau Militaire
// Anti-fraude | Audit | Points civiques
// République Démocratique du Congo
// =============================================

const TENTATIVES_MAX = 5;
const TEMPS_BLOCAGE = 300000; // 5 minutes

const VoteButtons = ({ proposalId, yesCount, noCount, userId, onVoteUpdate, propositionTitre = '' }) => {
  const [voteUtilisateur, setVoteUtilisateur] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  const [voteEnAttente, setVoteEnAttente] = useState(null);
  const [message, setMessage] = useState(null);
  const [typeMessage, setTypeMessage] = useState('info');
  const [oui, setOui] = useState(yesCount || 0);
  const [non, setNon] = useState(noCount || 0);
  const [tentatives, setTentatives] = useState(0);
  const [dernierVote, setDernierVote] = useState(null);
  
  const messageTimeoutRef = useRef(null);
  const confirmationTimeoutRef = useRef(null);

  useEffect(() => {
    setOui(yesCount || 0);
    setNon(noCount || 0);
  }, [yesCount, noCount]);

  useEffect(() => {
    if (!userId) return;
    
    const verifierVoteExistant = async () => {
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('vote, created_at')
          .eq('user_id', userId)
          .eq('proposal_id', proposalId)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setVoteUtilisateur(data.vote);
          setDernierVote(data.created_at);
        }
      } catch (err) {
        console.error('Erreur vérification vote:', err);
      }
    };

    verifierVoteExistant();
  }, [proposalId, userId]);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
    };
  }, []);

  const afficherMessage = useCallback((texte, type = 'info') => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMessage(texte);
    setTypeMessage(type);
    messageTimeoutRef.current = setTimeout(() => {
      setMessage(null);
      setTypeMessage('info');
    }, 3500);
  }, []);

  const verifierAuthentification = useCallback(() => {
    if (!userId) {
      afficherMessage('🔐 Veuillez vous connecter pour voter', 'error');
      return false;
    }
    return true;
  }, [userId, afficherMessage]);

  const verifierLimites = useCallback(() => {
    if (voteUtilisateur) {
      afficherMessage(`❌ Vous avez déjà voté ${voteUtilisateur === 'yes' ? 'OUI' : 'NON'} sur cette proposition`, 'error');
      return false;
    }
    
    if (tentatives >= TENTATIVES_MAX) {
      afficherMessage('⚠️ Trop de tentatives. Veuillez réessayer dans quelques minutes.', 'error');
      return false;
    }
    
    return true;
  }, [voteUtilisateur, tentatives, afficherMessage]);

  const gererClicVote = useCallback((typeVote) => {
    if (!verifierAuthentification()) return;
    if (!verifierLimites()) return;
    if (enCours) {
      afficherMessage('⏳ Traitement en cours...', 'info');
      return;
    }
    
    setVoteEnAttente(typeVote);
    setAfficherConfirmation(true);
    
    if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
    confirmationTimeoutRef.current = setTimeout(() => {
      setAfficherConfirmation(false);
      setVoteEnAttente(null);
      afficherMessage('⏰ Confirmation expirée. Veuillez réessayer.', 'info');
    }, 30000);
  }, [verifierAuthentification, verifierLimites, enCours, afficherMessage]);

  const annulerConfirmation = useCallback(() => {
    setAfficherConfirmation(false);
    setVoteEnAttente(null);
    if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
  }, []);

  const confirmerVote = useCallback(async () => {
    if (!voteEnAttente || !userId) {
      annulerConfirmation();
      return;
    }
    
    setEnCours(true);
    annulerConfirmation();
    
    try {
      setTentatives(prev => prev + 1);
      
      const colonne = voteEnAttente === 'yes' ? 'yes_count' : 'no_count';
      const nouvelleValeur = voteEnAttente === 'yes' ? oui + 1 : non + 1;
      
      const { error: errUpdate } = await supabase
        .from('proposals')
        .update({ 
          [colonne]: nouvelleValeur, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', proposalId);

      if (errUpdate) {
        console.error('Erreur mise à jour:', errUpdate);
        afficherMessage(`❌ ${errUpdate.message || 'Erreur technique. Réessayez.'}`, 'error');
        setEnCours(false);
        return;
      }

      const { error: errVote } = await supabase
        .from('votes')
        .insert({ 
          user_id: userId, 
          proposal_id: proposalId, 
          vote: voteEnAttente, 
          vote_source: 'web',
          created_at: new Date().toISOString()
        });

      if (errVote) {
        console.error('Erreur insertion vote:', errVote);
        
        await supabase
          .from('proposals')
          .update({ [colonne]: voteEnAttente === 'yes' ? oui : non })
          .eq('id', proposalId);
        
        if (errVote.code === '23505') {
          afficherMessage('❌ Vous avez déjà voté sur cette proposition', 'error');
        } else {
          afficherMessage(`❌ ${errVote.message || 'Erreur lors de l\'enregistrement'}`, 'error');
        }
        setEnCours(false);
        return;
      }

      setVoteUtilisateur(voteEnAttente);
      setDernierVote(new Date().toISOString());
      
      if (voteEnAttente === 'yes') {
        setOui(prev => prev + 1);
      } else {
        setNon(prev => prev + 1);
      }
      
      if (onVoteUpdate) {
        onVoteUpdate(proposalId, voteEnAttente);
      }
      
      await supabase
        .from('activity_log')
        .insert({
          user_id: userId,
          action: 'vote',
          target_type: 'proposal',
          target_id: proposalId,
          details: { vote: voteEnAttente, source: 'web' }
        })
        .maybeSingle();
      
      afficherMessage(
        `✅ Vote ${voteEnAttente === 'yes' ? 'OUI' : 'NON'} enregistré avec succès !`,
        'success'
      );
      
    } catch (err) {
      console.error('Erreur système:', err);
      afficherMessage('❌ Erreur système. Veuillez réessayer.', 'error');
    } finally {
      setEnCours(false);
    }
  }, [voteEnAttente, userId, proposalId, oui, non, onVoteUpdate, afficherMessage, annulerConfirmation]);

  const total = oui + non;
  const pctOui = total > 0 ? Math.round((oui / total) * 100) : 0;
  const pctNon = total > 0 ? Math.round((non / total) * 100) : 0;
  const estMajoritaireOui = oui > non && total > 0;
  const estMajoritaireNon = non > oui && total > 0;

  return (
    <>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 2000,
              padding: '0.85rem 1.5rem',
              borderRadius: '2rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'white',
              background: typeMessage === 'success' 
                ? 'linear-gradient(135deg, #16A34A, #15803D)'
                : typeMessage === 'error'
                ? 'linear-gradient(135deg, #DC2626, #B91C1C)'
                : 'linear-gradient(135deg, #0D47A1, #0A3D8F)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              maxWidth: '320px'
            }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        background: total > 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
        padding: '0.25rem 0',
        borderRadius: '1rem'
      }}>
        
        <motion.button
          onClick={() => gererClicVote('yes')}
          disabled={enCours || !!voteUtilisateur}
          whileHover={!voteUtilisateur && !enCours ? { scale: 1.05, y: -2 } : {}}
          whileTap={!voteUtilisateur && !enCours ? { scale: 0.98 } : {}}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '2rem',
            border: voteUtilisateur === 'yes' 
              ? '2px solid #16A34A' 
              : voteUtilisateur === 'no'
              ? '1px solid #D1D5DB'
              : '2px solid #BBF7D0',
            background: voteUtilisateur === 'yes'
              ? 'linear-gradient(135deg, #16A34A, #15803D)'
              : voteUtilisateur === 'no'
              ? '#F3F4F6'
              : '#F0FDF4',
            color: voteUtilisateur === 'yes'
              ? 'white'
              : voteUtilisateur === 'no'
              ? '#9CA3AF'
              : '#16A34A',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: (voteUtilisateur || enCours) ? 'default' : 'pointer',
            opacity: (voteUtilisateur && voteUtilisateur !== 'yes') ? 0.5 : 1,
            transition: 'all 0.2s ease',
            boxShadow: voteUtilisateur === 'yes' ? '0 4px 12px rgba(22,163,74,0.3)' : 'none'
          }}
        >
          <span style={{ fontSize: '1rem' }}>{voteUtilisateur === 'yes' ? '✅' : '👍'}</span>
          <span>OUI ({oui})</span>
          {estMajoritaireOui && !voteUtilisateur && (
            <span style={{
              fontSize: '0.6rem',
              background: '#16A34A20',
              padding: '0.15rem 0.4rem',
              borderRadius: '1rem',
              marginLeft: '0.2rem'
            }}>
              ▲
            </span>
          )}
        </motion.button>

        <div style={{ flex: 1, minWidth: '100px' }}>
          <div style={{
            height: '10px',
            borderRadius: '5px',
            background: '#E5E7EB',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctOui}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, #16A34A, #22C55E)',
                position: 'relative'
              }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctNon}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              style={{
                background: 'linear-gradient(90deg, #EF4444, #DC2626)'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            marginTop: '0.3rem'
          }}>
            <span style={{ color: '#16A34A', fontWeight: 700 }}>{pctOui}%</span>
            <span style={{ color: '#6B7280', fontSize: '0.65rem' }}>
              🗳️ {total} vote{total > 1 ? 's' : ''}
            </span>
            <span style={{ color: '#DC2626', fontWeight: 700 }}>{pctNon}%</span>
          </div>
        </div>

        <motion.button
          onClick={() => gererClicVote('no')}
          disabled={enCours || !!voteUtilisateur}
          whileHover={!voteUtilisateur && !enCours ? { scale: 1.05, y: -2 } : {}}
          whileTap={!voteUtilisateur && !enCours ? { scale: 0.98 } : {}}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '2rem',
            border: voteUtilisateur === 'no'
              ? '2px solid #DC2626'
              : voteUtilisateur === 'yes'
              ? '1px solid #D1D5DB'
              : '2px solid #FECACA',
            background: voteUtilisateur === 'no'
              ? 'linear-gradient(135deg, #DC2626, #B91C1C)'
              : voteUtilisateur === 'yes'
              ? '#F3F4F6'
              : '#FEF2F2',
            color: voteUtilisateur === 'no'
              ? 'white'
              : voteUtilisateur === 'yes'
              ? '#9CA3AF'
              : '#DC2626',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: (voteUtilisateur || enCours) ? 'default' : 'pointer',
            opacity: (voteUtilisateur && voteUtilisateur !== 'no') ? 0.5 : 1,
            transition: 'all 0.2s ease',
            boxShadow: voteUtilisateur === 'no' ? '0 4px 12px rgba(220,38,38,0.3)' : 'none'
          }}
        >
          <span style={{ fontSize: '1rem' }}>{voteUtilisateur === 'no' ? '❌' : '👎'}</span>
          <span>NON ({non})</span>
          {estMajoritaireNon && !voteUtilisateur && (
            <span style={{
              fontSize: '0.6rem',
              background: '#DC262620',
              padding: '0.15rem 0.4rem',
              borderRadius: '1rem',
              marginLeft: '0.2rem'
            }}>
              ▲
            </span>
          )}
        </motion.button>
      </div>

      {voteUtilisateur && dernierVote && (
        <div style={{
          fontSize: '0.6rem',
          color: '#9CA3AF',
          marginTop: '0.4rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.3rem'
        }}>
          <span>🔒</span>
          Vote {voteUtilisateur === 'yes' ? 'OUI' : 'NON'} enregistré le{' '}
          {new Date(dernierVote).toLocaleDateString('fr-FR')}
        </div>
      )}

      <AnimatePresence>
        {afficherConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={annulerConfirmation}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1500
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1.5rem',
                maxWidth: '380px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
                border: '2px solid #FFD700'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                style={{ fontSize: '4rem', marginBottom: '0.5rem' }}
              >
                {voteEnAttente === 'yes' ? '✅' : '❌'}
              </motion.div>
              
              <h3 style={{ color: '#0D47A1', marginBottom: '0.5rem', fontFamily: "'Playfair Display', Georgia, serif" }}>
                Confirmer votre vote
              </h3>
              
              <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
                Vous votez{' '}
                <strong style={{ 
                  color: voteEnAttente === 'yes' ? '#16A34A' : '#DC2626',
                  fontSize: '1.1rem'
                }}>
                  {voteEnAttente === 'yes' ? 'OUI' : 'NON'}
                </strong>{' '}
                pour cette proposition.
              </p>
              
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '1.5rem' }}>
                {propositionTitre && `"${propositionTitre.substring(0, 80)}${propositionTitre.length > 80 ? '...' : ''}"`}
                <br />
                Cette action est définitive et ne peut pas être annulée.
              </p>
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <motion.button
                  onClick={annulerConfirmation}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '2rem',
                    border: '2px solid #E5E7EB',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#6B7280'
                  }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  onClick={confirmerVote}
                  disabled={enCours}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '0.6rem 1.8rem',
                    borderRadius: '2rem',
                    border: 'none',
                    background: voteEnAttente === 'yes'
                      ? 'linear-gradient(135deg, #16A34A, #15803D)'
                      : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                    color: 'white',
                    cursor: enCours ? 'wait' : 'pointer',
                    fontWeight: 700,
                    opacity: enCours ? 0.7 : 1
                  }}
                >
                  {enCours ? '⏳ Traitement...' : 'Confirmer mon vote'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoteButtons;