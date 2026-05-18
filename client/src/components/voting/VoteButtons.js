import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabase';

const VoteButtons = ({ proposalId, yesCount, noCount, userId, onVoteUpdate }) => {
  const [voteUtilisateur, setVoteUtilisateur] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  const [voteEnAttente, setVoteEnAttente] = useState(null);
  const [message, setMessage] = useState(null);
  const [oui, setOui] = useState(yesCount || 0);
  const [non, setNon] = useState(noCount || 0);

  useEffect(() => { setOui(yesCount || 0); setNon(noCount || 0); }, [yesCount, noCount]);

  useEffect(() => {
    if (!userId) return;
    supabase.from('votes').select('vote').eq('user_id', userId).eq('proposal_id', proposalId).maybeSingle()
      .then(({ data }) => { if (data) setVoteUtilisateur(data.vote); })
      .catch(() => {});
  }, [proposalId, userId]);

  const gererClicVote = (typeVote) => {
    // CHECK IF LOGGED IN
    if (!userId) {
      setMessage('Connectez-vous pour voter.');
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    if (voteUtilisateur) {
      setMessage('Vous avez déjà voté.');
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    setVoteEnAttente(typeVote);
    setAfficherConfirmation(true);
  };

  const confirmerVote = async () => {
    if (!voteEnAttente || !userId) return;
    setEnCours(true); 
    setAfficherConfirmation(false);
    
    try {
      console.log('Voting:', { userId, proposalId, vote: voteEnAttente });
      
      // Try direct update first (bypass RPC)
      const colonne = voteEnAttente === 'yes' ? 'yes_count' : 'no_count';
      const nouvelleValeur = voteEnAttente === 'yes' ? oui + 1 : non + 1;
      
      // Update proposal count
      const { error: errUpdate } = await supabase.from('proposals')
        .update({ [colonne]: nouvelleValeur, updated_at: new Date().toISOString() })
        .eq('id', proposalId);

      if (errUpdate) {
        console.error('Update error:', errUpdate);
        setMessage('Erreur: ' + errUpdate.message);
        setTimeout(() => setMessage(null), 3000);
        setEnCours(false);
        return;
      }

      // Insert vote record
      const { error: errVote } = await supabase.from('votes').insert({ 
        user_id: userId, 
        proposal_id: proposalId, 
        vote: voteEnAttente, 
        vote_source: 'web' 
      });

      if (errVote) {
        console.error('Vote insert error:', errVote);
        // Rollback the count
        await supabase.from('proposals').update({ [colonne]: voteEnAttente === 'yes' ? oui : non }).eq('id', proposalId);
        if (errVote.code === '23505') setMessage('Vous avez déjà voté.');
        else setMessage('Erreur: ' + errVote.message);
        setTimeout(() => setMessage(null), 3000);
        setEnCours(false);
        return;
      }

      // Success!
      setVoteUtilisateur(voteEnAttente);
      if (voteEnAttente === 'yes') setOui(prev => prev + 1);
      else setNon(prev => prev + 1);
      if (onVoteUpdate) onVoteUpdate(proposalId, voteEnAttente);
      setMessage('✅ Vote enregistré !');
      setTimeout(() => setMessage(null), 3000);
      
    } catch (err) {
      console.error('Vote error:', err);
      setMessage('Erreur. Réessayez.');
      setTimeout(() => setMessage(null), 3000);
    } finally { 
      setEnCours(false); 
    }
  };

  const total = oui + non;
  const pctOui = total > 0 ? Math.round((oui / total) * 100) : 0;

  return (
    <>
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, padding: '0.75rem 1.5rem', borderRadius: '2rem', fontWeight: 600, fontSize: '0.9rem', color: 'white', background: message.includes('✅') ? '#16A34A' : '#F59E0B', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}>
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <motion.button onClick={() => gererClicVote('yes')} disabled={enCours || !!voteUtilisateur}
          whileHover={!voteUtilisateur ? { scale: 1.04 } : {}} whileTap={!voteUtilisateur ? { scale: 0.96 } : {}}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem', borderRadius: '2rem', border: voteUtilisateur === 'yes' ? '2px solid #16A34A' : '2px solid #BBF7D0', background: voteUtilisateur === 'yes' ? '#16A34A' : '#F0FDF4', color: voteUtilisateur === 'yes' ? 'white' : '#16A34A', fontWeight: 700, fontSize: '0.85rem', cursor: voteUtilisateur ? 'default' : 'pointer', opacity: voteUtilisateur && voteUtilisateur !== 'yes' ? 0.5 : 1 }}>
          {voteUtilisateur === 'yes' ? '✅' : '👍'} OUI ({oui})
        </motion.button>

        <div style={{ flex: 1, minWidth: 80 }}>
          <div style={{ height: 8, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${pctOui}%`, background: 'linear-gradient(90deg, #16A34A, #22C55E)' }} />
            <div style={{ width: `${100-pctOui}%`, background: 'linear-gradient(90deg, #EF4444, #DC2626)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9CA3AF', marginTop: 2 }}>
            <span style={{ color: '#16A34A', fontWeight: 600 }}>{pctOui}%</span>
            <span>{total} votes</span>
            <span style={{ color: '#DC2626', fontWeight: 600 }}>{100-pctOui}%</span>
          </div>
        </div>

        <motion.button onClick={() => gererClicVote('no')} disabled={enCours || !!voteUtilisateur}
          whileHover={!voteUtilisateur ? { scale: 1.04 } : {}} whileTap={!voteUtilisateur ? { scale: 0.96 } : {}}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem', borderRadius: '2rem', border: voteUtilisateur === 'no' ? '2px solid #DC2626' : '2px solid #FECACA', background: voteUtilisateur === 'no' ? '#DC2626' : '#FEF2F2', color: voteUtilisateur === 'no' ? 'white' : '#DC2626', fontWeight: 700, fontSize: '0.85rem', cursor: voteUtilisateur ? 'default' : 'pointer', opacity: voteUtilisateur && voteUtilisateur !== 'no' ? 0.5 : 1 }}>
          {voteUtilisateur === 'no' ? '❌' : '👎'} NON ({non})
        </motion.button>
      </div>

      <AnimatePresence>
        {afficherConfirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAfficherConfirmation(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
              style={{ background: 'white', padding: '2rem', borderRadius: '1.25rem', maxWidth: 400, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '3rem' }}>{voteEnAttente === 'yes' ? '✅' : '❌'}</div>
              <h3 style={{ color: '#0D47A1' }}>Confirmer votre vote</h3>
              <p>Vous votez <strong style={{ color: voteEnAttente === 'yes' ? '#16A34A' : '#DC2626' }}>{voteEnAttente === 'yes' ? 'OUI' : 'NON'}</strong>. Cette action est définitive.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={() => setAfficherConfirmation(false)} style={{ padding: '0.6rem 1.5rem', borderRadius: '2rem', border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <motion.button onClick={confirmerVote} whileHover={{ scale: 1.03 }} disabled={enCours}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '2rem', border: 'none', background: voteEnAttente === 'yes' ? '#16A34A' : '#DC2626', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  Confirmer
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