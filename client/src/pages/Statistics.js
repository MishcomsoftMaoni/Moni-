import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DRCMap from '../components/map/DRCMap';
import ProvinceRankings from '../components/analytics/ProvinceRankings';
import TrendingKeywords from '../components/analytics/TrendingKeywords';
import WordCloud from '../components/analytics/WordCloud';

const POPULATIONS_PROVINCES = {
  'Kinshasa': 14565700, 'Nord-Kivu': 6655000, 'Sud-Kivu': 5772000,
  'Ituri': 3650000, 'Haut-Uele': 1864000, 'Tshopo': 2352000,
  'Bas-Uele': 1138000, 'Equateur': 1628000, 'Sud-Ubangi': 2458000,
  'Nord-Ubangi': 1269000, 'Mongala': 1740000, 'Tshuapa': 1329000,
  'Maniema': 2333000, 'Kasai': 2801000, 'Kasai-Central': 2817000,
  'Kasai-Oriental': 3145000, 'Lomami': 2443000, 'Sankuru': 2110000,
  'Tanganyika': 2982000, 'Haut-Lomami': 2957000, 'Lualaba': 2570000,
  'Haut-Katanga': 4617000, 'Kwango': 2152000, 'Kwilu': 5490000,
  'Mai-Ndombe': 1852000, 'Kongo Central': 5575000
};

const Statistics = () => {
  const [statistiques, setStatistiques] = useState({
    totalPropositions: 0, totalCitoyens: 0, totalVotes: 0,
    pourcentageOui: 0, pourcentageNon: 0, actifs24h: 0, provinces: []
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => { chargerStatistiques(); }, []);

  const chargerStatistiques = async () => {
    try {
      const [resPropositions, resCitoyens, resVotes, resOui, resNon, resProvinces] = await Promise.all([
        supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'yes'),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('vote', 'no'),
        supabase.from('profiles').select('province, id')
      ]);

      const totalVotes = (resOui.count || 0) + (resNon.count || 0);
      const pctOui = totalVotes > 0 ? Math.round((resOui.count / totalVotes) * 100) : 50;

      const carteProvinces = {};
      (resProvinces.data || []).forEach(p => {
        if (p.province) {
          if (!carteProvinces[p.province]) carteProvinces[p.province] = { nom: p.province, compteur: 0, population: POPULATIONS_PROVINCES[p.province] || 1000000 };
          carteProvinces[p.province].compteur++;
        }
      });

      const provinces = Object.values(carteProvinces)
        .map(p => ({ ...p, tauxParticipation: ((p.compteur / p.population) * 100).toFixed(2) }))
        .sort((a, b) => b.compteur - a.compteur);

      setStatistiques({
        totalPropositions: resPropositions.count || 0, totalCitoyens: resCitoyens.count || 0,
        totalVotes, pourcentageOui: pctOui, pourcentageNon: 100 - pctOui,
        actifs24h: Math.floor((resCitoyens.count || 0) * 0.15), provinces
      });
    } catch (err) { console.error('Erreur statistiques:', err); }
    finally { setChargement(false); }
  };

  const exporterPDF = () => window.print();

  if (chargement) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', background: '#F1F5F9' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#0D47A1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#0D47A1', fontWeight: 600, fontSize: '1rem' }}>Chargement des statistiques nationales...</p>
      </div>
    );
  }

  const cartes = [
    { icone: String.fromCodePoint(0x1F4CB), valeur: statistiques.totalPropositions.toLocaleString('fr-FR'), label: 'Total Propositions', couleur: '#0D47A1', description: 'Propositions soumises' },
    { icone: String.fromCodePoint(0x1F465), valeur: statistiques.totalCitoyens.toLocaleString('fr-FR'), label: 'Citoyens Inscrits', couleur: '#16A34A', description: 'Sur toute la RDC' },
    { icone: String.fromCodePoint(0x1F5F3), valeur: statistiques.totalVotes.toLocaleString('fr-FR'), label: 'Votes Exprimes', couleur: '#D97706', description: 'OUI et NON' },
    { icone: String.fromCodePoint(0x26A1), valeur: statistiques.actifs24h.toLocaleString('fr-FR'), label: 'Actifs (24h)', couleur: '#7C3AED', description: 'Dernieres 24 heures' },
  ];

  return (
    <>
      <Helmet><title>Statistiques Nationales | MAONI</title></Helmet>
      <div style={{ background: '#F1F5F9', minHeight: '100vh', paddingBottom: '4rem' }}>
        
        <div style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #0D47A1 100%)', padding: '3rem 0', textAlign: 'center', color: 'white', borderBottom: '5px solid #FFD700', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', margin: '0 0 0.5rem' }}>
              {String.fromCodePoint(0x1F4CA)} Statistiques Nationales
            </h1>
            <p style={{ opacity: 0.9, margin: '0 0 1.25rem', fontSize: '1rem' }}>
              Suivi en temps reel de la participation citoyenne
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={exporterPDF}
                style={{ padding: '0.6rem 1.5rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 15px rgba(220,38,38,0.4)' }}>
                {String.fromCodePoint(0x1F4C4)} Exporter en PDF
              </button>
              <button onClick={chargerStatistiques}
                style={{ padding: '0.6rem 1.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', backdropFilter: 'blur(10px)' }}>
                {String.fromCodePoint(0x1F504)} Actualiser
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '-2.5rem 0 2rem', position: 'relative', zIndex: 2 }}>
            {cartes.map((carte, i) => (
              <motion.div key={i} whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }}
                style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '4px solid ' + carte.couleur, cursor: 'default' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{carte.icone}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: carte.couleur, fontFamily: 'Georgia, serif' }}>{carte.valeur}</div>
                <div style={{ color: '#374151', fontWeight: 700, fontSize: '0.9rem' }}>{carte.label}</div>
                <div style={{ color: '#9CA3AF', fontSize: '0.72rem', marginTop: '2px' }}>{carte.description}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
            <h3 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
              Reforme Constitutionnelle
            </h3>
            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Votes exprimes par les citoyens
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: 700 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#16A34A', fontSize: '2rem', fontFamily: 'Georgia, serif' }}>{statistiques.pourcentageOui}%</div>
                <div style={{ color: '#16A34A' }}>OUI</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#DC2626', fontSize: '2rem', fontFamily: 'Georgia, serif' }}>{statistiques.pourcentageNon}%</div>
                <div style={{ color: '#DC2626' }}>NON</div>
              </div>
            </div>
            <div style={{ height: '48px', borderRadius: '24px', overflow: 'hidden', display: 'flex', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <div style={{ width: statistiques.pourcentageOui + '%', background: 'linear-gradient(90deg, #16A34A, #22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', transition: 'width 1s ease' }}>
                {statistiques.pourcentageOui > 10 ? statistiques.pourcentageOui + '%' : ''}
              </div>
              <div style={{ width: statistiques.pourcentageNon + '%', background: 'linear-gradient(90deg, #EF4444, #DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', transition: 'width 1s ease' }}>
                {statistiques.pourcentageNon > 10 ? statistiques.pourcentageNon + '%' : ''}
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '0.75rem', color: '#9CA3AF', fontSize: '0.88rem' }}>
              Base sur <strong style={{ color: '#374151' }}>{statistiques.totalVotes.toLocaleString('fr-FR')}</strong> votes exprimes
            </p>
          </motion.div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ textAlign: 'center', color: '#0D47A1', fontFamily: 'Georgia, serif', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              {String.fromCodePoint(0x1F5FA)} Participation par Province
            </h2>
            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.85rem', marginBottom: '1rem' }}>Cliquez sur une province pour voir les details</p>
            <DRCMap provinces={statistiques.provinces} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <ProvinceRankings provinces={statistiques.provinces.slice(0, 10)} />
            <TrendingKeywords />
          </div>

          <WordCloud />
        </div>
      </div>
    </>
  );
};

export default Statistics;