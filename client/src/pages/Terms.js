import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SECTIONS = [
  {
    title: '1. Objet de l\'application',
    content: `L'application MAONI a pour objectif de :`,
    list: [
      'Permettre aux citoyens congolais de la RDC et de la diaspora d\'exprimer leurs opinions et de soumettre des propositions concernant les réformes constitutionnelles de la République Démocratique du Congo.',
      'Favoriser la participation citoyenne, le dialogue démocratique et la consultation populaire à grande échelle.',
      'Collecter des données d\'opinion de manière transparente, structurée et vérifiable.',
      'Transmettre les propositions les plus soutenues aux autorités compétentes pour une prise en compte particulière dans le processus de réforme constitutionnelle.',
    ],
  },
  {
    title: '2. Acceptation des conditions',
    content: `En accédant à l\'application MAONI, en créant un compte ou en soumettant une proposition, vous reconnaissez avoir lu, compris et accepté l\'intégralité des présentes conditions d\'utilisation dans leur version en vigueur au moment de votre utilisation. Si vous n\'êtes pas d\'accord avec l\'une quelconque de ces conditions, vous devez immédiatement cesser d\'utiliser l\'application et supprimer votre compte.`,
  },
  {
    title: '3. Accès et utilisation',
    list: [
      'L\'accès à l\'application est réservé aux utilisateurs âgés d\'au moins 18 ans. Les utilisateurs mineurs doivent disposer d\'une autorisation parentale ou légale.',
      'Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription et dans toutes vos interactions sur la plateforme.',
      'Vous êtes entièrement responsable de la confidentialité de vos identifiants de connexion et de toutes les activités réalisées depuis votre compte.',
      'Il vous incombe de signaler immédiatement toute utilisation non autorisée de votre compte à l\'équipe MAONI.',
    ],
  },
  {
    title: '4. Utilisation autorisée et interdite',
    content: 'En utilisant MAONI, vous vous engagez à :',
    list: [
      'Utiliser l\'application uniquement à des fins légales, civiques et démocratiques.',
      'Respecter les valeurs démocratiques, l\'unité nationale de la RDC et les droits fondamentaux de la personne.',
      'Ne pas soumettre de contenus diffamatoires, injurieux, haineux, racistes, ethniques ou tribaux.',
      'Ne pas publier de fausses informations, de désinformation ou de contenus trompeurs.',
      'Ne pas inciter à la violence, à l\'instabilité politique, à la rébellion ou à la désobéissance civile illégale.',
      'Ne pas usurper l\'identité d\'une autre personne ou d\'une institution officielle.',
      'Ne pas utiliser l\'application à des fins commerciales, publicitaires ou de collecte de données sans autorisation.',
      'Ne pas tenter de pirater, de contourner les mesures de sécurité ou de perturber le fonctionnement de la plateforme.',
    ],
  },
  {
    title: '5. Propriété et modération des contenus',
    content: `Les utilisateurs conservent la propriété intellectuelle de leurs propositions et opinions exprimées sur MAONI. Toutefois, en soumettant un contenu, vous accordez à MAONI une licence non exclusive, mondiale, gratuite et irrévocable pour utiliser, reproduire, analyser, compiler et diffuser ce contenu à des fins d\'étude, de statistiques et de consultation démocratique, dans le respect de votre vie privée.

MAONI se réserve le droit de modérer, modifier, masquer ou supprimer tout contenu qui viole les présentes conditions ou qui est jugé inapproprié, sans préavis et sans obligation de justification.`,
  },
  {
    title: '6. Collecte et utilisation des données',
    content: `MAONI peut collecter et traiter les données suivantes :`,
    list: [
      'Données d\'identité : prénom, nom, adresse e-mail, numéro de téléphone, province de résidence.',
      'Données socio-démographiques : tranche d\'âge, profession, statut de résident ou diaspora (facultatives).',
      'Données d\'usage : propositions soumises, votes exprimés, consultations effectuées, adresse IP.',
      'Données techniques : type de navigateur, appareil, données de connexion.',
    ],
    extra: 'Ces données sont utilisées exclusivement à des fins de gestion de la plateforme, d\'analyse statistique des opinions publiques, d\'amélioration du service et de contribution au processus de consultation constitutionnelle. Elles ne sont jamais vendues à des tiers.',
  },
  {
    title: '7. Confidentialité et protection des données',
    list: [
      'Les réponses aux sondages et votes peuvent être anonymisées dans les rapports publics.',
      'MAONI s\'engage formellement à ne pas vendre, louer ou transmettre les données personnelles à des tiers à des fins commerciales.',
      'Des mesures de sécurité techniques et organisationnelles robustes sont mises en place pour protéger vos données contre tout accès non autorisé, perte ou altération.',
      'Vous disposez de droits sur vos données (accès, rectification, suppression, portabilité) conformément à la Politique de Confidentialité.',
    ],
  },
  {
    title: '8. Propriété intellectuelle de la plateforme',
    content: `Tous les éléments constitutifs de l\'application MAONI – comprenant sans limitation le logo, le design, l\'interface utilisateur, les algorithmes, le code source, les bases de données, les graphiques et les textes rédigés par l\'équipe MAONI – sont protégés par les droits de propriété intellectuelle applicables en République Démocratique du Congo et à l\'international.

Toute reproduction, distribution, modification ou utilisation non autorisée de ces éléments est strictement interdite et peut donner lieu à des poursuites judiciaires.`,
  },
  {
    title: '9. Responsabilité et limitation de garanties',
    list: [
      'MAONI ne garantit pas que les résultats de la consultation influenceront directement ou immédiatement des décisions politiques, législatives ou gouvernementales.',
      'La plateforme est fournie « telle quelle » sans garantie d\'exhaustivité, d\'exactitude ou de disponibilité continue.',
      'MAONI ne peut être tenu responsable d\'interruptions de service, d\'erreurs techniques, de pertes de données ou d\'une mauvaise utilisation par des tiers.',
      'Les opinions exprimées par les utilisateurs n\'engagent que leurs auteurs et ne reflètent pas nécessairement les positions officielles de MAONI ou des autorités compétentes.',
    ],
  },
  {
    title: '10. Suspension ou suppression de compte',
    content: `MAONI se réserve le droit de suspendre temporairement ou de supprimer définitivement un compte utilisateur, sans préavis, en cas de :`,
    list: [
      'Violation des présentes conditions d\'utilisation.',
      'Comportement frauduleux, abusif ou malveillant sur la plateforme.',
      'Soumission de contenus contraires aux lois en vigueur en RDC.',
      'Signalements répétés par d\'autres utilisateurs de la communauté.',
      'Non-respect manifeste des valeurs démocratiques et civiques de MAONI.',
    ],
  },
  {
    title: '11. Modification des conditions',
    content: `Les présentes conditions d\'utilisation peuvent être modifiées à tout moment par l\'équipe MAONI pour refléter les évolutions légales, techniques ou fonctionnelles de la plateforme. Les utilisateurs seront informés de tout changement substantiel par une notification sur la plateforme ou par e-mail. L\'utilisation continue de MAONI après modification vaut acceptation des nouvelles conditions.`,
  },
  {
    title: '12. Droit applicable et juridiction compétente',
    content: `Les présentes conditions d\'utilisation sont régies par les lois en vigueur en République Démocratique du Congo. Tout litige relatif à l\'utilisation de MAONI sera soumis à la compétence exclusive des tribunaux compétents de la ville de Kinshasa, République Démocratique du Congo, sauf dispositions légales contraires impératives applicables à certains utilisateurs.`,
  },
];

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Conditions d'Utilisation | MAONI</title>
        <meta name="description" content="Conditions d'utilisation de la plateforme MAONI - Consultation citoyenne pour les réformes constitutionnelles de la RDC." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: '#f0f4f8', minHeight: '100vh', paddingBottom: '4rem' }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
          padding: '3rem 0',
          textAlign: 'center',
          color: 'white',
          borderBottom: '5px solid #FFD700'
        }}>
          <div className="container">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚖️</div>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              marginBottom: '0.5rem', margin: '0 0 0.5rem'
            }}>
              Conditions d'Utilisation
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 0.5rem' }}>
              Application MAONI – Plateforme de Consultation Citoyenne
            </p>
            <p style={{ color: '#FFD700', fontSize: '0.9rem', margin: 0 }}>
              Dernière mise à jour : 04 Mai 2026
            </p>
          </div>
        </div>

        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
          {/* Intro box */}
          <div style={{
            background: 'white', padding: '1.5rem 2rem', borderRadius: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '2rem',
            borderLeft: '5px solid #0D47A1'
          }}>
            <p style={{ margin: 0, lineHeight: 1.8, color: '#374151', fontSize: '0.95rem' }}>
              Bienvenue sur <strong>MAONI</strong>, une application web dédiée à la collecte d'opinions citoyennes
              et à la consultation populaire concernant les réformes constitutionnelles en République Démocratique du Congo (RDC).
              En accédant à cette application et en créant un compte, vous acceptez les présentes conditions d'utilisation.
              Veuillez les lire attentivement avant toute utilisation de la plateforme.
            </p>
          </div>

          {/* Sections */}
          {SECTIONS.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              style={{
                background: 'white', padding: '1.75rem 2rem', borderRadius: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '1rem'
              }}
            >
              <h2 style={{
                color: '#0D47A1', fontFamily: 'Georgia, serif',
                fontSize: '1.15rem', marginTop: 0, marginBottom: '1rem',
                paddingBottom: '0.5rem', borderBottom: '2px solid #EFF6FF'
              }}>
                {section.title}
              </h2>

              {section.content && (
                <p style={{ lineHeight: 1.8, color: '#374151', marginBottom: section.list ? '0.75rem' : 0, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                  {section.content}
                </p>
              )}

              {section.list && (
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.9 }}>
                  {section.list.map((item, i) => (
                    <li key={i} style={{ color: '#374151', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.extra && (
                <p style={{ lineHeight: 1.8, color: '#374151', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.95rem' }}>
                  {section.extra}
                </p>
              )}
            </motion.div>
          ))}

          {/* Contact */}
          <div style={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
            padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: 'white',
            marginTop: '2rem'
          }}>
            <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'Georgia, serif' }}>📬 Pour toute question</h3>
            <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.85)' }}>
              Si vous avez des questions concernant ces conditions d'utilisation, n'hésitez pas à nous contacter.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.95rem' }}>
              <span>📧 contact@maoni.cd</span>
              <span>📍 Kinshasa, RDC</span>
              <span>📞 +243 800 000 000</span>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link
              to="/privacy"
              style={{
                padding: '0.75rem 1.5rem', background: 'white', color: '#0D47A1',
                borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700,
                border: '2px solid #0D47A1', fontSize: '0.9rem'
              }}
            >
              🔒 Politique de Confidentialité
            </Link>
            <Link
              to="/"
              style={{
                padding: '0.75rem 1.5rem', background: '#0D47A1', color: 'white',
                borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem'
              }}
            >
              🏠 Retour à l'accueil
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Terms;
