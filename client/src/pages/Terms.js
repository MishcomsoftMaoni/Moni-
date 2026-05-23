import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================
// CONDITIONS GÉNÉRALES D'UTILISATION
// Version Officielle - Conforme aux lois de la RDC
// Dernière mise à jour: Mai 2026
// Version: 100.0.4
// =============================================

const SECTIONS = [
  {
    title: '1. Objet de l\'application',
    icon: '🎯',
    content: `L'application MAONI a pour objectif de :`,
    list: [
      '📢 Permettre aux citoyens congolais de la RDC et de la diaspora d\'exprimer leurs opinions et de soumettre des propositions concernant les réformes constitutionnelles.',
      '🗳️ Favoriser la participation citoyenne, le dialogue démocratique et la consultation populaire à grande échelle.',
      '📊 Collecter des données d\'opinion de manière transparente, structurée et vérifiable.',
      '🏛️ Transmettre les propositions les plus soutenues aux autorités compétentes.',
    ],
  },
  {
    title: '2. Acceptation des conditions',
    icon: '✓',
    content: `En accédant à l'application MAONI, en créant un compte ou en soumettant une proposition, vous reconnaissez avoir lu, compris et accepté l'intégralité des présentes conditions d'utilisation. Si vous n'êtes pas d'accord avec l'une quelconque de ces conditions, vous devez immédiatement cesser d'utiliser l'application et supprimer votre compte.`,
  },
  {
    title: '3. Accès et utilisation',
    icon: '🔑',
    list: [
      '👤 L\'accès à l\'application est réservé aux utilisateurs âgés d\'au moins 18 ans.',
      '📝 Vous vous engagez à fournir des informations exactes, complètes et à jour.',
      '🔒 Vous êtes entièrement responsable de la confidentialité de vos identifiants.',
      '⚠️ Il vous incombe de signaler immédiatement toute utilisation non autorisée.',
    ],
  },
  {
    title: '4. Utilisation autorisée et interdite',
    icon: '🚫',
    content: 'En utilisant MAONI, vous vous engagez à :',
    list: [
      '✅ Utiliser l\'application uniquement à des fins légales, civiques et démocratiques.',
      '🤝 Respecter les valeurs démocratiques, l\'unité nationale de la RDC.',
      '🚫 Ne pas soumettre de contenus diffamatoires, haineux ou discriminatoires.',
      '❌ Ne pas publier de fausses informations ou de désinformation.',
      '⚔️ Ne pas inciter à la violence ou à l\'instabilité politique.',
      '🕵️ Ne pas usurper l\'identité d\'autrui.',
      '💼 Ne pas utiliser l\'application à des fins commerciales sans autorisation.',
      '💻 Ne pas tenter de pirater ou perturber la plateforme.',
    ],
  },
  {
    title: '5. Propriété et modération des contenus',
    icon: '📜',
    content: `Les utilisateurs conservent la propriété intellectuelle de leurs propositions. En soumettant un contenu, vous accordez à MAONI une licence pour utiliser, analyser et diffuser ce contenu à des fins de consultation démocratique.

MAONI se réserve le droit de modérer ou supprimer tout contenu inapproprié.`,
  },
  {
    title: '6. Collecte et utilisation des données',
    icon: '📊',
    content: `MAONI peut collecter et traiter les données suivantes :`,
    list: [
      '🆔 Données d\'identité : prénom, nom, email, téléphone.',
      '📊 Données socio-démographiques : âge, profession, province.',
      '📈 Données d\'usage : propositions, votes, consultations.',
      '💻 Données techniques : navigateur, appareil, IP.',
    ],
    extra: 'Ces données ne sont jamais vendues à des tiers.',
  },
  {
    title: '7. Confidentialité et protection des données',
    icon: '🔒',
    list: [
      '🔐 Les votes peuvent être anonymisés dans les rapports publics.',
      '🚫 MAONI ne vend ni ne loue vos données personnelles.',
      '🛡️ Des mesures de sécurité protègent vos données.',
      '⚖️ Vous disposez de droits sur vos données (accès, rectification, suppression).',
    ],
  },
  {
    title: '8. Propriété intellectuelle de la plateforme',
    icon: '©️',
    content: `Tous les éléments de l'application MAONI (logo, design, code source) sont protégés par les droits de propriété intellectuelle. Toute reproduction non autorisée est interdite.`,
  },
  {
    title: '9. Responsabilité et limitation de garanties',
    icon: '⚠️',
    list: [
      '🏛️ MAONI ne garantit pas l\'influence directe sur les décisions politiques.',
      '📱 La plateforme est fournie « telle quelle » sans garantie de disponibilité continue.',
      '🔧 MAONI ne peut être tenu responsable des interruptions de service.',
      '💬 Les opinions exprimées n\'engagent que leurs auteurs.',
    ],
  },
  {
    title: '10. Suspension ou suppression de compte',
    icon: '⛔',
    content: `MAONI peut suspendre ou supprimer un compte en cas de :`,
    list: [
      '📜 Violation des conditions d\'utilisation.',
      '🕵️ Comportement frauduleux ou malveillant.',
      '📝 Soumission de contenus contraires aux lois.',
      '⚠️ Signalements répétés.',
    ],
  },
  {
    title: '11. Modification des conditions',
    icon: '📝',
    content: `Les conditions peuvent être modifiées. Les utilisateurs seront informés des changements substantiels. L'utilisation continue vaut acceptation.`,
  },
  {
    title: '12. Droit applicable et juridiction compétente',
    icon: '⚖️',
    content: `Les présentes conditions sont régies par les lois de la République Démocratique du Congo. Tout litige sera soumis aux tribunaux de Kinshasa.`,
  },
];

const Terms = () => {
  const [recherche, setRecherche] = useState('');
  const [sectionsFiltrees, setSectionsFiltrees] = useState(SECTIONS);

  const handleRecherche = (e) => {
    const terme = e.target.value.toLowerCase();
    setRecherche(terme);
    
    if (terme.trim() === '') {
      setSectionsFiltrees(SECTIONS);
    } else {
      const filtres = SECTIONS.filter(section =>
        section.title.toLowerCase().includes(terme) ||
        (section.content && section.content.toLowerCase().includes(terme)) ||
        (section.list && section.list.some(item => item.toLowerCase().includes(terme)))
      );
      setSectionsFiltrees(filtres);
    }
  };

  const dateMiseAJour = '22 Mai 2026';

  return (
    <>
      <Helmet>
        <title>Conditions d'Utilisation | MAONI RDC</title>
        <meta name="description" content="Conditions d'utilisation de la plateforme MAONI - Consultation citoyenne pour les réformes constitutionnelles de la RDC." />
        <meta name="keywords" content="conditions d'utilisation, CGU, MAONI, RDC, consultation citoyenne" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}
      >
        {/* Header présidentiel */}
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
            pointerEvents: 'none',
            fontFamily: 'Georgia, serif'
          }}>
            CGU
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ fontSize: '4rem', marginBottom: '0.5rem' }}
            >
              ⚖️🇨🇩
            </motion.div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              marginBottom: '0.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Conditions Générales d'Utilisation
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              Application MAONI – Plateforme Présidentielle de Consultation Citoyenne
            </p>
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,215,0,0.15)',
              padding: '0.3rem 1rem',
              borderRadius: '2rem',
              marginTop: '0.5rem'
            }}>
              <span style={{ color: '#FFD700', fontSize: '0.8rem', fontWeight: 600 }}>
                📅 Dernière mise à jour : {dateMiseAJour}
              </span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #FFFFFF, #F8FAFC)',
              padding: '1.5rem 2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              borderLeft: '5px solid #0D47A1',
              border: '1px solid rgba(255,215,0,0.2)'
            }}
          >
            <p style={{ margin: 0, lineHeight: 1.8, color: '#374151', fontSize: '0.95rem' }}>
              Bienvenue sur <strong style={{ color: '#0D47A1' }}>MAONI</strong>, une application web dédiée à la collecte d'opinions citoyennes
              et à la consultation populaire concernant les réformes constitutionnelles en République Démocratique du Congo.
              <br /><br />
              En accédant à cette application et en créant un compte, vous acceptez les présentes conditions d'utilisation.
            </p>
          </motion.div>

          {/* Barre de recherche */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Rechercher dans les conditions..."
                value={recherche}
                onChange={handleRecherche}
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
            {recherche && (
              <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#6B7280' }}>
                {sectionsFiltrees.length} section{sectionsFiltrees.length > 1 ? 's' : ''} trouvée{sectionsFiltrees.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Table des matières */}
          {!recherche && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                marginBottom: '2rem',
                border: '1px solid #E5E7EB'
              }}
            >
              <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> Table des matières
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                {SECTIONS.map((section, index) => (
                  <a
                    key={index}
                    href={`#section-${index}`}
                    style={{
                      color: '#0D47A1',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      padding: '0.3rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFD700'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#0D47A1'}
                  >
                    <span>{section.icon}</span> {section.title}
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Sections CGU */}
          <AnimatePresence>
            {sectionsFiltrees.map((section, index) => (
              <motion.div
                key={section.title}
                id={`section-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
                style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  marginBottom: '1rem',
                  borderLeft: `4px solid #0D47A1`
                }}
              >
                <h2 style={{
                  color: '#0D47A1',
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.1rem',
                  marginTop: 0,
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
                  {section.title}
                </h2>

                {section.content && (
                  <p style={{
                    lineHeight: 1.7,
                    color: '#374151',
                    marginBottom: section.list ? '0.75rem' : 0,
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-line'
                  }}>
                    {section.content}
                  </p>
                )}

                {section.list && (
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                    {section.list.map((item, i) => (
                      <li key={i} style={{ color: '#374151', fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.extra && (
                  <p style={{
                    lineHeight: 1.7,
                    color: '#374151',
                    marginTop: '0.75rem',
                    marginBottom: 0,
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    padding: '0.75rem',
                    background: '#F0F4F8',
                    borderRadius: '0.5rem'
                  }}>
                    {section.extra}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Message si aucun résultat */}
          {sectionsFiltrees.length === 0 && (
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
              <h3 style={{ color: '#0D47A1', marginBottom: '0.5rem' }}>Aucun résultat trouvé</h3>
              <p style={{ color: '#6B7280' }}>
                Aucune section ne correspond à votre recherche "{recherche}".
              </p>
              <button
                onClick={() => {
                  setRecherche('');
                  setSectionsFiltrees(SECTIONS);
                }}
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

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
              padding: '2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              color: 'white',
              marginTop: '2rem',
              border: '1px solid rgba(255,215,0,0.3)'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📬</div>
            <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'Georgia, serif' }}>Pour toute question</h3>
            <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
              Si vous avez des questions concernant ces conditions d'utilisation, n'hésitez pas à nous contacter.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span>📧 contact@maoni.cd</span>
              <span>📍 Kinshasa/Gombe, RDC</span>
              <span>📞 +243 896 590 320</span>
            </div>
          </motion.div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link
              to="/privacy"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#0D47A1',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: 700,
                border: '2px solid #0D47A1',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0D47A1';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#0D47A1';
              }}
            >
              🔒 Politique de Confidentialité
            </Link>
            <Link
              to="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#0D47A1',
                color: 'white',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1565C0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0D47A1'}
            >
              🏠 Retour à l'accueil
            </Link>
          </div>

          {/* Version et conformité */}
          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            fontSize: '0.7rem',
            color: '#9CA3AF',
            borderTop: '1px solid #E5E7EB',
            paddingTop: '1.5rem'
          }}>
            <p>© {new Date().getFullYear()} MAONI - République Démocratique du Congo</p>
            <p>Version 100.04 - Conforme aux lois de la RDC</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Terms;