import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabase';
import { Link } from 'react-router-dom';

const ScrollingProposals = () => {
  const [propositions, setPropositions] = useState([]);
  const [indexActuel, setIndexActuel] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    chargerPropositions();
  }, []);

  useEffect(() => {
    if (propositions.length === 0 || pause) return;
    const intervalle = setInterval(() => setIndexActuel(prev => (prev + 1) % propositions.length), 10000);
    return () => clearInterval(intervalle);
  }, [propositions.length, pause]);

  const chargerPropositions = async () => {
    try {
      const { data } = await supabase
        .from('proposals')
        .select('id, subject, one_sentence, yes_count, no_count, user_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        // Fetch user info separately
        const withUsers = await Promise.all(data.map(async (p) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('first_name, last_name, portrait_url, province')
            .eq('id', p.user_id)
            .maybeSingle();
          return { ...p, user: userData || {} };
        }));
        setPropositions(withUsers);
      }
    } catch (err) { console.error('Erreur:', err); }
    finally { setChargement(false); }
  };

  if (chargement) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Chargement des propositions...</div>;
  }

  if (propositions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Aucune proposition pour le moment.</div>;
  }

  const actuelle = propositions[indexActuel];
  const totalVotes = (actuelle.yes_count || 0) + (actuelle.no_count || 0);
  const user = actuelle.user || {};

  return (
    <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        <motion.div key={actuelle.id}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'white', borderRadius: '1rem', borderLeft: '4px solid #0D47A1', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
          initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
          onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
          <img src={user.portrait_url || '/images/default-avatar.png'} alt="" style={{ width: 55, height: 55, borderRadius: '50%', border: '3px solid #FFD700', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#0D47A1', fontSize: '0.9rem' }}>
              {user.first_name || 'Citoyen'} {user.last_name || 'Congolais'}
              {user.province && <span style={{ fontSize: '0.7rem', color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: '1rem', marginLeft: '0.5rem' }}>📍 {user.province}</span>}
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{actuelle.subject}</div>
            <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>{actuelle.one_sentence}</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
              <span style={{ color: '#16A34A', fontWeight: 600 }}>✅ {actuelle.yes_count || 0} OUI</span>
              <span style={{ color: '#DC2626', fontWeight: 600 }}>❌ {actuelle.no_count || 0} NON</span>
              <span style={{ color: '#999' }}>🗳️ {totalVotes} votes</span>
            </div>
          </div>
          <Link to={`/proposals/${actuelle.id}`} style={{ padding: '0.5rem 1rem', background: '#0D47A1', color: 'white', borderRadius: '2rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>Voir →</Link>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {propositions.map((_, i) => (
          <button key={i} onClick={() => setIndexActuel(i)}
            style={{ width: i === indexActuel ? '20px' : '8px', height: 8, borderRadius: 4, border: 'none', background: i === indexActuel ? '#0D47A1' : '#D1D5DB', cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  );
};

export default ScrollingProposals;