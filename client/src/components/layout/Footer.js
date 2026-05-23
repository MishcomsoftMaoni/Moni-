import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// =============================================
// PIED DE PAGE PRÉSIDENTIEL - Niveau Militaire
// Copyright | Navigation | Sécurité | RDC
// =============================================

const Footer = () => {
  const [dateMiseAJour, setDateMiseAJour] = useState('');
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const actualiserDate = useCallback(() => {
    setDateMiseAJour(new Date().toLocaleString('fr-FR', {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      timeZone: 'Africa/Kinshasa',
      hour12: false
    }));
  }, []);

  useEffect(() => {
    actualiserDate();
    const intervalle = setInterval(actualiserDate, 1000);
    return () => clearInterval(intervalle);
  }, [actualiserDate]);

  const liensNavigation = [
    { to: '/', label: 'Accueil', icon: '🏠' },
    { to: '/proposals', label: 'Propositions', icon: '📋' },
    { to: '/statistics', label: 'Statistiques', icon: '📊' },
    { to: '/submit-proposal', label: 'Soumettre', icon: '✍️' },
    { to: '/terms', label: 'Conditions', icon: '📜' },
    { to: '/privacy', label: 'Confidentialité', icon: '🔒' }
  ];

  const sceauxSecurite = [
    { icone: '🔒', texte: 'Chiffrement AES-256', niveau: 'Militaire' },
    { icone: '🛡️', texte: 'Protection DDoS', niveau: 'Active' },
    { icone: '🇨🇩', texte: 'Hébergement souverain', niveau: 'RDC' },
    { icone: '✅', texte: 'Certification gouvernementale', niveau: 'Niveau 3' },
    { icone: '🔐', texte: '2FA Disponible', niveau: 'Recommandé' },
    { icone: '📡', texte: 'USSD *123#', niveau: 'Hors ligne' }
  ];

  const mentions = [
    { label: 'Mentions légales', href: '/legal' },
    { label: 'Accessibilité', href: '/accessibility' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Contact technique', href: '/contact' }
  ];

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0A0F1A 0%, #0F172A 25%, #1E293B 100%)',
      color: '#CBD5E1',
      padding: '3rem 0 0 0',
      borderTop: '5px solid #FFD700',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Filigrane officiel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        fontSize: '8rem',
        fontWeight: 900,
        opacity: 0.02,
        color: '#FFD700',
        pointerEvents: 'none',
        fontFamily: 'Georgia, serif'
      }}>
        MAONI
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
        
        {/* Grille principale */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>

          {/* Colonne 1: MAONI */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img 
                src="/images/logo-drc-map.png" 
                alt="République Démocratique du Congo" 
                style={{ height: '45px', width: 'auto', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}
              />
              <h4 style={{
                color: '#FFD700',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.6rem',
                margin: 0,
                fontWeight: 800,
                letterSpacing: '2px'
              }}>
                MAONI
              </h4>
            </div>
            
            <p style={{
              color: '#94A3B8',
              lineHeight: 1.7,
              fontSize: '0.85rem',
              marginBottom: '0.75rem'
            }}>
              Plateforme présidentielle de consultation citoyenne pour la réforme constitutionnelle 
              en République Démocratique du Congo.
            </p>
            
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #FFD700, #F59E0B)',
              color: '#0D47A1',
              padding: '0.3rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              🇨🇩 VOIX DU PEUPLE
            </div>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h4 style={{
              color: 'white',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.1rem',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #FFD700',
              display: 'inline-block'
            }}>
              📍 Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {liensNavigation.map(lien => (
                <li key={lien.to}>
                  <Link
                    to={lien.to}
                    style={{
                      color: '#94A3B8',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#FFD700';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#94A3B8';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{lien.icon}</span>
                    <span>{lien.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3: Sceaux de sécurité */}
          <div>
            <h4 style={{
              color: 'white',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.1rem',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #FFD700',
              display: 'inline-block'
            }}>
              🛡️ Sécurité
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {sceauxSecurite.map((sceau, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.3rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{sceau.icone}</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E2E8F0' }}>
                      {sceau.texte}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                      Niveau: {sceau.niveau}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne 4: Contact & Réseaux */}
          <div>
            <h4 style={{
              color: 'white',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.1rem',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #FFD700',
              display: 'inline-block'
            }}>
              📞 Contact
            </h4>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1rem' }}>
              <li style={{ color: '#94A3B8', padding: '0.4rem 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>📍</span> Kinshasa/Gombe, RDC
              </li>
              <li style={{ color: '#94A3B8', padding: '0.4rem 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>📧</span> <a href="mailto:contact@maoni.cd" style={{ color: '#94A3B8', textDecoration: 'none' }}>contact@maoni.cd</a>
              </li>
              <li style={{ color: '#94A3B8', padding: '0.4rem 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>📞</span> <a href="tel:+243896590320" style={{ color: '#94A3B8', textDecoration: 'none' }}>+243 896 590 320</a>
              </li>
              <li style={{ color: '#94A3B8', padding: '0.4rem 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>📡</span> USSD: <strong style={{ color: '#FFD700' }}>*123#</strong>
              </li>
            </ul>

            {/* Réseaux sociaux */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <a
                href="https://web.facebook.com/MaoniRDC"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#94A3B8',
                  fontSize: '1.3rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                📘 Facebook
              </a>
              <a
                href="https://wa.me/243896590320"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#94A3B8',
                  fontSize: '1.3rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#25D366'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bande de certification */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          padding: '1rem 0',
          borderTop: '1px solid rgba(255,215,0,0.15)',
          borderBottom: '1px solid rgba(255,215,0,0.15)',
          marginBottom: '1.5rem',
          background: 'rgba(255,215,0,0.02)'
        }}>
          {[
            { icone: '🏛️', texte: 'Plateforme Présidentielle' },
            { icone: '⚖️', texte: 'Conforme à la Loi n°22/012' },
            { icone: '🔬', texte: 'Audit de sécurité 2026' },
            { icone: '📜', texte: 'Version 100.0.4' }
          ].map((cert, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#94A3B8',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.3px'
            }}>
              <span style={{ fontSize: '0.9rem' }}>{cert.icone}</span>
              <span>{cert.texte}</span>
            </div>
          ))}
        </div>

        {/* Mentions légales */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem'
        }}>
          {mentions.map(mention => (
            <Link
              key={mention.label}
              to={mention.href}
              style={{
                color: '#64748B',
                textDecoration: 'none',
                fontSize: '0.7rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
            >
              {mention.label}
            </Link>
          ))}
        </div>

        {/* Barre inférieure */}
        <div style={{ textAlign: 'center', paddingBottom: '1.5rem' }}>
          <p style={{
            fontSize: '0.7rem',
            color: '#64748B',
            margin: '0 0 0.5rem',
            fontFamily: 'monospace',
            letterSpacing: '0.5px'
          }}>
            🔐 Dernière mise à jour sécurisée : {dateMiseAJour} (Heure de Kinshasa) • UTC+1
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#94A3B8',
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ color: '#FFD700', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              🇨🇩 Fabriqué en République Démocratique du Congo
            </span>
            <span style={{ color: '#475569' }}>|</span>
            <span>MAONI © {annee}</span>
            <span style={{ color: '#475569' }}>|</span>
            <span>Tous droits réservés</span>
            <span style={{ color: '#475569' }}>|</span>
            <span style={{ color: '#FFD700', fontWeight: 600 }}>MISHCOMSOFT SASU</span>
          </p>
          <p style={{
            fontSize: '0.65rem',
            color: '#475569',
            marginTop: '0.5rem',
            letterSpacing: '0.3px'
          }}>
            Conformité • Transparence • Intégrité Républicaine
          </p>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #FFD700, #F59E0B, #FFD700, transparent)',
        animation: 'shine 3s linear infinite'
      }} />

      <style>
        {`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;