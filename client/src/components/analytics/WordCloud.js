import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';

const MOTS_VIDES = new Set([
  'cette', 'notre', 'leurs', 'pour', 'avec', 'dans', 'plus', 'très',
  'alors', 'aussi', 'bien', 'comme', 'entre', 'mais', 'même', 'moins',
  'sont', 'sous', 'sur', 'tout', 'tous', 'une', 'aux', 'des', 'les',
  'nos', 'par', 'pas', 'que', 'qui', 'son', 'ont', 'été', 'est'
]);

const PALETTE_RDC = [
  '#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3',
  '#C62828', '#D32F2F', '#E53935', '#EF5350',
  '#F57F17', '#F9A825', '#FBC02D', '#FFD700',
  '#1B5E20', '#2E7D32', '#388E3C', '#43A047',
  '#4A148C', '#6A1B9A', '#7B1FA2', '#8E24AA',
  '#00695C', '#00838F', '#0277BD', '#5D4037',
];

const WordCloud = () => {
  const [mots, setMots] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [motSurvole, setMotSurvole] = useState(null);

  useEffect(() => {
    genererNuage();
  }, []);

  const genererNuage = async () => {
    try {
      const { data } = await supabase
        .from('proposals')
        .select('subject, category')
        .eq('status', 'published')
        .limit(100);

      if (!data || data.length === 0) {
        setMots(motsParDefaut());
        setChargement(false);
        return;
      }

      const frequences = {};
      data.forEach(proposition => {
        if (proposition.subject) {
          const motsExtraits = proposition.subject
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z\s-]/g, ' ')
            .split(/\s+/)
            .filter(mot => mot.length > 4 && !MOTS_VIDES.has(mot));

          motsExtraits.forEach(mot => {
            frequences[mot] = (frequences[mot] || 0) + 1;
          });
        }
      });

      const tries = Object.entries(frequences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 40)
        .map(([mot, occurences]) => ({
          texte: mot.charAt(0).toUpperCase() + mot.slice(1),
          occurences,
          taille: Math.max(0.7, Math.min(2.4, 0.7 + (occurences / 8))),
          couleur: PALETTE_RDC[Math.floor(Math.random() * PALETTE_RDC.length)],
        }));

      setMots(tries.length >= 5 ? tries : motsParDefaut());
    } catch (err) {
      console.error('Erreur nuage de mots:', err);
      setMots(motsParDefaut());
    } finally {
      setChargement(false);
    }
  };

  const motsParDefaut = () => {
    const defauts = [
      'Constitution', 'Réforme', 'Démocratie', 'Justice', 'Droits',
      'Liberté', 'Citoyens', 'Provinces', 'Décentralisation',
      'Éducation', 'Santé', 'Sécurité', 'Développement', 'Économie',
      'Emploi', 'Paix', 'Unité', 'Gouvernance', 'Transparence',
      'Participation', 'Référendum', 'Vote', 'Souveraineté',
      'Congo', 'Peuple', 'Avenir', 'Parlement', 'Mandat',
      'Élections', 'Ressources'
    ];
    return defauts.map((texte, i) => ({
      texte,
      occurences: Math.max(3, 25 - i),
      taille: Math.max(0.75, Math.min(2.2, 2.2 - (i * 0.04))),
      couleur: PALETTE_RDC[i % PALETTE_RDC.length],
    }));
  };

  const motsMelanges = [...mots].sort(() => Math.random() - 0.5);

  if (chargement) {
    return (
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center'
      }}>
        <div style={{
          width: '36px', height: '36px', margin: '0 auto 1rem',
          border: '3px solid #E5E7EB', borderTopColor: '#0D47A1',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#6B7280', margin: 0 }}>
          Génération du nuage de mots en cours...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white', padding: '1.75rem', borderRadius: '1rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginTop: '1.5rem'
    }}>
      {/* En-tête */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem',
        paddingBottom: '0.75rem', borderBottom: '2px solid #F3F4F6'
      }}>
        <span style={{ fontSize: '1.5rem' }}>☁️</span>
        <div>
          <h3 style={{
            color: '#0D47A1', margin: 0, fontFamily: 'Georgia, serif',
            fontSize: '1.15rem', fontWeight: 700
          }}>
            Nuage de Mots Clés
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
            Thèmes les plus abordés dans les propositions
          </p>
        </div>
      </div>

      {/* Nuage */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
        justifyContent: 'center', alignItems: 'center',
        padding: '1.5rem 1rem', minHeight: '220px',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F0F9FF 100%)',
        borderRadius: '0.75rem', border: '1px solid #E5E7EB',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Mot survolé - infobulle */}
        {motSurvole && (
          <div style={{
            position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
            background: '#0D47A1', color: 'white', padding: '0.4rem 1rem',
            borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
            zIndex: 10, boxShadow: '0 4px 12px rgba(13,71,161,0.3)',
            pointerEvents: 'none'
          }}>
            {motSurvole}
          </div>
        )}

        {motsMelanges.map((mot, index) => (
          <motion.span
            key={mot.texte}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.025,
              type: 'spring',
              stiffness: 180,
              damping: 12
            }}
            whileHover={{ scale: 1.25, y: -4, zIndex: 5 }}
            onMouseEnter={() => setMotSurvole(`${mot.texte} (${mot.occurences} occ.)`)}
            onMouseLeave={() => setMotSurvole(null)}
            style={{
              fontSize: `${mot.taille}rem`,
              color: mot.couleur,
              fontWeight: mot.occurences > 8 ? 800 : mot.occurences > 5 ? 700 : 600,
              cursor: 'pointer',
              padding: '3px 8px',
              borderRadius: '6px',
              background: motSurvole === `${mot.texte} (${mot.occurences} occ.)`
                ? `${mot.couleur}18`
                : 'transparent',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              lineHeight: 1.4,
              letterSpacing: '0.01em',
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
          { label: 'Très fréquent', taille: '1.15rem', poids: 800 },
          { label: 'Fréquent', taille: '0.95rem', poids: 700 },
          { label: 'Mentionné', taille: '0.8rem', poids: 600 },
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
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Pied */}
      <div style={{
        marginTop: '0.75rem', padding: '0.65rem',
        background: 'linear-gradient(135deg, #F0F4F8, #E8EDF2)',
        borderRadius: '0.5rem', fontSize: '0.74rem', color: '#6B7280',
        textAlign: 'center', fontWeight: 500
      }}>
        🤖 Généré automatiquement à partir des propositions publiées
      </div>
    </div>
  );
};

export default WordCloud;