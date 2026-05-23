import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// =============================================
// CONFIGURATION MULTILINGUE - Niveau Présidentiel
// 5 Langues Officielles de la République Démocratique du Congo
// Version: 100.0.4
// =============================================

const ressources = {
  // ==================== FRANÇAIS (Langue officielle) ====================
  fr: {
    translation: {
      // Navigation
      'nav.home': 'Accueil',
      'nav.proposals': 'Propositions',
      'nav.statistics': 'Statistiques',
      'nav.login': 'Se connecter',
      'nav.register': 'Créer un compte',
      'nav.logout': 'Se déconnecter',
      'nav.profile': 'Mon Profil',
      'nav.submit': 'Soumettre',
      'nav.constitution': 'Constitution',
      'nav.issues': 'Signalements',

      // Hero
      'hero.title': 'MAONI',
      'hero.subtitle': 'Annuaire numérique de propositions citoyennes',
      'hero.subtitle2': 'pour ou contre les réformes constitutionnelles en RD Congo',
      'hero.description': 'Votre voix compte pour l\'avenir de la République Démocratique du Congo.',
      'hero.participate': '🇨🇩 Je participe maintenant',
      'hero.consult': '📋 Consulter les propositions',

      // Statistiques
      'stats.citizens': 'Citoyens',
      'stats.proposals': 'Propositions',
      'stats.votes': 'Votes',
      'stats.majority': 'Majorité OUI',

      // Fonctionnement
      'how.title': 'Comment ça marche ?',
      'how.step1.title': '1. Proposez',
      'how.step1.desc': 'Soumettez vos idées pour améliorer la constitution.',
      'how.step2.title': '2. Votez',
      'how.step2.desc': 'Exprimez votre soutien ou opposition. Votez OUI ou NON.',
      'how.step3.title': '3. Consultez',
      'how.step3.desc': 'Suivez les résultats en temps réel par province.',
      'how.step4.title': '4. Impactez',
      'how.step4.desc': 'Les propositions soutenues seront transmises aux autorités compétentes.',

      'cta.title': 'Prêt à faire entendre votre voix ?',
      'cta.desc': 'Rejoignez les millions de Congolais qui participent déjà.',
      'cta.button': 'Je participe maintenant',

      // Propositions
      'proposals.title': 'Propositions Citoyennes',
      'proposals.submitted': 'propositions soumises',
      'proposals.search': '🔍 Rechercher une proposition...',
      'proposals.allProvinces': 'Toutes les provinces',
      'proposals.filterAll': 'Toutes',
      'proposals.filterYes': 'Majorité OUI',
      'proposals.filterNo': 'Majorité NON',
      'proposals.sortRecent': 'Plus récentes',
      'proposals.sortPopular': 'Plus soutenues',
      'proposals.sortControversial': 'Plus contestées',
      'proposals.loadMore': '📥 Charger plus de propositions',
      'proposals.noResults': '📭 Aucune proposition trouvée',
      'proposals.beFirst': 'Soyez le premier à soumettre une proposition !',
      'proposals.subject': 'Objet de votre proposition',
      'proposals.summary': 'Résumé en une phrase',
      'proposals.content': 'Contenu détaillé',
      'proposals.loginToVote': 'Connectez-vous pour voter',
      'proposals.seeDetails': 'Détails →',
      'proposals.submitButton': '✍️ Soumettre une proposition',
      'proposals.subjectCount': 'caractères',
      'proposals.voteYes': 'OUI',
      'proposals.voteNo': 'NON',
      'proposals.votes': 'votes',

      // Formulaire
      'form.title': 'Soumettre une Proposition',
      'form.subtitle': 'Partagez votre vision pour l\'avenir constitutionnel de la RDC',
      'form.guidelines': '📋 Directives de soumission',
      'form.guideline1': 'Soyez clair et constructif',
      'form.guideline2': 'Respectez les valeurs démocratiques et l\'unité nationale',
      'form.guideline3': 'Évitez les propos haineux ou violents',
      'form.guideline4': 'Apportez des arguments',
      'form.guideline5': 'Joignez des documents si nécessaire',
      'form.category': 'Catégorie',
      'form.subject': 'Objet',
      'form.subjectPlaceholder': 'Ex: Modification de l\'article 220',
      'form.summary': 'Résumé',
      'form.summaryPlaceholder': 'Résumez votre proposition en une phrase',
      'form.content': 'Contenu détaillé',
      'form.contentPlaceholder': 'Développpez votre proposition...',
      'form.contentHelp': 'Formatage possible (gras, listes, liens)',
      'form.images': 'Images (optionnel - max 5)',
      'form.imagesDrag': 'Glissez-déposez des images',
      'form.imagesClick': 'ou cliquez (JPG, PNG - 5MB max)',
      'form.documents': 'Documents (optionnel - max 3)',
      'form.documentsDrag': 'Glissez-déposez des documents',
      'form.documentsClick': 'ou cliquez (PDF, Word - 10MB max)',
      'form.terms': 'Je confirme le respect des valeurs démocratiques et des lois de la RDC',
      'form.submit': '🚀 Soumettre',
      'form.submitting': 'Soumission...',
      'form.errors.subject': 'L\'objet est requis',
      'form.errors.summary': 'Le résumé est requis',
      'form.errors.content': 'Contenu minimum 50 caractères',
      'form.errors.terms': 'Acceptation requise',
      'form.charCount': 'caractères',
      'form.summaryCharCount': 'caractères (sujet)',
      'form.contentCharCount': 'caractères (contenu)',

      // Inscription
      'register.title': 'Créer un compte',
      'register.subtitle': 'Rejoignez la plateforme citoyenne',
      'register.firstName': 'Prénom',
      'register.lastName': 'Nom',
      'register.email': 'Adresse email',
      'register.password': 'Mot de passe',
      'register.confirmPassword': 'Confirmer le mot de passe',
      'register.ageRange': 'Tranche d\'âge',
      'register.selectAge': 'Sélectionnez',
      'register.profession': 'Profession',
      'register.phone': 'Téléphone',
      'register.province': 'Province',
      'register.selectProvince': 'Sélectionnez votre province',
      'register.diaspora': 'Je vis hors RDC',
      'register.otherResidence': 'Pays de résidence',
      'register.portrait': 'Photo portrait',
      'register.portraitHelp': 'JPG, PNG - 5MB max',
      'register.terms': 'J\'accepte les conditions',
      'register.submit': '✅ Créer mon compte',
      'register.alreadyMember': 'Déjà inscrit ?',
      'register.login': 'Se connecter',

      // Connexion
      'login.title': 'Se connecter',
      'login.subtitle': 'Bienvenue',
      'login.email': 'Email',
      'login.password': 'Mot de passe',
      'login.remember': 'Se souvenir',
      'login.forgot': 'Mot de passe oublié ?',
      'login.submit': '🔑 Se connecter',
      'login.noAccount': 'Pas encore de compte ?',
      'login.register': 'Créer un compte',
      'login.error': 'Email ou mot de passe incorrect',
      'login.ussd': '📱 Sans internet ? *123#',

      // Statistiques
      'stats.pageTitle': 'Statistiques Nationales',
      'stats.referendum': '🗳️ Référendum',
      'stats.basedOn': 'Basé sur',
      'stats.votesExprimes': 'votes exprimés',
      'stats.participation': 'Participation par Province',
      'stats.topProvinces': '🏆 Top 10 Provinces',
      'stats.trends': '📈 Tendances',
      'stats.keywords': '☁️ Nuage de mots',

      // Footer
      'footer.maoni': 'MAONI',
      'footer.description': 'Consultation citoyenne pour la réforme constitutionnelle en RDC',
      'footer.entreprise': 'Entreprise',
      'footer.navigation': 'Navigation',
      'footer.resources': 'Ressources',
      'footer.contact': 'Contact',
      'footer.facebook': 'Facebook',
      'footer.whatsapp': 'WhatsApp',
      'footer.terms': 'Conditions',
      'footer.privacy': 'Confidentialité',
      'footer.madeIn': 'Fabriqué en RDC',
      'footer.rights': 'Tous droits réservés',
      'footer.update': 'Dernière mise à jour',
      'footer.security': 'Sécurité',
      'footer.ussd': 'USSD',

      // Patrimoine
      'heritage.title': '🇨🇩 Patrimoine National',

      // Catégories
      'category.constitutional': 'Constitution',
      'category.electoral': 'Élections',
      'category.decentralization': 'Décentralisation',
      'category.justice': 'Justice',
      'category.economy': 'Économie',
      'category.security': 'Sécurité',
      'category.education': 'Éducation',
      'category.health': 'Santé',
      'category.other': 'Autre',

      // Âges
      'age.18-30': '18-30 ans',
      'age.30-40': '30-40 ans',
      'age.40-50': '40-50 ans',
      'age.50-60': '50-60 ans',
      'age.60-70': '60-70 ans',
      'age.70+': '70+ ans',

      // Votes
      'vote.yes': 'OUI',
      'vote.no': 'NON',
      'vote.confirm': 'Confirmation',
      'vote.cancel': 'Annuler',
      'vote.confirmButton': 'Confirmer',
      'vote.alreadyVoted': 'Déjà voté',
      'vote.success': '✅ Vote enregistré',
      'vote.error': '❌ Erreur',

      // Général
      'loading': 'Chargement...',
      'error': 'Erreur',
      'retry': 'Réessayer',
      'back': 'Retour',
      'yes': 'OUI',
      'no': 'NON',
      'citizen': 'Citoyen',
      'congolese': 'Congolais',
      'seeMore': 'Voir plus',
      'seeLess': 'Voir moins',
      'close': 'Fermer',
      'save': 'Enregistrer',
      'cancel': 'Annuler',
      'confirm': 'Confirmer',
      'search': 'Rechercher',
      'filter': 'Filtrer',
      'sort': 'Trier',
      'share': 'Partager',
      'report': 'Signaler',
    }
  },

  // ==================== KISWAHILI ====================
  sw: {
    translation: {
      'nav.home': 'Nyumbani',
      'nav.proposals': 'Mapendekezo',
      'nav.statistics': 'Takwimu',
      'nav.login': 'Ingia',
      'nav.register': 'Jiunge',
      'nav.logout': 'Toka',
      'nav.profile': 'Wasifu',
      'hero.title': 'MAONI',
      'hero.subtitle': 'Mageuzi ya Katiba',
      'hero.description': 'Sauti yako inahesabiwa',
      'hero.participate': '🇨🇩 Shiriki',
      'stats.citizens': 'Wananchi',
      'stats.proposals': 'Mapendekezo',
      'stats.votes': 'Kura',
      'proposals.title': 'Mapendekezo ya Wananchi',
      'proposals.submitButton': '✍️ Wasilisha',
      'login.title': 'Ingia',
      'login.submit': '🔑 Ingia',
      'register.title': 'Jiunge',
      'register.submit': '✅ Unda akaunti',
      'footer.madeIn': 'Imetengenezwa RDC',
      'vote.yes': 'NDIYO',
      'vote.no': 'HAPANA',
      'loading': 'Inapakia...',
      'citizen': 'Raia',
      'congolese': 'Kongo',
    }
  },

  // ==================== LINGÁLA ====================
  ln: {
    translation: {
      'nav.home': 'Ndako',
      'nav.proposals': 'Makanisi',
      'nav.statistics': 'Statistiki',
      'nav.login': 'Kota',
      'nav.register': 'Komí',
      'nav.logout': 'Sima',
      'hero.title': 'MAONI',
      'hero.subtitle': 'Bongóla Mibeko',
      'hero.description': 'Lobí na yo ezali na ntina',
      'hero.participate': '🇨🇩 Nazali na ndingisa',
      'stats.citizens': 'Bato',
      'stats.proposals': 'Makanisi',
      'stats.votes': 'Mibotu',
      'proposals.title': 'Makanisi ya Bato',
      'login.title': 'Kota',
      'register.title': 'Komí',
      'vote.yes': 'Ee',
      'vote.no': 'Te',
      'footer.madeIn': 'Esalemi na RDC',
      'loading': 'Ezali kotiama...',
      'citizen': 'Moto',
      'congolese': 'Mokongo',
    }
  },

  // ==================== TSHILUBA ====================
  tsh: {
    translation: {
      'nav.home': 'Mutu',
      'nav.proposals': 'Miyeye',
      'nav.login': 'Ukota',
      'nav.register': 'Ulemba',
      'hero.title': 'MAONI',
      'hero.subtitle': 'Miilu ya Badimu',
      'hero.description': 'Diboko dye nu di ne muena',
      'hero.participate': '🇨🇩 Ndi mumvulukayi',
      'stats.citizens': 'Badimu',
      'stats.proposals': 'Miyeye',
      'stats.votes': 'Mavotu',
      'proposals.title': 'Miyeye ya Badimu',
      'login.title': 'Ukota',
      'register.title': 'Ulemba',
      'vote.yes': 'Ee',
      'vote.no': 'Apu',
      'footer.madeIn': 'Isalama mu RDC',
      'loading': 'Ikulela...',
      'citizen': 'Mudimu',
    }
  },

  // ==================== KIKONGO ====================
  kik: {
    translation: {
      'nav.home': 'Nzo',
      'nav.proposals': 'Mabanza',
      'nav.login': 'Kota',
      'nav.register': 'Vwala',
      'hero.title': 'MAONI',
      'hero.subtitle': 'Mvutu ya Bantu',
      'hero.description': 'Ngolo na ngeyo ya mvutu',
      'hero.participate': '🇨🇩 Mina vwala bubu',
      'stats.citizens': 'Bantu',
      'stats.proposals': 'Mabanza',
      'stats.votes': 'Mavotu',
      'proposals.title': 'Mabanza ma Bantu',
      'login.title': 'Kota',
      'register.title': 'Vwala',
      'vote.yes': 'Ee',
      'vote.no': 'Ko',
      'footer.madeIn': 'Basalama na RDC',
      'loading': 'Kulosa...',
      'citizen': 'Muntu',
    }
  }
};

// Configuration i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: ressources,
    fallbackLng: 'fr',
    lng: 'fr',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'maoni_language',
    },
    react: {
      useSuspense: false,
    },
    supportedLngs: ['fr', 'sw', 'ln', 'tsh', 'kik'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
  });

// Log de démarrage
console.log('[MAONI] 🌍 Système multilingue activé - 5 langues officielles RDC');
console.log('[MAONI] 📍 Langues: Français, Kiswahili, Lingála, Tshiluba, Kikongo');
console.log('[MAONI] 🇨🇩 Plateforme Présidentielle - Version 100.0.4');

export default i18n;