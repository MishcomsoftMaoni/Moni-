import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================
// CONSTITUTION DE LA RDC - Version Officielle
// Document Fondamental de la République
// Version: 100.0.4
// =============================================

const ARTICLES_CONSTITUTION = [
  {
    numero: 'Préambule',
    titre: 'Préambule',
    contenu: 'Nous, Peuple Congolais, Unis par la volonté de bâtir un État de droit, une Nation unie et prospère, dans le respect de nos diversités et de nos traditions.',
    icone: '📜',
    couleur: 'gold'
  },
  {
    numero: 'Article 1',
    titre: 'Forme de l\'État',
    contenu: 'La République Démocratique du Congo est, dans ses frontières du 30 juin 1960, un État de droit, indépendant, souverain, uni et indivisible, laïc, démocratique et social. Son emblème est le drapeau tricolore bleu ciel, orné d\'une étoile jaune dans le coin supérieur gauche.',
    icone: '🏛️',
    couleur: 'blue'
  },
  {
    numero: 'Article 2',
    titre: 'Organisation territoriale',
    contenu: 'La République Démocratique du Congo est composée de la Ville de Kinshasa et de vingt-cinq provinces dotées de la personnalité juridique. La liste et l\'organisation des provinces sont fixées par la loi.',
    icone: '🗺️',
    couleur: 'green'
  },
  {
    numero: 'Article 5',
    titre: 'Souveraineté nationale',
    contenu: 'La souveraineté nationale appartient au peuple. Tout pouvoir émane du peuple qui l\'exerce directement par voie de référendum ou d\'élections, et indirectement par ses représentants.',
    icone: '👥',
    couleur: 'gold'
  },
  {
    numero: 'Article 10',
    titre: 'Nationalité',
    contenu: 'La nationalité congolaise est une et exclusive. Elle ne peut être détenue concomitamment avec aucune autre.',
    icone: '🪪',
    couleur: 'blue'
  },
  {
    numero: 'Article 15',
    titre: 'Libertés fondamentales',
    contenu: 'Toute personne a droit à la vie, à l\'intégrité physique, à la liberté ainsi qu\'à la sécurité de sa personne. Ces droits sont inviolables.',
    icone: '🕊️',
    couleur: 'green'
  },
  {
    numero: 'Article 70',
    titre: 'Mandat présidentiel',
    contenu: 'Le Président de la République est élu au suffrage universel direct pour un mandat de cinq ans renouvelable une seule fois.',
    icone: '👑',
    couleur: 'gold'
  },
  {
    numero: 'Article 110',
    titre: 'Pouvoir judiciaire',
    contenu: 'Le pouvoir judiciaire est indépendant du pouvoir exécutif et du pouvoir législatif. Il est exercé par les cours et tribunaux.',
    icone: '⚖️',
    couleur: 'blue'
  },
  {
    numero: 'Article 220',
    titre: 'Dispositions intangibles',
    contenu: 'La forme républicaine de l\'État, le principe du suffrage universel, la forme représentative du gouvernement, le nombre et la durée des mandats du Président de la République, ainsi que l\'indépendance de la justice ne peuvent faire l\'objet d\'aucune révision constitutionnelle.',
    icone: '🔒',
    couleur: 'red'
  }
];

const getCouleurArticle = (couleur) => {
  switch (couleur) {
    case 'gold': return '#FFD700';
    case 'blue': return '#0D47A1';
    case 'green': return '#16A34A';
    case 'red': return '#DC2626';
    default: return '#0D47A1';
  }
};

const Constitution = () => {
  const [articleOuvert, setArticleOuvert] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [articlesFiltres, setArticlesFiltres] = useState(ARTICLES_CONSTITUTION);

  useEffect(() => {
    if (recherche.trim() === '') {
      setArticlesFiltres(ARTICLES_CONSTITUTION);
    } else {
      const rechercheLower = recherche.toLowerCase();
      const filtres = ARTICLES_CONSTITUTION.filter(article =>
        article.numero.toLowerCase().includes(rechercheLower) ||
        article.titre.toLowerCase().includes(rechercheLower) ||
        article.contenu.toLowerCase().includes(rechercheLower)
      );
      setArticlesFiltres(filtres);
    }
  }, [recherche]);

  return (
    <>
      <Helmet>
        <title>Constitution de la RDC | Texte Fondamental | MAONI</title>
        <meta name="description" content="Constitution de la République Démocratique du Congo - Texte officiel modifié par la Loi n° 11/002 du 20 janvier 2011" />
        <meta name="keywords" content="Constitution RDC, Loi fondamentale, RDC, Congo, Constitution congolaise" />
      </Helmet>
      
      <div style={{ background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        {/* En-tête présidentiel */}
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
            bottom: '0',
            right: '0',
            fontSize: '8rem',
            fontWeight: 900,
            opacity: 0.03,
            color: '#FFD700',
            pointerEvents: 'none',
            fontFamily: 'Georgia, serif'
          }}>
            CONSTITUTION
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ fontSize: '4rem', marginBottom: '0.5rem' }}
            >
              📜⚖️
            </motion.div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif", 
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', 
              margin: '0 0 0.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Constitution de la <span style={{ color: '#FFD700' }}>RDC</span>
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0, letterSpacing: '1px' }}>
              Loi Fondamentale de la République Démocratique du Congo
            </p>
            <p style={{ opacity: 0.7, fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Modifiée par la Loi n° 11/002 du 20 janvier 2011
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '-1.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 3 }}>
          
          {/* Section de téléchargement PDF */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              background: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem 2rem', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)', 
              marginBottom: '2rem',
              border: '1px solid rgba(255,215,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>📄</div>
                <div>
                  <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', margin: 0, fontSize: '1.2rem' }}>
                    Document Officiel
                  </h2>
                  <p style={{ color: '#6B7280', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
                    Journal Officiel - Numéro Spécial - Kinshasa, 5 février 2011
                  </p>
                </div>
              </div>
              <a 
                href="/constitution-rdc.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.7rem 1.5rem', 
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)', 
                  color: 'white', 
                  borderRadius: '2rem', 
                  textDecoration: 'none', 
                  fontWeight: 700, 
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(220,38,38,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(220,38,38,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(220,38,38,0.3)';
                }}
              >
                📥 Télécharger le PDF
              </a>
            </div>
          </motion.div>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Rechercher un article, un mot-clé..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.5rem',
                  borderRadius: '2rem',
                  border: '2px solid #E2E8F0',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'white'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
              />
            </div>
          </motion.div>

          {/* Résultats de recherche */}
          {recherche && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: '#6B7280' }}
            >
              {articlesFiltres.length} article{articlesFiltres.length > 1 ? 's' : ''} trouvé{articlesFiltres.length > 1 ? 's' : ''}
            </motion.div>
          )}

          {/* Articles de la Constitution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {articlesFiltres.map((article, index) => {
              const couleurArticle = getCouleurArticle(article.couleur);
              const estOuvert = articleOuvert === article.numero;
              
              return (
                <motion.div
                  key={article.numero}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: 'white',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    boxShadow: estOuvert ? '0 10px 30px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${estOuvert ? couleurArticle : '#E2E8F0'}`,
                    borderLeft: `4px solid ${couleurArticle}`
                  }}
                >
                  <button
                    onClick={() => setArticleOuvert(estOuvert ? null : article.numero)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: estOuvert ? `linear-gradient(135deg, ${couleurArticle}08, transparent)` : 'white',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{article.icone}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ 
                          fontWeight: 800, 
                          color: couleurArticle,
                          fontSize: '0.85rem',
                          letterSpacing: '0.5px'
                        }}>
                          {article.numero}
                        </div>
                        <div style={{ 
                          fontWeight: 700, 
                          color: '#1F2937',
                          fontSize: '1rem'
                        }}>
                          {article.titre}
                        </div>
                      </div>
                    </div>
                    <motion.span
                      animate={{ rotate: estOuvert ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ color: '#9CA3AF', fontSize: '1.2rem' }}
                    >
                      ▼
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {estOuvert && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ 
                          padding: '0 1.5rem 1.5rem 1.5rem',
                          borderTop: `1px solid ${couleurArticle}20`
                        }}>
                          <p style={{ 
                            color: '#374151', 
                            lineHeight: 1.7, 
                            fontSize: '0.9rem',
                            marginBottom: '1rem',
                            fontStyle: 'italic'
                          }}>
                            {article.contenu}
                          </p>
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: '#9CA3AF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>🔗</span>
                            <span>Article {article.numero} de la Constitution de la RDC</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Message si aucun résultat */}
          {articlesFiltres.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '1rem',
                marginTop: '1rem'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</div>
              <h3 style={{ color: '#0D47A1', marginBottom: '0.5rem' }}>Aucun article trouvé</h3>
              <p style={{ color: '#6B7280' }}>
                Aucun article ne correspond à votre recherche "{recherche}".
              </p>
              <button
                onClick={() => setRecherche('')}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1.5rem',
                  background: '#0D47A1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2rem',
                  cursor: 'pointer'
                }}
              >
                Effacer la recherche
              </button>
            </motion.div>
          )}

          {/* Lien retour */}
          <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '1rem' }}>
            <Link 
              to="/" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#0D47A1', 
                fontWeight: 700, 
                textDecoration: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '2rem',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.transform = 'translateX(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Constitution;