import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// =============================================
// USSD HANDLER - Niveau Militaire
// Menu interactif sans Internet | *123#
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

const TEMPS_EXPIRATION_SESSION = 300000; // 5 minutes
const NETTOYAGE_INTERVALLE = 300000; // 5 minutes
const MAX_PROPOSITIONS_AFFICHEES = 7;
const MAX_SUJET_LONGUEUR = 250;
const MAX_CONTENU_LONGUEUR = 500;

// =============================================
// GESTION DES SESSIONS
// =============================================

interface USSDSession {
  etat: string;
  donnees: Record<string, unknown>;
  derniereActivite: number;
  langue?: string;
  tentativeVote?: number;
}

const sessions = new Map<string, USSDSession>();

// Nettoyage des sessions expirées
setInterval(() => {
  const maintenant = Date.now();
  for (const [cle, session] of sessions) {
    if (maintenant - session.derniereActivite > TEMPS_EXPIRATION_SESSION) {
      sessions.delete(cle);
      console.log(`[USSD] Session expirée: ${cle}`);
    }
  }
}, NETTOYAGE_INTERVALLE);

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

function formaterNombre(nombre: number): string {
  return nombre.toLocaleString('fr-FR');
}

function tronquerTexte(texte: string, maxLength: number): string {
  if (texte.length <= maxLength) return texte;
  return texte.substring(0, maxLength - 3) + '...';
}

function genererMenuPrincipal(profil: { first_name?: string } | null): string {
  let menu = `CON Bienvenue sur MAONI 🇨🇩\n`;
  menu += `Consultation Constitutionnelle\n`;
  if (profil?.first_name) {
    menu += `Bonjour ${profil.first_name} !\n`;
  }
  menu += `─\n`;
  menu += `1. 📋 Voter sur une proposition\n`;
  menu += `2. ✍️ Soumettre une proposition\n`;
  menu += `3. 📊 Statistiques nationales\n`;
  menu += `4. 👤 Mon compte\n`;
  menu += `5. ❓ Aide\n`;
  menu += `─\n`;
  menu += `0. Quitter`;
  return menu;
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
    const corps = await req.json();
    const { sessionId, phoneNumber, text, serviceCode, networkCode } = corps;

    console.log(`[USSD] Session: ${sessionId}, Phone: ${phoneNumber}, Input: "${text}", Network: ${networkCode || 'inconnu'}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer ou créer la session
    let session = sessions.get(sessionId);
    if (!session) {
      session = { etat: 'menu_principal', donnees: {}, derniereActivite: Date.now() };
      sessions.set(sessionId, session);
    }
    session.derniereActivite = Date.now();

    const entrees = text ? text.split('*') : [];
    const derniereEntree = entrees.length > 0 ? entrees[entrees.length - 1] : '';
    const nombreEntrees = entrees.length;

    // Récupérer le profil utilisateur
    const { data: profil, error: profilError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, province, role, civic_points')
      .eq('phone', phoneNumber)
      .maybeSingle();

    if (profilError) {
      console.error('[USSD] Erreur recherche profil:', profilError);
    }

    let reponse = '';

    // ==========================================
    // MENU PRINCIPAL (Démarrage)
    // ==========================================
    if (text === '' || nombreEntrees === 0) {
      session.etat = 'menu_principal';
      reponse = genererMenuPrincipal(profil);
    }

    // ==========================================
    // NIVEAU 1 - MENU PRINCIPAL
    // ==========================================
    else if (nombreEntrees === 1) {
      switch (derniereEntree) {
        case '1': // Voter
          if (!profil) {
            reponse = 'CON 🔐 Vous devez être inscrit pour voter.\n';
            reponse += 'Inscrivez-vous sur maoni.cd\n';
            reponse += '─\n';
            reponse += '0. Retour';
            break;
          }

          session.etat = 'selection_vote';
          session.tentativeVote = 0;

          const { data: propositions, error: propsError } = await supabase
            .from('proposals')
            .select('id, subject, yes_count, no_count, created_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(MAX_PROPOSITIONS_AFFICHEES);

          if (propsError) {
            console.error('[USSD] Erreur chargement propositions:', propsError);
            reponse = 'CON 📋 Erreur technique. Réessayez.\n0. Retour';
            break;
          }

          if (!propositions || propositions.length === 0) {
            reponse = 'CON 📭 Aucune proposition disponible.\n0. Retour';
            break;
          }

          reponse = 'CON 📋 Choisissez une proposition :\n';
          propositions.forEach((p, i) => {
            reponse += `${i + 1}. ${tronquerTexte(p.subject, 45)}\n`;
          });
          reponse += `─\n0. Retour au menu principal`;
          session.donnees = { propositions };
          break;

        case '2': // Proposer
          if (!profil) {
            reponse = 'CON 🔐 Vous devez être inscrit pour proposer.\n';
            reponse += 'Inscrivez-vous sur maoni.cd\n';
            reponse += '─\n';
            reponse += '0. Retour';
            break;
          }

          session.etat = 'sujet_proposition';
          reponse = 'CON ✍️ Nouvelle proposition\n';
          reponse += 'Entrez le titre (max 250 caractères) :\n';
          reponse += '─\n';
          reponse += '0. Annuler';
          break;

        case '3': // Statistiques
          const [propositionsCount, votesCount, citoyensCount, ouiCount, nonCount] = await Promise.all([
            supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published'),
            supabase.from('votes').select('id', { count: 'exact', head: true }),
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'yes'),
            supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'no')
          ]);

          const totalVotes = (ouiCount.count || 0) + (nonCount.count || 0);
          const pctOui = totalVotes > 0 ? Math.round((ouiCount.count / totalVotes) * 100) : 50;

          reponse = `CON 📊 MAONI - RDC\n`;
          reponse += `👥 Citoyens: ${formaterNombre(citoyensCount.count || 0)}\n`;
          reponse += `📋 Propositions: ${formaterNombre(propositionsCount.count || 0)}\n`;
          reponse += `🗳️ Votes exprimés: ${formaterNombre(totalVotes)}\n`;
          reponse += `✅ OUI: ${pctOui}% | ❌ NON: ${100 - pctOui}%\n`;
          reponse += `─\n`;
          reponse += `🌐 maoni.cd\n`;
          reponse += `0. Retour`;
          break;

        case '4': // Mon compte
          if (!profil) {
            reponse = 'CON 🔐 Vous n\'êtes pas encore inscrit.\n';
            reponse += 'Inscrivez-vous sur maoni.cd/register\n';
            reponse += '─\n';
            reponse += '0. Retour';
            break;
          }

          const [mesProps, mesVotes] = await Promise.all([
            supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('user_id', profil.id),
            supabase.from('votes').select('id', { count: 'exact', head: true }).eq('user_id', profil.id)
          ]);

          reponse = `CON 👤 Mon compte MAONI\n`;
          reponse += `📛 ${profil.first_name} ${profil.last_name}\n`;
          reponse += `📍 ${profil.province || 'RDC'}\n`;
          reponse += `📝 Propositions: ${mesProps.count || 0}\n`;
          reponse += `🗳️ Votes: ${mesVotes.count || 0}\n`;
          reponse += `⭐ Points: ${profil.civic_points || 0}\n`;
          reponse += `─\n`;
          reponse += `0. Retour`;
          break;

        case '5': // Aide
          reponse = `CON 📱 Aide MAONI\n`;
          reponse += `─\n`;
          reponse += `1. Voter → Choisissez OUI/NON\n`;
          reponse += `2. Proposer → Partagez votre idée\n`;
          reponse += `3. Stats → Voir les chiffres\n`;
          reponse += `4. Mon compte → Votre profil\n`;
          reponse += `─\n`;
          reponse += `🌐 maoni.cd\n`;
          reponse += `📞 *123# depuis Kinshasa\n`;
          reponse += `─\n`;
          reponse += `0. Retour`;
          break;

        case '0': // Quitter
          reponse = 'END Merci d\'avoir utilisé MAONI.\n🇨🇩 Votre voix compte !';
          sessions.delete(sessionId);
          break;

        default:
          reponse = 'CON ❌ Choix invalide.\n0. Retour';
      }
    }

    // ==========================================
    // NIVEAU 2 - SÉLECTION VOTE
    // ==========================================
    else if (nombreEntrees === 2 && session.etat === 'selection_vote') {
      const choix = parseInt(derniereEntree);
      const propositions = (session.donnees as { propositions?: { id: string; subject: string; yes_count: number; no_count: number }[] })?.propositions || [];

      if (choix === 0) {
        reponse = genererMenuPrincipal(profil);
        session.etat = 'menu_principal';
        session.donnees = {};
      } else if (choix > 0 && choix <= propositions.length) {
        const selectionnee = propositions[choix - 1];
        session.etat = 'confirmation_vote';
        session.donnees = { propositionSelectionnee: selectionnee };
        
        const totalVotes = (selectionnee.yes_count || 0) + (selectionnee.no_count || 0);
        const pct = totalVotes > 0 ? Math.round((selectionnee.yes_count / totalVotes) * 100) : 0;
        
        reponse = `CON 📋 ${tronquerTexte(selectionnee.subject, 60)}\n`;
        reponse += `─\n`;
        reponse += `✅ OUI: ${selectionnee.yes_count || 0} (${pct}%)\n`;
        reponse += `❌ NON: ${selectionnee.no_count || 0} (${100 - pct}%)\n`;
        reponse += `─\n`;
        reponse += `1. Voter OUI\n`;
        reponse += `2. Voter NON\n`;
        reponse += `─\n`;
        reponse += `0. Retour`;
      } else {
        reponse = 'CON ❌ Numéro invalide.\n0. Retour';
      }
    }

    // ==========================================
    // NIVEAU 3 - CONFIRMATION VOTE
    // ==========================================
    else if (nombreEntrees === 3 && session.etat === 'confirmation_vote') {
      const vote = derniereEntree;
      const proposition = (session.donnees as { propositionSelectionnee?: { id: string; subject: string; yes_count: number; no_count: number } })?.propositionSelectionnee;

      if (vote === '0') {
        reponse = genererMenuPrincipal(profil);
        session.etat = 'menu_principal';
        session.donnees = {};
      } else if ((vote === '1' || vote === '2') && proposition && profil) {
        const typeVote = vote === '1' ? 'yes' : 'no';
        
        // Vérifier si déjà voté
        const { data: existant } = await supabase
          .from('votes')
          .select('id')
          .eq('user_id', profil.id)
          .eq('proposal_id', proposition.id)
          .maybeSingle();

        if (existant) {
          reponse = `END ❌ Vous avez déjà voté sur cette proposition.\nMerci de votre participation.\n🇨🇩 MAONI`;
          sessions.delete(sessionId);
          break;
        }

        // Enregistrer le vote
        const { error: errVote } = await supabase
          .from('votes')
          .insert({
            user_id: profil.id,
            proposal_id: proposition.id,
            vote: typeVote,
            vote_source: 'ussd',
            created_at: new Date().toISOString()
          });

        if (errVote) {
          console.error('[USSD] Erreur vote:', errVote);
          reponse = `END ❌ Erreur technique. Réessayez plus tard.\n🇨🇩 MAONI`;
        } else {
          // Mettre à jour le compteur
          const colonne = typeVote === 'yes' ? 'yes_count' : 'no_count';
          await supabase
            .from('proposals')
            .update({ [colonne]: (proposition[colonne] || 0) + 1 })
            .eq('id', proposition.id);

          const totalApres = typeVote === 'yes' 
            ? (proposition.yes_count || 0) + 1 + (proposition.no_count || 0)
            : (proposition.yes_count || 0) + (proposition.no_count || 0) + 1;
          const pctApres = totalApres > 0 
            ? Math.round(((typeVote === 'yes' ? (proposition.yes_count || 0) + 1 : proposition.yes_count || 0) / totalApres) * 100)
            : 50;

          reponse = `END ✅ Vote "${typeVote === 'yes' ? 'OUI' : 'NON'}" enregistré !\n`;
          reponse += `📊 Nouveau résultat: ${pctApres}% OUI\n`;
          reponse += `🇨🇩 Merci pour votre participation citoyenne !`;
        }
        sessions.delete(sessionId);
      } else {
        reponse = 'CON ❌ Choix invalide.\n0. Retour';
      }
    }

    // ==========================================
    // NIVEAU 2 - SUJET PROPOSITION
    // ==========================================
    else if (session.etat === 'sujet_proposition' && nombreEntrees === 2) {
      if (derniereEntree === '0') {
        reponse = genererMenuPrincipal(profil);
        session.etat = 'menu_principal';
        session.donnees = {};
      } else if (derniereEntree.length < 5) {
        reponse = 'CON ❌ Titre trop court (minimum 5 caractères).\nEntrez le titre :\n0. Annuler';
      } else {
        session.donnees = { ...session.donnees, sujetProposition: derniereEntree.substring(0, MAX_SUJET_LONGUEUR) };
        session.etat = 'contenu_proposition';
        reponse = 'CON ✍️ Entrez le contenu détaillé (max 500 caractères) :\n0. Annuler';
      }
    }

    // ==========================================
    // NIVEAU 3 - CONTENU PROPOSITION
    // ==========================================
    else if (session.etat === 'contenu_proposition' && nombreEntrees === 3) {
      if (derniereEntree === '0') {
        reponse = genererMenuPrincipal(profil);
        session.etat = 'menu_principal';
        session.donnees = {};
      } else if (derniereEntree.length < 10) {
        reponse = 'CON ❌ Contenu trop court (minimum 10 caractères).\nEntrez le contenu :\n0. Annuler';
      } else if (profil) {
        const sujet = (session.donnees as { sujetProposition?: string })?.sujetProposition || '';
        const contenu = derniereEntree.substring(0, MAX_CONTENU_LONGUEUR);
        
        const { data: nouvelleProp, error: errProp } = await supabase
          .from('proposals')
          .insert({
            user_id: profil.id,
            subject: sujet,
            one_sentence: sujet.length > 200 ? sujet.substring(0, 197) + '...' : sujet,
            content: contenu,
            status: 'published',
            yes_count: 0,
            no_count: 0,
            source: 'ussd',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (errProp) {
          console.error('[USSD] Erreur proposition:', errProp);
          reponse = `END ❌ Erreur lors de la soumission.\nVeuillez réessayer.\n🇨🇩 MAONI`;
        } else {
          reponse = `END ✅ Proposition soumise avec succès !\n`;
          reponse += `📝 "${tronquerTexte(sujet, 60)}"\n`;
          reponse += `📋 Référence: #${nouvelleProp.id}\n`;
          reponse += `🌐 Consultez les votes sur maoni.cd/proposals/${nouvelleProp.id}\n`;
          reponse += `🇨🇩 Merci pour votre contribution citoyenne !`;
        }
        sessions.delete(sessionId);
      } else {
        reponse = `END ❌ Session expirée. Veuillez recomposer *123#.`;
        sessions.delete(sessionId);
      }
    }

    // ==========================================
    // SESSION EXPIRÉE OU ERREUR
    // ==========================================
    else {
      reponse = 'END ⏰ Session expirée. Recomposez *123# pour continuer.\n🇨🇩 MAONI';
      sessions.delete(sessionId);
    }

    console.log(`[USSD] Réponse à ${phoneNumber}: ${reponse.substring(0, 100)}...`);

    return new Response(reponse, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Freeflow': 'FC'
      },
      status: 200,
    });

  } catch (err) {
    console.error('[USSD] Erreur:', err);
    return new Response('END ❌ Une erreur est survenue. Veuillez réessayer.\n🇨🇩 MAONI', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200,
    });
  }
});