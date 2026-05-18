import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES_PATRIMOINE = [
  {
    id: 1,
    src: '/images/gallery/president-tshisekedi-rdc-fr.jpg',
    alt: 'Son Excellence Félix Tshisekedi, Président de la République',
    titre: 'Leadership National',
    description: 'Son Excellence Félix Tshisekedi, Président de la République Démocratique du Congo',
    forme: 'portrait',
    priorite: true
  },
  {
    id: 2,
    src: '/images/gallery/forest-bassin-congo-fr.jpg',
    alt: 'Forêt du Bassin du Congo',
    titre: 'Bassin du Congo',
    description: 'Deuxième poumon vert de la planète, patrimoine mondial de l\'UNESCO',
    forme: 'landscape'
  },
  {
    id: 3,
    src: '/images/gallery/okapi-espece-protegee-fr.jpg',
    alt: 'Okapi, espèce protégée de RDC',
    titre: 'Okapi',
    description: 'Espèce endémique protégée, trésor national de la biodiversité congolaise',
    forme: 'square'
  },
  {
    id: 4,
    src: '/images/gallery/gorille-montagne-virunga-fr.jpg',
    alt: 'Gorille des montagnes du Parc des Virunga',
    titre: 'Gorille des Montagnes',
    description: 'Parc National des Virunga, site classé au patrimoine mondial de l\'UNESCO',
    forme: 'square'
  },
  {
    id: 5,
    src: '/images/gallery/volcan-nyiragongo-goma-fr.jpg',
    alt: 'Volcan Nyiragongo à Goma',
    titre: 'Volcan Nyiragongo',
    description: 'Merveille naturelle de Goma, le plus grand lac de lave du monde',
    forme: 'square'
  },
  {
    id: 6,
    src: '/images/gallery/fleuve-congo-kinshasa-fr.jpg',
    alt: 'Fleuve Congo à Kinshasa',
    titre: 'Fleuve Congo',
    description: 'Artère vitale de la RDC, le fleuve le plus profond du monde',
    forme: 'landscape'
  }
];

const HeritageGallery = () => {
  const [indexActuel, setIndexActuel] = useState(0);
  const [enTransition, setEnTransition] = useState(false);
  const [survole, setSurvole] = useState(false);

  const imageSuivante = useCallback(() => {
    if (enTransition) return;
    setEnTransition(true);
    setTimeout(() => {
      setIndexActuel((precedent) => (precedent + 1) % IMAGES_PATRIMOINE.length);
      setEnTransition(false);
    }, 600);
  }, [enTransition]);

  useEffect(() => {
    if (survole) return;
    const intervalle = setInterval(imageSuivante, 5000);
    return () => clearInterval(intervalle);
  }, [imageSuivante, survole]);

  const allerA = (index) => {
    if (index === indexActuel || enTransition) return;
    setEnTransition(true);
    setTimeout(() => {
      setIndexActuel(index);
      setEnTransition(false);
    }, 600);
  };

  const imageActuelle = IMAGES_PATRIMOINE[indexActuel];

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: '1000px',
      margin: '0 auto', borderRadius: '1.5rem', overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      background: '#0F172A'
    }}
      onMouseEnter={() => setSurvole(true)}
      onMouseLeave={() => setSurvole(false)}
    >
      {/* Conteneur d'images */}
      <div style={{
        position: 'relative', width: '100%',
        height: 'clamp(280px, 50vw, 500px)', overflow: 'hidden'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={imageActuelle.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)',
              padding: '1.5rem'
            }}
          >
            <img
              src={imageActuelle.src}
              alt={imageActuelle.alt}
              style={{
                maxWidth: imageActuelle.forme === 'portrait' ? '50%' : '90%',
                maxHeight: imageActuelle.forme === 'portrait' ? '90%' : '80%',
                width: 'auto', height: 'auto',
                objectFit: 'contain',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Légende */}
        <motion.div
          key={`legende-${imageActuelle.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            position: 'absolute', bottom: '1.5rem', left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(13,71,161,0.95), rgba(10,61,143,0.95))',
            color: 'white', padding: '0.75rem 1.75rem',
            borderRadius: '3rem', textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,215,0,0.5)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            maxWidth: '90%'
          }}
        >
          <h3 style={{
            color: '#FFD700', margin: 0, fontSize: '1.1rem',
            fontFamily: 'Georgia, serif', fontWeight: 700
          }}>
            {imageActuelle.titre}
          </h3>
          <p style={{
            margin: '0.2rem 0 0', fontSize: '0.82rem',
            opacity: 0.9, lineHeight: 1.4
          }}>
            {imageActuelle.description}
          </p>
        </motion.div>

        {/* Flèches de navigation */}
        {survole && (
          <>
            <button
              onClick={() => allerA((indexActuel - 1 + IMAGES_PATRIMOINE.length) % IMAGES_PATRIMOINE.length)}
              aria-label="Image précédente"
              style={{
                position: 'absolute', left: '1rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', color: 'white',
                border: 'none', width: '40px', height: '40px',
                borderRadius: '50%', cursor: 'pointer',
                fontSize: '1.2rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(5px)', transition: 'all 0.3s ease'
              }}
            >
              ‹
            </button>
            <button
              onClick={() => allerA((indexActuel + 1) % IMAGES_PATRIMOINE.length)}
              aria-label="Image suivante"
              style={{
                position: 'absolute', right: '1rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', color: 'white',
                border: 'none', width: '40px', height: '40px',
                borderRadius: '50%', cursor: 'pointer',
                fontSize: '1.2rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(5px)', transition: 'all 0.3s ease'
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Points de navigation */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '0.6rem',
        padding: '1rem', background: 'rgba(0,0,0,0.3)'
      }}>
        {IMAGES_PATRIMOINE.map((image, index) => (
          <button
            key={image.id}
            onClick={() => allerA(index)}
            aria-label={`Voir ${image.titre}`}
            title={image.titre}
            style={{
              width: index === indexActuel ? '28px' : '10px',
              height: '10px', borderRadius: '5px', border: 'none',
              background: index === indexActuel
                ? 'linear-gradient(90deg, #FFD700, #F9A825)'
                : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', transition: 'all 0.3s ease',
              boxShadow: index === indexActuel
                ? '0 0 10px rgba(255,215,0,0.6)'
                : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeritageGallery;