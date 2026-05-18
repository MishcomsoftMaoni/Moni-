import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const corps = await req.json();
    const { proposal_id, vote_type } = corps;

    if (!proposal_id || !vote_type) throw new Error('Identifiant de proposition et type de vote requis.');
    if (!['yes', 'no'].includes(vote_type)) throw new Error('Le type de vote doit être "yes" ou "no".');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authentification requise.');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: errAuth } = await supabaseAdmin.auth.getUser(token);
    if (errAuth || !user) throw new Error('Utilisateur non authentifié.');

    // Vérifier si l'utilisateur a déjà voté
    const { data: voteExistant } = await supabaseAdmin
      .from('votes').select('id, vote')
      .eq('user_id', user.id).eq('proposal_id', proposal_id).maybeSingle();

    if (voteExistant) {
      throw new Error(`Vous avez déjà voté "${voteExistant.vote === 'yes' ? 'OUI' : 'NON'}" sur cette proposition.`);
    }

    // Récupérer la proposition
    const { data: proposition, error: errProposition } = await supabaseAdmin
      .from('proposals').select('yes_count, no_count, user_id')
      .eq('id', proposal_id).single();

    if (errProposition || !proposition) throw new Error('Proposition introuvable.');
    if (proposition.user_id === user.id) throw new Error('Vous ne pouvez pas voter sur votre propre proposition.');

    // Insérer le vote
    const { error: errInsertion } = await supabaseAdmin
      .from('votes').insert({ user_id: user.id, proposal_id, vote: vote_type, vote_source: 'web' });

    if (errInsertion) throw new Error('Erreur lors de l\'enregistrement du vote.');

    // Mettre à jour le compteur
    const colonne = vote_type === 'yes' ? 'yes_count' : 'no_count';
    const compteurActuel = vote_type === 'yes' ? (proposition.yes_count || 0) : (proposition.no_count || 0);

    const { error: errMiseAJour } = await supabaseAdmin
      .from('proposals').update({ [colonne]: compteurActuel + 1, updated_at: new Date().toISOString() }).eq('id', proposal_id);

    if (errMiseAJour) {
      // Annulation du vote en cas d'échec
      await supabaseAdmin.from('votes').delete().eq('user_id', user.id).eq('proposal_id', proposal_id);
      throw new Error('Erreur lors de la mise à jour du compteur.');
    }

    // Journal d'activité
    await supabaseAdmin.from('activity_log').insert({
      user_id: user.id, action: 'vote', target_type: 'proposal',
      target_id: proposal_id, details: { vote: vote_type }
    }).maybeSingle();

    // Récupérer les compteurs finaux
    const { data: final } = await supabaseAdmin
      .from('proposals').select('yes_count, no_count').eq('id', proposal_id).single();

    const oui = final?.yes_count || (vote_type === 'yes' ? compteurActuel + 1 : proposition.yes_count || 0);
    const non = final?.no_count || (vote_type === 'no' ? compteurActuel + 1 : proposition.no_count || 0);
    const total = oui + non;

    return new Response(JSON.stringify({
      succes: true,
      message: `Vote "${vote_type === 'yes' ? 'OUI' : 'NON'}" enregistré avec succès.`,
      donnees: {
        proposal_id, yes_count: oui, no_count: non, total_votes: total,
        pourcentage_oui: total > 0 ? Math.round((oui / total) * 100) : 0,
        pourcentage_non: total > 0 ? Math.round((non / total) * 100) : 0,
        vote_utilisateur: vote_type
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (err) {
    console.error('Erreur compteur de votes:', err);
    const message = err instanceof Error ? err.message : 'Erreur lors du traitement du vote.';
    const codeStatut = message.includes('Authentification') ? 401 : 400;

    return new Response(JSON.stringify({ succes: false, erreur: message, code: 'ERREUR_VOTE' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: codeStatut
    });
  }
});