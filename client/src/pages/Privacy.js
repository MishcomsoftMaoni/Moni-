import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SECTIONS = [
  {
    title: '1. Responsable du traitement',
    content: `Le responsable du traitement des données collectées via l'application MAONI est l'équipe MAONI, dont le siège est établi à Kinshasa, République Démocratique du Congo.

Pour toute question relative à la protection de vos données personnelles :
📧 contact@maoni.cd
📍 Kinshasa, RDC`,
  },
  {
    title: '2. Cadre juridique applicable',
    content: `Les traitements de données mis en œuvre par MAONI respectent :`,
    list: [
      'Les lois et réglementations en vigueur en République Démocratique du Congo relatives à la protection des données personnelles et à la vie privée.',
      'Les principes universels de protection des données, notamment ceux du Règlement Général sur la Protection des Données (RGPD) de l\'Union Européenne, appliqués aux utilisateurs de la diaspora congolaise résidant dans l\'espace UE.',
      'Les standards internationaux de protection des données personnelles recommandés par les organisations internationales de défense des droits numériques.',
    ],
  },
  {
    title: '3. Données collectées',
    content: 'MAONI collecte deux catégories de données :',
    subsections: [
      {
        subtitle: 'a) Données fournies volontairement',
        list: [
          'Données d\'identité : prénom, nom de famille, adresse e-mail, numéro de téléphone.',
          'Données socio-démographiques : tranche d\'âge, profession, province de résidence, statut diaspora.',
          'Photo de profil (portrait) : optionnelle, uniquement si fournie par l\'utilisateur.',
          'Opinions et propositions : textes, contenus de propositions citoyennes et votes exprimés.',
          'Documents joints : fichiers PDF, images téléchargés pour étayer une proposition.',
        ],
      },
      {
        subtitle: 'b) Données collectées automatiquement',
        list: [
          'Adresse IP et géolocalisation approximative au niveau du pays ou de la province.',
          'Données techniques : type de navigateur, appareil utilisé, version du système d\'exploitation.',
          'Données d\'usage : pages consultées, propositions lues, durée de session, actions effectuées.',
          'Journaux de connexion (logs) à des fins de sécurité et de détection d\'abus.',
        ],
      },
    ],
  },
  {
    title: '4. Base légale du traitement',
    content: 'Le traitement de vos données repose sur les bases légales suivantes :',
    list: [
      'Consentement explicite : lors de la création du compte, vous consentez expressément au traitement de vos données dans le cadre décrit par la présente politique.',
      'Intérêt légitime : analyse des tendances démocratiques, détection des abus et amélioration continue de la plateforme.',
      'Mission d\'intérêt public : contribution à la consultation citoyenne nationale sur les réformes constitutionnelles de la RDC.',
      'Obligation légale : en cas de demande d\'une autorité judiciaire ou administrative compétente.',
    ],
  },
  {
    title: '5. Finalités du traitement',
    content: 'Vos données sont traitées aux fins suivantes :',
    list: [
      'Gestion de votre compte utilisateur et authentification sécurisée sur la plateforme.',
      'Organisation et facilitation des sondages et consultations citoyennes.',
      'Analyse statistique anonymisée des opinions et propositions pour établir des rapports de synthèse.',
      'Contribution au débat démocratique et transmission des propositions les plus soutenues aux autorités compétentes.',
      'Amélioration continue des fonctionnalités de l\'application et de l\'expérience utilisateur.',
      'Prévention des fraudes, des comportements abusifs et assurance de la sécurité de la plateforme.',
      'Communication avec les utilisateurs (notifications importantes, mises à jour de service).',
    ],
  },
  {
    title: '6. Durée de conservation des données',
    content: 'Vos données sont conservées selon les durées suivantes :',
    list: [
      'Données de compte actif : conservées pendant toute la durée d\'activité de votre compte sur MAONI.',
      'Données après suppression du compte : 30 jours après la suppression, puis suppression définitive des données personnelles identifiables.',
      'Données anonymisées : conservées sans limite de durée à des fins statistiques et historiques.',
      'Journaux de sécurité : conservés 12 mois maximum, puis supprimés ou anonymisés.',
      'Sauvegardes : les sauvegardes techniques peuvent contenir vos données pendant 90 jours supplémentaires après suppression.',
    ],
  },
  {
    title: '7. Partage et transfert des données',
    content: 'MAONI ne vend jamais vos données personnelles. Les données peuvent être partagées avec :',
    list: [
      'Prestataires techniques : hébergement (Supabase/PostgreSQL), services d\'infrastructure cloud, uniquement dans le cadre de la fourniture du service, sous contrat de confidentialité strict.',
      'Autorités compétentes : données anonymisées et agrégées sur les résultats de la consultation, transmises dans le cadre du processus officiel de réforme constitutionnelle.',
      'Chercheurs et institutions académiques : uniquement sous forme de données anonymisées et agrégées, dans le cadre de partenariats de recherche formellement établis.',
      'Autorités judiciaires ou légales : si requis par une décision de justice ou une obligation légale applicable.',
    ],
    extra: 'Aucun transfert de données vers des pays tiers n\'est effectué sans garanties appropriées conformément aux standards internationaux de protection des données.',
  },
  {
    title: '8. Sécurité des données',
    content: 'MAONI met en œuvre des mesures de sécurité techniques et organisationnelles incluant :',
    list: [
      'Chiffrement des communications : toutes les transmissions de données utilisent le protocole HTTPS/TLS.',
      'Chiffrement des données sensibles : les mots de passe sont hachés avec des algorithmes sécurisés (bcrypt).',
      'Contrôle d\'accès strict : Row Level Security (RLS) sur la base de données Supabase, accès limité au strict nécessaire.',
      'Authentification sécurisée : tokens JWT avec expiration, sessions gérées de manière sécurisée.',
      'Journalisation et surveillance : monitoring continu pour détecter les anomalies et tentatives d\'intrusion.',
      'Minimisation des données : seules les données strictement nécessaires aux finalités définies sont collectées.',
      'Sauvegardes régulières : données sauvegardées et chiffrées dans des centres de données sécurisés.',
    ],
  },
  {
    title: '9. Vos droits en matière de données personnelles',
    content: 'Conformément aux réglementations applicables, vous disposez des droits suivants :',
    list: [
      'Droit d\'accès : obtenir une copie de toutes les données personnelles que nous détenons vous concernant.',
      'Droit de rectification : corriger les données inexactes ou incomplètes vous concernant.',
      'Droit d\'opposition : vous opposer au traitement de vos données pour certaines finalités spécifiques.',
      'Droit à l\'effacement (droit à l\'oubli) : demander la suppression de vos données personnelles, sous réserve des obligations légales de conservation.',
      'Droit à la limitation du traitement : restreindre l\'utilisation de vos données dans certaines circonstances.',
      'Droit à la portabilité : recevoir vos données dans un format structuré, couramment utilisé et lisible par machine.',
      'Droit de retirer votre consentement : à tout moment, sans que cela n\'affecte la licéité du traitement antérieur.',
    ],
    extra: 'Pour exercer l\'un de ces droits, contactez-nous à : contact@maoni.cd. Nous répondrons dans un délai maximum de 30 jours.',
  },
  {
    title: '10. Cookies et technologies similaires',
    content: 'MAONI utilise les cookies et technologies similaires suivants :',
    list: [
      'Cookies de session : essentiels au fonctionnement de l\'authentification et de la navigation sécurisée.',
      'Cookies de préférences : pour mémoriser vos préférences de langue et d\'interface.',
      'Stockage local (localStorage) : pour maintenir votre session et améliorer les performances de l\'application.',
    ],
    extra: 'MAONI n\'utilise pas de cookies publicitaires, de traceurs tiers à des fins commerciales ou de systèmes de suivi inter-sites.',
  },
  {
    title: '11. Protection des mineurs',
    content: `MAONI est exclusivement destinée aux utilisateurs majeurs (18 ans et plus). L'application ne collecte pas sciemment des données personnelles de mineurs. Si vous constatez qu'un mineur a créé un compte sans autorisation parentale, veuillez nous contacter immédiatement à contact@maoni.cd afin que nous procédions à la suppression des données concernées.`,
  },
  {
    title: '12. Données sensibles',
    content: `Dans le cadre de la consultation citoyenne sur les réformes constitutionnelles, les opinions politiques et les propositions de réforme soumises par les utilisateurs peuvent être considérées comme des données sensibles. MAONI traite ces données avec une vigilance particulière et un niveau de protection renforcé, en s\'assurant qu\'elles ne sont utilisées qu\'aux fins de consultation démocratique décrites dans la présente politique.`,
  },
  {
    title: '13. Modifications de la politique de confidentialité',
    content: `La présente politique de confidentialité peut être révisée périodiquement pour refléter les évolutions légales, réglementaires ou opérationnelles. En cas de modification substantielle, les utilisateurs seront informés par une notification sur la plateforme et/ou par e-mail au moins 14 jours avant l'entrée en vigueur des nouvelles dispositions. La poursuite de l'utilisation de MAONI après notification des modifications vaut acceptation de la politique révisée.`,
  },
  {
    title: '14. Décision automatisée et profilage',
    content: `MAONI peut utiliser des algorithmes d'analyse automatique (intelligence artificielle) pour extraire des mots-clés, évaluer la cohérence des propositions et identifier des tendances dans les données de consultation. Ces traitements automatisés n'ont pas d'effet juridique contraignant sur les utilisateurs et visent uniquement à améliorer la qualité de l'analyse des consultations citoyennes. Les résultats de ces analyses ne sont jamais utilisés pour discriminer des individus.`,
  },
  {
    title: '15. Réclamations',
    content: `Si vous estimez que vos droits en matière de protection des données n'ont pas été respectés par MAONI, vous avez le droit de déposer une réclamation auprès de l'autorité de protection des données compétente en République Démocratique du Congo ou, pour les utilisateurs résidant dans l'espace européen, auprès de l'autorité de contrôle de votre pays de résidence (CNIL en France, par exemple).

Pour les réclamations directes à MAONI : contact@maoni.cd`,
  },
  {
    title: '16. Contact et délégué à la protection des données',
    content: `Pour toute question, demande d'exercice de droits ou réclamation relative à la protection de vos données personnelles, vous pouvez contacter MAONI à :

📧 contact@maoni.cd
📍 Kinshasa, République Démocratique du Congo
📞 +243 800 000 000

Nous nous engageons à traiter votre demande dans un délai raisonnable et au plus tard dans les 30 jours suivant sa réception.`,
  },
];

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité | MAONI</title>
        <meta name="description" content="Politique de confidentialité de la plateforme MAONI - Comment nous protégeons vos données personnelles." />
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
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</div>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              margin: '0 0 0.5rem'
            }}>
              Politique de Confidentialité
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 0.5rem' }}>
              Application MAONI – Plateforme de Consultation Citoyenne
            </p>
            <p style={{ color: '#FFD700', fontSize: '0.9rem', margin: 0 }}>
              Dernière mise à jour : 05 Mai 2026
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
              Chez <strong>MAONI</strong>, la protection de votre vie privée et de vos données personnelles est une priorité absolue.
              Cette politique de confidentialité vous explique de manière transparente quelles données nous collectons,
              pourquoi nous les collectons, comment nous les utilisons et comment vous pouvez exercer vos droits.
              Elle s'applique à toutes les personnes utilisant la plateforme MAONI, qu'elles résident en RDC ou dans la diaspora congolaise à l'étranger.
            </p>
          </div>

          {/* Table of Contents */}
          <div style={{
            background: 'white', padding: '1.5rem 2rem', borderRadius: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem'
          }}>
            <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginTop: 0, marginBottom: '1rem' }}>
              📋 Table des matières
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {SECTIONS.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  style={{ color: '#0D47A1', textDecoration: 'none', fontSize: '0.85rem', padding: '0.25rem 0' }}
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map((section, index) => (
            <motion.div
              key={index}
              id={`section-${index}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
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
                <p style={{ lineHeight: 1.8, color: '#374151', marginBottom: section.list || section.subsections ? '0.75rem' : 0, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
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

              {section.subsections && section.subsections.map((sub, si) => (
                <div key={si} style={{ marginTop: '0.75rem' }}>
                  <h4 style={{ color: '#1565C0', marginBottom: '0.5rem', fontSize: '0.95rem' }}>{sub.subtitle}</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.9 }}>
                    {sub.list.map((item, i) => (
                      <li key={i} style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {section.extra && (
                <p style={{ lineHeight: 1.8, color: '#374151', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.95rem', fontStyle: 'italic', padding: '0.75rem', background: '#F0F4F8', borderRadius: '0.5rem' }}>
                  {section.extra}
                </p>
              )}
            </motion.div>
          ))}

          {/* RGPD Summary Badge */}
          <div style={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
            padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: 'white',
            marginTop: '2rem', marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
            <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'Georgia, serif' }}>Nos engagements de confidentialité</h3>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              {[
                '✅ Jamais de vente de données',
                '✅ Chiffrement SSL/TLS',
                '✅ Droit à l\'effacement',
                '✅ Transparence totale',
              ].map((item, i) => (
                <span key={i} style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
            padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: 'white'
          }}>
            <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'Georgia, serif' }}>📬 Nous contacter</h3>
            <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.85)' }}>
              Pour exercer vos droits ou poser des questions relatives à vos données personnelles :
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
              to="/terms"
              style={{
                padding: '0.75rem 1.5rem', background: 'white', color: '#0D47A1',
                borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700,
                border: '2px solid #0D47A1', fontSize: '0.9rem'
              }}
            >
              ⚖️ Conditions d'Utilisation
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

export default Privacy;
