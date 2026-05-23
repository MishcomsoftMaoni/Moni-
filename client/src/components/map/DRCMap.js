import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// =============================================
// CARTE INTERACTIVE DE LA RDC - Niveau Militaire
// 26 provinces | Données officielles | Participation en temps réel
// =============================================

// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// =============================================
// DONNÉES GÉOGRAPHIQUES OFFICIELLES
// =============================================
const COORDONNEES_PROVINCES = {
  'Kinshasa': { lat: -4.325, lng: 15.322, capitale: true },
  'Nord-Kivu': { lat: -0.791, lng: 29.045, zone: 'Est' },
  'Sud-Kivu': { lat: -3.011, lng: 28.629, zone: 'Est' },
  'Ituri': { lat: 1.565, lng: 29.949, zone: 'Est' },
  'Haut-Uélé': { lat: 3.066, lng: 27.401, zone: 'Nord-Est' },
  'Tshopo': { lat: 0.516, lng: 25.199, zone: 'Nord-Est' },
  'Bas-Uélé': { lat: 3.481, lng: 25.551, zone: 'Nord' },
  'Équateur': { lat: 0.058, lng: 18.433, zone: 'Nord-Ouest' },
  'Sud-Ubangi': { lat: 2.826, lng: 19.230, zone: 'Nord-Ouest' },
  'Nord-Ubangi': { lat: 4.091, lng: 21.605, zone: 'Nord' },
  'Mongala': { lat: 2.156, lng: 21.510, zone: 'Nord-Ouest' },
  'Tshuapa': { lat: -0.793, lng: 21.878, zone: 'Ouest' },
  'Maniema': { lat: -3.020, lng: 26.583, zone: 'Est' },
  'Kasaï': { lat: -5.349, lng: 21.415, zone: 'Centre' },
  'Kasaï-Central': { lat: -5.893, lng: 21.419, zone: 'Centre' },
  'Kasaï-Oriental': { lat: -5.969, lng: 23.479, zone: 'Centre' },
  'Lomami': { lat: -6.141, lng: 24.483, zone: 'Centre' },
  'Sankuru': { lat: -4.293, lng: 23.644, zone: 'Centre' },
  'Tanganyika': { lat: -5.989, lng: 29.065, zone: 'Sud-Est' },
  'Haut-Lomami': { lat: -8.721, lng: 24.664, zone: 'Sud-Est' },
  'Lualaba': { lat: -10.078, lng: 24.510, zone: 'Sud' },
  'Haut-Katanga': { lat: -10.979, lng: 26.734, zone: 'Sud-Est' },
  'Kwango': { lat: -5.914, lng: 17.559, zone: 'Ouest' },
  'Kwilu': { lat: -5.039, lng: 18.819, zone: 'Ouest' },
  'Mai-Ndombe': { lat: -1.874, lng: 19.140, zone: 'Ouest' },
  'Kongo Central': { lat: -5.354, lng: 14.297, zone: 'Ouest' }
};

// =============================================
// SEUILS DE PARTICIPATION (Niveau militaire)
// =============================================
const NIVEAUX_PARTICIPATION = [
  { min: 500, couleur: '#B91C1C', taille: 48, etiquette: 'CRITIQUE', icone: '⚠️', alerte: true },
  { min: 200, couleur: '#DC2626', taille: 42, etiquette: 'TRÈS ÉLEVÉE', icone: '🔴', alerte: false },
  { min: 100, couleur: '#F97316', taille: 36, etiquette: 'ÉLEVÉE', icone: '🟠', alerte: false },
  { min: 50, couleur: '#F59E0B', taille: 30, etiquette: 'MODÉRÉE', icone: '🟡', alerte: false },
  { min: 20, couleur: '#10B981', taille: 24, etiquette: 'FAIBLE', icone: '🟢', alerte: false },
  { min: 5, couleur: '#6B7280', taille: 20, etiquette: 'MINIMALE', icone: '⚪', alerte: false },
  { min: 0, couleur: '#9CA3AF', taille: 16, etiquette: 'NÉANTE', icone: '◻️', alerte: false }
];

// Population par province (données officielles)
const POPULATIONS_PROVINCES = {
  'Kinshasa': 14565700,
  'Nord-Kivu': 6655000,
  'Sud-Kivu': 5772000,
  'Ituri': 3650000,
  'Haut-Uélé': 1864000,
  'Tshopo': 2352000,
  'Bas-Uélé': 1138000,
  'Équateur': 1628000,
  'Sud-Ubangi': 2458000,
  'Nord-Ubangi': 1269000,
  'Mongala': 1740000,
  'Tshuapa': 1329000,
  'Maniema': 2333000,
  'Kasaï': 2801000,
  'Kasaï-Central': 2817000,
  'Kasaï-Oriental': 3145000,
  'Lomami': 2443000,
  'Sankuru': 2110000,
  'Tanganyika': 2982000,
  'Haut-Lomami': 2957000,
  'Lualaba': 2570000,
  'Haut-Katanga': 4617000,
  'Kwango': 2152000,
  'Kwilu': 5490000,
  'Mai-Ndombe': 1852000,
  'Kongo Central': 5575000
};

const obtenirNiveau = (count) => {
  for (const niveau of NIVEAUX_PARTICIPATION) {
    if (count >= niveau.min) return niveau;
  }
  return NIVEAUX_PARTICIPATION[NIVEAUX_PARTICIPATION.length - 1];
};

const creerIconePersonnalisee = (province) => {
  const niveau = obtenirNiveau(province.count || 0);
  const taille = niveau.taille;
  
  const animationPulsation = niveau.alerte ? `
    animation: pulse-${province.name.replace(/\s/g, '')} 1.5s ease-in-out infinite;
    @keyframes pulse-${province.name.replace(/\s/g, '')} {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 4px ${niveau.couleur}33; }
      50% { transform: scale(1.1); box-shadow: 0 0 0 12px ${niveau.couleur}66; }
    }
  ` : '';
  
  return L.divIcon({
    className: 'marqueur-province',
    html: `
      <div style="
        width: ${taille}px; height: ${taille}px;
        background: radial-gradient(circle at 30% 30%, ${niveau.couleur}, ${niveau.couleur}CC);
        border: 3px solid ${niveau.alerte ? '#FFD700' : 'white'};
        border-radius: 50%;
        box-shadow: 0 0 25px rgba(0,0,0,0.4), 0 0 0 4px ${niveau.couleur}44;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white; font-weight: 800;
        font-size: ${taille > 35 ? '14px' : taille > 25 ? '11px' : '9px'};
        cursor: pointer; transition: all 0.2s ease;
        font-family: 'Inter', monospace;
        ${niveau.alerte ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
      ">
        <span>${province.count || 0}</span>
        ${niveau.alerte ? '<span style="font-size: 8px; margin-top: -2px;">!</span>' : ''}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 4px ${niveau.couleur}44; }
          50% { transform: scale(1.15); box-shadow: 0 0 0 14px ${niveau.couleur}66; }
        }
      </style>
    `,
    iconSize: [taille + 12, taille + 12],
    iconAnchor: [taille / 2 + 6, taille / 2 + 6],
    popupAnchor: [0, -taille / 2 - 8]
  });
};

const LIMITES_RDC = [[-13.5, 11.5], [5.5, 31.5]];

const AjusterCarte = () => {
  const carte = useMap();
  useEffect(() => {
    carte.fitBounds(LIMITES_RDC);
    carte.setMinZoom(4);
    carte.setMaxZoom(9);
  }, [carte]);
  return null;
};

const DRCMap = ({ provinces = [], onProvinceSelect }) => {
  const [provinceSelectionnee, setProvinceSelectionnee] = useState(null);
  const mapRef = useRef(null);

  const provincesEnrichies = useMemo(() => {
    return provinces.map(province => ({
      ...province,
      population: POPULATIONS_PROVINCES[province.name] || 1000000,
      participationRate: province.population 
        ? ((province.count / province.population) * 100).toFixed(2)
        : 0,
      coordonnees: COORDONNEES_PROVINCES[province.name]
    })).filter(p => p.coordonnees);
  }, [provinces]);

  const handleProvinceClick = useCallback((province) => {
    setProvinceSelectionnee(province);
    if (onProvinceSelect) onProvinceSelect(province);
  }, [onProvinceSelect]);

  const totalCitoyens = provincesEnrichies.reduce((acc, p) => acc + (p.count || 0), 0);
  const provincesAlerte = provincesEnrichies.filter(p => obtenirNiveau(p.count || 0).alerte).length;

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Bandeau de statistiques */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)',
        borderRadius: '0.75rem',
        padding: '0.5rem 1rem',
        color: 'white',
        border: '1px solid rgba(255,215,0,0.3)',
        fontSize: '0.7rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div>🗺️ {provincesEnrichies.length}/26 provinces</div>
        <div>👥 {totalCitoyens.toLocaleString('fr-FR')} citoyens</div>
        {provincesAlerte > 0 && (
          <div style={{ color: '#F87171' }}>⚠️ {provincesAlerte} zones critiques</div>
        )}
      </div>

      {/* Carte principale */}
      <div style={{
        height: '560px',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 3px #0D47A1, 0 0 0 6px rgba(255,215,0,0.3)',
        border: '2px solid #FFD700'
      }}>
        <MapContainer
          ref={mapRef}
          center={[-4.0, 21.0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <AjusterCarte />
          
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> | Données géographiques RDC'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {provincesEnrichies.map((province) => {
            const coords = province.coordonnees;
            if (!coords) return null;
            
            const niveau = obtenirNiveau(province.count || 0);
            
            return (
              <Marker
                key={province.name}
                position={[coords.lat, coords.lng]}
                icon={creerIconePersonnalisee(province)}
                eventHandlers={{ click: () => handleProvinceClick(province) }}
              >
                <Popup>
                  <div style={{
                    padding: '0.6rem',
                    minWidth: '250px',
                    fontFamily: "'Inter', sans-serif",
                    background: 'linear-gradient(135deg, #FFFFFF, #F8FAFC)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      borderBottom: '2px solid #FFD700',
                      paddingBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>{niveau.icone}</span>
                      <h3 style={{
                        color: '#0D47A1',
                        margin: 0,
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.1rem',
                        fontWeight: 800
                      }}>
                        {province.name}
                      </h3>
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', lineHeight: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>👥 Citoyens inscrits :</span>
                        <span style={{ fontWeight: 800, color: '#0D47A1' }}>
                          {(province.count || 0).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>🏘️ Population totale :</span>
                        <span style={{ fontWeight: 600 }}>
                          {(province.population / 1000000).toFixed(1)} M
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>📊 Taux de participation :</span>
                        <span style={{
                          fontWeight: 800,
                          color: province.participationRate > 1 ? '#16A34A' : '#F59E0B'
                        }}>
                          {province.participationRate}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>🎯 Niveau :</span>
                        <span style={{
                          fontWeight: 700,
                          color: niveau.couleur
                        }}>
                          {niveau.etiquette}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{
                      marginTop: '0.75rem',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#E5E7EB',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(province.participationRate * 2, 100)}%`,
                        background: `linear-gradient(90deg, ${niveau.couleur}, ${niveau.couleur}CC)`,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    
                    {coords.capitale && (
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.65rem',
                        color: '#FFD700',
                        background: '#0D47A1',
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '1rem'
                      }}>
                        🏛️ SIÈGE DU GOUVERNEMENT
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Légende */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '0.8rem 1rem',
        borderRadius: '0.75rem',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        fontSize: '0.7rem',
        border: '1px solid rgba(255,215,0,0.3)',
        zIndex: 1000,
        minWidth: '140px'
      }}>
        <div style={{
          color: '#FFD700',
          fontWeight: 800,
          fontSize: '0.7rem',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Niveaux de participation
        </div>
        {NIVEAUX_PARTICIPATION.filter(n => n.min < 500).map((niveau) => (
          <div key={niveau.min} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.3rem',
            color: '#E5E7EB'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: niveau.couleur,
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: `0 0 8px ${niveau.couleur}80`
            }} />
            <span>{niveau.icone} {niveau.etiquette}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#9CA3AF' }}>
              {niveau.min === 0 ? '0+' : `${niveau.min}+`}
            </span>
          </div>
        ))}
        <div style={{
          marginTop: '0.5rem',
          paddingTop: '0.3rem',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          fontSize: '0.6rem',
          color: '#9CA3AF',
          textAlign: 'center'
        }}>
          🔴 Zone critique = vigilance renforcée
        </div>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .leaflet-control-zoom {
              display: none;
            }
          }
          
          .leaflet-popup-content-wrapper {
            border-radius: 0.75rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          
          .leaflet-popup-tip {
            background: #F8FAFC;
          }
        `}
      </style>
    </div>
  );
};

export default DRCMap;