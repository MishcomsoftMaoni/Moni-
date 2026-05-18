import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import HeritageGallery from '../components/layout/HeritageGallery';
import ScrollingProposals from '../components/home/ScrollingProposals';

const Home = () => {
  const { estAuthentifie } = useAuth();
  const navigate = useNavigate();
  const [statistiques, setStatistiques] = useState({ 
    citoyens: 0, propositions: 0, votes: 0, problemes: 0, pourcentageOui: 50 
  });
  const [citoyensEnDirect, setCitoyensEnDirect] = useState(0);

  useEffect(() => { chargerStatistiques(); }, []);
  useEffect(() => {
    const intervalle = setInterval(() => setCitoyensEnDirect(precedent => precedent + 1), 5000);
    return () => clearInterval(intervalle);
  }, []);

  const chargerStatistiques = async () => {
    try {
      const [resCitoyens, resPropositions, resVotes, resOui, resNon, resProblemes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'yes'),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'no'),
        supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      ]);
      const totalVotes = (resOui.count || 0) + (resNon.count || 0);
      setStatistiques({ 
        citoyens: resCitoyens.count || 0, 
        propositions: resPropositions.count || 0, 
        votes: totalVotes, 
        problemes: resProblemes.count || 0,
        pourcentageOui: totalVotes > 0 ? Math.round((resOui.count / totalVotes) * 100) : 50 
      });
      setCitoyensEnDirect(resCitoyens.count || 0);
    } catch (err) { console.error('Erreur:', err); }
  };

  const etapes = [
    { icone: '📝', titre: '1. Proposez', description: 'Soumettez vos idées pour améliorer la constitution.' },
    { icone: '🗳️', titre: '2. Votez', description: 'Exprimez votre soutien ou opposition. Votez OUI ou NON.' },
    { icone: '📊', titre: '3. Consultez', description: 'Suivez les résultats en temps réel par province.' },
    { icone: '🏛️', titre: '4. Impactez', description: 'Les propositions soutenues seront transmises aux autorités compétentes.' }
  ];

  const donneesStats = [
    { valeur: citoyensEnDirect.toLocaleString('fr-FR'), etiquette: 'Citoyens' },
    { valeur: statistiques.propositions.toLocaleString('fr-FR'), etiquette: 'Propositions' },
    { valeur: statistiques.problemes.toLocaleString('fr-FR'), etiquette: 'Problèmes' },
    { valeur: statistiques.votes.toLocaleString('fr-FR'), etiquette: 'Votes' },
    { valeur: statistiques.pourcentageOui + '%', etiquette: 'Majorité OUI' }
  ];

  return (
    <>
      <Helmet><title>MAONI - Plateforme de Consultation Citoyenne | RDC</title></Helmet>

      {/* HÉROS */}
      <section style={{ background: 'linear-gradient(135deg, rgba(30,100,200,0.85) 0%, rgba(25,80,150,0.82) 50%, rgba(160,40,40,0.78) 100%)', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ textAlign: 'center', padding: '2rem', zIndex: 1 }}>
          <img src="/images/logo-drc-map.png" alt="MAONI RDC" style={{ height: '90px', marginBottom: '1.5rem', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }} />

          <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#DC2626', color: 'white', padding: '0.35rem 1rem', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem', boxShadow: '0 0 20px rgba(220,38,38,0.5)' }}>
            <span style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%' }} />
            EN DIRECT
          </motion.div>

          <h1 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '0.5rem' }}>MAONI</h1>
          <p style={{ color: '#FFD700', fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', fontWeight: 700, marginBottom: '0.5rem' }}>Réformes Constitutionnelles RD Congo</p>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', maxWidth: '550px', margin: '0 auto 2rem' }}>La voix du peuple congolais.</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {donneesStats.map((stat, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }}
                style={{ padding: '0.75rem 1.2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', minWidth: '110px' }}>
                <div style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Georgia, serif' }}>{stat.valeur}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{stat.etiquette}</div>
              </motion.div>
            ))}
          </div>

          {/* DEUX BOUTONS PRINCIPAUX */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <motion.button onClick={() => estAuthentifie ? navigate('/submit-proposal') : navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '0.85rem 2rem', borderRadius: '3rem', background: 'linear-gradient(135deg, #FFD700, #F9A825)', color: '#0D47A1', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(255,215,0,0.4)' }}>
              ✍️ Soumettre une Proposition
            </motion.button>
            <motion.button onClick={() => estAuthentifie ? navigate('/submit-issue') : navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '0.85rem 2rem', borderRadius: '3rem', background: '#C62828', color: 'white', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(198,40,40,0.4)' }}>
              ⚠️ Décrire un Problème
            </motion.button>
          </div>

          <motion.button onClick={() => navigate('/proposals')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ padding: '0.85rem 2rem', borderRadius: '3rem', background: 'transparent', color: 'white', fontWeight: 600, fontSize: '1rem', border: '2px solid rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            📋 Consulter les propositions
          </motion.button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[{ icone: '🔒', texte: 'Données chiffrées' }, { icone: '🇨🇩', texte: 'Hébergé en RDC' }, { icone: '✅', texte: 'Plateforme vérifiée' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 600 }}><span>{s.icone}</span> {s.texte}</div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION IMPACT DIRECT */}
      <section style={{ background: 'white', padding: '2.5rem 0', borderBottom: '3px solid #FFD700' }}>
        <div style={{ maxWidth: '950px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.5rem', fontSize: '1.5rem' }}>🏛️ Comment votre voix impacte la Constitution</h2>
          <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '2rem', fontSize: '0.9rem' }}>Chaque proposition citoyenne suit un processus officiel</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            {[
              { icone: '✍️', texte: 'Proposition\ncitoyenne', couleur: '#0D47A1' },
              { icone: '🗳️', texte: 'Vote\nnational', couleur: '#16A34A' },
              { icone: '📊', texte: 'Analyse\nstatistique', couleur: '#7C3AED' },
              { icone: '🏛️', texte: 'Revue\nPrésidentielle', couleur: '#C62828' },
              { icone: '📜', texte: 'Constitution\nRévisée', couleur: '#D97706' },
            ].map((etape, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: '0.75rem 1rem', background: etape.couleur, color: 'white', borderRadius: '0.5rem', fontWeight: 700, textAlign: 'center', minWidth: '90px', whiteSpace: 'pre-line', fontSize: '0.75rem' }}>
                  {etape.icone} {etape.texte}
                </div>
                {i < 4 && <span style={{ fontSize: '1.5rem', color: '#D1D5DB', fontWeight: 700 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* MESSAGE DE LA PRÉSIDENCE - AVEC VIDÉO YOUTUBE */}
      <section style={{ background: '#0F172A', padding: '3rem 0', borderBottom: '3px solid #FFD700' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#DC2626', color: 'white', padding: '0.3rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
            <span style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%' }} />
            MESSAGE OFFICIEL
          </div>
          <h2 style={{ color: '#FFD700', fontFamily: 'Georgia, serif', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', marginBottom: '0.75rem' }}>Message de la Présidence</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            La réforme constitutionnelle est l'affaire de tous les Congolais. Votre voix compte pour construire l'avenir de notre nation.
          </p>
          
          {/* VIDÉO YOUTUBE */}
          <div style={{ maxWidth: '700px', margin: '0 auto', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '2px solid rgba(255,215,0,0.3)' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe 
                src="https://www.youtube.com/embed/AhHyQ_4ZO-U" 
                title="Message de la Présidence"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROPOSITIONS DÉFILANTES */}
      <section style={{ background: 'white', padding: '2rem 0', borderBottom: '3px solid #FFD700' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1.5rem', fontSize: '1.6rem' }}>🔄 Propositions des citoyens</h2>
          <ScrollingProposals />
        </div>
      </section>

      {/* GALERIE PATRIMOINE */}
      <section style={{ padding: '2.5rem 0', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1.5rem', fontSize: '1.6rem' }}>🇨🇩 Patrimoine National</h2>
          <HeritageGallery />
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{ padding: '2.5rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '2rem', fontSize: '1.6rem' }}>Comment ça marche ?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {etapes.map((etape, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} whileHover={{ y: -5 }}
                style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '1rem', textAlign: 'center', borderTop: '4px solid #0D47A1', cursor: 'default' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{etape.icone}</div>
                <h3 style={{ color: '#0D47A1', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{etape.titre}</h3>
                <p style={{ color: '#6B7280', lineHeight: 1.6, fontSize: '0.9rem' }}>{etape.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* APPEL À L'ACTION FINAL */}
      <section style={{ padding: '3rem 0', background: 'linear-gradient(135deg, #1E5FB4 0%, #1550A0 100%)', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontFamily: 'Georgia, serif' }}>Prêt à faire entendre votre voix ?</h2>
          <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.9 }}>Rejoignez les citoyens congolais qui participent à la construction de l'avenir.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button onClick={() => estAuthentifie ? navigate('/submit-proposal') : navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '0.85rem 2rem', borderRadius: '3rem', background: 'linear-gradient(135deg, #FFD700, #F9A825)', color: '#0D47A1', fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(255,215,0,0.5)' }}>
              ✍️ Proposition
            </motion.button>
            <motion.button onClick={() => estAuthentifie ? navigate('/submit-issue') : navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '0.85rem 2rem', borderRadius: '3rem', background: '#C62828', color: 'white', fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(198,40,40,0.4)' }}>
              ⚠️ Problème
            </motion.button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;