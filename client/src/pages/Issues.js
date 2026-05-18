import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => { chargerIssues(); }, []);

  const chargerIssues = async () => {
    try {
      const { data } = await supabase
        .from('issues')
        .select('*, auteur:profiles(first_name, last_name, province)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20);
      setIssues(data || []);
    } catch (err) { console.error('Erreur:', err); }
    finally { setChargement(false); }
  };

  return (
    <>
      <Helmet><title>Problèmes Signalés | MAONI</title></Helmet>
      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #C62828, #DC2626)', padding: '3rem 0', textAlign: 'center', color: 'white', borderBottom: '5px solid #FFD700' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', margin: 0 }}>⚠️ Problèmes Signalés</h1>
          <p style={{ opacity: 0.9, margin: '0.5rem 0 0' }}>Problèmes identifiés dans la Constitution actuelle</p>
        </div>
        <div style={{ maxWidth: '800px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
          {chargement ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '44px', height: '44px', border: '4px solid #E5E7EB', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>
              <div style={{ fontSize: '4rem' }}>📭</div>
              <h3>Aucun problème signalé</h3>
            </div>
          ) : (
            issues.map(issue => (
              <motion.div key={issue.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1rem', borderLeft: '5px solid #DC2626' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#DC2626' }}>⚠️ {issue.subject}</span>
                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{issue.created_at ? formatDistanceToNow(new Date(issue.created_at), { addSuffix: true, locale: fr }) : ''}</span>
                </div>
                <p style={{ color: '#6B7280', fontStyle: 'italic', marginBottom: '0.5rem' }}>💡 {issue.one_sentence}</p>
                <p style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{issue.content?.substring(0, 200)}...</p>
                {issue.consequence && <p style={{ color: '#DC2626', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ Conséquence: {issue.consequence?.substring(0, 150)}...</p>}
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
                  Par {issue.auteur?.first_name || 'Citoyen'} {issue.auteur?.last_name || 'Congolais'} • 📍 {issue.auteur?.province || 'RDC'}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Issues;