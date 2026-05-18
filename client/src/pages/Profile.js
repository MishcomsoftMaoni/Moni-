import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const BADGES_LIST = {
  'contributor': { icone: '✍️', label: 'Contributeur', couleur: '#7C3AED', description: 'A soumis des propositions' },
  'super_voter': { icone: '🗳️', label: 'Super Votant', couleur: '#D97706', description: 'A voté plus de 50 fois' },
  'early_adopter': { icone: '🌟', label: 'Précurseur', couleur: '#059669', description: 'Parmi les premiers inscrits' },
  'active_citizen': { icone: '🏆', label: 'Citoyen Actif', couleur: '#DC2626', description: 'Participation exceptionnelle' },
  'verified': { icone: '✓', label: 'Vérifié', couleur: '#16A34A', description: 'Identité vérifiée' },
};

const Profile = () => {
  const auth = useAuth();
  const profil = auth.profil || auth.profile || {};
  const utilisateur = auth.utilisateur || auth.user;
  const deconnexion = auth.deconnexion || auth.logout;
  const navigate = useNavigate();

  const [mesPropositions, setMesPropositions] = useState([]);
  const [mesVotes, setMesVotes] = useState([]);
  const [pret, setPret] = useState(false);
  const [onglet, setOnglet] = useState('propositions');

  useEffect(() => {
    if (!utilisateur) { setPret(true); return; }
    const charger = async () => {
      try {
        const [resProp, resVotes] = await Promise.all([
          supabase.from('proposals').select('*').eq('user_id', utilisateur.id).order('created_at', { ascending: false }),
          supabase.from('votes').select('id,vote,created_at,proposal:proposals(id,subject,yes_count,no_count)').eq('user_id', utilisateur.id).order('created_at', { ascending: false }).limit(50)
        ]);
        setMesPropositions(resProp.data || []);
        setMesVotes(resVotes.data || []);
      } catch (err) { console.error(err); }
      finally { setPret(true); }
    };
    charger();
  }, [utilisateur]);

  const gererDeconnexion = async () => { await deconnexion(); navigate('/'); };

  if (!utilisateur && !auth.chargement && !auth.loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', background: 'white', padding: '3rem 2rem', borderRadius: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', maxWidth: '450px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connectez-vous</h2>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>pour accéder à votre profil citoyen.</p>
          <Link to="/login" style={{ padding: '0.75rem 2.5rem', background: '#0D47A1', color: 'white', borderRadius: '3rem', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 6px 20px rgba(13,71,161,0.3)' }}>Se connecter</Link>
        </motion.div>
      </div>
    );
  }

  if (!pret) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: '1rem', background: '#F1F5F9' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#0D47A1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#0D47A1', fontWeight: 600, fontSize: '1rem' }}>Chargement de votre profil...</p>
      </div>
    );
  }

  const totalVotesRecus = mesPropositions.reduce((s, p) => s + (p.yes_count || 0) + (p.no_count || 0), 0);
  const publiees = mesPropositions.filter(p => p.status === 'published' || p.status === 'featured').length;

  const statutBadge = (statut) => {
    const s = {
      'published': { label: 'Publiée', couleur: '#16A34A', fond: '#DCFCE7' },
      'pending': { label: 'En attente', couleur: '#D97706', fond: '#FEF3C7' },
      'featured': { label: 'En vedette', couleur: '#7C3AED', fond: '#EDE9FE' },
      'rejected': { label: 'Rejetée', couleur: '#DC2626', fond: '#FEE2E2' },
      'draft': { label: 'Brouillon', couleur: '#6B7280', fond: '#F3F4F6' },
    }[statut] || { label: statut, couleur: '#6B7280', fond: '#F3F4F6' };
    return <span style={{ background: s.fond, color: s.couleur, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '1rem', whiteSpace: 'nowrap' }}>{s.label}</span>;
  };

  return (
    <>
      <Helmet><title>{profil.first_name || 'Mon'} Profil | MAONI</title></Helmet>

      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        {/* Bannière premium */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #C62828 100%)', padding: '3rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={profil.portrait_url || '/images/default-avatar.png'} alt="" style={{ width: '105px', height: '105px', borderRadius: '50%', border: '4px solid #FFD700', objectFit: 'cover', boxShadow: '0 10px 35px rgba(0,0,0,0.35)' }} />
              {profil.is_verified && (
                <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#16A34A', color: 'white', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: '2px solid white' }}>✓</span>
              )}
            </div>
            <h1 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '1.8rem', margin: '0.75rem 0 0.15rem' }}>
              {profil.first_name || 'Citoyen'} {profil.last_name || 'Congolais'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', margin: '0 0 0.25rem' }}>{profil.profession || ''}</p>
            <p style={{ color: '#FFD700', fontSize: '0.88rem', margin: 0 }}>
              📍 {profil.diaspora ? `Diaspora – ${profil.other_residence || 'Étranger'}` : (profil.province || 'RDC')}
            </p>
            {/* Badges */}
            {(profil.badges || []).length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {(profil.badges || []).map(b => {
                  const badge = BADGES_LIST[b];
                  return badge ? (
                    <span key={b} title={badge.description} style={{ background: `${badge.couleur}22`, color: badge.couleur, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '1rem', border: `1px solid ${badge.couleur}44`, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {badge.icone} {badge.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Membre depuis {profil.created_at ? new Date(profil.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '...'}
            </p>
          </div>
        </motion.div>

        <div style={{ maxWidth: '850px', margin: '-3rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
          
          {/* Cartes statistiques */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { icone: '📝', valeur: mesPropositions.length, label: 'Propositions', couleur: '#0D47A1', description: 'Total soumises' },
              { icone: '✅', valeur: publiees, label: 'Publiées', couleur: '#16A34A', description: 'Acceptées' },
              { icone: '🗳️', valeur: totalVotesRecus, label: 'Votes reçus', couleur: '#7C3AED', description: 'Sur vos propositions' },
              { icone: '⭐', valeur: profil.civic_points || 0, label: 'Points', couleur: '#D97706', description: 'Points civiques' },
            ].map((s, i) => (
              <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.12)' }}
                style={{ background: 'white', padding: '1.1rem', borderRadius: '0.85rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${s.couleur}`, cursor: 'default' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{s.icone}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.couleur, fontFamily: 'Georgia, serif' }}>{s.valeur}</div>
                <div style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: '2px' }}>{s.description}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Link to="/submit-proposal" style={{ flex: 1, textAlign: 'center', padding: '0.8rem', background: 'linear-gradient(135deg, #FFD700, #F9A825)', color: '#0D47A1', borderRadius: '0.85rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 6px 20px rgba(255,215,0,0.35)' }}>
              ✍️ Soumettre une proposition
            </Link>
            <button onClick={gererDeconnexion} style={{ padding: '0.8rem 1.5rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '0.85rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s ease' }}
              onMouseEnter={e => e.target.style.background = '#FECACA'} onMouseLeave={e => e.target.style.background = '#FEE2E2'}>
              🚪 Déconnexion
            </button>
          </div>

          {/* Informations */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
            <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', margin: '0 0 1rem', fontSize: '1.05rem', paddingBottom: '0.5rem', borderBottom: '2px solid #E5E7EB' }}>📋 Informations personnelles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', color: '#374151' }}>
              {[
                { icone: '📧', label: 'Email', valeur: profil.email },
                { icone: '💼', label: 'Profession', valeur: profil.profession },
                { icone: '📍', label: 'Localisation', valeur: profil.diaspora ? `Diaspora – ${profil.other_residence || 'Étranger'}` : profil.province },
                { icone: '📞', label: 'Téléphone', valeur: profil.phone },
                { icone: '🎂', label: 'Âge', valeur: profil.age_range },
                { icone: '⭐', label: 'Points civiques', valeur: profil.civic_points || 0 },
              ].filter(i => i.valeur).map((item, i) => (
                <div key={i} style={{ padding: '0.6rem', background: '#F8FAFC', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '2px' }}>{item.icone} {item.label}</div>
                  <div style={{ fontWeight: 600 }}>{item.valeur || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Onglets Propositions / Votes */}
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '2px solid #F3F4F6' }}>
              {[
                { id: 'propositions', label: `📝 Mes propositions (${mesPropositions.length})` },
                { id: 'votes', label: `🗳️ Mes votes (${mesVotes.length})` },
              ].map(tab => (
                <button key={tab.id} onClick={() => setOnglet(tab.id)}
                  style={{ flex: 1, padding: '0.85rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: onglet === tab.id ? '#0D47A1' : '#9CA3AF', borderBottom: onglet === tab.id ? '3px solid #0D47A1' : '3px solid transparent', transition: 'all 0.2s' }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ padding: '1.25rem', maxHeight: '500px', overflowY: 'auto' }}>
              <AnimatePresence mode="wait">
                {onglet === 'propositions' ? (
                  <motion.div key="props" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {mesPropositions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9CA3AF' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📝</div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Aucune proposition soumise.</p>
                        <Link to="/submit-proposal" style={{ color: '#0D47A1', fontWeight: 700, fontSize: '0.9rem' }}>Soumettre ma première proposition →</Link>
                      </div>
                    ) : (
                      mesPropositions.map(p => {
                        const total = (p.yes_count || 0) + (p.no_count || 0);
                        const pctOui = total > 0 ? Math.round((p.yes_count / total) * 100) : 0;
                        return (
                          <motion.div key={p.id} whileHover={{ y: -1 }}
                            style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', marginBottom: '0.5rem', background: '#FAFAFA' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                              <Link to={`/proposals/${p.id}`} style={{ fontWeight: 700, color: '#0D47A1', textDecoration: 'none', fontSize: '0.88rem', flex: 1, lineHeight: 1.3 }}>{p.subject}</Link>
                              {statutBadge(p.status)}
                            </div>
                            {p.one_sentence && <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: '0 0 0.5rem', fontStyle: 'italic' }}>💡 {p.one_sentence}</p>}
                            <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                              <div style={{ height: '100%', width: `${pctOui}%`, background: 'linear-gradient(90deg, #16A34A, #22C55E)', borderRadius: '3px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9CA3AF' }}>
                              <span style={{ color: '#16A34A', fontWeight: 600 }}>✅ {p.yes_count || 0}</span>
                              <span>{total} votes</span>
                              <span style={{ color: '#DC2626', fontWeight: 600 }}>{p.no_count || 0} ❌</span>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="votes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {mesVotes.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9CA3AF' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗳️</div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Aucun vote exprimé.</p>
                        <Link to="/proposals" style={{ color: '#0D47A1', fontWeight: 700, fontSize: '0.9rem' }}>Consulter les propositions →</Link>
                      </div>
                    ) : (
                      mesVotes.map(v => (
                        <motion.div key={v.id} whileHover={{ y: -1 }}
                          style={{ padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: `2px solid ${v.vote === 'yes' ? '#BBF7D0' : '#FECACA'}`, background: v.vote === 'yes' ? '#F0FDF4' : '#FFF5F5', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          <Link to={`/proposals/${v.proposal?.id}`} style={{ fontWeight: 600, color: '#1F2937', textDecoration: 'none', fontSize: '0.85rem', flex: 1, lineHeight: 1.3 }}>{v.proposal?.subject || 'Proposition supprimée'}</Link>
                          <span style={{ background: v.vote === 'yes' ? '#16A34A' : '#DC2626', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '1rem', flexShrink: 0 }}>
                            {v.vote === 'yes' ? '✅ OUI' : '❌ NON'}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;