import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const COORDONNEES_PROVINCES = {
  'Kinshasa': { lat: -4.325, lng: 15.322 },
  'Nord-Kivu': { lat: -0.791, lng: 29.045 },
  'Sud-Kivu': { lat: -3.011, lng: 28.629 },
  'Ituri': { lat: 1.565, lng: 29.949 },
  'Haut-Uele': { lat: 3.066, lng: 27.401 },
  'Tshopo': { lat: 0.516, lng: 25.199 },
  'Bas-Uele': { lat: 3.481, lng: 25.551 },
  'Equateur': { lat: 0.058, lng: 18.433 },
  'Sud-Ubangi': { lat: 2.826, lng: 19.230 },
  'Nord-Ubangi': { lat: 4.091, lng: 21.605 },
  'Mongala': { lat: 2.156, lng: 21.510 },
  'Tshuapa': { lat: -0.793, lng: 21.878 },
  'Maniema': { lat: -3.020, lng: 26.583 },
  'Kasai': { lat: -5.349, lng: 21.415 },
  'Kasai-Central': { lat: -5.893, lng: 21.419 },
  'Kasai-Oriental': { lat: -5.969, lng: 23.479 },
  'Lomami': { lat: -6.141, lng: 24.483 },
  'Sankuru': { lat: -4.293, lng: 23.644 },
  'Tanganyika': { lat: -5.989, lng: 29.065 },
  'Haut-Lomami': { lat: -8.721, lng: 24.664 },
  'Lualaba': { lat: -10.078, lng: 24.510 },
  'Haut-Katanga': { lat: -10.979, lng: 26.734 },
  'Kwango': { lat: -5.914, lng: 17.559 },
  'Kwilu': { lat: -5.039, lng: 18.819 },
  'Mai-Ndombe': { lat: -1.874, lng: 19.140 },
  'Kongo Central': { lat: -5.354, lng: 14.297 }
};

const NIVEAUX_PARTICIPATION = [
  { min: 100, couleur: '#C62828', taille: 40, etiquette: 'TrÃ¨s Ã©levÃ©e', icone: 'ðŸ”´' },
  { min: 50, couleur: '#F57C00', taille: 32, etiquette: 'Ã‰levÃ©e', icone: 'ðŸŸ ' },
  { min: 20, couleur: '#FBC02D', taille: 26, etiquette: 'Moyenne', icone: 'ðŸŸ¡' },
  { min: 5, couleur: '#388E3C', taille: 20, etiquette: 'Faible', icone: 'ðŸŸ¢' },
  { min: 0, couleur: '#9E9E9E', taille: 16, etiquette: 'Minimale', icone: 'âšª' },
];

const obtenirNiveau = (count) => {
  for (const niveau of NIVEAUX_PARTICIPATION) {
    if (count >= niveau.min) return niveau;
  }
  return NIVEAUX_PARTICIPATION[NIVEAUX_PARTICIPATION.length - 1];
};

const creerIconePersonnalisee = (province) => {
  const niveau = obtenirNiveau(province.count || 0);
  const taille = niveau.taille;
  return L.divIcon({
    className: 'marqueur-personnalise',
    html: `
      <div style="
        width: ${taille}px; height: ${taille}px;
        background: ${niveau.couleur};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 20px rgba(0,0,0,0.5), 0 0 0 6px ${niveau.couleur}33;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 700;
        font-size: ${taille > 30 ? '13px' : '10px'};
        cursor: pointer; transition: all 0.3s ease;
        font-family: 'Inter', sans-serif;
      ">
        ${province.count || 0}
      </div>
    `,
    iconSize: [taille + 10, taille + 10],
    iconAnchor: [taille / 2 + 5, taille / 2 + 5],
    popupAnchor: [0, -taille / 2 - 5]
  });
};

const LIMITES_RDC = [[-13.5, 11.5], [5.5, 31.5]];

const AjusterCarte = () => {
  const carte = useMap();
  useEffect(() => { carte.fitBounds(LIMITES_RDC); }, [carte]);
  return null;
};

const DRCMap = ({ provinces = [] }) => {
  const [provinceSelectionnee, setProvinceSelectionnee] = useState(null);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        height: '520px', borderRadius: '1rem', overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '3px solid #0D47A1'
      }}>
        <MapContainer
          center={[-4.0, 21.0]} zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true} minZoom={4} maxZoom={10}
        >
          <AjusterCarte />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {provinces.map((province) => {
            const coords = COORDONNEES_PROVINCES[province.name];
            if (!coords) return null;
            return (
              <Marker
                key={province.name}
                position={[coords.lat, coords.lng]}
                icon={creerIconePersonnalisee(province)}
                eventHandlers={{ click: () => setProvinceSelectionnee(province) }}
              >
                <Popup>
                  <div style={{ padding: '0.5rem', minWidth: '220px', fontFamily: 'Inter, sans-serif' }}>
                    <h3 style={{ color: '#0D47A1', margin: '0 0 0.75rem', fontFamily: 'Georgia, serif', fontSize: '1.05rem', borderBottom: '2px solid #FFD700', paddingBottom: '0.4rem' }}>
                      ðŸ“ {province.name}
                    </h3>
                    <div style={{ fontSize: '0.88rem', lineHeight: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>ðŸ‘¥ Citoyens :</span>
                        <span style={{ fontWeight: 700, color: '#0D47A1' }}>{(province.count || 0).toLocaleString('fr-FR')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>ðŸ˜ï¸ Population :</span>
                        <span style={{ fontWeight: 600 }}>{((province.population || 0) / 1000000).toFixed(1)} M</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>ðŸ“Š Taux :</span>
                        <span style={{ fontWeight: 700, color: (province.participationRate || 0) > 1 ? '#16A34A' : '#F59E0B' }}>
                          {province.participationRate || 0}%
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', height: '6px', borderRadius: '3px', background: '#E5E7EB', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((province.participationRate || 0) * 10, 100)}%`, background: 'linear-gradient(90deg, #0D47A1, #1565C0)', borderRadius: '3px' }} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* LÃ©gende */}
      <div style={{
        position: 'absolute', bottom: '16px', right: '16px',
        background: 'rgba(255,255,255,0.95)', padding: '0.85rem 1rem',
        borderRadius: '0.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        fontSize: '0.78rem', backdropFilter: 'blur(10px)',
        border: '1px solid #E5E7EB', zIndex: 1000
      }}>
        <h4 style={{ margin: '0 0 0.5rem', color: '#0D47A1', fontWeight: 700, fontSize: '0.8rem' }}>
          Participation
        </h4>
        {NIVEAUX_PARTICIPATION.map((niveau) => (
          <div key={niveau.min} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: niveau.couleur, border: '2px solid white', boxShadow: '0 0 6px rgba(0,0,0,0.3)' }} />
            <span>{niveau.icone} {niveau.etiquette}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DRCMap;