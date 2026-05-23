import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// =============================================
// LISTE DES PROPOSITIONS - Niveau Présidentiel
// Filtres | Tri | Recherche | Pagination infinie
// Version: 100.0.4
// =============================================

const PAR_PAGE = 12;

const PROVINCES = [
  'Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Uélé',
  'Tshopo', 'Bas-Uélé', 'Équateur', 'Sud-Ubangi', 'Nord-Ubangi',
  'Mongala', 'Tshuapa', 'Maniema', 'Kasaï', 'Kasaï-Central',
  'Kasaï-Oriental', 'Lomami', 'Sankuru', 'Tanganyika', 'Haut-Lomami',
  'Lualaba', 'Haut-Katanga', 'Kwango', 'Kwilu', 'Mai-Ndombe', 'Kongo Central'
];

const CATEGORIES = [
  { valeur: 'all', label: 'Toutes les catégories', icone: '📋' },
  { valeur: 'constitutional', label: 'Réforme Constitutionnelle', icone: '📜' },
  { valeur: 'electoral', label: 'Système Électoral', icone: '🗳️' },
  { valeur: 'decentralization', label: 'Décentralisation', icone: '🏛️' },
  { valeur: 'justice', label: 'Justice et Droits', icone: '⚖️' },
  { valeur: 'economy', label: 'Économie et Développement', icone: '💰' },
  { valeur: 'security', label: 'Sécurité et Défense', icone: '🛡️' },
  { valeur: 'education', label: 'Éducation', icone: '📚' },
  { valeur: 'health', label: 'Santé', icone: '🏥' },
];

const TRIS_OPTIONS = [
  { valeur: 'recent', label: 'Plus récentes', icone: '🕐' },
  { valeur: 'populaire', label: 'Plus soutenues', icone: '🔥' },
  { valeur: 'controverse', label: 'Plus contestées', icone: '⚡' },
];

const FILTRES_VOTES = [
  { id: 'all', label: 'Toutes', icone: '📋', couleur: '#0D47A1' },
  { id: 'yes', label: 'Majorité OUI', icone: '✅', couleur: '#16A34A' },
  { id: 'no', label: 'Majorité NON', icone: '❌', couleur: '#DC2626' },
];

const Proposals = () => {
  const { estAuthentifie, user } = useAuth();
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
  const [propositionsVotees, setPropositionsVotees] = useState(new Set());

  const chargementRef = useRef(false);

  // Récupérer les propositions déjà votées
  useEffect(() => {
    if (!estAuthentifie || !user) return;
    
    const fetchVotes = async () => {
      try {
        const { data } = await supabase
          .from('votes')
          .select('proposal_id')
          .eq('user_id', user.id);
        
        if (data) {
          setPropositionsVotees(new Set(data.map(v => v.proposal_id)));
        }
      } catch (err) {
        console.error('Erreur chargement votes:', err);
      }
    };
    fetchVotes();
  }, [estAuthentifie, user]);

  const chargerPropositions = useCallback(async (numPage = 1, reinitialiser = false) => {
    if (chargementRef.current && !reinitialiser) return;
    chargementRef.current = true;
    setChargement(true);
    
    try {
      let requete = supabase
        .from('proposals')
        .select('*, profiles!proposals_user_id_fkey(id, first_name, last_name, portrait_url, province, profession)', { count: 'exact' })
        .eq('status', 'published');

      if (filtre === 'yes') {
        requete = requete.gt('yes_count', 0);
      } else if (filtre === 'no') {
        requete = requete.gt('no_count', 0);
      }
      
      if (categorie !== 'all') {
        requete = requete.eq('category', categorie);
      }
      
      if (province) {
        requete = requete.eq('profiles.province', province);
      }
      
      if (recherche) {
        requete = requete.or(`subject.ilike.%${recherche}%,one_sentence.ilike.%${recherche}%`);
      }

      switch (tri) {
        case 'populaire':
          requete = requete.order('yes_count', { ascending: false });
          break;
        case 'controverse':
          requete = requete.order('no_count', { ascending: false });
          break;
        default:
          requete = requete.order('created_at', { ascending: false });
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
          a_vote: propositionsVotees.has(p.id),
          profil: p.profiles || { first_name: 'Citoyen', last_name: 'Congolais' }
        };
      });

      setPropositions(prev => reinitialiser ? transformees : [...prev, ...transformees]);
      setTotal(count || 0);
      setPlusDisponible((count || 0) > (fin + 1));
      setPage(numPage);
    } catch (err) {
      console.error('Erreur chargement propositions:', err);
    } finally {
      setChargement(false);
      setChargementInitial(false);
      chargementRef.current = false;
    }
  }, [filtre, tri, recherche, province, categorie, propositionsVotees]);

  useEffect(() => {
    chargerPropositions(1, true);
  }, [chargerPropositions]);

  const chargerPlus = () => {
    if (!chargement && plusDisponible) {
      chargerPropositions(page + 1);
    }
  };

  const getCategorieInfo = (cat) => {
    return CATEGORIES.find(c => c.valeur === cat) || CATEGORIES[0];
  };

  const getCouleurMajorite = (oui, non) => {
    if (oui > non) return '#16A34A';
    if (non > oui) return '#DC2626';
    return '#0D47A1';
  };

  if (chargementInitial) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#0D47A1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Propositions Citoyennes | MAONI RDC</title>
        <meta name="description" content="Consultez et votez sur les propositions de réforme constitutionnelle en République Démocratique du Congo" />
      </Helmet>

      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        {/* En-tête premium */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0A0F1A 0%, #0D47A1 50%, #0A3D8F 100%)', 
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
            opacity: 0.03, 
            color: '#FFD700', 
            pointerEvents: 'none' 
          }}>
            PROPOSITIONS
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
            >
              📋🇨🇩
            </motion.div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif", 
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
              margin: '0 0 0.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Propositions Citoyennes
            </h1>
            <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
              <strong style={{ color: '#FFD700', fontSize: '1.4rem' }}>{total.toLocaleString('fr-FR')}</strong> propositions soumises par les citoyens congolais
            </p>
            <motion.button
              onClick={() => estAuthentifie ? navigate('/submit-proposal') : navigate('/register')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                padding: '0.75rem 2.5rem', 
                borderRadius: '3rem', 
                background: 'linear-gradient(135deg, #FFD700, #F59E0B)', 
                color: '#0D47A1', 
                fontWeight: 700, 
                fontSize: '1rem', 
                border: 'none', 
                cursor: 'pointer', 
                boxShadow: '0 8px 30px rgba(255,215,0,0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {estAuthentifie ? '✍️ Soumettre une proposition' : '✨ Créer un compte pour proposer'}
            </motion.button>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '-1.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
          
          {/* Barre de filtres */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'white', 
              padding: '1rem 1.25rem', 
              borderRadius: '1rem', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
              marginBottom: '1.5rem',
              border: '1px solid rgba(255,215,0,0.2)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.75rem', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              
              <div style={{ flex: '2', minWidth: '200px', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Rechercher une proposition..." 
                  value={recherche} 
                  onChange={e => setRecherche(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.7rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '2rem', 
                    fontSize: '0.9rem', 
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
                {recherche && (
                  <button 
                    onClick={() => setRecherche('')} 
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '1rem', 
                      color: '#9CA3AF' 
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <select 
                value={province} 
                onChange={e => setProvince(e.target.value)}
                style={{ 
                  padding: '0.65rem 1rem', 
                  border: '2px solid #E5E7EB', 
                  borderRadius: '2rem', 
                  fontSize: '0.85rem', 
                  background: 'white', 
                  cursor: 'pointer', 
                  outline: 'none',
                  minWidth: '160px'
                }}
              >
                <option value="">📍 Toutes les provinces</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select 
                value={categorie} 
                onChange={e => setCategorie(e.target.value)}
                style={{ 
                  padding: '0.65rem 1rem', 
                  border: '2px solid #E5E7EB', 
                  borderRadius: '2rem', 
                  fontSize: '0.85rem', 
                  background: 'white', 
                  cursor: 'pointer', 
                  outline: 'none',
                  minWidth: '220px'
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.valeur} value={c.valeur}>
                    {c.icone} {c.label}
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '0.3rem', background: '#F3F4F6', padding: '0.2rem', borderRadius: '2rem' }}>
                {FILTRES_VOTES.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setFiltre(f.id)}
                    style={{ 
                      padding: '0.45rem 1rem', 
                      borderRadius: '2rem', 
                      border: 'none', 
                      background: filtre === f.id ? f.couleur : 'transparent', 
                      color: filtre === f.id ? 'white' : '#6B7280', 
                      fontWeight: 600, 
                      fontSize: '0.8rem', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem' 
                    }}
                  >
                    {f.icone} {f.label}
                  </button>
                ))}
              </div>

              <select 
                value={tri} 
                onChange={e => setTri(e.target.value)}
                style={{ 
                  padding: '0.65rem 1rem', 
                  border: '2px solid #E5E7EB', 
                  borderRadius: '2rem', 
                  fontSize: '0.85rem', 
                  background: 'white', 
                  cursor: 'pointer', 
                  outline: 'none',
                  minWidth: '150px'
                }}
              >
                {TRIS_OPTIONS.map(t => (
                  <option key={t.valeur} value={t.valeur}>
                    {t.icone} {t.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Statistiques des filtres */}
          {total > 0 && (
            <div style={{ 
              marginBottom: '1rem', 
              fontSize: '0.8rem', 
              color: '#6B7280',
              textAlign: 'center'
            }}>
              {recherche && <span>🔍 "{recherche}" • </span>}
              {province && <span>📍 {province} • </span>}
              {categorie !== 'all' && <span>🏷️ {CATEGORIES.find(c => c.valeur === categorie)?.label} • </span>}
              <strong>{total.toLocaleString('fr-FR')}</strong> proposition{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
            </div>
          )}

          {/* Liste des propositions */}
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {propositions.map((p, i) => {
                const couleurMajorite = getCouleurMajorite(p.pourcentage_oui, p.pourcentage_non);
                const categorieInfo = getCategorieInfo(p.category);
                
                return (
                  <motion.div 
                    key={p.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                    whileHover={{ y: -4, boxShadow: '0 15px 40px rgba(0,0,0,0.12)' }}
                    style={{ 
                      background: 'white', 
                      borderRadius: '1rem', 
                      padding: '1.5rem', 
                      boxShadow: '0 2px 15px rgba(0,0,0,0.06)', 
                      borderLeft: `5px solid ${couleurMajorite}`, 
                      transition: 'all 0.3s ease', 
                      cursor: 'pointer' 
                    }}
                    onClick={() => navigate(`/proposals/${p.id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <img 
                        src={p.profil?.portrait_url || '/images/default-avatar.png'} 
                        alt="" 
                        style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #FFD700', objectFit: 'cover', flexShrink: 0 }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#1F2937', fontSize: '0.9rem' }}>
                          {p.profil?.first_name || 'Citoyen'} {p.profil?.last_name || 'Congolais'}
                          {p.a_vote && (
                            <span style={{ 
                              marginLeft: '0.5rem', 
                              fontSize: '0.7rem', 
                              background: '#EFF6FF', 
                              color: '#0D47A1', 
                              padding: '2px 8px', 
                              borderRadius: '1rem' 
                            }}>
                              🗳️ Vous avez voté
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span>🕐 {p.il_y_a}</span>
                          {p.profil?.province && (
                            <span style={{ background: '#EFF6FF', color: '#0D47A1', padding: '2px 8px', borderRadius: '1rem', fontWeight: 600 }}>
                              📍 {p.profil.province}
                            </span>
                          )}
                          {p.category && p.category !== 'constitutional' && (
                            <span style={{ background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: '1rem', fontWeight: 500 }}>
                              {categorieInfo.icone} {categorieInfo.label}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: 800, 
                          color: couleurMajorite, 
                          fontFamily: 'Georgia, serif' 
                        }}>
                          {p.pourcentage_oui > 50 ? 'OUI' : p.pourcentage_non > 50 ? 'NON' : '—'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Majorité</div>
                      </div>
                    </div>

                    <h3 style={{ fontWeight: 700, color: '#0D47A1', marginBottom: '0.35rem', fontSize: '1rem', lineHeight: 1.4 }}>
                      {p.subject}
                    </h3>
                    {p.one_sentence && (
                      <p style={{ fontStyle: 'italic', color: '#6B7280', marginBottom: '0.5rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        💡 {p.one_sentence}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '5px' }}>
                          <span style={{ color: '#16A34A' }}>✅ OUI {p.pourcentage_oui}%</span>
                          <span style={{ color: '#9CA3AF' }}>🗳️ {p.total_votes} votes</span>
                          <span style={{ color: '#DC2626' }}>{p.pourcentage_non}% NON ❌</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '4px', background: '#E5E7EB', overflow: 'hidden', display: 'flex' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p.pourcentage_oui}%` }}
                            transition={{ duration: 0.5, delay: i * 0.02 }}
                            style={{ 
                              width: `${p.pourcentage_oui}%`, 
                              background: 'linear-gradient(90deg, #16A34A, #22C55E)', 
                              borderRadius: '4px 0 0 4px' 
                            }} 
                          />
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p.pourcentage_non}%` }}
                            transition={{ duration: 0.5, delay: i * 0.02 + 0.1 }}
                            style={{ 
                              width: `${p.pourcentage_non}%`, 
                              background: 'linear-gradient(90deg, #EF4444, #DC2626)', 
                              borderRadius: '0 4px 4px 0' 
                            }} 
                          />
                        </div>
                      </div>
                      <span style={{ 
                        padding: '0.35rem 1rem', 
                        background: 'linear-gradient(135deg, #0D47A1, #0A3D8F)', 
                        color: 'white', 
                        borderRadius: '2rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        flexShrink: 0, 
                        whiteSpace: 'nowrap' 
                      }}>
                        Voir →
                      </span>
                    </div>
                  </motion.div>
                );
              })}
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
          {plusDisponible && !chargement && !chargementInitial && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <motion.button 
                onClick={chargerPlus} 
                whileHover={{ scale: 1.03, y: -2 }} 
                whileTap={{ scale: 0.97 }}
                style={{ 
                  padding: '0.8rem 3rem', 
                  borderRadius: '3rem', 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #FFD700, #F59E0B)', 
                  color: '#0D47A1', 
                  fontWeight: 700, 
                  fontSize: '0.95rem', 
                  cursor: 'pointer', 
                  boxShadow: '0 6px 25px rgba(255,215,0,0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                📥 Charger plus de propositions
              </motion.button>
            </div>
          )}

          {/* État vide */}
          {!chargement && !chargementInitial && propositions.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem', 
                background: 'white', 
                borderRadius: '1rem',
                marginTop: '1rem'
              }}
            >
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: '#374151', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                Aucune proposition trouvée
              </h3>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: '#6B7280' }}>
                {recherche || province || categorie !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Soyez le premier à soumettre une proposition pour la réforme constitutionnelle !'}
              </p>
              {!recherche && !province && categorie === 'all' && (
                <button 
                  onClick={() => navigate('/submit-proposal')}
                  style={{ 
                    padding: '0.75rem 2.5rem', 
                    borderRadius: '3rem', 
                    background: '#0D47A1', 
                    color: 'white', 
                    border: 'none', 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    cursor: 'pointer' 
                  }}
                >
                  ✍️ Soumettre une proposition
                </button>
              )}
            </motion.div>
          )}

          {/* Compteur */}
          {propositions.length > 0 && !chargement && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '1.5rem', 
              fontSize: '0.8rem', 
              color: '#9CA3AF', 
              fontWeight: 500 
            }}>
              Affichage de <strong style={{ color: '#374151' }}>{propositions.length}</strong> sur{' '}
              <strong style={{ color: '#374151' }}>{total.toLocaleString('fr-FR')}</strong> propositions
            </div>
          )}
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

export default Proposals;