import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================
// GALERIE DU PATRIMOINE NATIONAL - Niveau Présidentiel
// Images officielles | Animation | Citations RDC
// =============================================

const IMAGES_PATRIMOINE = [
  {
    id: 1,
    src: '/images/gallery/president-tshisekedi-rdc-fr.jpg',
    alt: 'Son Excellence Félix Tshisekedi, Président de la République',
    titre: 'Leadership National',
    description: 'Son Excellence Félix Tshisekedi, Président de la République Démocratique du Congo',
    forme: 'portrait',
    priorite: true,
    citation: '"L\'unité nationale est notre force"'
  },
  {
    id: 2,
    src: '/images/gallery/forest-bassin-congo-fr.jpg',
    alt: 'Forêt du Bassin du Congo',
    titre: 'Bassin du Congo',
    description: 'Deuxième poumon vert de la planète, patrimoine mondial de l\'UNESCO',
    forme: 'landscape',
    citation: '"Protégeons notre patrimoine naturel"'
  },
  {
    id: 3,
    src: '/images/gallery/okapi-espece-protegee-fr.jpg',
    alt: 'Okapi, espèce protégée de RDC',
    titre: 'Okapi',
    description: 'Espèce endémique protégée, trésor national de la biodiversité congolaise',
    forme: 'square',
    citation: '"La biodiversité, fierté nationale"'
  },
  {
    id: 4,
    src: '/images/gallery/gorille-montagne-virunga-fr.jpg',
    alt: 'Gorille des montagnes du Parc des Virunga',
    titre: 'Gorille des Montagnes',
    description: 'Parc National des Virunga, site classé au patrimoine mondial de l\'UNESCO',
    forme: 'square',
    citation: '"Virunga, joyau de l\'humanité"'
  },
  {
    id: 5,
    src: '/images/gallery/volcan-nyiragongo-goma-fr.jpg',
    alt: 'Volcan Nyiragongo à Goma',
    titre: 'Volcan Nyiragongo',
    description: 'Merveille naturelle de Goma, le plus grand lac de lave du monde',
    forme: 'square',
    citation: '"La puissance de la nature congolaise"'
  },
  {
    id: 6,
    src: '/images/gallery/fleuve-congo-kinshasa-fr.jpg',
    alt: 'Fleuve Congo à Kinshasa',
    titre: 'Fleuve Congo',
    description: 'Artère vitale de la RDC, le fleuve le plus profond du monde',
    forme: 'landscape',
    citation: '"Le Congo, notre artère vitale"'
  }
];

const HeritageGallery = () => {
  const [indexActuel, setIndexActuel] = useState(0);
  const [enTransition, setEnTransition] = useState(false);
  const [survole, setSurvole] = useState(false);
  const [direction, setDirection] = useState('next');
  const [progressWidth, setProgressWidth] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const autoAdvanceDelay = 6000;

  const demarrerProgression = useCallback(() => {
    setProgressWidth(0);
    if (progressRef.current) clearInterval(progressRef.current);
    
    progressRef.current = setInterval(() => {
      setProgressWidth(prev => {
        if (prev >= 100) {
          clearInterval(progressRef.current);
          return 100;
        }
        return prev + (100 / (autoAdvanceDelay / 50));
      });
    }, 50);
  }, []);

  const reinitialiserProgression = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    demarrerProgression();
  }, [demarrerProgression]);

  const imageSuivante = useCallback(() => {
    if (enTransition) return;
    setDirection('next');
    setEnTransition(true);
    reinitialiserProgression();
    setTimeout(() => {
      setIndexActuel((precedent) => (precedent + 1) % IMAGES_PATRIMOINE.length);
      setEnTransition(false);
    }, 600);
  }, [enTransition, reinitialiserProgression]);

  const imagePrecedente = useCallback(() => {
    if (enTransition) return;
    setDirection('prev');
    setEnTransition(true);
    reinitialiserProgression();
    setTimeout(() => {
      setIndexActuel((precedent) => (precedent - 1 + IMAGES_PATRIMOINE.length) % IMAGES_PATRIMOINE.length);
      setEnTransition(false);
    }, 600);
  }, [enTransition, reinitialiserProgression]);

  useEffect(() => {
    if (survole) return;
    
    demarrerProgression();
    const intervalle = setInterval(() => {
      imageSuivante();
    }, autoAdvanceDelay);
    
    return () => {
      clearInterval(intervalle);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [imageSuivante, survole, demarrerProgression]);

  const allerA = useCallback((index) => {
    if (index === indexActuel || enTransition) return;
    setDirection(index > indexActuel ? 'next' : 'prev');
    setEnTransition(true);
    reinitialiserProgression();
    setTimeout(() => {
      setIndexActuel(index);
      setEnTransition(false);
    }, 600);
  }, [indexActuel, enTransition, reinitialiserProgression]);

  const imageActuelle = IMAGES_PATRIMOINE[indexActuel];

  const variants = {
    next: {
      initial: { opacity: 0, x: 100, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -100, scale: 0.95 }
    },
    prev: {
      initial: { opacity: 0, x: -100, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: 100, scale: 0.95 }
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      borderRadius: '1.5rem',
      overflow: 'hidden',
      boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)',
      background: 'linear-gradient(135deg, #0A0F1A, #0F172A)'
    }}
      onMouseEnter={() => setSurvole(true)}
      onMouseLeave={() => setSurvole(false)}
    >
      
      {/* Bandeau honorifique */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
        backdropFilter: 'blur(8px)',
        padding: '0.5rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,215,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🏛️</span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#FFD700',
            letterSpacing: '0.1em'
          }}>
            PATRIMOINE NATIONAL
          </span>
        </div>
        <div style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'monospace'
        }}>
          {indexActuel + 1} / {IMAGES_PATRIMOINE.length}
        </div>
      </div>

      {/* Conteneur d'images */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(300px, 55vw, 550px)',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)'
      }}>
        
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={imageActuelle.id}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              background: `radial-gradient(circle, ${imageActuelle.forme === 'portrait' ? 'rgba(255,215,0,0.15)' : 'rgba(255,215,0,0.08)'}, transparent 70%)`,
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
            
            <img
              src={imageActuelle.src}
              alt={imageActuelle.alt}
              loading={imageActuelle.priorite ? 'eager' : 'lazy'}
              style={{
                maxWidth: imageActuelle.forme === 'portrait' ? '45%' : '90%',
                maxHeight: imageActuelle.forme === 'portrait' ? '90%' : '80%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '1rem',
                boxShadow: '0 15px 50px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,215,0,0.2)'
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Citation flottante */}
        <motion.div
          key={`citation-${imageActuelle.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem 1rem',
            borderRadius: '2rem',
            border: '1px solid rgba(255,215,0,0.3)',
            fontSize: '0.7rem',
            color: '#FFD700',
            fontStyle: 'italic',
            maxWidth: '200px',
            textAlign: 'center'
          }}
        >
          “{imageActuelle.citation}”
        </motion.div>

        {/* Légende principale */}
        <motion.div
          key={`legende-${imageActuelle.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(13,71,161,0.95), rgba(10,61,143,0.95))',
            backdropFilter: 'blur(12px)',
            color: 'white',
            padding: '0.8rem 1.8rem',
            borderRadius: '3rem',
            textAlign: 'center',
            border: '2px solid rgba(255,215,0,0.6)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            maxWidth: '90%',
            zIndex: 5
          }}
        >
          <h3 style={{
            color: '#FFD700',
            margin: 0,
            fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}>
            {imageActuelle.titre}
          </h3>
          <p style={{
            margin: '0.3rem 0 0',
            fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
            opacity: 0.95,
            lineHeight: 1.4
          }}>
            {imageActuelle.description}
          </p>
        </motion.div>

        {/* Flèches de navigation */}
        <AnimatePresence>
          {survole && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={imagePrecedente}
                aria-label="Image précédente"
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  border: '1px solid rgba(255,215,0,0.5)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                whileHover={{ scale: 1.1, background: 'rgba(13,71,161,0.8)' }}
              >
                ‹
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={imageSuivante}
                aria-label="Image suivante"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  border: '1px solid rgba(255,215,0,0.5)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                whileHover={{ scale: 1.1, background: 'rgba(13,71,161,0.8)' }}
              >
                ›
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Points de navigation et barre de progression */}
      <div style={{
        padding: '0.8rem 1rem',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
        borderTop: '1px solid rgba(255,215,0,0.15)'
      }}>
        
        {/* Barre de progression */}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '1px',
          marginBottom: '0.8rem',
          overflow: 'hidden'
        }}>
          <motion.div
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #FFD700, #F59E0B)',
              borderRadius: '1px',
              boxShadow: '0 0 8px rgba(255,215,0,0.5)'
            }}
          />
        </div>

        {/* Points de navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap'
        }}>
          {IMAGES_PATRIMOINE.map((image, index) => (
            <motion.button
              key={image.id}
              onClick={() => allerA(index)}
              aria-label={`Voir ${image.titre}`}
              title={image.titre}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: index === indexActuel ? '32px' : '10px',
                height: '10px',
                borderRadius: '5px',
                border: 'none',
                background: index === indexActuel
                  ? 'linear-gradient(90deg, #FFD700, #F59E0B)'
                  : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: index === indexActuel
                  ? '0 0 12px rgba(255,215,0,0.6)'
                  : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Indicateur de pause */}
      <AnimatePresence>
        {survole && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              bottom: '50px',
              right: '15px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              padding: '0.2rem 0.6rem',
              borderRadius: '1rem',
              fontSize: '0.6rem',
              color: '#FFD700',
              zIndex: 15
            }}
          >
            ⏸️ Défilement en pause
          </motion.div>
        )}
      </AnimatePresence>

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

export default HeritageGallery;