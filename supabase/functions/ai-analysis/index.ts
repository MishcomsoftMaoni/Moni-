import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// =============================================
// IA D'ANALYSE - Niveau Militaire
// Analyse de sentiment | Mots-clés | Doublons | Tendances
// République Démocratique du Congo
// =============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-maoni-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
};

// =============================================
// LISTES EXHAUSTIVES POUR ANALYSE LINGUISTIQUE
// =============================================

// Mots vides en français (stop words)
const MOTS_VIDES = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc',
  'car', 'que', 'qui', 'quoi', 'dont', 'dans', 'sur', 'sous', 'avec',
  'sans', 'pour', 'par', 'vers', 'chez', 'entre', 'comme', 'plus',
  'moins', 'très', 'tout', 'tous', 'toute', 'toutes', 'est', 'sont',
  'être', 'avoir', 'faire', 'dire', 'pouvoir', 'aller', 'venir',
  'devoir', 'savoir', 'vouloir', 'falloir', 'voir', 'prendre',
  'mettre', 'donner', 'trouver', 'parler', 'passer', 'rester',
  'aussi', 'bien', 'encore', 'déjà', 'toujours', 'jamais',
  'ici', 'là', 'alors', 'après', 'avant', 'pendant', 'depuis',
  'cette', 'notre', 'leurs', 'même', 'fait', 'peut', 'être',
  'aux', 'ces', 'son', 'ses', 'nos', 'vos', 'leur', 'cet', 'cette',
  'ces', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'ce', 'cet'
]);

// Mots positifs (vocabulaire de soutien)
const MOTS_POSITIFS = new Set([
  'oui', 'pour', 'soutenir', 'approuver', 'accord', 'favorable',
  'nécessaire', 'important', 'essentiel', 'bénéfique', 'positif',
  'améliorer', 'développer', 'progresser', 'renforcer', 'protéger',
  'excellent', 'bon', 'bien', 'bravo', 'daccord', 'liberté',
  'démocratie', 'justice', 'paix', 'prospérité', 'avenir', 'progrès',
  'construction', 'unité', 'solidarité', 'développement', 'croissance',
  'innovation', 'modernisation', 'transparence', 'efficacité', 'équité'
]);

// Mots négatifs (vocabulaire d'opposition)
const MOTS_NEGATIFS = new Set([
  'non', 'contre', 'opposer', 'rejeter', 'désapprouver', 'défavorable',
  'dangereux', 'néfaste', 'négatif', 'problème', 'risque', 'menace',
  'détruire', 'affaiblir', 'reculer', 'perdre', 'grave', 'mauvais',
  'corruption', 'dictature', 'violence', 'instabilité', 'injustice',
  'inégalité', 'pauvreté', 'chômage', 'crise', 'blocage', 'inefficacité',
  'mensonge', 'tromperie', 'abus', 'fraude', 'incompétence'
]);

// Mots de catégories thématiques
const CATEGORIES_THEMATIQUES = {
  INSTITUTIONS: ['constitution', 'parlement', 'gouvernement', 'président', 'assemblée', 'sénat', 'justice', 'cour', 'loi', 'réforme'],
  SOCIETE: ['éducation', 'santé', 'sécurité', 'emploi', 'logement', 'eau', 'électricité', 'route', 'transport', 'environnement'],
  ECONOMIE: ['économie', 'développement', 'investissement', 'emploi', 'industrie', 'agriculture', 'mines', 'budget', 'fiscalité', 'commerce'],
  DROITS: ['droits', 'liberté', 'égalité', 'justice', 'démocratie', 'transparence', 'participation', 'citoyen', 'élection', 'vote'],
  TERRITOIRE: ['province', 'territoire', 'décentralisation', 'kinshasa', 'goma', 'lubumbashi', 'mbuji', 'kisangani', 'frontière', 'région']
};

// Seuils d'alerte
const SEUILS = {
  DOUBLON: 0.75,
  SPAM_ELEVE: 10,
  SPAM_MODERE: 5,
  QUALITE_MIN: 50,
  LONGUEUR_MIN: 50,
  LONGUEUR_MAX: 50000,
  SCORE_SENTIMENT_POSITIF: 0.3,
  SCORE_SENTIMENT_NEGATIF: -0.3,
  TENDANCE_HAUSSE: 30
};

// =============================================
// FONCTIONS D'ANALYSE
// =============================================

// Extraction de mots-clés avec score TF-IDF amélioré
function extraireMotsCles(texte: string, nombreMax: number = 10): { mot: string; score: number; frequence: number; categorie?: string }[] {
  if (!texte || texte.length === 0) return [];
  
  const mots = texte
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s-]/g, ' ')
    .split(/\s+/)
    .filter(m => m.length > 3 && !MOTS_VIDES.has(m) && !/^\d+$/.test(m));

  const compteur: Record<string, number> = {};
  mots.forEach(m => { compteur[m] = (compteur[m] || 0) + 1; });

  const totalMots = mots.length || 1;
  const resultats = Object.entries(compteur)
    .map(([mot, freq]) => {
      // Déterminer la catégorie thématique
      let categorie = 'general';
      for (const [cat, motsCat] of Object.entries(CATEGORIES_THEMATIQUES)) {
        if (motsCat.some(mc => mc === mot)) {
          categorie = cat;
          break;
        }
      }
      return { 
        mot, 
        score: (freq / totalMots) * Math.log(1 + freq), 
        frequence: freq,
        categorie
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, nombreMax);
  
  return resultats;
}

// Analyse de sentiment avancée
function analyserSentiment(texte: string): { score: number; etiquette: string; niveau: string; confiance: number } {
  const mots = texte.toLowerCase().split(/\s+/);
  let scorePositif = 0;
  let scoreNegatif = 0;
  let totalMotsPertinents = 0;

  mots.forEach(m => {
    if (MOTS_POSITIFS.has(m)) {
      scorePositif += 2;
      totalMotsPertinents++;
    }
    if (MOTS_NEGATIFS.has(m)) {
      scoreNegatif += 2;
      totalMotsPertinents++;
    }
  });

  const scoreTotal = scorePositif - scoreNegatif;
  const normalise = totalMotsPertinents > 0 ? Math.max(-1, Math.min(1, scoreTotal / (totalMotsPertinents * 2))) : 0;
  
  let etiquette = 'neutre';
  let niveau = 'faible';
  let confiance = 0.5;
  
  if (normalise > SEUILS.SCORE_SENTIMENT_POSITIF) {
    etiquette = 'positif';
    niveau = normalise > 0.6 ? 'fort' : 'modéré';
    confiance = Math.min(0.9, 0.5 + normalise * 0.5);
  } else if (normalise < SEUILS.SCORE_SENTIMENT_NEGATIF) {
    etiquette = 'négatif';
    niveau = normalise < -0.6 ? 'fort' : 'modéré';
    confiance = Math.min(0.9, 0.5 + Math.abs(normalise) * 0.5);
  }

  return { score: normalise, etiquette, niveau, confiance };
}

// Détection de doublons par similarité cosinus
function detecterDoublons(nouveauTexte: string, textesExistants: string[]): { estDoublon: boolean; similarite: number; propositionsSimilaires: string[] } {
  const nouveauMots = nouveauTexte.toLowerCase().split(/\s+/).filter(m => m.length > 3 && !MOTS_VIDES.has(m));
  const nouveauSet = new Set(nouveauMots);
  let similariteMax = 0;
  const propositionsSimilaires: string[] = [];

  textesExistants.forEach(existant => {
    const motsExistants = existant.toLowerCase().split(/\s+/).filter(m => m.length > 3 && !MOTS_VIDES.has(m));
    const intersection = nouveauMots.filter(m => motsExistants.includes(m)).length;
    const union = nouveauMots.length + motsExistants.length - intersection;
    const similarite = union > 0 ? intersection / union : 0;
    
    if (similarite > similariteMax) {
      similariteMax = similarite;
      if (similarite > SEUILS.DOUBLON) {
        propositionsSimilaires.push(existant.substring(0, 100));
      }
    }
  });

  return { 
    estDoublon: similariteMax > SEUILS.DOUBLON, 
    similarite: similariteMax,
    propositionsSimilaires: propositionsSimilaires.slice(0, 3)
  };
}

// Vérification de cohérence et qualité
function verifierCoherence(sujet: string, contenu: string, categorie?: string) {
  const problemes: string[] = [];
  const avertissements: string[] = [];
  const longueurContenu = (contenu || '').replace(/<[^>]*>/g, '').length;
  const longueurSujet = (sujet || '').length;

  // Vérification de la longueur
  if (!sujet || longueurSujet < 10) {
    problemes.push('Le sujet est trop court (minimum 10 caractères).');
  } else if (longueurSujet > 250) {
    problemes.push('Le sujet dépasse la limite de 250 caractères.');
  }
  
  if (longueurContenu < SEUILS.LONGUEUR_MIN) {
    problemes.push(`Le contenu détaillé est trop court (minimum ${SEUILS.LONGUEUR_MIN} caractères).`);
  }
  if (longueurContenu > SEUILS.LONGUEUR_MAX) {
    problemes.push(`Le contenu dépasse la limite de ${SEUILS.LONGUEUR_MAX} caractères.`);
  }

  // Détection de spam
  const motifsSpam = ['http://', 'https://', 'www.', '@', '.com', '.org', '.net'];
  let scoreSpam = 0;
  motifsSpam.forEach(m => {
    const regex = new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const occurrences = (contenu || '').match(regex) || [];
    scoreSpam += occurrences.length;
  });
  
  if (scoreSpam > SEUILS.SPAM_ELEVE) {
    problemes.push('Contenu suspect détecté (trop de liens externes).');
  } else if (scoreSpam > SEUILS.SPAM_MODERE) {
    avertissements.push('Présence de plusieurs liens externes. Vérification recommandée.');
  }

  // Détection de répétitions excessives
  const motsContenu = (contenu || '').toLowerCase().split(/\s+/);
  const freqMots: Record<string, number> = {};
  motsContenu.forEach(m => { freqMots[m] = (freqMots[m] || 0) + 1; });
  const motsRepetes = Object.entries(freqMots).filter(([_, count]) => count > 10).length;
  if (motsRepetes > 5) {
    avertissements.push('Présence de répétitions excessives dans le contenu.');
  }

  // Analyse de sentiment du contenu
  const sentiment = analyserSentiment(contenu || '');
  
  // Score de qualité
  let scoreQualite = 100;
  scoreQualite -= problemes.length * 15;
  scoreQualite -= avertissements.length * 5;
  scoreQualite = Math.max(0, Math.min(100, scoreQualite));

  return {
    estValide: problemes.length === 0,
    problemes,
    avertissements,
    scoreQualite,
    longueurContenu,
    scoreSpam,
    sentiment,
    recommandation: scoreQualite >= 70 
      ? 'Proposition de bonne qualité. Prête à être publiée.'
      : scoreQualite >= 50
      ? 'Proposition acceptable avec quelques réserves. Une révision légère est recommandée.'
      : 'Proposition nécessitant des améliorations importantes avant publication.'
  };
}

// =============================================
// HANDLER PRINCIPAL
// =============================================

serve(async (req: Request) => {
  // Gestion CORS préflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Vérification de l'authentification
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ succes: false, erreur: 'Authentification requise' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    const corps = await req.json();
    const { action, data } = corps;

    // Validation de l'action
    const actionsValides = [
      'extraire_mots_cles', 'analyser_sentiment', 'verifier_coherence',
      'detecter_doublons', 'tendances_mots_cles', 'generer_nuage_mots',
      'classifier_categorie', 'analyser_complet'
    ];
    
    if (!actionsValides.includes(action)) {
      throw new Error(`Action inconnue : ${action}`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let resultat: Record<string, unknown> = {};

    switch (action) {
      case 'extraire_mots_cles': {
        const motsCles = extraireMotsCles(data.texte, data.nombreMax || 10);
        resultat = { mots_cles: motsCles, total_mots_extraits: motsCles.length };
        break;
      }

      case 'analyser_sentiment': {
        const sentiment = analyserSentiment(data.texte);
        resultat = { sentiment };
        break;
      }

      case 'verifier_coherence': {
        resultat = verifierCoherence(data.sujet, data.contenu, data.categorie);
        break;
      }

      case 'detecter_doublons': {
        const { data: propositionsExistantes } = await supabase
          .from('proposals')
          .select('subject, content')
          .eq('status', 'published')
          .limit(100);

        const textesExistants = (propositionsExistantes || []).map(
          (p: { subject: string; content: string }) => `${p.subject} ${(p.content || '').replace(/<[^>]*>/g, '')}`
        );

        const texteCombine = `${data.sujet} ${(data.contenu || '').replace(/<[^>]*>/g, '')}`;
        const detection = detecterDoublons(texteCombine, textesExistants);

        resultat = {
          ...detection,
          recommandation: detection.estDoublon
            ? '⚠️ Cette proposition semble similaire à une proposition existante. Veuillez vérifier avant publication.'
            : '✅ Aucun doublon détecté.'
        };
        break;
      }

      case 'tendances_mots_cles': {
        const septJours = new Date(); 
        septJours.setDate(septJours.getDate() - 7);
        const quatorzeJours = new Date(); 
        quatorzeJours.setDate(quatorzeJours.getDate() - 14);

        const [recentes, anciennes] = await Promise.all([
          supabase.from('proposals').select('subject, content').eq('status', 'published').gte('created_at', septJours.toISOString()),
          supabase.from('proposals').select('subject, content').eq('status', 'published').gte('created_at', quatorzeJours.toISOString()).lt('created_at', septJours.toISOString())
        ]);

        const texteRecent = (recentes.data || []).map((p: { subject: string; content: string }) => `${p.subject} ${p.content}`).join(' ');
        const texteAncien = (anciennes.data || []).map((p: { subject: string; content: string }) => `${p.subject} ${p.content}`).join(' ');

        const motsRecents = extraireMotsCles(texteRecent, 30);
        const motsAnciens = extraireMotsCles(texteAncien, 30);

        const mapAnciens = new Map(motsAnciens.map(k => [k.mot, { frequence: k.frequence, score: k.score }]));
        const tendances = motsRecents
          .map(k => {
            const ancien = mapAnciens.get(k.mot);
            const freqAncienne = ancien?.frequence || 0;
            const augmentation = freqAncienne > 0 
              ? ((k.frequence - freqAncienne) / freqAncienne) * 100 
              : 100;
            const variation = augmentation > 0 ? 'hausse' : augmentation < 0 ? 'baisse' : 'stable';
            return { 
              ...k, 
              pourcentage_augmentation: Math.round(augmentation),
              variation,
              tendance: augmentation > SEUILS.TENDANCE_HAUSSE ? 'forte_hausse' : augmentation > 0 ? 'hausse' : augmentation < -20 ? 'forte_baisse' : 'stable'
            };
          })
          .filter(k => k.pourcentage_augmentation > 15)
          .slice(0, 15);

        resultat = { 
          tendances, 
          periode: '7_jours',
          total_propositions_analysees: (recentes.data?.length || 0) + (anciennes.data?.length || 0)
        };
        break;
      }

      case 'generer_nuage_mots': {
        const { data: toutesProps } = await supabase
          .from('proposals')
          .select('subject, content, category')
          .eq('status', 'published')
          .limit(500);

        const toutTexte = (toutesProps || []).map((p: { subject: string; content: string }) => `${p.subject} ${p.content}`).join(' ');
        const motsCles = extraireMotsCles(toutTexte, 60);

        const scoreMax = Math.max(...motsCles.map(k => k.score), 1);
        const nuage = motsCles.map(k => ({
          texte: k.mot.charAt(0).toUpperCase() + k.mot.slice(1),
          valeur: Math.round((k.score / scoreMax) * 50) + 10,
          frequence: k.frequence,
          categorie: k.categorie
        }));

        // Statistiques complémentaires
        const totalPropositions = toutesProps?.length || 0;
        const totalMotsUniques = motsCles.length;

        resultat = { 
          nuage,
          statistiques: {
            total_propositions: totalPropositions,
            total_mots_uniques: totalMotsUniques,
            score_max: scoreMax
          }
        };
        break;
      }

      case 'classifier_categorie': {
        const texte = `${data.sujet} ${data.contenu}`.toLowerCase();
        const scores: Record<string, number> = {};
        
        for (const [categorie, mots] of Object.entries(CATEGORIES_THEMATIQUES)) {
          let score = 0;
          mots.forEach(mot => {
            const regex = new RegExp(mot, 'gi');
            const occ = (texte.match(regex) || []).length;
            score += occ * 2;
          });
          scores[categorie] = score;
        }
        
        const categoriePredite = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';
        const confiance = Math.min(0.95, (scores[categoriePredite] / 20) + 0.3);
        
        resultat = {
          categorie_predite,
          confiance: Math.round(confiance * 100) / 100,
          scores_alternatifs: scores
        };
        break;
      }

      case 'analyser_complet': {
        // Analyse complète pour la modération
        const coherence = verifierCoherence(data.sujet, data.contenu, data.categorie);
        const sentiment = analyserSentiment(data.contenu || '');
        const motsCles = extraireMotsCles(`${data.sujet} ${data.contenu}`, 15);
        const categoriePredite = await (async () => {
          const texte = `${data.sujet} ${data.contenu}`.toLowerCase();
          const scores: Record<string, number> = {};
          for (const [categorie, mots] of Object.entries(CATEGORIES_THEMATIQUES)) {
            let score = 0;
            mots.forEach(mot => {
              const regex = new RegExp(mot, 'gi');
              const occ = (texte.match(regex) || []).length;
              score += occ * 2;
            });
            scores[categorie] = score;
          }
          return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';
        })();
        
        // Décision de modération
        let decision = 'approuver';
        let raison = '';
        
        if (!coherence.estValide) {
          decision = 'rejeter';
          raison = coherence.problemes.join(', ');
        } else if (coherence.scoreQualite < 60) {
          decision = 'revision';
          raison = 'Qualité insuffisante, révision recommandée';
        } else if (sentiment.etiquette === 'négatif' && sentiment.niveau === 'fort') {
          decision = 'revision';
          raison = 'Langage très négatif, vérification recommandée';
        } else {
          raison = 'Proposition conforme aux standards de qualité';
        }
        
        resultat = {
          coherence,
          sentiment,
          mots_cles: motsCles,
          categorie_predite: categoriePredite,
          moderation: {
            decision,
            raison,
            priorite: decision === 'rejeter' ? 'haute' : decision === 'revision' ? 'moyenne' : 'basse',
            timestamp: new Date().toISOString()
          }
        };
        break;
      }
    }

    // Journalisation de l'analyse
    await supabase
      .from('activity_log')
      .insert({
        action: `ai_analysis_${action}`,
        details: { timestamp: new Date().toISOString(), input_size: JSON.stringify(data)?.length },
        created_at: new Date().toISOString()
      })
      .maybeSingle();

    return new Response(JSON.stringify({
      succes: true,
      action,
      donnees: resultat,
      horodatage: new Date().toISOString(),
      version: '100.0.4'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Erreur analyse IA:', err);
    const message = err instanceof Error ? err.message : 'Erreur interne du serveur';
    return new Response(JSON.stringify({
      succes: false,
      erreur: message,
      code: 'AI_ANALYSIS_ERROR',
      horodatage: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});