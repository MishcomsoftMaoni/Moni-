import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const ressources = {
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
      'nav.submit': 'Soumettre une proposition',

      // Hero
      'hero.title': 'MAONI',
      'hero.subtitle': 'Réformes Constitutionnelles RD Congo',
      'hero.description': 'La voix du peuple congolais.',
      'hero.participate': 'Je participe maintenant',
      'hero.consult': 'Consulter les propositions',

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

      // Appel à l'action
      'cta.title': 'Prêt à faire entendre votre voix ?',
      'cta.desc': 'Rejoignez les citoyens congolais qui participent à la construction de l\'avenir.',
      'cta.button': 'Je participe maintenant',

      // Propositions
      'proposals.title': 'Propositions Citoyennes',
      'proposals.submitted': 'propositions soumises par les citoyens',
      'proposals.search': 'Rechercher une proposition...',
      'proposals.allProvinces': 'Toutes les provinces',
      'proposals.filterAll': 'Toutes',
      'proposals.filterYes': 'Majorité OUI',
      'proposals.filterNo': 'Majorité NON',
      'proposals.sortRecent': 'Plus récentes',
      'proposals.sortPopular': 'Plus soutenues',
      'proposals.sortControversial': 'Plus contestées',
      'proposals.loadMore': 'Charger plus de propositions',
      'proposals.noResults': 'Aucune proposition trouvée',
      'proposals.beFirst': 'Soyez le premier à soumettre une proposition !',
      'proposals.subject': 'Objet de votre proposition',
      'proposals.summary': 'Votre proposition en une phrase',
      'proposals.content': 'Votre proposition détaillée',
      'proposals.loginToVote': 'Connectez-vous pour voter',
      'proposals.seeDetails': 'Voir les détails',
      'proposals.submitButton': 'Soumettre une proposition',

      // Formulaire
      'form.title': 'Soumettre une Proposition',
      'form.subtitle': 'Partagez votre vision pour l\'avenir constitutionnel de la RDC',
      'form.guidelines': 'Directives de soumission',
      'form.guideline1': 'Soyez clair et constructif dans votre proposition',
      'form.guideline2': 'Respectez les valeurs démocratiques et l\'unité nationale',
      'form.guideline3': 'Évitez les propos haineux, discriminatoires ou violents',
      'form.guideline4': 'Apportez des arguments pour soutenir votre position',
      'form.guideline5': 'Vous pouvez joindre des fichiers pour étayer votre proposition',
      'form.category': 'Catégorie',
      'form.subject': 'Objet de votre proposition',
      'form.subjectPlaceholder': 'Ex: Modification de l\'article 220 de la Constitution',
      'form.subjectHelp': 'Maximum 250 caractères',
      'form.summary': 'Votre proposition en une phrase',
      'form.summaryPlaceholder': 'Résumez votre proposition en une phrase',
      'form.summaryHelp': 'Une phrase claire qui résume votre proposition',
      'form.content': 'Votre proposition détaillée',
      'form.contentPlaceholder': 'Développez votre proposition en détail...',
      'form.contentHelp': 'Vous pouvez formater votre texte, ajouter des listes, etc.',
      'form.photos': 'Photos (optionnel - max 5)',
      'form.photosDrag': 'Glissez-déposez vos photos ici',
      'form.photosClick': 'ou cliquez pour sélectionner (JPG, PNG - max 5MB)',
      'form.fichiers': 'Fichiers joints (optionnel - max 3)',
      'form.fichiersDrag': 'Glissez-déposez vos fichiers ici',
      'form.fichiersClick': 'ou cliquez pour sélectionner (PDF, Word - max 10MB)',
      'form.terms': 'Je confirme que ma proposition respecte les valeurs démocratiques et les lois de la RDC.',
      'form.submit': 'Soumettre ma proposition',
      'form.submitting': 'Soumission en cours...',
      'form.errors.subject': 'L\'objet est obligatoire',
      'form.errors.summary': 'Le résumé est obligatoire',
      'form.errors.content': 'Le contenu doit contenir au moins 50 caractères',
      'form.errors.terms': 'Vous devez accepter les conditions',

      // Inscription
      'register.title': 'Créer un compte',
      'register.subtitle': 'Rejoignez la plateforme citoyenne',
      'register.firstName': 'Prénom',
      'register.lastName': 'Nom',
      'register.email': 'Adresse email',
      'register.password': 'Mot de passe',
      'register.confirmPassword': 'Confirmer le mot de passe',
      'register.ageRange': 'Tranche d\'âge',
      'register.selectAge': 'Sélectionnez votre tranche d\'âge',
      'register.profession': 'Profession',
      'register.phone': 'Numéro de téléphone',
      'register.province': 'Province de résidence',
      'register.selectProvince': 'Sélectionnez votre province',
      'register.diaspora': 'Je vis en dehors de la RDC',
      'register.otherResidence': 'Pays de résidence',
      'register.portrait': 'Photo portrait',
      'register.portraitHelp': 'Formats : JPG, PNG (max 5 MB)',
      'register.terms': 'J\'accepte les conditions d\'utilisation',
      'register.submit': 'Créer mon compte',
      'register.alreadyMember': 'Déjà inscrit ?',
      'register.login': 'Se connecter',

      // Connexion
      'login.title': 'Se connecter',
      'login.subtitle': 'Bienvenue sur la plateforme citoyenne',
      'login.email': 'Adresse email',
      'login.password': 'Mot de passe',
      'login.remember': 'Se souvenir de moi',
      'login.forgot': 'Mot de passe oublié ?',
      'login.submit': 'Se connecter',
      'login.noAccount': 'Pas encore de compte ?',
      'login.register': 'Créer un compte',
      'login.error': 'Email ou mot de passe incorrect',
      'login.ussd': 'Sans internet ? Composez *123#',

      // Statistiques
      'stats.pageTitle': 'Statistiques Nationales',
      'stats.referendum': 'Référendum sur la Réforme Constitutionnelle',
      'stats.basedOn': 'Basé sur',
      'stats.votesExprimes': 'votes exprimés',
      'stats.participation': 'Participation par Province',
      'stats.topProvinces': 'Top 10 Provinces',
      'stats.trends': 'Tendances de la semaine',
      'stats.keywords': 'Nuage de Mots Clés',

      // Pied de page
      'footer.maoni': 'MAONI',
      'footer.description': 'Consultation citoyenne pour la réforme constitutionnelle en RDC.',
      'footer.terms': 'Conditions d\'utilisation',
      'footer.privacy': 'Politique de confidentialité',
      'footer.contact': 'Contact',
      'footer.resources': 'Réseaux',
      'footer.madeIn': 'Fabriqué en RDC',
      'footer.rights': 'Tous droits réservés',
      'footer.update': 'Dernière mise à jour',

      // Patrimoine
      'heritage.title': 'Patrimoine National',

      // Catégories
      'category.constitutional': 'Réforme Constitutionnelle',
      'category.electoral': 'Système Électoral',
      'category.decentralization': 'Décentralisation',
      'category.justice': 'Justice et Droits',
      'category.economy': 'Économie et Développement',
      'category.security': 'Sécurité et Défense',
      'category.education': 'Éducation',
      'category.health': 'Santé',
      'category.other': 'Autre',

      // Tranches d'âge
      'age.18-30': '18 - 30 ans',
      'age.30-40': '30 - 40 ans',
      'age.40-50': '40 - 50 ans',
      'age.50-60': '50 - 60 ans',
      'age.60-70': '60 - 70 ans',
      'age.70-80': '70 - 80 ans',

      // Votes
      'vote.yes': 'OUI',
      'vote.no': 'NON',
      'vote.confirm': 'Confirmer votre vote',
      'vote.cancel': 'Annuler',
      'vote.confirmButton': 'Confirmer mon vote',
      'vote.alreadyVoted': 'Vous avez déjà voté',

      // Général
      'loading': 'Chargement...',
      'error': 'Une erreur est survenue',
      'retry': 'Réessayer',
      'back': 'Retour',
      'yes': 'OUI',
      'no': 'NON',
      'citizen': 'Citoyen',
      'congolese': 'Congolais',
    }
  }
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: ressources,
  fallbackLng: 'fr',
  lng: 'fr',
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage']
  }
});

export default i18n;