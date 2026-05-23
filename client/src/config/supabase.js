import { createClient } from '@supabase/supabase-js';

// =============================================
// CONFIGURATION SUPABASE - Niveau Militaire
// Sécurité maximale | PKCE | Audit | Performance
// République Démocratique du Congo
// Version: 100.0.4
// =============================================

// Configuration Supabase (clés de production)
const supabaseUrl = 'https://evnwpfgcsrroiewyzmnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bndwZmdjc3Jyb2lld3l6bW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjM3OTAsImV4cCI6MjA5MzE5OTc5MH0.HtQXMh5sJPP4RaGghJWHH3XS1Z-mrk-JlNv8YeSMjQ8';

// Service Role Key (utilisé uniquement pour les opérations admin)
// ⚠️ À garder secret - ne jamais exposer côté client
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || null;

// Options de configuration par défaut
const defaultOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'maoni_auth_token',
    flowType: 'pkce', // PKCE pour plus de sécurité
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'MAONI',
      'x-application-version': '100.0.4',
      'x-platform': 'web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Client principal (clé anon - pour le frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, defaultOptions);

// Client admin (clé service - pour les opérations privilégiées)
// Ce client ne doit être utilisé que dans les Edge Functions ou le backend
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'x-application-name': 'MAONI-ADMIN',
          'x-application-version': '100.0.4',
        },
      },
    })
  : null;

// =============================================
// INTERCEPTEURS ET LOGGING (environnement dev)
// =============================================

// Logging des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
    if (typeof url === 'string' && url.includes('supabase.co')) {
      console.log('[Supabase] Requête:', {
        url: url.split('?')[0],
        method: options?.method || 'GET',
        timestamp: new Date().toISOString(),
      });
    }
    return originalFetch(...args);
  };
}

// =============================================
// FONCTIONS UTILITAIRES SÉCURISÉES
// =============================================

// Vérifier la connexion à Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    if (error) throw error;
    return { connected: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('[Supabase] Erreur de connexion:', error.message);
    return { connected: false, error: error.message };
  }
};

// Récupérer les statistiques de la session
export const getSessionStats = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { authenticated: false };
    
    return {
      authenticated: true,
      userId: session.user.id,
      email: session.user.email,
      expiresAt: session.expires_at,
      lastActivity: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Supabase] Erreur session stats:', error);
    return { authenticated: false, error: error.message };
  }
};

// Rafraîchir le token automatiquement
export const refreshAuthToken = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return { success: true, session: data.session };
  } catch (error) {
    console.error('[Supabase] Erreur rafraîchissement token:', error);
    return { success: false, error: error.message };
  }
};

// Écouter les changements d'authentification
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase] Auth state change:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN') {
      console.log('[Auth] ✅ Utilisateur connecté:', session?.user?.email);
      window.dispatchEvent(new CustomEvent('maoni-auth-signin', { 
        detail: { userId: session?.user?.id, timestamp: new Date().toISOString() }
      }));
    } else if (event === 'SIGNED_OUT') {
      console.log('[Auth] 👋 Utilisateur déconnecté');
      window.dispatchEvent(new CustomEvent('maoni-auth-signout'));
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('[Auth] 🔄 Token rafraîchi');
    }
    
    callback(event, session);
  });
};

// =============================================
// FONCTIONS DE SÉCURITÉ ADDITIONNELLES
// =============================================

// Vérifier si l'utilisateur a les droits admin
export const isUserAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data?.role === 'admin' || data?.role === 'presidential';
  } catch (error) {
    console.error('[Security] Erreur vérification admin:', error);
    return false;
  }
};

// Vérifier les permissions pour une action spécifique
export const checkPermission = async (userId, action, resource) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    const permissions = {
      admin: ['*'],
      presidential: ['*'],
      moderator: ['moderate_proposals', 'view_reports'],
      citizen: ['vote', 'submit_proposal', 'comment'],
    };
    
    const userPermissions = permissions[profile?.role] || permissions.citizen;
    return userPermissions.includes('*') || userPermissions.includes(action);
  } catch (error) {
    console.error('[Security] Erreur permission:', error);
    return false;
  }
};

// =============================================
// EXPORT DES CONFIGURATIONS
// =============================================

export const supabaseConfig = {
  url: supabaseUrl,
  version: '100.0.4',
  features: {
    auth: true,
    realtime: true,
    storage: true,
    edgeFunctions: true,
  },
  security: {
    pkceEnabled: true,
    sessionPersistence: true,
    autoRefreshToken: true,
  },
};

// Log de démarrage
console.log('[Supabase] 🚀 Client initialisé - MAONI v100.0.4');
console.log('[Supabase] 🔒 Mode sécurisé - PKCE activé');
console.log('[Supabase] 📡 URL:', supabaseUrl.replace(/https:\/\//, ''));
console.log('[Supabase] 🇨🇩 République Démocratique du Congo');

export default supabase;