import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================
// POLITIQUE DE CONFIDENTIALITÉ - Version Officielle
// Conforme aux lois RDC | RGPD | Protection maximale
// Dernière mise à jour: Mai 2026
// Version: 100.0.4
// =============================================

const SECTIONS = [
  {
    title: '1. Responsable du traitement',
    icon: '👤',
    content: `Le responsable du traitement des données collectées via l'application MAONI est l'équipe MAONI, dont le siège est établi à Kinshasa, République Démocratique du Congo.

Pour toute question relative à la protection de vos données personnelles :
📧 contact@maoni.cd
📍 Kinshasa/Gombe, RDC
📞 +243 896 590 320`,
  },
  {
    title: '2. Cadre juridique applicable',
    icon: '⚖️',
    content: `Les traitements de données mis en œuvre par MAONI respectent :`,
    list: [
      '📜 Les lois et réglementations en vigueur en République Démocratique du Congo relatives à la protection des données personnelles et à la vie privée.',
      '🌍 Les principes universels de protection des données, notamment ceux du Règlement Général sur la Protection des Données (RGPD) de l\'Union Européenne, appliqués aux utilisateurs de la diaspora congolaise résidant dans l\'espace UE.',
      '🏛️ Les standards internationaux de protection des données personnelles recommandés par les organisations internationales de défense des droits numériques.',
      '🔒 La Loi n° 22/012 sur la cybersécurité et la protection des données personnelles en RDC.',
    ],
  },
  {
    title: '3. Données collectées',
    icon: '📊',
    content: 'MAONI collecte deux catégories de données :',
    subsections: [
      {
        subtitle: 'a) Données fournies volontairement',
        icon: '✍️',
        list: [
          '🆔 Données d\'identité : prénom, nom de famille, adresse e-mail, numéro de téléphone.',
          '📊 Données socio-démographiques : tranche d\'âge, profession, province de résidence, statut diaspora.',
          '🖼️ Photo de profil (portrait) : optionnelle, uniquement si fournie par l\'utilisateur.',
          '💬 Opinions et propositions : textes, contenus de propositions citoyennes et votes exprimés.',
          '📎 Documents joints : fichiers PDF, images téléchargés pour étayer une proposition.',
        ],
      },
      {
        subtitle: 'b) Données collectées automatiquement',
        icon: '🤖',
        list: [
          '🌐 Adresse IP et géolocalisation approximative au niveau du pays ou de la province.',
          '💻 Données techniques : type de navigateur, appareil utilisé, version du système d\'exploitation.',
          '📈 Données d\'usage : pages consultées, propositions lues, durée de session, actions effectuées.',
          '📝 Journaux de connexion (logs) à des fins de sécurité et de détection d\'abus.',
        ],
      },
    ],
  },
  {
    title: '4. Base légale du traitement',
    icon: '📜',
    content: 'Le traitement de vos données repose sur les bases légales suivantes :',
    list: [
      '✅ Consentement explicite : lors de la création du compte, vous consentez expressément au traitement de vos données.',
      '🎯 Intérêt légitime : analyse des tendances démocratiques, détection des abus et amélioration continue.',
      '🏛️ Mission d\'intérêt public : contribution à la consultation citoyenne nationale.',
      '⚖️ Obligation légale : en cas de demande d\'une autorité judiciaire ou administrative.',
    ],
  },
  {
    title: '5. Finalités du traitement',
    icon: '🎯',
    content: 'Vos données sont traitées aux fins suivantes :',
    list: [
      '🔐 Gestion de votre compte utilisateur et authentification sécurisée.',
      '🗳️ Organisation et facilitation des sondages et consultations citoyennes.',
      '📊 Analyse statistique anonymisée des opinions et propositions.',
      '🏛️ Contribution au débat démocratique et transmission des propositions soutenues.',
      '🚀 Amélioration continue des fonctionnalités de l\'application.',
      '🛡️ Prévention des fraudes et assurance de la sécurité de la plateforme.',
      '📧 Communication avec les utilisateurs (notifications importantes).',
    ],
  },
  {
    title: '6. Durée de conservation des données',
    icon: '⏱️',
    content: 'Vos données sont conservées selon les durées suivantes :',
    list: [
      '📆 Données de compte actif : conservées pendant toute la durée d\'activité.',
      '🗑️ Données après suppression du compte : 30 jours après la suppression.',
      '📊 Données anonymisées : conservées sans limite de durée à des fins statistiques.',
      '🔒 Journaux de sécurité : conservés 12 mois maximum, puis supprimés.',
      '💾 Sauvegardes : peuvent contenir vos données pendant 90 jours supplémentaires.',
    ],
  },
  {
    title: '7. Partage et transfert des données',
    icon: '🔄',
    content: 'MAONI ne vend jamais vos données personnelles. Les données peuvent être partagées avec :',
    list: [
      '🏢 Prestataires techniques : hébergement (Supabase/PostgreSQL), sous contrat de confidentialité.',
      '🏛️ Autorités compétentes : données anonymisées et agrégées sur les résultats.',
      '🎓 Chercheurs et institutions académiques : uniquement sous forme de données anonymisées.',
      '⚖️ Autorités judiciaires ou légales : si requis par une décision de justice.',
    ],
    extra: 'Aucun transfert de données vers des pays tiers sans garanties appropriées.',
  },
  {
    title: '8. Sécurité des données',
    icon: '🛡️',
    content: 'MAONI met en œuvre des mesures de sécurité techniques et organisationnelles incluant :',
    list: [
      '🔐 Chiffrement des communications : HTTPS/TLS 1.3.',
      '🔒 Chiffrement des données sensibles : mots de passe hachés (bcrypt).',
      '🛡️ Contrôle d\'accès strict : Row Level Security (RLS).',
      '🔑 Authentification sécurisée : tokens JWT avec expiration.',
      '📊 Journalisation et surveillance : monitoring continu.',
      '📉 Minimisation des données : collecte limitée au strict nécessaire.',
      '💾 Sauvegardes régulières : données chiffrées.',
    ],
  },
  {
    title: '9. Vos droits en matière de données personnelles',
    icon: '⚖️',
    content: 'Conformément aux réglementations applicables, vous disposez des droits suivants :',
    list: [
      '👁️ Droit d\'accès : obtenir une copie de vos données personnelles.',
      '✏️ Droit de rectification : corriger les données inexactes.',
      '🚫 Droit d\'opposition : vous opposer au traitement pour certaines finalités.',
      '🗑️ Droit à l\'effacement (droit à l\'oubli).',
      '⏸️ Droit à la limitation du traitement.',
      '📦 Droit à la portabilité : recevoir vos données dans un format structuré.',
      '🔓 Droit de retirer votre consentement à tout moment.',
    ],
    extra: 'Pour exercer vos droits, contactez contact@maoni.cd. Réponse sous 30 jours.',
  },
  {
    title: '10. Cookies et technologies similaires',
    icon: '🍪',
    content: 'MAONI utilise les cookies et technologies similaires suivants :',
    list: [
      '🍪 Cookies de session : essentiels à l\'authentification.',
      '⚙️ Cookies de préférences : pour mémoriser vos préférences.',
      '💾 Stockage local (localStorage) : pour maintenir votre session.',
    ],
    extra: 'MAONI n\'utilise pas de cookies publicitaires ou de traceurs tiers.',
  },
  {
    title: '11. Protection des mineurs',
    icon: '👶',
    content: `MAONI est exclusivement destinée aux utilisateurs majeurs (18 ans et plus). L'application ne collecte pas sciemment des données personnelles de mineurs. Si vous constatez qu'un mineur a créé un compte sans autorisation parentale, veuillez nous contacter immédiatement.`,
  },
  {
    title: '12. Données sensibles',
    icon: '⚠️',
    content: `Les opinions politiques et les propositions de réforme sont traitées avec une vigilance particulière et un niveau de protection renforcé.`,
  },
  {
    title: '13. Modifications de la politique',
    icon: '📝',
    content: `Cette politique peut être révisée périodiquement. Les utilisateurs seront informés au moins 14 jours à l'avance en cas de modification substantielle.`,
  },
  {
    title: '14. Décision automatisée et profilage',
    icon: '🤖',
    content: `MAONI utilise des algorithmes d'analyse automatique pour extraire des mots-clés et identifier des tendances. Ces traitements n'ont pas d'effet juridique contraignant.`,
  },
  {
    title: '15. Réclamations',
    icon: '📢',
    content: `Si vous estimez que vos droits n'ont pas été respectés, vous avez le droit de déposer une réclamation auprès de l'autorité de protection des données compétente en RDC.`,
  },
  {
    title: '16. Contact et délégué à la protection des données',
    icon: '📞',
    content: `Pour toute question : contact@maoni.cd

📍 Kinshasa/Gombe, République Démocratique du Congo
📞 +243 896 590 320

Nous répondons dans les 30 jours suivant votre demande.`,
  },
];

const Privacy = () => {
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
        <title>Politique de Confidentialité | MAONI RDC</title>
        <meta name="description" content="Politique de confidentialité de la plateforme MAONI - Protection des données personnelles conformément aux lois de la RDC et au RGPD." />
        <meta name="keywords" content="confidentialité, données personnelles, RGPD, RDC, protection des données" />
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
            bottom: '0',
            right: '5%',
            fontSize: '8rem',
            fontWeight: 900,
            opacity: 0.03,
            color: '#FFD700',
            pointerEvents: 'none',
            fontFamily: 'Georgia, serif'
          }}>
            CONFIDENTIALITÉ
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ fontSize: '4rem', marginBottom: '0.5rem' }}
            >
              🔒⚖️
            </motion.div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              margin: '0 0 0.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Politique de Confidentialité
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>
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
          
          {/* Badge d'engagement */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
              padding: '1.5rem 2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              color: 'white',
              marginBottom: '2rem',
              border: '1px solid rgba(255,215,0,0.3)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️🇨🇩</div>
            <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'Georgia, serif' }}>Nos engagements de confidentialité</h3>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              {[
                '✅ Jamais de vente de données',
                '🔒 Chiffrement SSL/TLS 1.3',
                '🗑️ Droit à l\'effacement',
                '📋 Transparence totale',
                '🇨🇩 Conforme aux lois RDC',
                '🌍 Conforme au RGPD'
              ].map((item, i) => (
                <span key={i} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Barre de recherche */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Rechercher dans la politique de confidentialité..."
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
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

          {/* Sections */}
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
                    marginBottom: section.list || section.subsections ? '0.75rem' : 0,
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

                {section.subsections && section.subsections.map((sub, si) => (
                  <div key={si} style={{ marginTop: '0.75rem' }}>
                    <h4 style={{
                      color: '#1565C0',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <span>{sub.icon || '📌'}</span> {sub.subtitle}
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                      {sub.list.map((item, i) => (
                        <li key={i} style={{ color: '#374151', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

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

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link
              to="/terms"
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
              ⚖️ Conditions d'Utilisation
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

          {/* Version */}
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

export default Privacy;