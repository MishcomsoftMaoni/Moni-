import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// =============================================
// EN-TÊTE PRÉSIDENTIEL - Niveau Militaire
// Navigation | Authentification | Design RDC
// =============================================

const Header = () => {
  const auth = useAuth();
  const estAuthentifie = auth.estAuthentifie ?? auth.isAuthenticated;
  const chargement = auth.chargement ?? auth.loading;
  const profil = auth.profil ?? auth.profile;
  const deconnexion = auth.deconnexion ?? auth.logout;
  const navigate = useNavigate();
  const location = useLocation();
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);
  const [heureActuelle, setHeureActuelle] = useState('');
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);

  // Heure en temps réel (Kinshasa)
  useEffect(() => {
    const actualiserHeure = () => {
      setHeureActuelle(new Date().toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Kinshasa'
      }));
    };
    actualiserHeure();
    const intervalle = setInterval(actualiserHeure, 60000);
    return () => clearInterval(intervalle);
  }, []);

  // Notifications
  useEffect(() => {
    if (estAuthentifie) {
      setNotificationsNonLues(Math.floor(Math.random() * 3));
    }
  }, [estAuthentifie]);

  const gererDeconnexion = useCallback(async () => {
    await deconnexion();
    navigate('/');
    setMenuMobileOuvert(false);
  }, [deconnexion, navigate]);

  const fermerMenu = useCallback(() => setMenuMobileOuvert(false), []);

  // Fermer le menu au changement de route
  useEffect(() => {
    fermerMenu();
  }, [location.pathname, fermerMenu]);

  // Fermer le menu au redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuMobileOuvert) {
        setMenuMobileOuvert(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuMobileOuvert]);

  const liensNavigation = [
    { to: '/', icone: '🏠', label: 'Accueil', fin: true, description: "Page d'accueil" },
    { to: '/proposals', icone: '📋', label: 'Propositions', description: 'Consulter et voter' },
    { to: '/statistics', icone: '📊', label: 'Statistiques', description: 'Tendances nationales' },
    { to: '/constitution', icone: '📜', label: 'Constitution', description: 'Texte fondamental' },
    { to: '/issues', icone: '⚠️', label: 'Signalements', description: 'Problèmes identifiés' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1030 }}>
      
      {/* BANDEAU PRÉSIDENTIEL OFFICIEL */}
      <div style={{
        background: 'linear-gradient(90deg, #0A0F1A, #0F172A, #0A0F1A)',
        color: '#FFD700',
        textAlign: 'center',
        padding: '0.4rem 1rem',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        borderBottom: '1px solid rgba(255,215,0,0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <span>🏛️ PLATEFORME DE CONSULTATION CITOYENNE — RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
        <span style={{
          fontSize: '0.65rem',
          background: 'rgba(255,215,0,0.15)',
          padding: '0.15rem 0.6rem',
          borderRadius: '1rem'
        }}>
          🕐 {heureActuelle} | Kinshasa
        </span>
      </div>

      {/* BARRE DE NAVIGATION PRINCIPALE */}
      <div style={{
        background: 'linear-gradient(135deg, #0B2B5B 0%, #0D47A1 50%, #0A3D8F 100%)',
        boxShadow: '0 6px 25px rgba(13,71,161,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        position: 'relative'
      }}>
        
        {/* Filigrane militaire */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '5rem',
          fontWeight: 900,
          opacity: 0.02,
          color: '#FFD700',
          pointerEvents: 'none',
          fontFamily: 'Georgia, serif',
          whiteSpace: 'nowrap'
        }}>
          MAONI • RDC • 2026
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
          padding: '0 2rem',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          
          {/* LOGO ET IDENTITÉ */}
          <Link
            to="/"
            onClick={fermerMenu}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img
              src="/images/logo-drc-map.png"
              alt="MAONI - République Démocratique du Congo"
              style={{
                height: '48px',
                width: 'auto',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))'
              }}
            />
            <div>
              <div style={{
                color: 'white',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                lineHeight: 1.2,
                textShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                MA<span style={{ color: '#FFD700' }}>O</span>NI
              </div>
              <div style={{
                color: '#FFD700',
                fontSize: '0.55rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                marginTop: '-3px',
                textTransform: 'uppercase'
              }}>
                ⚜️ VOIX DU PEUPLE ⚜️
              </div>
            </div>
          </Link>

          {/* BOUTON MENU MOBILE */}
          <button
            onClick={() => setMenuMobileOuvert(!menuMobileOuvert)}
            aria-label="Menu principal"
            aria-expanded={menuMobileOuvert}
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '6px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              padding: '0.6rem',
              transition: 'all 0.2s ease'
            }}
            className="menu-mobile-bouton"
          >
            <span style={{ display: 'block', width: '22px', height: '2px', background: '#FFD700', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '22px', height: '2px', background: '#FFD700', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '22px', height: '2px', background: '#FFD700', borderRadius: '2px' }} />
          </button>

          {/* NAVIGATION */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              flexWrap: 'wrap'
            }}
            className={menuMobileOuvert ? 'menu-mobile-ouvert' : ''}
          >
            {liensNavigation.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.fin}
                onClick={fermerMenu}
                title={lien.description}
                style={({ isActive }) => ({
                  color: isActive ? '#FFD700' : 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500,
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: isActive ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))' : 'transparent',
                  border: isActive ? '1px solid rgba(255,215,0,0.3)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                })}
              >
                <span style={{ fontSize: '0.9rem' }}>{lien.icone}</span>
                <span>{lien.label}</span>
              </NavLink>
            ))}

            {/* Séparateur */}
            <span style={{
              width: '1px',
              height: '30px',
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.3), transparent)',
              margin: '0 0.5rem'
            }} />

            {/* SECTION AUTHENTIFICATION */}
            {estAuthentifie ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Notification badge */}
                {notificationsNonLues > 0 && (
                  <Link
                    to="/notifications"
                    style={{
                      position: 'relative',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>🔔</span>
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: '#DC2626',
                      color: 'white',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '1rem',
                      minWidth: '18px',
                      textAlign: 'center'
                    }}>
                      {notificationsNonLues}
                    </span>
                  </Link>
                )}

                {/* Profil utilisateur */}
                <NavLink
                  to="/profile"
                  onClick={fermerMenu}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '0.35rem 0.9rem',
                    borderRadius: '2rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: isActive ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.2s ease'
                  })}
                >
                  <img
                    src={profil?.portrait_url || '/images/default-avatar.png'}
                    alt={`${profil?.first_name || 'Citoyen'}`}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '2px solid #FFD700',
                      objectFit: 'cover',
                      background: '#F3F4F6'
                    }}
                  />
                  <span>{profil?.first_name || 'Mon Profil'}</span>
                </NavLink>

                {/* Déconnexion */}
                <button
                  onClick={gererDeconnexion}
                  style={{
                    background: 'rgba(220,38,38,0.15)',
                    color: '#FCA5A5',
                    border: '1px solid rgba(220,38,38,0.4)',
                    padding: '0.4rem 1rem',
                    borderRadius: '2rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(220,38,38,0.3)';
                    e.currentTarget.style.color = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(220,38,38,0.15)';
                    e.currentTarget.style.color = '#FCA5A5';
                  }}
                >
                  <span>🚪</span> Quitter
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <NavLink
                  to="/login"
                  onClick={fermerMenu}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '0.45rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    borderRadius: '2rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔐 Se connecter
                </NavLink>
                <Link
                  to="/register"
                  onClick={fermerMenu}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #F59E0B)',
                    color: '#0D47A1',
                    textDecoration: 'none',
                    padding: '0.5rem 1.3rem',
                    borderRadius: '2rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,215,0,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,215,0,0.4)';
                  }}
                >
                  <span>✨</span> Créer un compte
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* STYLES MOBILE */}
      <style>{`
        @media (max-width: 900px) {
          .menu-mobile-bouton {
            display: flex !important;
          }
          
          nav:not(.menu-mobile-ouvert) {
            display: none !important;
          }
          
          .menu-mobile-ouvert {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #0B2B5B, #0D47A1);
            padding: 1.2rem;
            box-shadow: 0 15px 35px rgba(0,0,0,0.4);
            gap: 0.75rem !important;
            z-index: 100;
            border-top: 2px solid #FFD700;
            border-bottom: 1px solid rgba(255,215,0,0.2);
          }
          
          .menu-mobile-ouvert a,
          .menu-mobile-ouvert button,
          .menu-mobile-ouvert div {
            width: 100%;
            justify-content: flex-start;
          }
          
          .menu-mobile-ouvert .nav-link {
            padding: 0.6rem 1rem;
            width: 100%;
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .menu-mobile-ouvert {
          animation: slideDown 0.3s ease-out;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1E293B;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #FFD700;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #F59E0B;
        }
      `}</style>
    </header>
  );
};

export default Header;