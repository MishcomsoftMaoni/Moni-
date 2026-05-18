import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Mots vides en français
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
  'aux', 'ces', 'son', 'ses', 'nos', 'vos', 'leur'
]);

// Mots positifs en français
const MOTS_POSITIFS = new Set([
  'oui', 'pour', 'soutenir', 'approuver', 'accord', 'favorable',
  'nécessaire', 'important', 'essentiel', 'bénéfique', 'positif',
  'améliorer', 'développer', 'progresser', 'renforcer', 'protéger',
  'excellent', 'bon', 'bien', 'bravo', 'daccord', 'liberté',
  'démocratie', 'justice', 'paix', 'prospérité', 'avenir'
]);

// Mots négatifs en français
const MOTS_NEGATIFS = new Set([
  'non', 'contre', 'opposer', 'rejeter', 'désapprouver', 'défavorable',
  'dangereux', 'néfaste', 'négatif', 'problème', 'risque', 'menace',
  'détruire', 'affaiblir', 'reculer', 'perdre', 'grave', 'mauvais',
  'corruption', 'dictature', 'violence', 'instabilité'
]);

// Extraction de mots-clés (inspirée TF-IDF)
function extraireMotsCles(texte: string, nombreMax: number = 10): { mot: string; score: number; frequence: number }[] {
  const mots = texte
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s-]/g, ' ')
    .split(/\s+/)
    .filter(m => m.length > 3 && !MOTS_VIDES.has(m));

  const compteur: Record<string, number> = {};
  mots.forEach(m => { compteur[m] = (compteur[m] || 0) + 1; });

  const totalMots = mots.length || 1;
  return Object.entries(compteur)
    .map(([mot, freq]) => ({ mot, score: (freq / totalMots) * Math.log(1 + freq), frequence: freq }))
    .sort((a, b) => b.score - a.score)
    .slice(0, nombreMax);
}

// Analyse de sentiment
function analyserSentiment(texte: string): { score: number; etiquette: string } {
  const mots = texte.toLowerCase().split(/\s+/);
  let score = 0;
  mots.forEach(m => {
    if (MOTS_POSITIFS.has(m)) score += 2;
    if (MOTS_NEGATIFS.has(m)) score -= 2;
  });

  const normalise = Math.max(-1, Math.min(1, score / 10));
  let etiquette = 'neutre';
  if (normalise > 0.3) etiquette = 'positif';
  else if (normalise < -0.3) etiquette = 'négatif';

  return { score: normalise, etiquette };
}

// Détection de doublons
function detecterDoublons(nouveauTexte: string, textesExistants: string[]): { estDoublon: boolean; similarite: number } {
  const nouveauxMots = new Set(nouveauTexte.toLowerCase().split(/\s+/).filter(m => m.length > 3));
  let similariteMax = 0;

  textesExistants.forEach(existant => {
    const motsExistants = new Set(existant.toLowerCase().split(/\s+/).filter(m => m.length > 3));
    const intersection = [...nouveauxMots].filter(m => motsExistants.has(m)).length;
    const union = new Set([...nouveauxMots, ...motsExistants]).size;
    if (union > 0) similariteMax = Math.max(similariteMax, intersection / union);
  });

  return { estDoublon: similariteMax > 0.7, similarite: similariteMax };
}

// Vérification de cohérence
function verifierCoherence(sujet: string, contenu: string) {
  const problemes: string[] = [];
  const longueurContenu = (contenu || '').replace(/<[^>]*>/g, '').length;

  if (!sujet || sujet.length < 10) problemes.push('Le sujet est trop court (minimum 10 caractères).');
  if (longueurContenu < 50) problemes.push('Le contenu détaillé est trop court (minimum 50 caractères).');
  if (longueurContenu > 50000) problemes.push('Le contenu dépasse la limite de 50 000 caractères.');

  // Détection de spam
  const motifsSpam = ['http://', 'https://', 'www.', '@'];
  let scoreSpam = 0;
  motifsSpam.forEach(m => { scoreSpam += ((contenu || '').match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length; });
  if (scoreSpam > 5) problemes.push('Contenu suspect détecté (trop de liens externes).');

  return {
    estValide: problemes.length === 0,
    problemes,
    scoreQualite: Math.max(0, 100 - problemes.length * 15),
    longueurContenu,
    scoreSpam
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const corps = await req.json();
    const { action, data } = corps;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let resultat: Record<string, unknown> = {};

    switch (action) {
      case 'extraire_mots_cles': {
        const motsCles = extraireMotsCles(data.texte);
        resultat = { mots_cles: motsCles };
        break;
      }

      case 'analyser_sentiment': {
        const sentiment = analyserSentiment(data.texte);
        resultat = { sentiment };
        break;
      }

      case 'verifier_coherence': {
        resultat = verifierCoherence(data.sujet, data.contenu);
        break;
      }

      case 'detecter_doublons': {
        const { data: propositionsExistantes } = await supabase
          .from('proposals')
          .select('subject, content')
          .eq('status', 'published')
          .limit(50);

        const textesExistants = (propositionsExistantes || []).map(
          (p: { subject: string; content: string }) => `${p.subject} ${(p.content || '').replace(/<[^>]*>/g, '')}`
        );

        const texteCombine = `${data.sujet} ${(data.contenu || '').replace(/<[^>]*>/g, '')}`;
        const detection = detecterDoublons(texteCombine, textesExistants);

        resultat = {
          ...detection,
          recommandation: detection.estDoublon
            ? 'Cette proposition semble similaire à une proposition existante. Veuillez vérifier.'
            : 'Aucun doublon détecté.'
        };
        break;
      }

      case 'tendances_mots_cles': {
        const septJours = new Date(); septJours.setDate(septJours.getDate() - 7);
        const quatorzeJours = new Date(); quatorzeJours.setDate(quatorzeJours.getDate() - 14);

        const { data: recentes } = await supabase
          .from('proposals').select('subject, content').eq('status', 'published').gte('created_at', septJours.toISOString());
        const { data: anciennes } = await supabase
          .from('proposals').select('subject, content').eq('status', 'published').gte('created_at', quatorzeJours.toISOString()).lt('created_at', septJours.toISOString());

        const texteRecent = (recentes || []).map((p: { subject: string; content: string }) => `${p.subject} ${p.content}`).join(' ');
        const texteAncien = (anciennes || []).map((p: { subject: string; content: string }) => `${p.subject} ${p.content}`).join(' ');

        const motsRecents = extraireMotsCles(texteRecent, 20);
        const motsAnciens = extraireMotsCles(texteAncien, 20);

        const mapAnciens = new Map(motsAnciens.map(k => [k.mot, k.frequence]));
        const tendances = motsRecents
          .map(k => {
            const freqAncienne = mapAnciens.get(k.mot) || 0;
            const augmentation = freqAncienne > 0 ? ((k.frequence - freqAncienne) / freqAncienne) * 100 : 100;
            return { ...k, pourcentage_augmentation: Math.round(augmentation) };
          })
          .filter(k => k.pourcentage_augmentation > 20)
          .slice(0, 10);

        resultat = { tendances };
        break;
      }

      case 'generer_nuage_mots': {
        const { data: toutesProps } = await supabase
          .from('proposals').select('subject, content').eq('status', 'published');

        const toutTexte = (toutesProps || []).map((p: { subject: string; content: string }) => `${p.subject} ${p.content}`).join(' ');
        const motsCles = extraireMotsCles(toutTexte, 50);

        const scoreMax = Math.max(...motsCles.map(k => k.score), 1);
        const nuage = motsCles.map(k => ({
          texte: k.mot,
          valeur: Math.round((k.score / scoreMax) * 40) + 10,
          frequence: k.frequence
        }));

        resultat = { nuage };
        break;
      }

      default:
        throw new Error(`Action inconnue : ${action}`);
    }

    return new Response(JSON.stringify({
      succes: true,
      action,
      donnees: resultat,
      horodatage: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Erreur analyse IA:', err);
    const message = err instanceof Error ? err.message : 'Erreur interne du serveur';
    return new Response(JSON.stringify({
      succes: false,
      erreur: message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});