import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Analyse du message SMS pour déterminer l'intention
function analyserCommande(texte: string): { action: string; donnees?: Record<string, string> } {
  const normalise = texte.trim().toUpperCase();

  // Commande de vote : VOTE [ID] [OUI/NON] ou VOTER [ID] [OUI/NON]
  if (normalise.startsWith('VOTE ') || normalise.startsWith('VOTER ')) {
    const parties = normalise.split(' ');
    if (parties.length >= 3) {
      const id = parties[1];
      const vote = parties[2] === 'OUI' || parties[2] === 'YES' ? 'yes'
        : parties[2] === 'NON' || parties[2] === 'NO' ? 'no' : null;
      if (id && vote) return { action: 'vote', donnees: { id_proposition: id, type_vote: vote } };
    }
    return { action: 'inconnue', donnees: { message: 'Format : VOTE [NUMÉRO] [OUI/NON]' } };
  }

  // Commande de proposition : PROPOSE [Titre] | [Contenu]
  if (normalise.startsWith('PROPOSE ') || normalise.startsWith('PROPOSER ')) {
    const contenu = texte.substring(texte.indexOf(' ') + 1);
    const parties = contenu.split('|');
    return {
      action: 'proposer',
      donnees: { sujet: parties[0]?.trim() || '', contenu: parties[1]?.trim() || contenu }
    };
  }

  // Statistiques
  if (normalise === 'STATS' || normalise === 'STATISTIQUES') return { action: 'statistiques' };

  // Inscription
  if (normalise.startsWith('INSCRIPTION') || normalise.startsWith('REGISTER')) {
    return { action: 'inscription', donnees: { nom: normalise.split(' ').slice(1).join(' ') } };
  }

  // Aide
  if (normalise === 'AIDE' || normalise === 'HELP' || normalise === '?') return { action: 'aide' };

  return { action: 'inconnue' };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const webhook = await req.json();
    const { from, text, date, id: messageId } = webhook;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Enregistrer le SMS entrant
    await supabase.from('sms_messages').insert({
      from_number: from, message_text: text,
      received_at: date || new Date().toISOString(),
      message_id: messageId, processed: false
    }).catch(err => console.error('Erreur stockage SMS:', err));

    // Trouver le profil utilisateur
    const { data: profil } = await supabase.from('profiles')
      .select('id, first_name, last_name').eq('phone', from).maybeSingle();

    const commande = analyserCommande(text);
    let reponse = '';

    switch (commande.action) {
      case 'vote': {
        if (!profil) {
          reponse = 'Vous devez d\'abord vous inscrire sur maoni.cd pour voter. Envoyez AIDE pour plus d\'informations.';
          break;
        }
        const { id_proposition, type_vote } = commande.donnees!;
        const { data: proposition } = await supabase.from('proposals')
          .select('id, subject, yes_count, no_count').eq('id', id_proposition).maybeSingle();

        if (!proposition) { reponse = `Proposition n°${id_proposition} introuvable.`; break; }

        const { data: voteExistant } = await supabase.from('votes')
          .select('id').eq('user_id', profil.id).eq('proposal_id', id_proposition).maybeSingle();

        if (voteExistant) { reponse = 'Vous avez déjà voté sur cette proposition.'; break; }

        const { error: errVote } = await supabase.from('votes')
          .insert({ user_id: profil.id, proposal_id: id_proposition, vote: type_vote, vote_source: 'sms' });
        if (errVote) { reponse = 'Erreur lors du vote. Réessayez.'; break; }

        const colonne = type_vote === 'yes' ? 'yes_count' : 'no_count';
        await supabase.from('proposals').update({ [colonne]: (proposition[colonne] || 0) + 1 }).eq('id', id_proposition);

        const oui = type_vote === 'yes' ? (proposition.yes_count || 0) + 1 : proposition.yes_count;
        const non = type_vote === 'no' ? (proposition.no_count || 0) + 1 : proposition.no_count;
        reponse = `✅ Vote "${type_vote === 'yes' ? 'OUI' : 'NON'}" enregistré : "${proposition.subject.substring(0, 60)}..." (OUI: ${oui}, NON: ${non})`;
        break;
      }

      case 'proposer': {
        if (!profil) { reponse = 'Inscrivez-vous d\'abord sur maoni.cd pour soumettre une proposition.'; break; }
        const { sujet, contenu } = commande.donnees!;
        const { error: errProp } = await supabase.from('proposals').insert({
          user_id: profil.id, subject: sujet.substring(0, 250), content: contenu,
          one_sentence: sujet.substring(0, 200), status: 'published', yes_count: 0, no_count: 0
        });
        reponse = errProp ? 'Erreur lors de la soumission.' : `✅ Proposition soumise : "${sujet.substring(0, 100)}"`;
        break;
      }

      case 'statistiques': {
        const { count: nbPropositions } = await supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published');
        const { count: nbVotes } = await supabase.from('votes').select('id', { count: 'exact', head: true });
        const { count: nbCitoyens } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
        reponse = `📊 MAONI : ${nbCitoyens} citoyens, ${nbPropositions} propositions, ${nbVotes} votes. maoni.cd`;
        break;
      }

      case 'inscription': {
        reponse = profil
          ? `Déjà inscrit comme ${profil.first_name} ${profil.last_name}. Gérez votre compte sur maoni.cd.`
          : '📱 Inscrivez-vous gratuitement sur maoni.cd/register pour participer.';
        break;
      }

      case 'aide': {
        reponse = '📱 MAONI - Aide\n• VOTE [N°] [OUI/NON]\n• PROPOSE [Titre]|[Contenu]\n• STATS\n• INSCRIPTION\n• AIDE\nmaoni.cd';
        break;
      }

      default: {
        reponse = 'Commande inconnue. Envoyez AIDE pour la liste.\nVOTE [N°] [OUI/NON] | PROPOSE [texte] | STATS\nmaoni.cd';
      }
    }

    await supabase.from('sms_messages')
      .update({ processed: true, response_text: reponse, processed_at: new Date().toISOString() })
      .eq('message_id', messageId);

    return new Response(JSON.stringify({ succes: true, message: reponse, destinataire: from }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
    });

  } catch (err) {
    console.error('Erreur SMS:', err);
    return new Response(JSON.stringify({ succes: false, erreur: 'Erreur serveur' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
    });
  }
});