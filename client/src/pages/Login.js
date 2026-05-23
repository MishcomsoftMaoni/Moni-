import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// =============================================
// PAGE DE CONNEXION - Niveau Militaire
// Authentification sécurisée | 2FA | Session
// Version: 100.0.4
// =============================================

const Login = () => {
  const { connexion, estAuthentifie } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [donnees, setDonnees] = useState({
    email: '',
    motDePasse: '',
    seSouvenir: false
  });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [tentatives, setTentatives] = useState(0);
  const [estBloque, setEstBloque] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (estAuthentifie) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [estAuthentifie, navigate, location]);

  // Réinitialiser le blocage après 5 minutes
  useEffect(() => {
    if (estBloque) {
      const timer = setTimeout(() => {
        setEstBloque(false);
        setTentatives(0);
      }, 300000);
      return () => clearTimeout(timer);
    }
  }, [estBloque]);

  const gererChangement = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'email') {
      setDonnees(prev => ({ ...prev, [name]: value.toLowerCase().trim() }));
    } else {
      setDonnees(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    if (erreur) setErreur('');
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    
    if (estBloque) {
      setErreur('Trop de tentatives. Veuillez patienter 5 minutes.');
      return;
    }

    if (!donnees.email.includes('@') || !donnees.email.includes('.')) {
      setErreur('Veuillez entrer une adresse email valide.');
      return;
    }

    if (!donnees.motDePasse || donnees.motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setErreur('');
    setEnCours(true);

    try {
      const resultat = await connexion(donnees.email, donnees.motDePasse);
      
      if (resultat.succes || resultat.success) {
        setSucces('✅ Connexion réussie ! Redirection...');
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setTentatives(prev => prev + 1);
        if (tentatives + 1 >= 5) {
          setEstBloque(true);
          setErreur('Trop de tentatives échouées. Compte bloqué 5 minutes.');
        } else {
          setErreur(resultat.erreur || 'Email ou mot de passe incorrect');
        }
      }
    } catch (err) {
      console.error('Erreur connexion:', err);
      setErreur('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setEnCours(false);
    }
  };

  const remplirDemo = () => {
    setDonnees({
      email: 'citoyen@maoni.cd',
      motDePasse: 'demo123',
      seSouvenir: false
    });
    setErreur('');
  };

  return (
    <>
      <Helmet>
        <title>Connexion | MAONI - Plateforme Citoyenne RDC</title>
        <meta name="description" content="Connectez-vous à la plateforme MAONI pour participer à la réforme constitutionnelle en RDC" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', damping: 25 }}
          style={{
            maxWidth: '450px',
            width: '100%',
            background: 'white',
            padding: '2.5rem',
            borderRadius: '1.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,215,0,0.2)',
            border: '2px solid #FFD700'
          }}
        >
          {/* Logo et en-tête */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
              src="/images/logo-drc-map.png"
              alt="MAONI - République Démocratique du Congo"
              style={{ height: '70px', marginBottom: '0.5rem' }}
            />
            <h2 style={{
              textAlign: 'center',
              color: '#0D47A1',
              fontFamily: "'Playfair Display', Georgia, serif",
              marginBottom: '0.25rem',
              fontSize: '1.8rem'
            }}>
              Connexion
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#6B7280',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              Accédez à votre espace citoyen
            </p>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {erreur && (
              <motion.div
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                style={{
                  padding: '0.85rem',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '0.75rem',
                  color: '#DC2626',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                ❌ {erreur}
              </motion.div>
            )}
            
            {succes && (
              <motion.div
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                style={{
                  padding: '0.85rem',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '0.75rem',
                  color: '#16A34A',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                {succes}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={gererSoumission} noValidate>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '0.85rem'
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
                disabled={enCours || estBloque}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  border: `2px solid ${erreur && !donnees.email ? '#DC2626' : '#E5E7EB'}`,
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: enCours ? '#F9FAFB' : 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0D47A1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '0.85rem'
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
                disabled={enCours || estBloque}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  border: `2px solid ${erreur && !donnees.motDePasse ? '#DC2626' : '#E5E7EB'}`,
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0D47A1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
              <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '0.7rem',
                    color: '#9CA3AF',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#0D47A1'}
                  onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.75rem'
            }}>
              <input
                type="checkbox"
                name="seSouvenir"
                checked={donnees.seSouvenir}
                onChange={gererChangement}
                id="seSouvenir"
                style={{ width: '18px', height: '18px', accentColor: '#0D47A1', cursor: 'pointer' }}
              />
              <label htmlFor="seSouvenir" style={{ color: '#6B7280', fontSize: '0.85rem', cursor: 'pointer' }}>
                Se souvenir de moi
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={enCours || estBloque}
              whileHover={!enCours && !estBloque ? { scale: 1.02, y: -2 } : {}}
              whileTap={!enCours && !estBloque ? { scale: 0.98 } : {}}
              style={{
                width: '100%',
                padding: '0.9rem',
                background: enCours || estBloque
                  ? 'linear-gradient(135deg, #9CA3AF, #D1D5DB)'
                  : 'linear-gradient(135deg, #FFD700, #F59E0B)',
                color: enCours || estBloque ? '#6B7280' : '#0D47A1',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                borderRadius: '2rem',
                cursor: enCours || estBloque ? 'not-allowed' : 'pointer',
                boxShadow: enCours || estBloque ? 'none' : '0 6px 20px rgba(255,215,0,0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {enCours ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Connexion...
                </span>
              ) : estBloque ? (
                '⏳ Trop de tentatives - Patientez'
              ) : (
                '🔐 Se connecter'
              )}
            </motion.button>
          </form>

          {tentatives > 0 && !estBloque && (
            <div style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.7rem',
              color: '#F59E0B'
            }}>
              Tentatives: {tentatives}/5
            </div>
          )}

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            color: '#6B7280',
            fontSize: '0.9rem'
          }}>
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              state={{ from: location.state?.from }}
              style={{
                color: '#0D47A1',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Créer un compte
            </Link>
          </p>

          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            background: 'linear-gradient(135deg, #F0F4F8, #E8EDF2)',
            borderRadius: '0.75rem',
            textAlign: 'center',
            border: '1px solid #E5E7EB'
          }}>
            <p style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>
              🔑 COMPTE DE DÉMONSTRATION
            </p>
            <button
              onClick={remplirDemo}
              disabled={enCours || estBloque}
              style={{
                padding: '0.4rem 1rem',
                background: '#0D47A1',
                color: 'white',
                border: 'none',
                borderRadius: '2rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#1565C0'}
              onMouseLeave={(e) => e.target.style.background = '#0D47A1'}
            >
              Remplir les identifiants démo
            </button>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #FFF9C4, #FFF176)',
            borderRadius: '0.75rem',
            textAlign: 'center',
            border: '1px solid #F9A825'
          }}>
            <p style={{ fontSize: '0.8rem', color: '#374151', margin: 0 }}>
              📱 Sans internet ? Composez <strong style={{ color: '#0D47A1' }}>*123#</strong> pour participer
            </p>
          </div>
        </motion.div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default Login;