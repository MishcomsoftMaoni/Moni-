import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import VoteButtons from '../components/voting/VoteButtons';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// =============================================
// DÉTAIL D'UNE PROPOSITION - Niveau Présidentiel
// Consultation citoyenne | Partage | Analyse
// Version: 100.0.4
// =============================================

const CATEGORIES = {
  'constitutional': { label: 'Réforme Constitutionnelle', icone: '📜', couleur: '#0D47A1' },
  'electoral': { label: 'Système Électoral', icone: '🗳️', couleur: '#16A34A' },
  'decentralization': { label: 'Décentralisation', icone: '🏛️', couleur: '#D97706' },
  'justice': { label: 'Justice et Droits', icone: '⚖️', couleur: '#7C3AED' },
  'economy': { label: 'Économie et Développement', icone: '💰', couleur: '#0891B2' },
  'security': { label: 'Sécurité et Défense', icone: '🛡️', couleur: '#DC2626' },
  'education': { label: 'Éducation', icone: '📚', couleur: '#059669' },
  'health': { label: 'Santé', icone: '🏥', couleur: '#E11D48' },
  'other': { label: 'Autre', icone: '📌', couleur: '#6B7280' },
};

const ProposalDetail = () => {
  const { id } = useParams();
  const auth = useAuth();
  const utilisateur = auth.utilisateur || auth.user;
  const estAuthentifie = auth.estAuthentifie || auth.isAuthenticated;
  const navigate = useNavigate();
  
  const [proposition, setProposition] = useState(null);
  const [auteur, setAuteur] = useState({});
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [copieLien, setCopieLien] = useState(false);
  const [imageActive, setImageActive] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [envoiCommentaire, setEnvoiCommentaire] = useState(false);

  useEffect(() => { 
    if (id) {
      chargerProposition();
      chargerCommentaires();
    }
  }, [id]);

  const chargerProposition = useCallback(async () => {
    setChargement(true);
    try {
      await supabase.rpc('increment_view_count', { proposal_id: id }).catch(() => {});
      
      const { data, error } = await supabase
        .from('proposals')
        .select('id, user_id, subject, one_sentence, content, category, image_urls, video_urls, file_urls, yes_count, no_count, view_count, status, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();
      
      if (error || !data) throw new Error('Introuvable');
      setProposition(data);
      
      if (data.user_id) {
        const { data: profilData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, portrait_url, province, profession, civic_points, badges, is_verified')
          .eq('id', data.user_id)
          .maybeSingle();
        if (profilData) setAuteur(profilData);
      }
    } catch (err) { 
      setErreur('Proposition introuvable.'); 
    } finally { 
      setChargement(false); 
    }
  }, [id]);

  const chargerCommentaires = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('comments')
        .select('*, user:profiles(id, first_name, last_name, portrait_url)')
        .eq('proposal_id', id)
        .eq('status', 'published')
        .order('created_at', { ascending: true });
      setCommentaires(data || []);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
    }
  }, [id]);

  const handleVoteUpdate = useCallback((proposalId, voteType) => {
    setProposition(prev => prev ? { 
      ...prev, 
      yes_count: voteType === 'yes' ? (prev.yes_count || 0) + 1 : prev.yes_count, 
      no_count: voteType === 'no' ? (prev.no_count || 0) + 1 : prev.no_count 
    } : prev);
  }, []);

  const handleAjouterCommentaire = async () => {
    if (!estAuthentifie) {
      alert('Connectez-vous pour commenter');
      return;
    }
    if (!nouveauCommentaire.trim()) return;
    
    setEnvoiCommentaire(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: utilisateur.id,
          proposal_id: id,
          content: nouveauCommentaire.trim(),
          status: 'published'
        })
        .select();
      
      if (error) throw error;
      
      setNouveauCommentaire('');
      await chargerCommentaires();
    } catch (err) {
      console.error('Erreur ajout commentaire:', err);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setEnvoiCommentaire(false);
    }
  };

  const partager = useCallback((plateforme) => {
    const url = encodeURIComponent(window.location.href);
    const texte = encodeURIComponent(`${proposition.subject} - ${proposition.one_sentence || ''}`);
    const liens = {
      facebook: `https://web.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${texte}%20${url}`,
      tiktok: `https://www.tiktok.com/share?text=${texte}`,
      twitter: `https://twitter.com/intent/tweet?text=${texte}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${texte}`,
    };
    window.open(liens[plateforme], '_blank');
  }, [proposition]);

  const inviterAmis = useCallback((plateforme) => {
    const url = encodeURIComponent(window.location.href);
    const message = encodeURIComponent(`Soutenez ma proposition sur MAONI ! Votez OUI : "${proposition.subject}" ${window.location.href}`);
    const liens = {
      facebook: `https://web.facebook.com/sharer/sharer.php?u=${url}&quote=${message}`,
      whatsapp: `https://wa.me/?text=${message}`,
      telegram: `https://t.me/share/url?url=${url}&text=${message}`,
    };
    window.open(liens[plateforme], '_blank');
  }, [proposition]);

  const copierLienFn = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopieLien(true);
    setTimeout(() => setCopieLien(false), 2500);
  }, []);

  if (chargement) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: '1rem', background: '#F1F5F9' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#0D47A1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#0D47A1', fontWeight: 600, fontSize: '1rem' }}>Chargement de la proposition...</p>
      </div>
    );
  }

  if (erreur || !proposition) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#F1F5F9', minHeight: '70vh' }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>😕</div>
          <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Proposition introuvable</h2>
          <p style={{ color: '#6B7280', marginBottom: '2rem' }}>{erreur || 'Cette proposition n\'existe pas ou a été supprimée.'}</p>
          <Link to="/proposals" style={{ padding: '0.75rem 2.5rem', background: '#0D47A1', color: 'white', borderRadius: '3rem', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 6px 20px rgba(13,71,161,0.3)' }}>← Retour aux propositions</Link>
        </motion.div>
      </div>
    );
  }

  const totalVotes = (proposition.yes_count || 0) + (proposition.no_count || 0);
  const pctOui = totalVotes > 0 ? Math.round(((proposition.yes_count || 0) / totalVotes) * 100) : 0;
  const estAuteur = utilisateur && proposition.user_id === utilisateur.id;
  const categorieInfo = CATEGORIES[proposition.category] || CATEGORIES.other;

  return (
    <>
      <Helmet>
        <title>{proposition.subject} | MAONI RDC</title>
        <meta name="description" content={proposition.one_sentence || 'Proposition citoyenne sur MAONI'} />
        <meta property="og:title" content={proposition.subject} />
        <meta property="og:description" content={proposition.one_sentence || 'Proposition citoyenne'} />
        <meta property="og:image" content={proposition.image_urls?.[0] || '/images/logo-drc-map.png'} />
      </Helmet>

      {/* Lightbox */}
      <AnimatePresence>
        {imageActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setImageActive(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <img src={imageActive} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '0.5rem' }} />
            <button onClick={() => setImageActive(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        {/* Fil d'Ariane */}
        <div style={{ background: 'white', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: '68px', zIndex: 10 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', fontSize: '0.85rem', color: '#6B7280' }}>
            <Link to="/" style={{ color: '#0D47A1', textDecoration: 'none', fontWeight: 500 }}>Accueil</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <Link to="/proposals" style={{ color: '#0D47A1', textDecoration: 'none', fontWeight: 500 }}>Propositions</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <span style={{ color: '#374151', fontWeight: 500 }}>{proposition.subject?.substring(0, 60)}...</span>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* CONTENU PRINCIPAL */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '5px solid #0D47A1' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ background: `${categorieInfo.couleur}15`, color: categorieInfo.couleur, fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {categorieInfo.icone} {categorieInfo.label}
                </span>
                {proposition.status === 'featured' && (
                  <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '1rem' }}>
                    ⭐ Proposition en vedette
                  </span>
                )}
              </div>
              
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', color: '#111827', lineHeight: 1.4, marginBottom: '1rem' }}>
                {proposition.subject}
              </h1>
              
              {proposition.one_sentence && (
                <div style={{ fontStyle: 'italic', borderLeft: '4px solid #FFD700', padding: '1rem 1.25rem', background: '#FFFBEB', borderRadius: '0 0.75rem 0.75rem 0', marginBottom: '1.5rem', lineHeight: 1.6, color: '#374151' }}>
                  💡 {proposition.one_sentence}
                </div>
              )}

              {/* Auteur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: '#F8FAFC', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #E5E7EB' }}>
                <img src={auteur.portrait_url || '/images/default-avatar.png'} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid #FFD700', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0D47A1', fontSize: '0.95rem' }}>
                    {auteur.first_name || 'Citoyen'} {auteur.last_name || 'Congolais'}
                    {auteur.is_verified && <span style={{ color: '#16A34A', marginLeft: '0.3rem' }}>✓ Vérifié</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                    {auteur.profession && <span>{auteur.profession}</span>}
                    {auteur.province && <span> • 📍 {auteur.province}</span>}
                    {auteur.civic_points > 0 && <span> • ⭐ {auteur.civic_points} points</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', flexShrink: 0 }}>
                  <div>{format(new Date(proposition.created_at), 'dd MMM yyyy', { locale: fr })}</div>
                  <div>{formatDistanceToNow(new Date(proposition.created_at), { addSuffix: true, locale: fr })}</div>
                </div>
              </div>

              {/* Zone de vote */}
              <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', borderRadius: '0.75rem', border: '2px solid #BBF7D0', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', marginTop: 0, fontSize: '1.1rem' }}>🗳️ Donnez votre avis</h3>
                {estAuthentifie ? (
                  <VoteButtons 
                    proposalId={proposition.id} 
                    yesCount={proposition.yes_count || 0} 
                    noCount={proposition.no_count || 0} 
                    userId={utilisateur?.id} 
                    onVoteUpdate={handleVoteUpdate} 
                    propositionTitre={proposition.subject}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#FFFBEB', borderRadius: '0.5rem', border: '1px solid #FDE68A' }}>
                    <p style={{ color: '#92400E', marginBottom: '0.75rem', fontWeight: 600 }}>🔒 Connectez-vous pour voter sur cette proposition</p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <Link to="/login" style={{ padding: '0.5rem 1.5rem', background: '#0D47A1', color: 'white', borderRadius: '2rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Se connecter</Link>
                      <Link to="/register" style={{ padding: '0.5rem 1.5rem', background: '#FFD700', color: '#0D47A1', borderRadius: '2rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Créer un compte</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Invitation aux amis (auteur uniquement) */}
              {estAuteur && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: '1.5rem', background: '#FFF7ED', borderRadius: '0.75rem', border: '2px solid #FED7AA', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: '#C2410C', fontFamily: 'Georgia, serif', margin: 0, fontSize: '1rem' }}>📢 Invitez vos amis à voter !</h4>
                    <span style={{ background: '#FED7AA', color: '#C2410C', padding: '4px 12px', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700 }}>👑 Votre proposition</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#9A3412', marginBottom: '1rem' }}>
                    Cette proposition a <strong>{totalVotes} votes</strong>. Partagez-la pour obtenir plus de soutien !
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => inviterAmis('facebook')} style={{ padding: '0.6rem 1.2rem', background: '#1877F2', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>📘 Facebook</button>
                    <button onClick={() => inviterAmis('whatsapp')} style={{ padding: '0.6rem 1.2rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>💬 WhatsApp</button>
                    <button onClick={() => inviterAmis('telegram')} style={{ padding: '0.6rem 1.2rem', background: '#0088cc', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>📱 Telegram</button>
                  </div>
                </motion.div>
              )}

              {/* Contenu détaillé */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.75rem', fontSize: '1.05rem', paddingBottom: '0.5rem', borderBottom: '2px solid #E5E7EB' }}>📄 Proposition détaillée</h3>
                {proposition.content ? (
                  <div dangerouslySetInnerHTML={{ __html: proposition.content }} style={{ lineHeight: 1.9, color: '#374151', fontSize: '0.95rem' }} />
                ) : (
                  <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem' }}>Aucun contenu détaillé fourni.</p>
                )}
              </div>

              {/* Images */}
              {(proposition.image_urls || []).length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.75rem', fontSize: '1rem' }}>🖼️ Images jointes ({proposition.image_urls.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {proposition.image_urls.map((img, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.03 }} onClick={() => setImageActive(img)}
                        style={{ cursor: 'pointer', borderRadius: '0.5rem', overflow: 'hidden', border: '2px solid #E5E7EB', aspectRatio: '1' }}>
                        <img src={img} alt={`Image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {(proposition.file_urls || []).length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.75rem', fontSize: '1rem' }}>📎 Documents joints ({proposition.file_urls.length})</h3>
                  {proposition.file_urls.map((fichier, i) => (
                    <a key={i} href={fichier} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '0.5rem', marginBottom: '0.35rem', color: '#0D47A1', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1px solid #E5E7EB', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'} 
                      onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}>
                      <span style={{ fontSize: '1.2rem' }}>📄</span> Télécharger le document {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {/* Section commentaires */}
              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', fontSize: '1rem' }}>
                  💬 Commentaires ({commentaires.length})
                </h3>
                
                {estAuthentifie ? (
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <textarea
                      value={nouveauCommentaire}
                      onChange={(e) => setNouveauCommentaire(e.target.value)}
                      placeholder="Partagez votre avis sur cette proposition..."
                      rows={3}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid #E5E7EB', fontSize: '0.85rem', resize: 'vertical', outline: 'none' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                    <button
                      onClick={handleAjouterCommentaire}
                      disabled={envoiCommentaire || !nouveauCommentaire.trim()}
                      style={{ padding: '0.75rem 1.5rem', background: envoiCommentaire ? '#9CA3AF' : '#0D47A1', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: envoiCommentaire ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      {envoiCommentaire ? '⏳' : 'Envoyer'}
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                    <Link to="/login" style={{ color: '#0D47A1', fontWeight: 600 }}>Connectez-vous</Link> pour commenter
                  </div>
                )}

                {commentaires.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '1.5rem' }}>Aucun commentaire pour le moment. Soyez le premier !</p>
                ) : (
                  commentaires.map((c) => (
                    <div key={c.id} style={{ padding: '0.75rem', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '0.75rem' }}>
                      <img src={c.user?.portrait_url || '/images/default-avatar.png'} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0D47A1' }}>
                          {c.user?.first_name || 'Citoyen'} {c.user?.last_name || 'Congolais'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#374151', margin: '0.25rem 0' }}>{c.content}</div>
                        <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
                          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.6rem 1.5rem', background: '#EFF6FF', color: '#0D47A1', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>← Retour</button>
                <Link to="/proposals" style={{ padding: '0.6rem 1.5rem', background: '#0D47A1', color: 'white', borderRadius: '2rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>📋 Toutes les propositions</Link>
              </div>
            </motion.div>

            {/* SIDEBAR */}
            <div style={{ position: 'sticky', top: '140px' }}>
              
              {/* Résultat du vote */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1rem', textAlign: 'center' }}>
                <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', fontSize: '1rem' }}>📊 Résultat du vote</h3>
                
                <div style={{ width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto 1rem', background: `conic-gradient(#16A34A ${pctOui * 3.6}deg, #DC2626 ${pctOui * 3.6}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '78px', height: '78px', background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: pctOui >= 50 ? '#16A34A' : '#DC2626', fontFamily: 'Georgia, serif' }}>{pctOui}%</span>
                    <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>OUI</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: '#F0FDF4', borderRadius: '0.5rem', flex: 1 }}>
                    <div style={{ fontWeight: 800, color: '#16A34A', fontSize: '1.1rem' }}>{proposition.yes_count || 0}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>✅ OUI</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: '#FEF2F2', borderRadius: '0.5rem', flex: 1 }}>
                    <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '1.1rem' }}>{proposition.no_count || 0}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>❌ NON</div>
                  </div>
                </div>
                <div style={{ padding: '0.4rem', background: '#F8FAFC', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>
                  🗳️ {totalVotes} votes exprimés
                </div>
              </motion.div>

              {/* Informations */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
                <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.75rem', fontSize: '1rem' }}>ℹ️ Informations</h3>
                <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 2 }}>
                  <div><span style={{ color: '#9CA3AF' }}>📅 Publiée le :</span> {format(new Date(proposition.created_at), 'dd MMMM yyyy', { locale: fr })}</div>
                  <div><span style={{ color: '#9CA3AF' }}>👁️ Consultations :</span> {proposition.view_count || 0}</div>
                  <div><span style={{ color: '#9CA3AF' }}>📎 Pièces jointes :</span> {((proposition.image_urls || []).length + (proposition.file_urls || []).length)}</div>
                  <div><span style={{ color: '#9CA3AF' }}>💬 Commentaires :</span> {commentaires.length}</div>
                </div>
              </motion.div>

              {/* Boutons de partage */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h4 style={{ color: '#0D47A1', marginBottom: '0.75rem', fontSize: '0.85rem' }}>📤 Partager</h4>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['facebook', 'whatsapp', 'twitter', 'telegram'].map(btn => (
                    <button key={btn} onClick={() => partager(btn)}
                      style={{ padding: '0.4rem 0.8rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.7rem' }}>
                      {btn === 'facebook' && '📘'}
                      {btn === 'whatsapp' && '💬'}
                      {btn === 'twitter' && '🐦'}
                      {btn === 'telegram' && '📱'}
                    </button>
                  ))}
                  <button onClick={copierLienFn}
                    style={{ padding: '0.4rem 0.8rem', background: copieLien ? '#16A34A' : '#6B7280', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.7rem' }}>
                    {copieLien ? '✅' : '🔗'}
                  </button>
                </div>
              </motion.div>
            </div>
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

export default ProposalDetail;