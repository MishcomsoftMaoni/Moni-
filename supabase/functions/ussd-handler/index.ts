import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Sessions USSD
const sessions = new Map<string, { etat: string; donnees: Record<string, unknown>; derniereActivite: number }>();

// Nettoyage des sessions expirées (5 minutes)
setInterval(() => {
  const maintenant = Date.now();
  for (const [cle, session] of sessions) {
    if (maintenant - session.derniereActivite > 300000) sessions.delete(cle);
  }
}, 300000);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const corps = await req.json();
    const { sessionId, phoneNumber, text } = corps;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer ou créer la session
    let session = sessions.get(sessionId);
    if (!session) {
      session = { etat: 'accueil', donnees: {}, derniereActivite: Date.now() };
      sessions.set(sessionId, session);
    }
    session.derniereActivite = Date.now();

    const entrees = text.split('*');
    const derniereEntree = entrees[entrees.length - 1] || '';
    const nombreEntrees = entrees.length;

    const { data: profil } = await supabase
      .from('profiles').select('id, first_name, last_name, province')
      .eq('phone', phoneNumber).maybeSingle();

    let reponse = '';

    // MENU PRINCIPAL
    if (text === '' || nombreEntrees === 0) {
      session.etat = 'menu_principal';
      reponse = `CON Bienvenue sur MAONI – Consultation Citoyenne RDC\n`;
      if (profil) reponse += `Bonjour ${profil.first_name} !\n`;
      reponse += `1. Voter sur une proposition\n`;
      reponse += `2. Soumettre une proposition\n`;
      reponse += `3. Statistiques\n`;
      reponse += `4. Aide`;
    }

    // NIVEAU 1
    else if (nombreEntrees === 1) {
      switch (derniereEntree) {
        case '1': {
          if (!profil) {
            reponse = 'CON Vous devez être inscrit pour voter.\nInscrivez-vous sur maoni.cd\n0. Retour';
            break;
          }
          session.etat = 'selection_vote';
          const { data: propositions } = await supabase
            .from('proposals').select('id, subject, yes_count, no_count')
            .eq('status', 'published').order('created_at', { ascending: false }).limit(5);

          if (!propositions || propositions.length === 0) {
            reponse = 'CON Aucune proposition disponible.\n0. Retour';
            break;
          }
          reponse = 'CON Choisissez une proposition :\n';
          propositions.forEach((p, i) => reponse += `${i + 1}. ${p.subject.substring(0, 40)}...\n`);
          reponse += '0. Retour';
          session.donnees = { propositions };
          break;
        }

        case '2': {
          if (!profil) {
            reponse = 'CON Vous devez être inscrit pour proposer.\nInscrivez-vous sur maoni.cd\n0. Retour';
            break;
          }
          session.etat = 'sujet_proposition';
          reponse = 'CON Entrez le titre de votre proposition (max 250 caractères) :\n0. Retour';
          break;
        }

        case '3': {
          const { count: nbPropositions } = await supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published');
          const { count: nbVotes } = await supabase.from('votes').select('id', { count: 'exact', head: true });
          const { count: nbCitoyens } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
          reponse = `CON 📊 MAONI\nCitoyens : ${nbCitoyens?.toLocaleString() || 0}\nPropositions : ${nbPropositions?.toLocaleString() || 0}\nVotes : ${nbVotes?.toLocaleString() || 0}\nmaoni.cd\n0. Retour`;
          break;
        }

        case '4': {
          reponse = 'CON 📱 Aide\n1. Voter : choisissez une proposition\n2. Proposer : partagez votre idée\n3. Statistiques\nmaoni.cd\n0. Retour';
          break;
        }

        default: reponse = 'CON Choix invalide.\n0. Retour';
      }
    }

    // SÉLECTION VOTE
    else if (nombreEntrees === 2 && session.etat === 'selection_vote') {
      const choix = parseInt(derniereEntree);
      const propositions = (session.donnees as { propositions?: { id: string; subject: string; yes_count: number; no_count: number }[] })?.propositions || [];

      if (choix === 0) {
        reponse = 'CON Menu principal\n1. Voter\n2. Proposer\n3. Stats\n4. Aide';
        session.etat = 'menu_principal';
      } else if (choix > 0 && choix <= propositions.length) {
        const selection = propositions[choix - 1];
        session.etat = 'confirmation_vote';
        session.donnees = { propositionSelectionnee: selection };
        reponse = `CON ${selection.subject.substring(0, 50)}...\n✅ OUI : ${selection.yes_count || 0} | ❌ NON : ${selection.no_count || 0}\n1. Voter OUI\n2. Voter NON\n0. Retour`;
      } else {
        reponse = 'CON Numéro invalide.\n0. Retour';
      }
    }

    // CONFIRMATION VOTE
    else if (nombreEntrees === 3 && session.etat === 'confirmation_vote') {
      const vote = derniereEntree;
      const proposition = (session.donnees as { propositionSelectionnee?: { id: string; yes_count: number; no_count: number } })?.propositionSelectionnee;

      if (vote === '0') {
        reponse = 'CON Vote annulé.\n0. Menu principal';
        session.etat = 'menu_principal';
      } else if ((vote === '1' || vote === '2') && proposition && profil) {
        const typeVote = vote === '1' ? 'yes' : 'no';
        const { data: existant } = await supabase.from('votes').select('id').eq('user_id', profil.id).eq('proposal_id', proposition.id).maybeSingle();

        if (existant) {
          reponse = 'END Vous avez déjà voté sur cette proposition. Merci.';
        } else {
          const { error: errVote } = await supabase.from('votes').insert({ user_id: profil.id, proposal_id: proposition.id, vote: typeVote, vote_source: 'ussd' });
          if (errVote) {
            reponse = 'END Erreur. Réessayez plus tard.';
          } else {
            const colonne = typeVote === 'yes' ? 'yes_count' : 'no_count';
            await supabase.from('proposals').update({ [colonne]: (proposition[colonne] || 0) + 1 }).eq('id', proposition.id);
            reponse = `END ✅ Vote "${typeVote === 'yes' ? 'OUI' : 'NON'}" enregistré !\nMerci pour votre participation.\nmaoni.cd`;
          }
        }
      } else {
        reponse = 'CON Choix invalide.\n0. Retour';
      }
    }

    // SUJET PROPOSITION
    else if (session.etat === 'sujet_proposition' && nombreEntrees === 2) {
      if (derniereEntree === '0') {
        reponse = 'CON Menu principal\n1. Voter\n2. Proposer\n3. Stats\n4. Aide';
        session.etat = 'menu_principal';
      } else {
        session.donnees = { ...session.donnees, sujetProposition: derniereEntree };
        session.etat = 'contenu_proposition';
        reponse = 'CON Entrez le contenu détaillé :\n0. Retour';
      }
    }

    // CONTENU PROPOSITION
    else if (session.etat === 'contenu_proposition' && nombreEntrees === 3) {
      if (derniereEntree === '0') {
        reponse = 'CON Proposition annulée.\n0. Menu principal';
        session.etat = 'menu_principal';
      } else if (profil) {
        const sujet = (session.donnees as { sujetProposition?: string })?.sujetProposition || '';
        const { error } = await supabase.from('proposals').insert({
          user_id: profil.id, subject: sujet.substring(0, 250),
          one_sentence: sujet.substring(0, 200), content: derniereEntree,
          status: 'published', yes_count: 0, no_count: 0
        });
        reponse = error
          ? 'END Erreur lors de la soumission.'
          : `END ✅ Proposition soumise !\n"${sujet.substring(0, 80)}"\nVisible sur maoni.cd\nMerci !`;
      }
      session.etat = 'menu_principal';
    }

    // SESSION EXPIRÉE
    else {
      reponse = 'END Session expirée. Recomposez *123#.';
      sessions.delete(sessionId);
    }

    return new Response(reponse, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain', 'Freeflow': 'FC' },
      status: 200,
    });

  } catch (err) {
    console.error('Erreur USSD:', err);
    return new Response('END Une erreur est survenue. Veuillez réessayer.', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }, status: 200,
    });
  }
});