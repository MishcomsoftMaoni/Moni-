import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// =============================================
// TABLEAU DE BORD PRÉSIDENTIEL - Niveau Commandement
// Statistiques en temps réel | Analyses avancées
// Accès réservé aux autorités compétentes
// Version: 100.0.4
// =============================================

const PresidentialDashboard = () => {
  const { estAuthentifie, profil, estAdmin } = useAuth();
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(true);
  const [periode, setPeriode] = useState('30j');
  const [stats, setStats] = useState({
    citoyens: { total: 0, croissance: 0, parProvince: [] },
    propositions: { total: 0, croissance: 0, parCategorie: [], enAttente: 0 },
    votes: { total: 0, croissance: 0, tauxOui: 50, tauxNon: 50 },
    signalements: { total: 0, critiques: 0 },
    activite: { aujourdhui: 0, cetteSemaine: 0, ceMois: 0 }
  });
  const [propositionsRecentes, setPropositionsRecentes] = useState([]);
  const [tendances, setTendances] = useState([]);

  // Vérifier l'accès admin
  useEffect(() => {
    if (!chargement && !estAuthentifie) {
      navigate('/login', { state: { from: '/dashboard' } });
    } else if (!chargement && !estAdmin()) {
      navigate('/');
    }
  }, [estAuthentifie, estAdmin, navigate, chargement]);

  const chargerStatistiques = useCallback(async () => {
    setChargement(true);
    
    try {
      const maintenant = new Date();
      let dateDebut;
      switch (periode) {
        case '7j': dateDebut = subDays(maintenant, 7); break;
        case '30j': dateDebut = subDays(maintenant, 30); break;
        case '90j': dateDebut = subDays(maintenant, 90); break;
        default: dateDebut = subDays(maintenant, 30);
      }
      
      const dateDebutStr = dateDebut.toISOString();
      
      const [totalCitoyens, nouveauxCitoyens] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', dateDebutStr)
      ]);
      
      const { data: citoyensParProvince } = await supabase
        .from('profiles')
        .select('province')
        .not('province', 'is', null);
      
      const provinceMap = {};
      citoyensParProvince?.forEach(p => {
        if (p.province) provinceMap[p.province] = (provinceMap[p.province] || 0) + 1;
      });
      const topProvinces = Object.entries(provinceMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const [totalPropositions, nouvellesPropositions, propositionsParCategorie, propositionsEnAttente] = await Promise.all([
        supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('proposals').select('id', { count: 'exact', head: true }).gte('created_at', dateDebutStr).eq('status', 'published'),
        supabase.from('proposals').select('category').eq('status', 'published'),
        supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);
      
      const categorieMap = {};
      propositionsParCategorie?.forEach(p => {
        if (p.category) categorieMap[p.category] = (categorieMap[p.category] || 0) + 1;
      });
      
      const { data: recents } = await supabase
        .from('proposals')
        .select('id, subject, yes_count, no_count, created_at, user_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const recentsAvecAuteurs = await Promise.all((recents || []).map(async (prop) => {
        const { data: user } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', prop.user_id)
          .single();
        return { ...prop, auteur: user };
      }));
      setPropositionsRecentes(recentsAvecAuteurs);
      
      const [totalVotes, nouveauxVotes, votesOui, votesNon] = await Promise.all([
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }).gte('created_at', dateDebutStr),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'yes'),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'no')
      ]);
      
      const totalVotesCount = (votesOui.count || 0) + (votesNon.count || 0);
      const tauxOui = totalVotesCount > 0 ? Math.round((votesOui.count / totalVotesCount) * 100) : 50;
      
      const [totalSignalements, signalementsCritiques] = await Promise.all([
        supabase.from('reports').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);
      
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      const debutSemaine = subDays(aujourdhui, 7);
      const debutMois = subDays(aujourdhui, 30);
      
      const [activiteAujourdhui, activiteSemaine, activiteMois] = await Promise.all([
        supabase.from('activity_log').select('id', { count: 'exact', head: true }).gte('created_at', aujourdhui.toISOString()),
        supabase.from('activity_log').select('id', { count: 'exact', head: true }).gte('created_at', debutSemaine.toISOString()),
        supabase.from('activity_log').select('id', { count: 'exact', head: true }).gte('created_at', debutMois.toISOString())
      ]);
      
      const croissanceCitoyens = totalCitoyens.count > 0 ? ((nouveauxCitoyens.count / totalCitoyens.count) * 100).toFixed(1) : 0;
      const croissancePropositions = totalPropositions.count > 0 ? ((nouvellesPropositions.count / totalPropositions.count) * 100).toFixed(1) : 0;
      const croissanceVotes = totalVotes.count > 0 ? ((nouveauxVotes.count / totalVotes.count) * 100).toFixed(1) : 0;
      
      setStats({
        citoyens: {
          total: totalCitoyens.count || 0,
          croissance: parseFloat(croissanceCitoyens),
          parProvince: topProvinces
        },
        propositions: {
          total: totalPropositions.count || 0,
          croissance: parseFloat(croissancePropositions),
          parCategorie: Object.entries(categorieMap).map(([name, count]) => ({ name, count })),
          enAttente: propositionsEnAttente.count || 0
        },
        votes: {
          total: totalVotes.count || 0,
          croissance: parseFloat(croissanceVotes),
          tauxOui,
          tauxNon: 100 - tauxOui,
          totalOui: votesOui.count || 0,
          totalNon: votesNon.count || 0
        },
        signalements: {
          total: totalSignalements.count || 0,
          critiques: signalementsCritiques.count || 0
        },
        activite: {
          aujourdhui: activiteAujourdhui.count || 0,
          cetteSemaine: activiteSemaine.count || 0,
          ceMois: activiteMois.count || 0
        }
      });
      
      setTendances([
        { label: 'Constitution', valeur: 45, hausse: true },
        { label: 'Décentralisation', valeur: 32, hausse: true },
        { label: 'Élections', valeur: 28, hausse: false },
        { label: 'Justice', valeur: 24, hausse: true },
        { label: 'Économie', valeur: 21, hausse: true }
      ]);
      
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setChargement(false);
    }
  }, [periode]);

  useEffect(() => {
    if (estAuthentifie && estAdmin()) {
      chargerStatistiques();
    }
  }, [estAuthentifie, estAdmin, periode, chargerStatistiques]);

  if (chargement) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#0D47A1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6B7280' }}>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!estAuthentifie || !estAdmin()) {
    return null;
  }

  const categoriesLabels = {
    constitutional: 'Constitution',
    electoral: 'Élections',
    decentralization: 'Décentralisation',
    justice: 'Justice',
    economy: 'Économie',
    security: 'Sécurité',
    education: 'Éducation',
    health: 'Santé'
  };

  return (
    <>
      <Helmet>
        <title>Tableau de Bord Présidentiel | MAONI RDC</title>
        <meta name="description" content="Statistiques en temps réel et analyses avancées pour le suivi de la consultation citoyenne" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '3rem' }}>
        
        {/* En-tête */}
        <div style={{
          background: 'linear-gradient(135deg, #0A0F1A 0%, #0D47A1 50%, #0A3D8F 100%)',
          padding: '2rem 0',
          borderBottom: '4px solid #FFD700',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '5%',
            fontSize: '6rem',
            fontWeight: 900,
            opacity: 0.05,
            color: '#FFD700',
            pointerEvents: 'none'
          }}>
            DASHBOARD
          </div>
          
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>🏛️</span>
                  <h1 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: 'white',
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    margin: 0
                  }}>
                    Tableau de Bord Présidentiel
                  </h1>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem' }}>
                  Suivi en temps réel de la consultation citoyenne
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem', borderRadius: '2rem' }}>
                {[
                  { valeur: '7j', label: '7 jours' },
                  { valeur: '30j', label: '30 jours' },
                  { valeur: '90j', label: '90 jours' }
                ].map(opt => (
                  <button
                    key={opt.valeur}
                    onClick={() => setPeriode(opt.valeur)}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '2rem',
                      border: 'none',
                      background: periode === opt.valeur ? '#FFD700' : 'transparent',
                      color: periode === opt.valeur ? '#0D47A1' : 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          
          {/* Cartes KPI principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {[
              { titre: 'Citoyens inscrits', valeur: stats.citoyens.total.toLocaleString('fr-FR'), icone: '👥', couleur: '#0D47A1', croissance: stats.citoyens.croissance },
              { titre: 'Propositions', valeur: stats.propositions.total.toLocaleString('fr-FR'), icone: '📋', couleur: '#16A34A', croissance: stats.propositions.croissance },
              { titre: 'Votes exprimés', valeur: stats.votes.total.toLocaleString('fr-FR'), icone: '🗳️', couleur: '#7C3AED', croissance: stats.votes.croissance },
              { titre: 'Activité (30j)', valeur: stats.activite.ceMois.toLocaleString('fr-FR'), icone: '⚡', couleur: '#F59E0B', croissance: null }
            ].map((kpi, i) => (
              <motion.div
                key={kpi.titre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${kpi.couleur}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>{kpi.titre}</span>
                  <span style={{ fontSize: '1.5rem' }}>{kpi.icone}</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: kpi.couleur }}>{kpi.valeur}</div>
                {kpi.croissance !== null && (
                  <div style={{ fontSize: '0.7rem', color: kpi.croissance > 0 ? '#16A34A' : '#DC2626', marginTop: '0.25rem' }}>
                    {kpi.croissance > 0 ? '↑' : '↓'} {Math.abs(kpi.croissance)}% vs période précédente
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Graphique de vote */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Référendum */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.25rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                🗳️ État du Référendum
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>OUI ({stats.votes.tauxOui}%)</span>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>NON ({stats.votes.tauxNon}%)</span>
                </div>
                <div style={{ height: '30px', borderRadius: '15px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${stats.votes.tauxOui}%`, background: 'linear-gradient(90deg, #16A34A, #22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>
                    {stats.votes.tauxOui > 15 && `${stats.votes.tauxOui}%`}
                  </div>
                  <div style={{ width: `${stats.votes.tauxNon}%`, background: 'linear-gradient(90deg, #EF4444, #DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>
                    {stats.votes.tauxNon > 15 && `${stats.votes.tauxNon}%`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9CA3AF' }}>
                <span>✅ {stats.votes.totalOui.toLocaleString('fr-FR')} votes OUI</span>
                <span>❌ {stats.votes.totalNon.toLocaleString('fr-FR')} votes NON</span>
              </div>
            </motion.div>

            {/* Propositions en attente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.25rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                ⏳ Modération en attente
              </h3>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#F59E0B' }}>
                  {stats.propositions.enAttente}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  propositions à valider
                </p>
                <button style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1.5rem',
                  background: '#0D47A1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  Examiner maintenant →
                </button>
              </div>
            </motion.div>
          </div>

          {/* Top provinces et tendances */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Top provinces */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.25rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                🏆 Top 5 provinces
              </h3>
              {stats.citoyens.parProvince.slice(0, 5).map((prov, idx) => {
                const maxCount = stats.citoyens.parProvince[0]?.count || 1;
                const pourcentage = (prov.count / maxCount) * 100;
                return (
                  <div key={prov.name} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>
                        {idx === 0 && '🥇'} {idx === 1 && '🥈'} {idx === 2 && '🥉'} {prov.name}
                      </span>
                      <span style={{ fontWeight: 700, color: '#0D47A1' }}>{prov.count.toLocaleString('fr-FR')}</span>
                    </div>
                    <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pourcentage}%`, height: '100%', background: 'linear-gradient(90deg, #0D47A1, #1565C0)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Tendances */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.25rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                📈 Tendances du moment
              </h3>
              {tendances.map((t, idx) => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '80px', height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${t.valeur}%`, height: '100%', background: t.hausse ? '#16A34A' : '#DC2626' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: t.hausse ? '#16A34A' : '#DC2626' }}>
                      {t.hausse ? '↑' : '↓'} {t.valeur}%
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Propositions récentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.25rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}
          >
            <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
              📋 Dernières propositions
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.75rem', color: '#9CA3AF' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.75rem', color: '#9CA3AF' }}>Auteur</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.75rem', color: '#9CA3AF' }}>Sujet</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.75rem', color: '#9CA3AF' }}>Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {propositionsRecentes.map((prop) => (
                    <tr key={prop.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#6B7280' }}>
                        {format(new Date(prop.created_at), 'dd/MM/yy', { locale: fr })}
                      </td>
                      <td style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 500 }}>
                        {prop.auteur?.first_name || 'Citoyen'} {prop.auteur?.last_name || ''}
                      </td>
                      <td style={{ padding: '0.5rem', fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prop.subject}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem' }}>
                        <span style={{ color: '#16A34A' }}>✅ {prop.yes_count || 0}</span> / 
                        <span style={{ color: '#DC2626' }}> ❌ {prop.no_count || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
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

export default PresidentialDashboard;