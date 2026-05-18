import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [dateMiseAJour, setDateMiseAJour] = useState('');

  useEffect(() => {
    const actualiserDate = () => {
      setDateMiseAJour(new Date().toLocaleString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Africa/Kinshasa'
      }));
    };
    actualiserDate();
    const intervalle = setInterval(actualiserDate, 1000);
    return () => clearInterval(intervalle);
  }, []);

  return (
    <footer style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#CBD5E1', padding: '3rem 0 0 0', borderTop: '5px solid #FFD700' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Grille principale */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

          {/* MAONI */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <img src="/images/logo-drc-map.png" alt="DRC" style={{ height: '35px' }} />
              <h4 style={{ color: '#FFD700', fontFamily: 'Georgia, serif', fontSize: '1.3rem', margin: 0 }}>MAONI</h4>
            </div>
            <p style={{ color: '#94A3B8', lineHeight: 1.7, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              Plateforme nationale de consultation citoyenne pour la réforme constitutionnelle en République Démocratique du Congo.
            </p>
            <span style={{ color: '#FFD700', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>JE PARTICIPE</span>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '1.05rem', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #FFD700', display: 'inline-block' }}>Navigation</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { to: '/', label: 'Accueil' },
                { to: '/proposals', label: 'Propositions' },
                { to: '/statistics', label: 'Statistiques' },
                { to: '/terms', label: 'Conditions d\'utilisation' },
                { to: '/privacy', label: 'Politique de confidentialité' },
              ].map(lien => (
                <li key={lien.to}>
                  <Link to={lien.to} style={{ color: '#94A3B8', textDecoration: 'none', display: 'block', padding: '0.3rem 0', fontSize: '0.88rem', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.target.style.color = '#FFD700'; e.target.style.paddingLeft = '6px'; }}
                    onMouseLeave={e => { e.target.style.color = '#94A3B8'; e.target.style.paddingLeft = '0'; }}>
                    › {lien.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Réseaux */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '1.05rem', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #FFD700', display: 'inline-block' }}>Nous Suivre</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <a href="https://web.facebook.com/MaoniRDC" target="_blank" rel="noopener noreferrer" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', fontSize: '0.88rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#FFD700'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                  <span style={{ fontSize: '1.1rem' }}>📘</span> Facebook
                </a>
              </li>
              <li>
                <a href="https://wa.me/243896590320" target="_blank" rel="noopener noreferrer" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', fontSize: '0.88rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#FFD700'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                  <span style={{ fontSize: '1.1rem' }}>💬</span> WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '1.05rem', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #FFD700', display: 'inline-block' }}>Contact</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ color: '#94A3B8', padding: '0.3rem 0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📍</span> Kinshasa, RDC</li>
              <li style={{ color: '#94A3B8', padding: '0.3rem 0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📧</span> contact@maoni.cd</li>
              <li style={{ color: '#94A3B8', padding: '0.3rem 0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📞</span> +243 896 590 320</li>
              <li style={{ color: '#94A3B8', padding: '0.3rem 0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🌐</span> www.maoni.cd</li>
            </ul>
          </div>
        </div>

        {/* Sceaux de sécurité */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '1.25rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.25rem' }}>
          {[
            { icone: '🔒', texte: 'Chiffrement SSL/TLS 256-bit' },
            { icone: '🛡️', texte: 'Protection RGPD conforme' },
            { icone: '🇨🇩', texte: 'Données hébergées en RDC' },
            { icone: '✅', texte: 'Plateforme vérifiée et sécurisée' }
          ].map((sceau, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.73rem', fontWeight: 600 }}>
              <span style={{ fontSize: '1rem' }}>{sceau.icone}</span> {sceau.texte}
            </div>
          ))}
        </div>

        {/* Barre inférieure */}
        <div style={{ textAlign: 'center', paddingBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.4rem' }}>
            Dernière mise à jour : {dateMiseAJour} (Heure de Kinshasa)
          </p>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
            <span style={{ color: '#FFD700', fontWeight: 700 }}>🇨🇩 Fabriqué en République Démocratique du Congo</span>
            <span style={{ margin: '0 0.5rem', color: '#475569' }}>|</span>
            MAONI © {new Date().getFullYear()}
            <span style={{ margin: '0 0.5rem', color: '#475569' }}>|</span>
            Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;