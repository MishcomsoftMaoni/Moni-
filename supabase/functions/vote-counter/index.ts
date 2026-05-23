import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// =============================================
// COMPTEUR DE VOTES - Niveau Militaire
// Traitement sécurisé | Anti-fraude | Audit
// République Démocratique du Congo
// =============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-maoni-version, x-forwarded-for',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
};

// =============================================
// CONFIGURATION
// =============================================

const TEMPS_BLOCAGE = 300000; // 5 minutes
const TENTATIVES_MAX = 5;
const TENTATIVES_PAR_IP = 10;

// Stockage des tentatives (anti-spam)
const tentativesParUtilisateur = new Map<string, { count: number; dernierBlocage: number }>();
const tentativesParIP = new Map<string, { count: number; timestamp: number[] }>();

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

function nettoyerTentativesAnciennes() {
  const maintenant = Date.now();
  for (const [ip, data] of tentativesParIP) {
    data.timestamp = data.timestamp.filter(t => maintenant - t < 60000); // Garder seulement la dernière minute
    if (data.timestamp.length === 0) tentativesParIP.delete(ip);
  }
}

// Nettoyage périodique
setInterval(nettoyerTentativesAnciennes, 60000);

function verifierTentativesIP(ip: string): boolean {
  const maintenant = Date.now();
  const data = tentativesParIP.get(ip);
  if (!data) return true;
  
  const tentativesRecentes = data.timestamp.filter(t => maintenant - t < 60000);
  return tentativesRecentes.length < TENTATIVES_PAR_IP;
}

function enregistrerTentativeIP(ip: string) {
  const maintenant = Date.now();
  const data = tentativesParIP.get(ip) || { count: 0, timestamp: [] };
  data.timestamp.push(maintenant);
  data.timestamp = data.timestamp.filter(t => maintenant - t < 60000);
  tentativesParIP.set(ip, data);
}

function verifierBlocageUtilisateur(userId: string): { bloque: boolean; tempsRestant?: number } {
  const data = tentativesParUtilisateur.get(userId);
  if (!data) return { bloque: false };
  
  if (data.dernierBlocage && Date.now() - data.dernierBlocage < TEMPS_BLOCAGE) {
    const tempsRestant = Math.ceil((TEMPS_BLOCAGE - (Date.now() - data.dernierBlocage)) / 1000);
    return { bloque: true, tempsRestant };
  }
  
  return { bloque: false };
}

function enregistrerTentativeUtilisateur(userId: string, succes: boolean) {
  const data = tentativesParUtilisateur.get(userId) || { count: 0, dernierBlocage: 0 };
  
  if (succes) {
    data.count = 0;
    data.dernierBlocage = 0;
  } else {
    data.count++;
    if (data.count >= TENTATIVES_MAX) {
      data.dernierBlocage = Date.now();
    }
  }
  
  tentativesParUtilisateur.set(userId, data);
}

// =============================================
// HANDLER PRINCIPAL
// =============================================

serve(async (req: Request) => {
  // Gestion CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Récupérer l'IP du client
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';

  try {
    const corps = await req.json();
    const { proposal_id, vote_type } = corps;

    // Validation des entrées
    if (!proposal_id || !vote_type) {
      throw new Error('Identifiant de proposition et type de vote requis.');
    }
    if (!['yes', 'no'].includes(vote_type)) {
      throw new Error('Le type de vote doit être "yes" ou "no".');
    }

    // Vérifier les tentatives par IP (anti-DoS)
    if (!verifierTentativesIP(clientIP)) {
      throw new Error('Trop de tentatives depuis cette adresse IP. Veuillez patienter.');
    }
    enregistrerTentativeIP(clientIP);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ==========================================
    // AUTHENTIFICATION
    // ==========================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentification requise. Veuillez vous connecter.');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: errAuth } = await supabaseAdmin.auth.getUser(token);
    
    if (errAuth || !user) {
      throw new Error('Session invalide ou expirée. Veuillez vous reconnecter.');
    }

    // Vérifier le blocage utilisateur
    const { bloque, tempsRestant } = verifierBlocageUtilisateur(user.id);
    if (bloque) {
      throw new Error(`Trop de tentatives. Compte bloqué pour ${Math.ceil(tempsRestant! / 60)} minutes.`);
    }

    // ==========================================
    // VÉRIFICATION DU VOTE EXISTANT
    // ==========================================
    const { data: voteExistant, error: errCheck } = await supabaseAdmin
      .from('votes')
      .select('id, vote, created_at')
      .eq('user_id', user.id)
      .eq('proposal_id', proposal_id)
      .maybeSingle();

    if (errCheck) {
      console.error('[Vote] Erreur vérification:', errCheck);
      throw new Error('Erreur technique. Veuillez réessayer.');
    }

    if (voteExistant) {
      enregistrerTentativeUtilisateur(user.id, false);
      throw new Error(`Vous avez déjà voté "${voteExistant.vote === 'yes' ? 'OUI' : 'NON'}" sur cette proposition le ${new Date(voteExistant.created_at).toLocaleDateString('fr-FR')}.`);
    }

    // ==========================================
    // RÉCUPÉRATION DE LA PROPOSITION
    // ==========================================
    const { data: proposition, error: errProposition } = await supabaseAdmin
      .from('proposals')
      .select('yes_count, no_count, user_id, subject, status')
      .eq('id', proposal_id)
      .single();

    if (errProposition || !proposition) {
      throw new Error('Proposition introuvable ou supprimée.');
    }

    if (proposition.status !== 'published') {
      throw new Error('Cette proposition n\'est pas disponible au vote.');
    }

    if (proposition.user_id === user.id) {
      throw new Error('Vous ne pouvez pas voter sur votre propre proposition.');
    }

    // ==========================================
    // TRANSACTION - INSERTION DU VOTE
    // ==========================================
    const { error: errInsertion } = await supabaseAdmin
      .from('votes')
      .insert({
        user_id: user.id,
        proposal_id: proposal_id,
        vote: vote_type,
        vote_source: 'web',
        ip_address: clientIP,
        created_at: new Date().toISOString()
      });

    if (errInsertion) {
      console.error('[Vote] Erreur insertion:', errInsertion);
      if (errInsertion.code === '23505') {
        throw new Error('Conflit détecté. Veuillez réessayer.');
      }
      throw new Error('Erreur lors de l\'enregistrement du vote.');
    }

    // ==========================================
    // MISE À JOUR DU COMPTEUR
    // ==========================================
    const colonne = vote_type === 'yes' ? 'yes_count' : 'no_count';
    const compteurActuel = vote_type === 'yes' ? (proposition.yes_count || 0) : (proposition.no_count || 0);

    const { error: errMiseAJour } = await supabaseAdmin
      .from('proposals')
      .update({
        [colonne]: compteurActuel + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal_id);

    if (errMiseAJour) {
      // ROLLBACK - Supprimer le vote en cas d'échec
      console.error('[Vote] Erreur mise à jour, rollback:', errMiseAJour);
      await supabaseAdmin
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('proposal_id', proposal_id);
      throw new Error('Erreur technique. Vote annulé. Veuillez réessayer.');
    }

    // ==========================================
    // JOURNALISATION (AUDIT)
    // ==========================================
    await supabaseAdmin
      .from('activity_log')
      .insert({
        user_id: user.id,
        action: 'vote',
        target_type: 'proposal',
        target_id: proposal_id,
        details: {
          vote: vote_type,
          previous_yes: proposition.yes_count || 0,
          previous_no: proposition.no_count || 0,
          source: 'web',
          ip: clientIP
        },
        created_at: new Date().toISOString()
      })
      .maybeSingle();

    // Mettre à jour les points civiques de l'utilisateur
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('civic_points')
      .eq('id', user.id)
      .single();

    if (userProfile) {
      await supabaseAdmin
        .from('profiles')
        .update({ civic_points: (userProfile.civic_points || 0) + 1 })
        .eq('id', user.id);
    }

    // Enregistrer la tentative réussie
    enregistrerTentativeUtilisateur(user.id, true);

    // ==========================================
    // RÉCUPÉRATION DES COMPTEURS FINAUX
    // ==========================================
    const { data: final, error: errFinal } = await supabaseAdmin
      .from('proposals')
      .select('yes_count, no_count')
      .eq('id', proposal_id)
      .single();

    const oui = final?.yes_count || (vote_type === 'yes' ? compteurActuel + 1 : proposition.yes_count || 0);
    const non = final?.no_count || (vote_type === 'no' ? compteurActuel + 1 : proposition.no_count || 0);
    const total = oui + non;
    const pourcentageOui = total > 0 ? Math.round((oui / total) * 100) : 0;
    const pourcentageNon = total > 0 ? Math.round((non / total) * 100) : 0;

    // ==========================================
    // NOTIFICATION (optionnelle)
    // ==========================================
    // Si la proposition atteint un seuil, notifier
    if (total === 10 || total === 50 || total === 100 || total === 500 || total === 1000) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: proposition.user_id,
          type: 'vote_milestone',
          title: `🎉 ${total} votes atteints !`,
          message: `Votre proposition "${proposition.subject.substring(0, 50)}" a atteint ${total} votes.`,
          data: { proposal_id, total_votes: total },
          created_at: new Date().toISOString()
        })
        .maybeSingle();
    }

    // ==========================================
    // RÉPONSE SUCCÈS
    // ==========================================
    return new Response(JSON.stringify({
      success: true,
      message: `✅ Vote "${vote_type === 'yes' ? 'OUI' : 'NON'}" enregistré avec succès.`,
      data: {
        proposal_id,
        yes_count: oui,
        no_count: non,
        total_votes: total,
        yes_percentage: pourcentageOui,
        no_percentage: pourcentageNon,
        user_vote: vote_type,
        civic_points_earned: 1,
        timestamp: new Date().toISOString()
      },
      meta: {
        version: '100.0.4',
        source: 'vote-counter-edge-function'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('[Vote] Erreur:', err);
    const message = err instanceof Error ? err.message : 'Erreur lors du traitement du vote.';
    
    // Déterminer le code de statut
    let codeStatut = 400;
    if (message.includes('Authentification') || message.includes('session')) codeStatut = 401;
    if (message.includes('bloqué')) codeStatut = 429;
    if (message.includes('propre proposition')) codeStatut = 403;
    
    return new Response(JSON.stringify({
      success: false,
      error: message,
      code: 'VOTE_ERROR',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: codeStatut,
    });
  }
});