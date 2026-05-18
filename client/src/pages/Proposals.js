import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAR_PAGE = 10;

const PROVINCES = [
  'Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Uélé',
  'Tshopo', 'Bas-Uélé', 'Équateur', 'Sud-Ubangi', 'Nord-Ubangi',
  'Mongala', 'Tshuapa', 'Maniema', 'Kasaï', 'Kasaï-Central',
  'Kasaï-Oriental', 'Lomami', 'Sankuru', 'Tanganyika', 'Haut-Lomami',
  'Lualaba', 'Haut-Katanga', 'Kwango', 'Kwilu', 'Mai-Ndombe', 'Kongo Central'
];

const CATEGORIES = [
  { valeur: 'all', label: 'Toutes les catégories' },
  { valeur: 'constitutional', label: 'Réforme Constitutionnelle' },
  { valeur: 'electoral', label: 'Système Électoral' },
  { valeur: 'decentralization', label: 'Décentralisation' },
  { valeur: 'justice', label: 'Justice et Droits' },
  { valeur: 'economy', label: 'Économie et Développement' },
  { valeur: 'education', label: 'Éducation' },
  { valeur: 'health', label: 'Santé' },
];

const Proposals = () => {
  const { estAuthentifie } = useAuth();
  const navigate = useNavigate();

  const [propositions, setPropositions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [chargementInitial, setChargementInitial] = useState(true);
  const [page, setPage] = useState(1);
  const [plusDisponible, setPlusDisponible] = useState(true);
  const [total, setTotal] = useState(0);

  const [filtre, setFiltre] = useState('all');
  const [tri, setTri] = useState('recent');
  const [recherche, setRecherche] = useState('');
  const [province, setProvince] = useState('');
  const [categorie, setCategorie] = useState('all');

  const chargerPropositions = useCallback(async (numPage = 1, reinitialiser = false) => {
    setChargement(true);
    try {
      let requete = supabase
        .from('proposals')
        .select('*, profiles!proposals_user_id_fkey(id, first_name, last_name, portrait_url, province, profession)', { count: 'exact' })
        .eq('status', 'published');

      if (filtre === 'yes') requete = requete.gt('yes_count', 0);
      else if (filtre === 'no') requete = requete.gt('no_count', 0);
      if (categorie !== 'all') requete = requete.eq('category', categorie);
      if (province) requete = requete.eq('profiles.province', province);
      if (recherche) requete = requete.or(`subject.ilike.%${recherche}%,one_sentence.ilike.%${recherche}%`);

      switch (tri) {
        case 'populaire': requete = requete.order('yes_count', { ascending: false }); break;
        case 'controverse': requete = requete.order('no_count', { ascending: false }); break;
        default: requete = requete.order('created_at', { ascending: false });
      }

      const debut = (numPage - 1) * PAR_PAGE;
      const fin = debut + PAR_PAGE - 1;
      const { data, error, count } = await requete.range(debut, fin);
      if (error) throw error;

      const transformees = (data || []).map(p => {
        const oui = p.yes_count || 0;
        const non = p.no_count || 0;
        const totalVotes = oui + non;
        return {
          ...p,
          total_votes: totalVotes,
          pourcentage_oui: totalVotes > 0 ? Math.round((oui / totalVotes) * 100) : 0,
          pourcentage_non: totalVotes > 0 ? Math.round((non / totalVotes) * 100) : 0,
          il_y_a: formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: fr }),
          profil: p.profiles || { first_name: 'Citoyen', last_name: 'Congolais' }
        };
      });

      setPropositions(reinitialiser ? transformees : prev => [...prev, ...transformees]);
      setTotal(count || 0);
      setPlusDisponible(count > fin + 1);
      setPage(numPage);
    } catch (err) {
      console.error('Erreur chargement propositions:', err);
    } finally {
      setChargement(false);
      setChargementInitial(false);
    }
  }, [filtre, tri, recherche, province, categorie]);

  useEffect(() => { chargerPropositions(1, true); }, [filtre, tri, recherche, province, categorie]);

  const chargerPlus = () => { if (!chargement && plusDisponible) chargerPropositions(page + 1); };

  return (
    <>
      <Helmet><title>Propositions Citoyennes | MAONI</title></Helmet>

      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        {/* En-tête premium */}
        <div style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #0D47A1 100%)', padding: '3rem 0', textAlign: 'center', color: 'white', borderBottom: '5px solid #FFD700', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', margin: '0 0 0.5rem', letterSpacing: '0.02em' }}>
              📋 Propositions Citoyennes
            </h1>
            <p style={{ fontSize: '1rem', opacity: 0.9, margin: '0 0 1.25rem' }}>
              <strong style={{ color: '#FFD700', fontSize: '1.3rem' }}>{total.toLocaleString('fr-FR')}</strong> propositions soumises par les citoyens congolais
            </p>
            <motion.button
              onClick={() => estAuthentifie ? navigate('/submit-proposal') : navigate('/register')}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '0.75rem 2.5rem', borderRadius: '3rem', background: 'linear-gradient(135deg, #FFD700, #F9A825)', color: '#0D47A1', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(255,215,0,0.4)' }}>
              ✍️ {estAuthentifie ? 'Soumettre une proposition' : 'Créer un compte pour proposer'}
            </motion.button>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '-1.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
          
          {/* Barre de filtres */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <input type="text" placeholder="🔍 Rechercher une proposition..." value={recherche} onChange={e => setRecherche(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0D47A1'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              {recherche && (
                <button onClick={() => setRecherche('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#9CA3AF' }}>✕</button>
              )}
            </div>

            <select value={province} onChange={e => setProvince(e.target.value)}
              style={{ padding: '0.6rem 0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '0.85rem', background: 'white', cursor: 'pointer', outline: 'none' }}>
              <option value="">📍 Toutes les provinces</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select value={categorie} onChange={e => setCategorie(e.target.value)}
              style={{ padding: '0.6rem 0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '0.85rem', background: 'white', cursor: 'pointer', outline: 'none' }}>
              {CATEGORIES.map(c => <option key={c.valeur} value={c.valeur}>{c.label}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '0.3rem', background: '#F3F4F6', padding: '3px', borderRadius: '2rem' }}>
              {[
                { id: 'all', label: 'Toutes', icone: '📋' },
                { id: 'yes', label: 'OUI', icone: '✅' },
                { id: 'no', label: 'NON', icone: '❌' },
              ].map(f => (
                <button key={f.id} onClick={() => setFiltre(f.id)}
                  style={{ padding: '0.45rem 0.9rem', borderRadius: '2rem', border: 'none', background: filtre === f.id ? '#0D47A1' : 'transparent', color: filtre === f.id ? 'white' : '#6B7280', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {f.icone} {f.label}
                </button>
              ))}
            </div>

            <select value={tri} onChange={e => setTri(e.target.value)}
              style={{ padding: '0.6rem 0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '0.85rem', background: 'white', cursor: 'pointer', outline: 'none' }}>
              <option value="recent">🕐 Plus récentes</option>
              <option value="populaire">🔥 Plus soutenues</option>
              <option value="controverse">⚡ Plus contestées</option>
            </select>
          </motion.div>

          {/* Liste des propositions */}
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {propositions.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
                  style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 15px rgba(0,0,0,0.06)', borderLeft: `5px solid ${p.pourcentage_oui > 50 ? '#16A34A' : p.pourcentage_non > 50 ? '#DC2626' : '#0D47A1'}`, transition: 'all 0.3s ease', cursor: 'pointer' }}
                  onClick={() => navigate(`/proposals/${p.id}`)}>
                  
                  {/* En-tête carte */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <img src={p.profil?.portrait_url || '/images/default-avatar.png'} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #FFD700', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#1F2937', fontSize: '0.9rem' }}>
                        {p.profil?.first_name || 'Citoyen'} {p.profil?.last_name || 'Congolais'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span>🕐 {p.il_y_a}</span>
                        {p.profil?.province && (
                          <span style={{ background: '#EFF6FF', color: '#0D47A1', padding: '2px 8px', borderRadius: '1rem', fontWeight: 600, fontSize: '0.7rem' }}>
                            📍 {p.profiles.province}
                          </span>
                        )}
                        {p.category && p.category !== 'constitutional' && (
                          <span style={{ background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: '1rem', fontWeight: 500, fontSize: '0.7rem' }}>
                            🏷️ {p.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Indicateur de tendance */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: p.pourcentage_oui > 50 ? '#16A34A' : p.pourcentage_non > 50 ? '#DC2626' : '#6B7280', fontFamily: 'Georgia, serif' }}>
                        {p.pourcentage_oui > 50 ? 'OUI' : p.pourcentage_non > 50 ? 'NON' : '—'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Majorité</div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <h3 style={{ fontWeight: 700, color: '#0D47A1', marginBottom: '0.35rem', fontSize: '1rem', lineHeight: 1.4 }}>
                    {p.subject}
                  </h3>
                  {p.one_sentence && (
                    <p style={{ fontStyle: 'italic', color: '#6B7280', marginBottom: '0.5rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      💡 {p.one_sentence}
                    </p>
                  )}

                  {/* Barre de votes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px' }}>
                        <span style={{ color: '#16A34A' }}>✅ OUI {p.pourcentage_oui}%</span>
                        <span style={{ color: '#9CA3AF' }}>🗳️ {p.total_votes} votes</span>
                        <span style={{ color: '#DC2626' }}>{p.pourcentage_non}% NON ❌</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '4px', background: '#E5E7EB', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${p.pourcentage_oui}%`, background: 'linear-gradient(90deg, #16A34A, #22C55E)', transition: 'width 0.5s ease', borderRadius: '4px 0 0 4px' }} />
                        <div style={{ width: `${p.pourcentage_non}%`, background: 'linear-gradient(90deg, #EF4444, #DC2626)', transition: 'width 0.5s ease', borderRadius: '0 4px 4px 0' }} />
                      </div>
                    </div>
                    <span style={{ padding: '0.35rem 0.9rem', background: '#0D47A1', color: 'white', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      Voir →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Chargement */}
          {chargement && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '44px', height: '44px', margin: '0 auto 1rem', border: '4px solid #E5E7EB', borderTopColor: '#0D47A1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#6B7280', fontWeight: 500 }}>Chargement des propositions...</p>
            </div>
          )}

          {/* Charger plus */}
          {plusDisponible && !chargement && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <motion.button onClick={chargerPlus} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '0.8rem 3rem', borderRadius: '3rem', border: 'none', background: 'linear-gradient(135deg, #FFD700, #F9A825)', color: '#0D47A1', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 25px rgba(255,215,0,0.3)' }}>
                📥 Charger plus de propositions
              </motion.button>
            </div>
          )}

          {/* État vide */}
          {!chargement && !chargementInitial && propositions.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem 2rem', color: '#9CA3AF' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: '#374151', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Aucune proposition trouvée</h3>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                {recherche ? 'Essayez de modifier vos critères de recherche.' : 'Soyez le premier à soumettre une proposition pour la réforme constitutionnelle !'}
              </p>
              {!recherche && (
                <button onClick={() => navigate('/submit-proposal')}
                  style={{ padding: '0.75rem 2.5rem', borderRadius: '3rem', background: '#0D47A1', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  ✍️ Soumettre une proposition
                </button>
              )}
            </motion.div>
          )}

          {/* Compteur */}
          {propositions.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 500 }}>
              Affichage de <strong style={{ color: '#374151' }}>{propositions.length}</strong> sur <strong style={{ color: '#374151' }}>{total.toLocaleString('fr-FR')}</strong> propositions
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Proposals;