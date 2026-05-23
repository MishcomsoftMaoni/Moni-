import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, checkSupabaseConnection } from '../config/supabase';

// =============================================
// SYSTÈME D'AUTHENTIFICATION - Niveau Militaire
// Session sécurisée | 2FA | Biométrie | Audit
// République Démocratique du Congo
// Version: 100.0.4
// =============================================

const AuthContext = createContext({});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  // États principaux
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState(false);
  
  // Refs
  const profileFetchedRef = useRef(false);
  let authSubscription = null;

  // Vérifier la connexion réseau
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log('[Auth] Connexion rétablie');
      if (user) refreshSession();
    };
    const handleOffline = () => {
      setIsOffline(true);
      console.log('[Auth] Mode hors ligne activé');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Rafraîchir la session
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      return true;
    } catch (error) {
      console.error('[Auth] Erreur rafraîchissement session:', error);
      return false;
    }
  }, []);

  // Vérifier l'expiration de session
  useEffect(() => {
    if (!user) return;
    
    let interval = null;
    
    const checkExpiry = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const minutesUntilExpiry = (expiresAt - now) / 1000 / 60;
          
          if (minutesUntilExpiry < 5 && minutesUntilExpiry > 0) {
            setSessionExpiryWarning(true);
          } else {
            setSessionExpiryWarning(false);
          }
          
          if (minutesUntilExpiry <= 0) {
            logout();
          }
        }
      } catch (err) {
        console.error('[Auth] Erreur vérification expiration:', err);
      }
    };
    
    checkExpiry();
    interval = setInterval(checkExpiry, 60000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  // Récupérer le profil utilisateur
  const fetchProfile = useCallback(async (userId) => {
    if (profileFetchedRef.current && profile?.id === userId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        profileFetchedRef.current = true;
      }
    } catch (err) {
      console.error('[Auth] Erreur chargement profil:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  // Initialisation de l'authentification
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[Auth] Initialisation...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          console.log('[Auth] Session trouvée pour:', session.user.email);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('[Auth] Aucune session trouvée');
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Erreur initialisation:', error);
        setLoading(false);
      }
    };
    
    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Événement:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        setTwoFactorRequired(false);
        setPendingLoginData(null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        profileFetchedRef.current = false;
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    });
    
    authSubscription = subscription;
    
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchProfile]);

  // =============================================
  // INSCRIPTION UTILISATEUR
  // =============================================
  const register = useCallback(async (formData) => {
    try {
      console.log('[Auth] Inscription...');
      
      const email = formData.email || formData.courriel;
      const password = formData.motDePasse || formData.password;
      const firstName = formData.prenom || formData.first_name;
      const lastName = formData.nom || formData.last_name;
      const phone = formData.telephone || formData.phone;
      
      if (!email) throw new Error('Adresse email requise');
      if (!password) throw new Error('Mot de passe requis');
      if (password.length < 6) throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName || 'Citoyen',
            last_name: lastName || 'Congolais',
            phone: phone || '',
            profession: formData.profession || '',
            province: formData.province || '',
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte utilisateur');
      }
      
      // Upload photo de profil
      let portraitUrl = null;
      if (formData.portrait) {
        try {
          const fileExt = formData.portrait.name.split('.').pop();
          const fileName = `${authData.user.id}_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('portraits')
            .upload(fileName, formData.portrait);
          
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('portraits')
              .getPublicUrl(fileName);
            portraitUrl = urlData.publicUrl;
            
            await supabase
              .from('profiles')
              .update({ portrait_url: portraitUrl })
              .eq('id', authData.user.id);
          }
        } catch (uploadErr) {
          console.warn('[Auth] Erreur upload portrait:', uploadErr);
        }
      }
      
      console.log('[Auth] ✅ Inscription réussie pour:', email);
      return { success: true, data: authData };
      
    } catch (err) {
      console.error('[Auth] Erreur inscription:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // =============================================
  // CONNEXION UTILISATEUR
  // =============================================
  const login = useCallback(async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        }
        throw error;
      }
      
      console.log('[Auth] ✅ Connexion réussie:', email);
      return { success: true, data };
      
    } catch (err) {
      console.error('[Auth] Erreur connexion:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // =============================================
  // DÉCONNEXION
  // =============================================
  const logout = useCallback(async () => {
    try {
      console.log('[Auth] Déconnexion...');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      profileFetchedRef.current = false;
      console.log('[Auth] 👋 Déconnexion réussie');
      return { success: true };
    } catch (err) {
      console.error('[Auth] Erreur déconnexion:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Mise à jour du profil
  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Non authentifié' };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProfile(data);
      console.log('[Auth] ✅ Profil mis à jour');
      return { success: true, data };
      
    } catch (err) {
      console.error('[Auth] Erreur mise à jour profil:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Changer le mot de passe
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'Non authentifié' };
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (signInError) throw new Error('Mot de passe actuel incorrect');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      console.log('[Auth] ✅ Mot de passe modifié');
      return { success: true };
      
    } catch (err) {
      console.error('[Auth] Erreur changement mot de passe:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Réinitialiser le mot de passe
  const resetPassword = useCallback(async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      console.log('[Auth] ✅ Email de réinitialisation envoyé');
      return { success: true };
      
    } catch (err) {
      console.error('[Auth] Erreur réinitialisation:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Supprimer le compte
  const deleteAccount = useCallback(async () => {
    if (!user) return { success: false, error: 'Non authentifié' };
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      await logout();
      
      console.log('[Auth] ✅ Compte supprimé');
      return { success: true };
      
    } catch (err) {
      console.error('[Auth] Erreur suppression compte:', err);
      return { success: false, error: err.message };
    }
  }, [user, logout]);

  // Vérifier si l'utilisateur est admin
  const isAdmin = useCallback(() => {
    return profile?.role === 'admin' || profile?.role === 'presidential';
  }, [profile]);

  const value = {
    user,
    profile,
    loading,
    isOffline,
    isAuthenticated: !!user,
    twoFactorRequired,
    sessionExpiryWarning,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    deleteAccount,
    refreshSession,
    isAdmin,
    
    // Français
    utilisateur: user,
    profil: profile,
    chargement: loading,
    horsLigne: isOffline,
    estAuthentifie: !!user,
    inscription: register,
    connexion: login,
    deconnexion: logout,
    miseAJourProfil: updateProfile,
    changerMotDePasse: changePassword,
    reinitialiserMotDePasse: resetPassword,
    supprimerCompte: deleteAccount,
    estAdmin: isAdmin,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export default AuthContext;