import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { connexion } = useAuth();
  const navigate = useNavigate();

  const [donnees, setDonnees] = useState({
    email: '',
    motDePasse: '',
    seSouvenir: false
  });
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  const gererChangement = (e) => {
    const { name, value, type, checked } = e.target;
    setDonnees(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnCours(true);

    try {
      const resultat = await connexion(donnees.email, donnees.motDePasse);
      if (resultat.succes) {
        navigate('/');
      } else {
        setErreur(resultat.erreur || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setErreur('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Connexion | MAONI</title>
        <meta name="description" content="Connectez-vous à la plateforme MAONI pour participer à la réforme constitutionnelle" />
      </Helmet>

      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem 1rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '440px', width: '100%', background: 'white',
            padding: '2.5rem', borderRadius: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img
              src="/images/logo-drc-map.png"
              alt="MAONI"
              style={{ height: '65px' }}
            />
          </div>

          <h2 style={{
            textAlign: 'center', color: '#0D47A1',
            fontFamily: 'Georgia, serif', marginBottom: '0.25rem'
          }}>
            Se connecter
          </h2>
          <p style={{
            textAlign: 'center', color: '#6B7280',
            marginBottom: '2rem', fontSize: '0.95rem'
          }}>
            Bienvenue sur la plateforme citoyenne
          </p>

          {/* Message d'erreur */}
          {erreur && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '0.75rem', background: '#FEF2F2',
                border: '1px solid #FECACA', borderRadius: '0.75rem',
                color: '#DC2626', marginBottom: '1.5rem',
                textAlign: 'center', fontSize: '0.9rem'
              }}
            >
              ❌ {erreur}
            </motion.div>
          )}

          <form onSubmit={gererSoumission} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block', fontWeight: 600, color: '#374151',
                marginBottom: '0.4rem', fontSize: '0.9rem'
              }}>
                Adresse email <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={donnees.email}
                onChange={gererChangement}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                autoFocus
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  border: '2px solid #E5E7EB', borderRadius: '0.75rem',
                  fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0D47A1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{
                display: 'block', fontWeight: 600, color: '#374151',
                marginBottom: '0.4rem', fontSize: '0.9rem'
              }}>
                Mot de passe <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="password"
                name="motDePasse"
                value={donnees.motDePasse}
                onChange={gererChangement}
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  border: '2px solid #E5E7EB', borderRadius: '0.75rem',
                  fontSize: '1rem', outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0D47A1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Se souvenir */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <input
                type="checkbox"
                name="seSouvenir"
                checked={donnees.seSouvenir}
                onChange={gererChangement}
                id="seSouvenir"
                style={{ width: '18px', height: '18px', accentColor: '#0D47A1' }}
              />
              <label htmlFor="seSouvenir" style={{ color: '#6B7280', fontSize: '0.9rem', cursor: 'pointer' }}>
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton connexion */}
            <motion.button
              type="submit"
              disabled={enCours}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '0.85rem',
                background: 'linear-gradient(135deg, #FFD700, #F9A825)',
                color: '#0D47A1', fontWeight: 700, fontSize: '1rem',
                border: 'none', borderRadius: '2rem', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {enCours ? '⏳ Connexion...' : '🔑 Se connecter'}
            </motion.button>
          </form>

          {/* Lien inscription */}
          <p style={{
            textAlign: 'center', marginTop: '1.5rem',
            color: '#6B7280', fontSize: '0.95rem'
          }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#0D47A1', fontWeight: 700, textDecoration: 'none' }}>
              Créer un compte
            </Link>
          </p>

          {/* Info USSD */}
          <div style={{
            marginTop: '1.5rem', padding: '0.75rem',
            background: 'linear-gradient(135deg, #FFF9C4, #FFF176)',
            borderRadius: '0.75rem', textAlign: 'center',
            border: '1px solid #F9A825'
          }}>
            <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0 }}>
              📱 Sans internet ? Composez <strong>*123#</strong> pour participer
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;