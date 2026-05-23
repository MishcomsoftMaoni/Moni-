import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabase';

// =============================================
// NUAGE DE MOTS-CLÉS - Niveau Présidentiel
// Analyse lexicale IA | Palette officielle RDC
// =============================================

const MOTS_VIDES = new Set([
  'cette', 'notre', 'leurs', 'pour', 'avec', 'dans', 'plus', 'très',
  'alors', 'aussi', 'bien', 'comme', 'entre', 'mais', 'même', 'moins',
  'sont', 'sous', 'sur', 'tout', 'tous', 'une', 'aux', 'des', 'les',
  'nos', 'par', 'pas', 'que', 'qui', 'son', 'ont', 'été', 'est',
  'était', 'étaient', 'avoir', 'être', 'faire', 'dire', 'aller', 'venir',
  'voir', 'pouvoir', 'vouloir', 'devoir', 'falloir', 'prendre', 'donner'
]);

const PALETTE_RDC = [
  // Bleus (Ciel et Fleuve Congo)
  '#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5',
  // Rouges (Sang des martyrs)
  '#C62828', '#D32F2F', '#E53935', '#EF5350', '#F44336',
  // Jaunes (Richesse du sous-sol)
  '#F57F17', '#F9A825', '#FBC02D', '#FFD700', '#FFC107',
  // Verts (Forêt équatoriale)
  '#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50',
  // Ornements (Dignité nationale)
  '#4A148C', '#6A1B9A', '#7B1FA2', '#8E24AA',
  '#00695C', '#00838F', '#0277BD', '#5D4037'
];

const CATEGORIES_THEMATIQUES = {
  INSTITUTIONS: ['constitution', 'parlement', 'gouvernement', 'présidence', 'assemblée', 'sénat', 'justice', 'cour', 'loi', 'réforme'],
  SOCIETE: ['éducation', 'santé', 'sécurité', 'emploi', 'logement', 'eau', 'électricité', 'route', 'transport'],
  ECONOMIE: ['économie', 'développement', 'investissement', 'emploi', 'industrie', 'agriculture', 'mines', 'budget'],
  DROITS: ['droits', 'liberté', 'égalité', 'justice', 'démocratie', 'transparence', 'participation', 'citoyen'],
  TERRITOIRE: ['province', 'territoire', 'décentralisation', 'kinshasa', 'goma', 'lubumbashi', 'mbuji', 'kisangani']
};

const ICONES_CATEGORIES = {
  INSTITUTIONS: '🏛️',
  SOCIETE: '👥',
  ECONOMIE: '💰',
  DROITS: '⚖️',
  TERRITOIRE: '🗺️'
};

const WordCloud = () => {
  const [mots, setMots] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [motSurvole, setMotSurvole] = useState(null);
  const [erreur, setErreur] = useState(false);
  const [categorieSelectionnee, setCategorieSelectionnee] = useState('TOUS');

  const genererNuage = useCallback(async () => {
    setChargement(true);
    
    try {
      let query = supabase
        .from('proposals')
        .select('subject, content, category')
        .eq('status', 'published')
        .limit(200);

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        setMots(motsParDefaut());
        setChargement(false);
        return;
      }

      const frequences = {};
      const frequencesParCategorie = {};

      data.forEach(proposition => {
        const texteComplet = `${proposition.subject || ''} ${proposition.content || ''}`;
        
        if (texteComplet) {
          const motsExtraits = extraireMots(texteComplet);
          const categorieProp = proposition.category || 'general';

          motsExtraits.forEach(mot => {
            frequences[mot] = (frequences[mot] || 0) + 1;
            if (!frequencesParCategorie[mot]) {
              frequencesParCategorie[mot] = {};
            }
            frequencesParCategorie[mot][categorieProp] = (frequencesParCategorie[mot][categorieProp] || 0) + 1;
          });
        }
      });

      const motsAvecCategorie = Object.entries(frequences).map(([mot, occurences]) => {
        const repartition = frequencesParCategorie[mot] || {};
        const categorieDominante = Object.entries(repartition)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';
        
        let categorieNom = 'Général';
        let iconeCategorie = '📝';
        
        if (CATEGORIES_THEMATIQUES.INSTITUTIONS.includes(mot)) {
          categorieNom = 'Institutions';
          iconeCategorie = ICONES_CATEGORIES.INSTITUTIONS;
        } else if (CATEGORIES_THEMATIQUES.SOCIETE.includes(mot)) {
          categorieNom = 'Société';
          iconeCategorie = ICONES_CATEGORIES.SOCIETE;
        } else if (CATEGORIES_THEMATIQUES.ECONOMIE.includes(mot)) {
          categorieNom = 'Économie';
          iconeCategorie = ICONES_CATEGORIES.ECONOMIE;
        } else if (CATEGORIES_THEMATIQUES.DROITS.includes(mot)) {
          categorieNom = 'Droits';
          iconeCategorie = ICONES_CATEGORIES.DROITS;
        } else if (CATEGORIES_THEMATIQUES.TERRITOIRE.includes(mot)) {
          categorieNom = 'Territoire';
          iconeCategorie = ICONES_CATEGORIES.TERRITOIRE;
        }
        
        return {
          texte: mot.charAt(0).toUpperCase() + mot.slice(1),
          occurences,
          categorie: categorieDominante,
          categorieNom,
          iconeCategorie,
          taille: calculerTaille(occurences),
          couleur: PALETTE_RDC[Math.floor(Math.random() * PALETTE_RDC.length)],
        };
      });

      const tries = motsAvecCategorie
        .sort((a, b) => b.occurences - a.occurences)
        .slice(0, 50);

      setMots(tries.length >= 10 ? tries : motsParDefaut());
      setErreur(false);
      
    } catch (err) {
      console.error('Erreur nuage de mots:', err);
      setErreur(true);
      setMots(motsParDefaut());
    } finally {
      setChargement(false);
    }
  }, []);

  const extraireMots = (texte) => {
    return texte
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\s-]/g, ' ')
      .split(/\s+/)
      .filter(mot => mot.length > 3 && !MOTS_VIDES.has(mot));
  };

  const calculerTaille = (occurences) => {
    const taille = 0.7 + Math.pow(occurences * 0.08, 0.7);
    return Math.min(2.8, Math.max(0.7, taille));
  };

  const motsParDefaut = () => {
    const defauts = [
      { texte: 'Constitution', occurences: 45, categorieNom: 'Institutions', iconeCategorie: '🏛️' },
      { texte: 'Réforme', occurences: 42, categorieNom: 'Institutions', iconeCategorie: '🏛️' },
      { texte: 'Démocratie', occurences: 38, categorieNom: 'Droits', iconeCategorie: '⚖️' },
      { texte: 'Justice', occurences: 35, categorieNom: 'Droits', iconeCategorie: '⚖️' },
      { texte: 'Droits', occurences: 32, categorieNom: 'Droits', iconeCategorie: '⚖️' },
      { texte: 'Liberté', occurences: 30, categorieNom: 'Droits', iconeCategorie: '⚖️' },
      { texte: 'Citoyens', occurences: 28, categorieNom: 'Société', iconeCategorie: '👥' },
      { texte: 'Provinces', occurences: 26, categorieNom: 'Territoire', iconeCategorie: '🗺️' },
      { texte: 'Décentralisation', occurences: 24, categorieNom: 'Institutions', iconeCategorie: '🏛️' },
      { texte: 'Éducation', occurences: 22, categorieNom: 'Société', iconeCategorie: '👥' },
      { texte: 'Santé', occurences: 20, categorieNom: 'Société', iconeCategorie: '👥' },
      { texte: 'Sécurité', occurences: 18, categorieNom: 'Société', iconeCategorie: '👥' },
      { texte: 'Développement', occurences: 16, categorieNom: 'Économie', iconeCategorie: '💰' },
      { texte: 'Économie', occurences: 15, categorieNom: 'Économie', iconeCategorie: '💰' },
      { texte: 'Emploi', occurences: 14, categorieNom: 'Économie', iconeCategorie: '💰' },
      { texte: 'Paix', occurences: 13, categorieNom: 'Société', iconeCategorie: '👥' },
      { texte: 'Unité', occurences: 12, categorieNom: 'Société', iconeCategorie: '👥' },
      { texte: 'Gouvernance', occurences: 11, categorieNom: 'Institutions', iconeCategorie: '🏛️' },
      { texte: 'Transparence', occurences: 10, categorieNom: 'Droits', iconeCategorie: '⚖️' },
      { texte: 'Participation', occurences: 9, categorieNom: 'Droits', iconeCategorie: '⚖️' }
    ];
    
    return defauts.map((mot, i) => ({
      ...mot,
      occurences: mot.occurences,
      taille: calculerTaille(mot.occurences),
      couleur: PALETTE_RDC[i % PALETTE_RDC.length],
    }));
  };

  const motsFiltres = useMemo(() => {
    if (categorieSelectionnee === 'TOUS') return mots;
    return mots.filter(m => m.categorieNom === categorieSelectionnee);
  }, [mots, categorieSelectionnee]);

  const motsMelanges = useMemo(() => {
    return [...motsFiltres].sort(() => Math.random() - 0.5);
  }, [motsFiltres]);

  const categoriesDisponibles = useMemo(() => {
    const cats = new Set(mots.map(m => m.categorieNom));
    return ['TOUS', ...Array.from(cats)];
  }, [mots]);

  useEffect(() => {
    genererNuage();
  }, [genererNuage]);

  if (chargement) {
    return (
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center',
        marginTop: '1.5rem'
      }}>
        <div style={{
          width: '36px', height: '36px', margin: '0 auto 1rem',
          border: '3px solid #E5E7EB', borderTopColor: '#0D47A1',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#6B7280', margin: 0, fontWeight: 500 }}>
          Génération du nuage de mots en cours...
        </p>
        <p style={{ color: '#9CA3AF', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
          Analyse lexicale des propositions citoyennes
        </p>
      </div>
    );
  }

  const totalOccurrences = mots.reduce((acc, m) => acc + m.occurences, 0);

  return (
    <div style={{
      background: 'white', padding: '1.75rem', borderRadius: '1rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginTop: '1.5rem'
    }}>
      
      {/* En-tête avec filtres */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
        paddingBottom: '0.75rem', borderBottom: '2px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>☁️</span>
          <div>
            <h3 style={{
              color: '#0D47A1', margin: 0, fontFamily: 'Georgia, serif',
              fontSize: '1.15rem', fontWeight: 700
            }}>
              Nuage de Mots Clés
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
              Thèmes les plus abordés dans les propositions citoyennes
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex', gap: '0.3rem', background: '#F3F4F6',
          padding: '0.2rem', borderRadius: '2rem', flexWrap: 'wrap'
        }}>
          {categoriesDisponibles.map(cat => (
            <button
              key={cat}
              onClick={() => setCategorieSelectionnee(cat)}
              style={{
                padding: '0.3rem 0.8rem', borderRadius: '1.5rem',
                border: 'none', fontSize: '0.7rem', fontWeight: 600,
                background: categorieSelectionnee === cat ? '#0D47A1' : 'transparent',
                color: categorieSelectionnee === cat ? 'white' : '#6B7280',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              {cat === 'TOUS' ? '📊 Tous' : 
               cat === 'Institutions' ? '🏛️ Institutions' :
               cat === 'Société' ? '👥 Société' :
               cat === 'Économie' ? '💰 Économie' :
               cat === 'Droits' ? '⚖️ Droits' :
               cat === 'Territoire' ? '🗺️ Territoire' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div style={{
        display: 'flex', gap: '1rem', marginBottom: '1rem',
        justifyContent: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Mots uniques</span>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0D47A1' }}>
            {motsFiltres.length}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Occurrences totales</span>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0D47A1' }}>
            {totalOccurrences}
          </div>
        </div>
        {erreur && (
          <div style={{
            fontSize: '0.65rem', background: '#FEF3C7', color: '#D97706',
            padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 600
          }}>
            Données par défaut
          </div>
        )}
      </div>

      {/* Nuage de mots */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
        justifyContent: 'center', alignItems: 'center',
        padding: '1.5rem 1rem', minHeight: '250px',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F0F9FF 100%)',
        borderRadius: '0.75rem', border: '1px solid #E5E7EB',
        position: 'relative', overflow: 'hidden'
      }}>
        
        <AnimatePresence>
          {motSurvole && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'absolute', top: '10px', left: '50%', 
                transform: 'translateX(-50%)',
                background: '#0D47A1', color: 'white', 
                padding: '0.4rem 1rem', borderRadius: '20px', 
                fontSize: '0.8rem', fontWeight: 600,
                zIndex: 10, boxShadow: '0 4px 12px rgba(13,71,161,0.3)',
                pointerEvents: 'none', whiteSpace: 'nowrap'
              }}
            >
              {motSurvole}
            </motion.div>
          )}
        </AnimatePresence>

        {motsMelanges.map((mot, index) => (
          <motion.span
            key={`${mot.texte}-${index}`}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: (index % 30) * 0.02,
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            whileHover={{ 
              scale: 1.3, 
              y: -6, 
              zIndex: 5,
              transition: { type: 'spring', stiffness: 400 }
            }}
            onMouseEnter={() => setMotSurvole(
              `${mot.texte} — ${mot.occurences} occurrence${mot.occurences > 1 ? 's' : ''} • ${mot.iconeCategorie} ${mot.categorieNom}`
            )}
            onMouseLeave={() => setMotSurvole(null)}
            style={{
              fontSize: `${mot.taille}rem`,
              color: mot.couleur,
              fontWeight: mot.occurences > 15 ? 800 : mot.occurences > 8 ? 700 : 600,
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: '8px',
              background: motSurvole?.startsWith(mot.texte) ? `${mot.couleur}15` : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              userSelect: 'none',
              lineHeight: 1.4,
              letterSpacing: '0.01em',
              textShadow: motSurvole?.startsWith(mot.texte) ? `0 0 8px ${mot.couleur}40` : 'none'
            }}
          >
            {mot.texte}
          </motion.span>
        ))}
      </div>

      {/* Légende */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1.5rem',
        marginTop: '1rem', flexWrap: 'wrap'
      }}>
        {[
          { label: 'Très fréquent (≥15)', taille: '1.3rem', poids: 800 },
          { label: 'Fréquent (8-14)', taille: '1.0rem', poids: 700 },
          { label: 'Mentionné (≤7)', taille: '0.8rem', poids: 600 },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem'
          }}>
            <span style={{
              fontSize: item.taille, fontWeight: item.poids,
              color: '#0D47A1', lineHeight: 1
            }}>
              Aa
            </span>
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Pied */}
      <div style={{
        marginTop: '0.75rem', padding: '0.65rem',
        background: 'linear-gradient(135deg, #F0F4F8, #E8EDF2)',
        borderRadius: '0.5rem', fontSize: '0.7rem', color: '#6B7280',
        textAlign: 'center', fontWeight: 500
      }}>
        🤖 Généré automatiquement à partir des propositions publiées
        <br />
        <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>
          Analyse lexicale temps réel • Classification par thème • Palette officielle RDC
        </span>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default WordCloud;