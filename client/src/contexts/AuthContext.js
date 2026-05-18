import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user.id); }
      else setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user.id); }
      else { setUser(null); setProfile(null); }
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
    return () => {
      window.removeEventListener('online', () => setIsOffline(false));
      window.removeEventListener('offline', () => setIsOffline(true));
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      // Use maybeSingle instead of single to avoid 406
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) setProfile(data);
    } catch (err) { console.error('Profile fetch error:', err); }
    finally { setLoading(false); }
  };

  const register = async (formData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
        options: { data: { first_name: formData.prenom || formData.first_name, last_name: formData.nom || formData.last_name } }
      });
      if (authError) throw authError;

      let portraitUrl = null;
      if (formData.portrait) {
        const fileName = authData.user.id + '_' + Date.now() + '.jpg';
        await supabase.storage.from('portraits').upload(fileName, formData.portrait);
        const { data: urlData } = supabase.storage.from('portraits').getPublicUrl(fileName);
        portraitUrl = urlData.publicUrl;
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id, email: formData.email,
        first_name: formData.prenom || formData.first_name,
        last_name: formData.nom || formData.last_name,
        age_range: formData.trancheAge || formData.age_range,
        profession: formData.profession, phone: formData.telephone || formData.phone,
        portrait_url: portraitUrl, province: formData.province,
        diaspora: formData.diaspora || false,
        other_residence: formData.autreResidence || formData.other_residence || null,
        role: 'citizen', language_preference: 'fr'
      });
      if (profileError) throw profileError;
      
      return { success: true, succes: true };
    } catch (err) { return { success: false, succes: false, error: err.message, erreur: err.message }; }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) throw error;
      return { success: true, succes: true, data };
    } catch (err) { return { success: false, succes: false, error: err.message, erreur: err.message }; }
  };

  const logout = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); };

  return React.createElement(AuthContext.Provider, {
    value: {
      // English names
      user, profile, loading, isOffline, register, login, logout,
      isAuthenticated: !!user,
      // French names
      utilisateur: user, profil: profile, chargement: loading, horsLigne: isOffline,
      inscription: register, connexion: login, deconnexion: logout,
      estAuthentifie: !!user,
    }
  }, children);
};

export default AuthContext;