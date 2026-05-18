import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const auth = useAuth();
  const estAuthentifie = auth.estAuthentifie ?? auth.isAuthenticated;
  const profil = auth.profil ?? auth.profile;
  const deconnexion = auth.deconnexion ?? auth.logout;
  const navigate = useNavigate();
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  const gererDeconnexion = async () => {
    await deconnexion();
    navigate('/');
    setMenuMobileOuvert(false);
  };

  const fermerMenu = () => setMenuMobileOuvert(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1030 }}>
      {/* 🏛️ BANDEAU PRÉSIDENTIEL OFFICIEL */}
      <div style={{ background: '#0F172A', color: '#FFD700', textAlign: 'center', padding: '0.35rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid #FFD700' }}>
        🏛️ PLATEFORME DE CONSULTATION CITOYENNE — RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
      </div>

      {/* BARRE DE NAVIGATION */}
      <div style={{
        background: 'linear-gradient(135deg, #0D47A1 0%, #0A3D8F 100%)',
        boxShadow: '0 4px 20px rgba(13,71,161,0.3)', backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '64px', padding: '0 1.5rem', maxWidth: '1280px', margin: '0 auto'
        }}>
          
          {/* LOGO */}
          <Link to="/" onClick={fermerMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <img src="/images/logo-drc-map.png" alt="MAONI RDC" style={{ height: '42px', width: 'auto' }} />
            <div>
              <span style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.05em', lineHeight: 1.2 }}>
                MA<span style={{ color: '#FFD700' }}>O</span>NI
              </span>
              <span style={{ color: '#FFD700', fontSize: '0.58rem', display: 'block', fontWeight: 700, letterSpacing: '0.08em', marginTop: '-2px' }}>
                JE PARTICIPE
              </span>
            </div>
          </Link>

          {/* BOUTON MOBILE */}
          <button onClick={() => setMenuMobileOuvert(!menuMobileOuvert)} aria-label="Menu"
            style={{ display: 'none', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
            className="menu-mobile-bouton">
            {[1, 2, 3].map(i => <span key={i} style={{ display: 'block', width: '24px', height: '2px', background: 'white', borderRadius: '2px' }} />)}
          </button>

          {/* NAVIGATION */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className={menuMobileOuvert ? 'menu-mobile-ouvert' : ''}>
            {[
              { to: '/', icone: '🏠', label: 'Accueil', fin: true },
              { to: '/proposals', icone: '📋', label: 'Propositions' },
              { to: '/statistics', icone: '📊', label: 'Statistiques' },
              { to: '/constitution', icone: '📜', label: 'Constitution' },
              { to: '/issues', icone: '⚠️', label: 'Problèmes' },
            ].map((lien) => (
              <NavLink key={lien.to} to={lien.to} end={lien.fin} onClick={fermerMenu}
                style={({ isActive }) => ({
                  color: isActive ? '#FFD700' : 'rgba(255,255,255,0.9)',
                  textDecoration: 'none', fontWeight: isActive ? 700 : 500,
                  padding: '0.45rem 0.8rem', borderRadius: '2rem',
                  fontSize: '0.85rem', transition: 'all 0.2s ease',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent'
                })}>
                <span style={{ marginRight: '0.25rem' }}>{lien.icone}</span>{lien.label}
              </NavLink>
            ))}

            <span style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.2)', margin: '0 0.4rem' }} />

            {estAuthentifie ? (
              <>
                <NavLink to="/profile" onClick={fermerMenu}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    color: 'white', textDecoration: 'none', padding: '0.35rem 0.8rem',
                    borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600,
                    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent'
                  })}>
                  <img src={profil?.portrait_url || '/images/default-avatar.png'} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #FFD700', objectFit: 'cover' }} />
                  {profil?.first_name || 'Mon Profil'}
                </NavLink>
                <button onClick={gererDeconnexion} style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.4rem 0.9rem', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, marginLeft: '0.4rem' }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={fermerMenu} style={{ color: 'white', textDecoration: 'none', padding: '0.45rem 0.9rem', fontSize: '0.85rem', fontWeight: 500 }}>
                  Se connecter
                </NavLink>
                <Link to="/register" onClick={fermerMenu} style={{ background: 'linear-gradient(135deg, #FFD700, #F9A825)', color: '#0D47A1', textDecoration: 'none', padding: '0.5rem 1.2rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 15px rgba(255,215,0,0.35)', marginLeft: '0.4rem' }}>
                  Créer un compte
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .menu-mobile-bouton { display: flex !important; }
          nav:not(.menu-mobile-ouvert) { display: none !important; }
          .menu-mobile-ouvert {
            display: flex !important; flex-direction: column; position: absolute;
            top: 64px; left: 0; right: 0;
            background: linear-gradient(135deg, #0D47A1, #0A3D8F);
            padding: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); gap: 0.5rem !important; z-index: 100;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;