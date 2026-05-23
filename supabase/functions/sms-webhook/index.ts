import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// =============================================
// SMS WEBHOOK - Niveau Militaire
// Gestion des SMS entrants | USSD alternatif
// République Démocratique du Congo
// =============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-maoni-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
};

// =============================================
// CONFIGURATION
// =============================================

const LONGUEUR_MAX_SUJET = 250;
const LONGUEUR_MAX_MESSAGE = 500;

// Liste des opérateurs télécoms en RDC (pour logging)
const OPERATEURS_TELECOM = [
  'Vodacom', 'Orange', 'Airtel', 'Africell', 'Tigo', 'CCT', 'SCT'
];

// =============================================
// ANALYSE DE COMMANDE SMS AVANCÉE
// =============================================

interface CommandeResult {
  action: string;
  donnees?: Record<string, string>;
  messageErreur?: string;
}

function analyserCommande(texte: string): CommandeResult {
  const normalise = texte.trim().toUpperCase();
  const original = texte.trim();

  // ========== COMMANDES DE VOTE ==========
  // VOTE [ID] [OUI/NON] ou VOTER [ID] [OUI/NON]
  if (normalise.startsWith('VOTE ') || normalise.startsWith('VOTER ')) {
    const parties = normalise.split(' ');
    if (parties.length >= 3) {
      const id = parties[1];
      const vote = parties[2] === 'OUI' || parties[2] === 'YES' ? 'yes'
        : parties[2] === 'NON' || parties[2] === 'NO' ? 'no' : null;
      if (id && vote && /^\d+$/.test(id)) {
        return { action: 'vote', donnees: { id_proposition: id, type_vote: vote } };
      }
    }
    return { action: 'inconnue', donnees: { message: 'Format : VOTE [NUMÉRO] [OUI/NON] (ex: VOTE 123 OUI)' } };
  }

  // ========== COMMANDES DE PROPOSITION ==========
  // PROPOSE [Titre] | [Contenu] ou PROPOSER [Titre] | [Contenu]
  if (normalise.startsWith('PROPOSE ') || normalise.startsWith('PROPOSER ')) {
    const contenu = original.substring(original.indexOf(' ') + 1);
    const parties = contenu.split('|');
    const sujet = parties[0]?.trim() || '';
    const corps = parties[1]?.trim() || contenu;
    
    if (sujet.length === 0) {
      return { action: 'inconnue', donnees: { message: 'Format : PROPOSE [Titre] | [Contenu] (sujet obligatoire)' } };
    }
    return {
      action: 'proposer',
      donnees: { sujet: sujet.substring(0, LONGUEUR_MAX_SUJET), contenu: corps.substring(0, LONGUEUR_MAX_MESSAGE) }
    };
  }

  // ========== COMMANDES DE STATISTIQUES ==========
  if (normalise === 'STATS' || normalise === 'STATISTIQUES' || normalise === 'STATISTIQUE') {
    return { action: 'statistiques' };
  }

  // ========== COMMANDES D'INSCRIPTION ==========
  if (normalise.startsWith('INSCRIPTION') || normalise.startsWith('REGISTER') || normalise === 'SIGNUP') {
    const nom = normalise.split(' ').slice(1).join(' ');
    return { action: 'inscription', donnees: { nom: nom || 'Citoyen' } };
  }

  // ========== COMMANDES D'AIDE ==========
  if (normalise === 'AIDE' || normalise === 'HELP' || normalise === '?' || normalise === 'INFO') {
    return { action: 'aide' };
  }

  // ========== COMMANDES DE PROFIL ==========
  if (normalise === 'PROFIL' || normalise === 'PROFILE' || normalise === 'MON COMPTE') {
    return { action: 'profil' };
  }

  // ========== COMMANDES DE RECHERCHE ==========
  if (normalise.startsWith('RECHERCHE ') || normalise.startsWith('SEARCH ')) {
    const terme = original.substring(original.indexOf(' ') + 1);
    return { action: 'recherche', donnees: { terme: terme.substring(0, 50) } };
  }

  return { action: 'inconnue' };
}

// =============================================
// FORMATAGE DES RÉPONSES SMS
// =============================================

function formaterReponse(texte: string, maxLongueur: number = 480): string {
  if (texte.length <= maxLongueur) return texte;
  // Couper au dernier espace avant la limite
  const coupe = texte.substring(0, maxLongueur);
  const dernierEspace = coupe.lastIndexOf(' ');
  return dernierEspace > 0 ? coupe.substring(0, dernierEspace) + '...' : coupe + '...';
}

// =============================================
// VALIDATION DU NUMÉRO DE TÉLÉPHONE
// =============================================

function validerNumeroTelephone(numero: string): boolean {
  // Format RDC: +243XXXXXXXXX ou 0XXXXXXXXX
  const regexRDC = /^(\+243|0)[0-9]{9}$/;
  return regexRDC.test(numero.replace(/\s/g, ''));
}

// =============================================
// HANDLER PRINCIPAL
// =============================================

serve(async (req: Request) => {
  // Gestion CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhook = await req.json();
    const { from, text, date, id: messageId, to, networkCode } = webhook;

    console.log(`[SMS] Reçu de ${from}: "${text}"`);

    // Validation du numéro
    if (!validerNumeroTelephone(from)) {
      console.warn(`[SMS] Numéro invalide: ${from}`);
      // Continuer quand même, mais logger
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Enregistrer le SMS entrant
    await supabase.from('sms_messages').insert({
      from_number: from,
      message_text: text,
      received_at: date || new Date().toISOString(),
      message_id: messageId,
      to_number: to,
      network_code: networkCode,
      processed: false
    }).catch(err => console.error('[SMS] Erreur stockage:', err));

    // Trouver le profil utilisateur
    const { data: profil, error: profilError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, province, role')
      .eq('phone', from)
      .maybeSingle();

    if (profilError) {
      console.error('[SMS] Erreur recherche profil:', profilError);
    }

    // Analyser la commande
    const commande = analyserCommande(text);
    let reponse = '';
    let commandeType = commande.action;

    switch (commande.action) {
      // ========== VOTE ==========
      case 'vote': {
        if (!profil) {
          reponse = '🔐 Inscription requise pour voter. Envoyez INSCRIPTION ou visitez maoni.cd/register.';
          break;
        }

        const { id_proposition, type_vote } = commande.donnees!;
        
        // Vérifier l'existence de la proposition
        const { data: proposition, error: propError } = await supabase
          .from('proposals')
          .select('id, subject, yes_count, no_count, status')
          .eq('id', id_proposition)
          .maybeSingle();

        if (propError || !proposition) {
          reponse = `❌ Proposition n°${id_proposition} introuvable. Vérifiez le numéro.`;
          break;
        }

        if (proposition.status !== 'published') {
          reponse = `❌ La proposition n°${id_proposition} n'est pas disponible au vote.`;
          break;
        }

        // Vérifier si déjà voté
        const { data: voteExistant, error: voteCheckError } = await supabase
          .from('votes')
          .select('id')
          .eq('user_id', profil.id)
          .eq('proposal_id', id_proposition)
          .maybeSingle();

        if (voteExistant) {
          reponse = `❌ Vous avez déjà voté sur cette proposition. Un seul vote par citoyen.`;
          break;
        }

        // Enregistrer le vote
        const { error: errVote } = await supabase
          .from('votes')
          .insert({
            user_id: profil.id,
            proposal_id: id_proposition,
            vote: type_vote,
            vote_source: 'sms',
            created_at: new Date().toISOString()
          });

        if (errVote) {
          console.error('[SMS] Erreur vote:', errVote);
          reponse = `❌ Erreur technique lors du vote. Réessayez plus tard.`;
          break;
        }

        // Mettre à jour le compteur
        const colonne = type_vote === 'yes' ? 'yes_count' : 'no_count';
        const nouvelleValeur = (proposition[colonne] || 0) + 1;
        
        await supabase
          .from('proposals')
          .update({ [colonne]: nouvelleValeur, updated_at: new Date().toISOString() })
          .eq('id', id_proposition);

        const oui = type_vote === 'yes' ? nouvelleValeur : (proposition.yes_count || 0);
        const non = type_vote === 'no' ? nouvelleValeur : (proposition.no_count || 0);
        const total = oui + non;
        const pourcentage = total > 0 ? Math.round((oui / total) * 100) : 0;

        reponse = `✅ Vote ${type_vote === 'yes' ? 'OUI' : 'NON'} enregistré !\n📝 "${proposition.subject.substring(0, 50)}..."\n📊 OUI: ${oui} | NON: ${non} (${pourcentage}% OUI)`;
        commandeType = 'vote_success';
        break;
      }

      // ========== PROPOSER ==========
      case 'proposer': {
        if (!profil) {
          reponse = '🔐 Inscription requise pour proposer. Envoyez INSCRIPTION ou visitez maoni.cd/register.';
          break;
        }

        const { sujet, contenu } = commande.donnees!;
        
        if (!sujet || sujet.length < 5) {
          reponse = `❌ Sujet trop court (minimum 5 caractères). Format: PROPOSE [Titre] | [Contenu détaillé]`;
          break;
        }

        const { data: nouvelleProp, error: errProp } = await supabase
          .from('proposals')
          .insert({
            user_id: profil.id,
            subject: sujet,
            content: contenu,
            one_sentence: sujet.length > 200 ? sujet.substring(0, 197) + '...' : sujet,
            status: 'published',
            yes_count: 0,
            no_count: 0,
            created_at: new Date().toISOString(),
            source: 'sms'
          })
          .select()
          .single();

        if (errProp) {
          console.error('[SMS] Erreur proposition:', errProp);
          reponse = `❌ Erreur lors de la soumission. Vérifiez votre message et réessayez.`;
          break;
        }

        reponse = `✅ Proposition soumise !\n📝 "${sujet.substring(0, 60)}"\n📋 Numéro: #${nouvelleProp.id}\n📊 Consultez les votes sur maoni.cd/proposals/${nouvelleProp.id}`;
        commandeType = 'proposal_success';
        break;
      }

      // ========== STATISTIQUES ==========
      case 'statistiques': {
        const [propositionsRes, votesRes, citoyensRes, ouiRes, nonRes] = await Promise.all([
          supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('votes').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'yes'),
          supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'no')
        ]);

        const totalVotes = (ouiRes.count || 0) + (nonRes.count || 0);
        const pctOui = totalVotes > 0 ? Math.round((ouiRes.count / totalVotes) * 100) : 50;

        reponse = `📊 MAONI - Statistiques nationales\n👥 Citoyens: ${(citoyensRes.count || 0).toLocaleString('fr-FR')}\n📋 Propositions: ${(propositionsRes.count || 0).toLocaleString('fr-FR')}\n🗳️ Votes: ${totalVotes.toLocaleString('fr-FR')}\n✅ OUI: ${pctOui}% | ❌ NON: ${100 - pctOui}%\n🌐 maoni.cd`;
        break;
      }

      // ========== INSCRIPTION ==========
      case 'inscription': {
        if (profil) {
          reponse = `✅ Vous êtes déjà inscrit(e) comme ${profil.first_name} ${profil.last_name}. Visitez maoni.cd pour gérer votre compte.`;
        } else {
          reponse = `📱 Inscription MAONI\n1. Visitez maoni.cd/register\n2. Remplissez le formulaire\n3. Confirmez votre compte\n\n📞 Besoin d'aide? Contactez +243 896 590 320`;
        }
        break;
      }

      // ========== PROFIL ==========
      case 'profil': {
        if (!profil) {
          reponse = `🔐 Vous n'êtes pas encore inscrit(e). Envoyez INSCRIPTION pour créer votre compte citoyen.`;
          break;
        }

        const { count: mesPropositions } = await supabase
          .from('proposals')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profil.id);

        const { count: mesVotes } = await supabase
          .from('votes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profil.id);

        reponse = `👤 Votre profil MAONI\n📛 ${profil.first_name} ${profil.last_name}\n📍 ${profil.province || 'RDC'}\n📝 Propositions: ${mesPropositions || 0}\n🗳️ Votes exprimés: ${mesVotes || 0}\n🌐 maoni.cd/profile`;
        break;
      }

      // ========== RECHERCHE ==========
      case 'recherche': {
        const { terme } = commande.donnees!;
        
        const { data: resultats } = await supabase
          .from('proposals')
          .select('id, subject')
          .eq('status', 'published')
          .ilike('subject', `%${terme}%`)
          .limit(5);

        if (!resultats || resultats.length === 0) {
          reponse = `🔍 Aucune proposition trouvée pour "${terme}". Essayez d'autres mots-clés sur maoni.cd.`;
        } else {
          const liste = resultats.map((p, i) => `${i + 1}. #${p.id} - ${p.subject.substring(0, 40)}`).join('\n');
          reponse = `🔍 Résultats pour "${terme}":\n${liste}\n\nVotez: VOTE [NUMERO] [OUI/NON]`;
        }
        break;
      }

      // ========== AIDE ==========
      case 'aide': {
        reponse = `📱 MAONI - Commandes SMS\n• VOTE [N°] [OUI/NON] - Voter\n• PROPOSE [Titre] | [Détail] - Proposer\n• STATS - Voir statistiques\n• PROFIL - Mon compte\n• RECHERCHE [mot] - Chercher\n• INSCRIPTION - S'inscrire\n• AIDE - Cette aide\n\n🌐 maoni.cd | 📞 *123#`;
        break;
      }

      // ========== COMMANDE INCONNUE ==========
      default: {
        reponse = `❌ Commande non reconnue: "${text.substring(0, 30)}"\n\nCommandes disponibles:\n• VOTE [N°] [OUI/NON]\n• PROPOSE [Titre] | [Détail]\n• STATS\n• AIDE\n\n🌐 maoni.cd`;
      }
    }

    // Formater la réponse (limite de 480 caractères pour SMS)
    const reponseFormatee = formaterReponse(reponse);
    console.log(`[SMS] Réponse à ${from}: "${reponseFormatee.substring(0, 100)}..."`);

    // Mettre à jour le message dans la base
    await supabase
      .from('sms_messages')
      .update({
        processed: true,
        response_text: reponseFormatee,
        processed_at: new Date().toISOString(),
        command_type: commandeType
      })
      .eq('message_id', messageId);

    // Journaliser l'activité
    await supabase
      .from('activity_log')
      .insert({
        action: 'sms_processed',
        user_id: profil?.id,
        details: {
          command_type: commandeType,
          from_number: from,
          message_length: text.length
        },
        created_at: new Date().toISOString()
      })
      .maybeSingle();

    // Retourner la réponse à l'API Africa's Talking
    return new Response(JSON.stringify({
      success: true,
      message: reponseFormatee,
      destination: from,
      command_type: commandeType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('[SMS] Erreur:', err);
    
    // Envoyer une réponse d'erreur générique
    const reponseErreur = "❌ Service MAONI temporairement indisponible. Veuillez réessayer plus tard ou visiter maoni.cd.";
    
    return new Response(JSON.stringify({
      success: false,
      message: reponseErreur,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});