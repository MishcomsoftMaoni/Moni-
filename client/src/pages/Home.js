import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import HeritageGallery from '../components/layout/HeritageGallery';
import ScrollingProposals from '../components/home/ScrollingProposals';

// =============================================
// PAGE D'ACCUEIL PRÉSIDENTIELLE - Niveau Militaire
// Consultation citoyenne pour la réforme constitutionnelle
// Version: 100.0.4
// =============================================

const Home = () => {
  const { estAuthentifie, user } = useAuth();
  const navigate = useNavigate();
  const [statistiques, setStatistiques] = useState({ 
    citoyens: 0, 
    propositions: 0, 
    votes: 0, 
    problemes: 0, 
    pourcentageOui: 50 
  });
  const [citoyensEnDirect, setCitoyensEnDirect] = useState(0);
  const [chargement, setChargement] = useState(false);
  const intervalRef = useRef(null);

  // Charger les statistiques
  const chargerStatistiques = useCallback(async () => {
    try {
      const [
        resCitoyens, 
        resPropositions, 
        resVotes, 
        resOui, 
        resNon, 
        resProblemes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'yes'),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'no'),
        supabase.from('reports').select('id', { count: 'exact', head: true }),
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
    } catch (err) { 
      console.error('Erreur chargement stats:', err); 
    }
  }, []);

  useEffect(() => {
    chargerStatistiques();
    const refreshInterval = setInterval(chargerStatistiques, 30000);
    return () => clearInterval(refreshInterval);
  }, [chargerStatistiques]);

  // Compteur en direct
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCitoyensEnDirect(prev => prev + 1);
    }, 8000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const etapes = [
    { icone: '📝', titre: '1. Proposez', description: 'Soumettez vos idées pour améliorer la constitution.' },
    { icone: '🗳️', titre: '2. Votez', description: 'Exprimez votre soutien ou opposition. Votez OUI ou NON.' },
    { icone: '📊', titre: '3. Consultez', description: 'Suivez les résultats en temps réel par province.' },
    { icone: '🏛️', titre: '4. Impactez', description: 'Les propositions soutenues seront transmises aux autorités compétentes.' }
  ];

  const donneesStats = [
    { valeur: citoyensEnDirect.toLocaleString('fr-FR'), etiquette: 'Citoyens', icone: '👥' },
    { valeur: statistiques.propositions.toLocaleString('fr-FR'), etiquette: 'Propositions', icone: '📋' },
    { valeur: statistiques.problemes.toLocaleString('fr-FR'), etiquette: 'Problèmes', icone: '⚠️' },
    { valeur: statistiques.votes.toLocaleString('fr-FR'), etiquette: 'Votes', icone: '🗳️' },
    { valeur: statistiques.pourcentageOui + '%', etiquette: 'Majorité OUI', icone: '✅' }
  ];

  const sceauxSecurite = [
    { icone: '🔒', texte: 'Données chiffrées' },
    { icone: '🇨🇩', texte: 'Hébergé en RDC' },
    { icone: '✅', texte: 'Plateforme vérifiée' }
  ];

  return (
    <>
      <Helmet>
        <title>MAONI 🇨🇩 - Plateforme Présidentielle de Consultation Citoyenne | RDC</title>
        <meta name="description" content="Plateforme nationale de consultation citoyenne pour la réforme constitutionnelle en République Démocratique du Congo." />
        <meta name="keywords" content="MAONI, RDC, Congo, réforme constitutionnelle, consultation citoyenne, démocratie, propositions, vote citoyen, Tshisekedi" />
      </Helmet>

      {/* SECTION HÉROS */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0A3D8F 0%, #0D47A1 50%, #1B5E8C 100%)', 
        minHeight: '85vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          fontSize: '12rem',
          fontWeight: 900,
          opacity: 0.03,
          color: '#FFD700',
          pointerEvents: 'none',
          fontFamily: 'Georgia, serif'
        }}>
          MAONI
        </div>
        
        <div style={{ textAlign: 'center', padding: '2rem', zIndex: 1, maxWidth: '1100px' }}>
          <img 
            src="/images/logo-drc-map.png" 
            alt="MAONI - RDC" 
            style={{ height: '100px', marginBottom: '1rem', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }} 
          />

          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: '#DC2626', 
            color: 'white', 
            padding: '0.4rem 1.2rem', 
            borderRadius: '2rem', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            marginBottom: '1.5rem',
            boxShadow: '0 0 20px rgba(220,38,38,0.5)'
          }}>
            <span style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%' }} />
            EN DIRECT
          </div>

          <h1 style={{ 
            color: 'white', 
            fontFamily: "'Playfair Display', Georgia, serif", 
            fontSize: 'clamp(1.8rem, 5vw, 3rem)', 
            fontWeight: 900, 
            marginBottom: '0.5rem'
          }}>
            MA<span style={{ color: '#FFD700' }}>O</span>NI
          </h1>
          
          <p style={{ color: '#FFD700', fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Réformes Constitutionnelles RD Congo
          </p>
          
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            La voix du peuple congolais.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {donneesStats.map((stat, i) => (
              <div key={i} style={{ 
                padding: '0.7rem 1.2rem', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '1rem', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                minWidth: '110px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>{stat.icone}</span>
                  <div style={{ color: '#FFD700', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Georgia, serif' }}>{stat.valeur}</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', marginTop: '0.25rem' }}>{stat.etiquette}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button 
              onClick={() => estAuthentifie ? navigate('/submit-proposal') : navigate('/register')} 
              style={{ 
                padding: '0.9rem 2.2rem', 
                borderRadius: '3rem', 
                background: 'linear-gradient(135deg, #FFD700, #F59E0B)', 
                color: '#0D47A1', 
                fontWeight: 800, 
                fontSize: '0.95rem', 
                border: 'none', 
                cursor: 'pointer', 
                boxShadow: '0 8px 25px rgba(255,215,0,0.4)'
              }}
            >
              ✍️ Soumettre une Proposition
            </button>
            
            <button 
              onClick={() => estAuthentifie ? navigate('/submit-issue') : navigate('/register')} 
              style={{ 
                padding: '0.9rem 2.2rem', 
                borderRadius: '3rem', 
                background: '#DC2626', 
                color: 'white', 
                fontWeight: 800, 
                fontSize: '0.95rem', 
                border: 'none', 
                cursor: 'pointer', 
                boxShadow: '0 8px 25px rgba(220,38,38,0.4)'
              }}
            >
              ⚠️ Décrire un Problème
            </button>
            
            <button 
              onClick={() => navigate('/proposals')} 
              style={{ 
                padding: '0.9rem 2.2rem', 
                borderRadius: '3rem', 
                background: 'transparent', 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                border: '2px solid rgba(255,255,255,0.6)', 
                cursor: 'pointer'
              }}
            >
              📋 Consulter les propositions
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {sceauxSecurite.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 600 }}>
                <span>{s.icone}</span> {s.texte}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION IMPACT DIRECT */}
      <section style={{ background: 'white', padding: '2.5rem 0', borderBottom: '3px solid #FFD700' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '0.5rem', fontSize: '1.6rem' }}>
            🏛️ Comment votre voix impacte la Constitution
          </h2>
          <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Chaque proposition citoyenne suit un processus officiel transparent
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            {[
              { icone: '✍️', texte: 'Proposition\ncitoyenne', couleur: '#0D47A1' },
              { icone: '🗳️', texte: 'Vote\nnational', couleur: '#16A34A' },
              { icone: '📊', texte: 'Analyse\nstatistique', couleur: '#7C3AED' },
              { icone: '🏛️', texte: 'Revue\nPrésidentielle', couleur: '#C62828' },
              { icone: '📜', texte: 'Constitution\nRévisée', couleur: '#D97706' },
            ].map((etape, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: '0.8rem 1rem', background: etape.couleur, color: 'white', borderRadius: '0.75rem', fontWeight: 700, textAlign: 'center', minWidth: '100px', whiteSpace: 'pre-line', fontSize: '0.75rem', boxShadow: `0 4px 12px ${etape.couleur}40` }}>
                  {etape.icone} {etape.texte}
                </div>
                {i < 4 && <span style={{ fontSize: '1.5rem', color: '#D1D5DB', fontWeight: 700 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* MESSAGE DE LA PRÉSIDENCE */}
      <section style={{ background: '#0F172A', padding: '3rem 0', borderBottom: '3px solid #FFD700' }}>
        <div style={{ maxWidth: '950px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#DC2626', color: 'white', padding: '0.3rem 1.2rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, marginBottom: '1rem' }}>
            <span style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%' }} />
            MESSAGE OFFICIEL
          </div>
          
          <h2 style={{ color: '#FFD700', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', marginBottom: '0.75rem' }}>
            Message de la Présidence
          </h2>
          
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
            "La réforme constitutionnelle est l'affaire de tous les Congolais. Votre voix compte pour construire l'avenir de notre nation."
          </p>
          
          <div style={{ maxWidth: '700px', margin: '0 auto', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 15px 45px rgba(0,0,0,0.5)', border: '2px solid rgba(255,215,0,0.3)' }}>
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
      <section style={{ background: 'white', padding: '2.5rem 0', borderBottom: '3px solid #FFD700' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '1.5rem', fontSize: '1.6rem' }}>
            🔄 Propositions des citoyens
          </h2>
          <ScrollingProposals />
        </div>
      </section>

      {/* PATRIMOINE NATIONAL */}
      <section style={{ padding: '2.5rem 0', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '1.5rem', fontSize: '1.6rem' }}>
            🇨🇩 Patrimoine National
          </h2>
          <HeritageGallery />
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{ padding: '2.5rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '2rem', fontSize: '1.6rem' }}>
            Comment ça marche ?
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {etapes.map((etape, i) => (
              <div key={i} style={{ padding: '1.8rem', background: '#F8FAFC', borderRadius: '1rem', textAlign: 'center', borderTop: '5px solid #0D47A1' }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{etape.icone}</div>
                <h3 style={{ color: '#0D47A1', marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 800 }}>{etape.titre}</h3>
                <p style={{ color: '#6B7280', lineHeight: 1.6, fontSize: '0.9rem' }}>{etape.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPEL À L'ACTION FINAL */}
      <section style={{ padding: '3.5rem 0', background: 'linear-gradient(135deg, #0A3D8F 0%, #0D47A1 50%, #1B5E8C 100%)', textAlign: 'center', color: 'white', borderTop: '3px solid #FFD700' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.9rem)', marginBottom: '0.75rem', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Prêt à faire entendre votre voix ?
          </h2>
          <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.9, maxWidth: '550px', marginLeft: 'auto', marginRight: 'auto' }}>
            Rejoignez les citoyens congolais qui participent à la construction de l'avenir.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => estAuthentifie ? navigate('/submit-proposal') : navigate('/register')} style={{ padding: '0.9rem 2.2rem', borderRadius: '3rem', background: 'linear-gradient(135deg, #FFD700, #F59E0B)', color: '#0D47A1', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(255,215,0,0.4)' }}>
              ✍️ Proposition
            </button>
            <button onClick={() => estAuthentifie ? navigate('/submit-issue') : navigate('/register')} style={{ padding: '0.9rem 2.2rem', borderRadius: '3rem', background: '#DC2626', color: 'white', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(220,38,38,0.4)' }}>
              ⚠️ Problème
            </button>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '0.75rem', background: 'rgba(255,215,0,0.1)', borderRadius: '2rem', border: '1px solid rgba(255,215,0,0.3)', display: 'inline-block' }}>
            <span style={{ fontSize: '0.8rem' }}>📱 Pas d'internet ? Composez </span>
            <strong style={{ color: '#FFD700', fontSize: '1rem' }}>*123#</strong>
            <span style={{ fontSize: '0.8rem' }}> pour participer</span>
          </div>
        </div>
      </section>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
        `}
      </style>
    </>
  );
};

export default Home;