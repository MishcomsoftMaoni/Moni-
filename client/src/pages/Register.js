import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// =============================================
// INSCRIPTION CITOYENNE - Niveau Présidentiel
// 26 provinces | 6 tranches d'âge | Multi-étapes
// Version: 100.0.4
// =============================================

const PROVINCES = [
  'Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Uélé',
  'Tshopo', 'Bas-Uélé', 'Équateur', 'Sud-Ubangi', 'Nord-Ubangi',
  'Mongala', 'Tshuapa', 'Maniema', 'Kasaï', 'Kasaï-Central',
  'Kasaï-Oriental', 'Lomami', 'Sankuru', 'Tanganyika', 'Haut-Lomami',
  'Lualaba', 'Haut-Katanga', 'Kwango', 'Kwilu', 'Mai-Ndombe', 'Kongo Central'
];

const TRANCHES_AGE = [
  '18 - 30 ans', '30 - 40 ans', '40 - 50 ans',
  '50 - 60 ans', '60 - 70 ans', '70 - 80 ans'
];

const PROFESSIONS = [
  'Fonctionnaire', 'Enseignant', 'Médecin', 'Infirmier', 'Ingénieur',
  'Avocat', 'Commerçant', 'Agriculteur', 'Étudiant', 'Retraité',
  'Artisan', 'Chauffeur', 'Informaticien', 'Journaliste', 'Sans emploi',
  'Autre'
];

const Register = () => {
  const { inscription } = useAuth();
  const navigate = useNavigate();

  const [etape, setEtape] = useState(1);
  const [formulaire, setFormulaire] = useState({
    prenom: '', nom: '', email: '', motDePasse: '', confirmation: '',
    trancheAge: '', profession: '', telephone: '', province: '',
    diaspora: false, autreResidence: '', portrait: null, accepterConditions: false
  });
  const [erreurs, setErreurs] = useState({});
  const [erreurSoumission, setErreurSoumission] = useState('');
  const [apercuPortrait, setApercuPortrait] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [succes, setSucces] = useState(false);

  const gererChangement = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const fichier = files[0];
      if (fichier && fichier.size > 5 * 1024 * 1024) {
        setErreurs(prev => ({ ...prev, portrait: 'Le fichier ne doit pas dépasser 5 Mo' }));
        return;
      }
      setFormulaire(prev => ({ ...prev, portrait: fichier }));
      if (fichier) {
        const lecteur = new FileReader();
        lecteur.onloadend = () => setApercuPortrait(lecteur.result);
        lecteur.readAsDataURL(fichier);
      }
      if (erreurs.portrait) setErreurs(prev => ({ ...prev, portrait: '' }));
    } else if (type === 'checkbox') {
      setFormulaire(prev => ({ ...prev, [name]: checked }));
      if (name === 'diaspora' && !checked) {
        setFormulaire(prev => ({ ...prev, autreResidence: '' }));
      }
    } else {
      setFormulaire(prev => ({ ...prev, [name]: value }));
    }
    if (erreurs[name]) setErreurs(prev => ({ ...prev, [name]: '' }));
  };

  const validerEtape1 = () => {
    const e = {};
    if (!formulaire.prenom.trim()) e.prenom = 'Le prénom est obligatoire.';
    if (!formulaire.nom.trim()) e.nom = 'Le nom est obligatoire.';
    if (!formulaire.email.trim()) e.email = 'L\'adresse email est obligatoire.';
    else if (!/\S+@\S+\.\S+/.test(formulaire.email)) e.email = 'Veuillez saisir une adresse email valide.';
    if (!formulaire.motDePasse) e.motDePasse = 'Le mot de passe est obligatoire.';
    else if (formulaire.motDePasse.length < 6) e.motDePasse = 'Minimum 6 caractères requis.';
    if (formulaire.motDePasse !== formulaire.confirmation) e.confirmation = 'Les mots de passe ne correspondent pas.';
    setErreurs(e); 
    return Object.keys(e).length === 0;
  };

  const validerEtape2 = () => {
    const e = {};
    if (!formulaire.trancheAge) e.trancheAge = 'Veuillez sélectionner votre tranche d\'âge.';
    if (!formulaire.profession.trim()) e.profession = 'La profession est obligatoire.';
    if (!formulaire.telephone.trim()) e.telephone = 'Le numéro de téléphone est obligatoire.';
    else if (!/^(\+243|0)[0-9]{9,10}$/.test(formulaire.telephone.replace(/\s/g, ''))) {
      e.telephone = 'Numéro de téléphone congolais invalide (ex: +243 XXX XXX XXX ou 0XX XXX XXXX)';
    }
    if (!formulaire.province) e.province = 'Veuillez sélectionner votre province.';
    setErreurs(e); 
    return Object.keys(e).length === 0;
  };

  const validerEtape3 = () => {
    const e = {};
    if (!formulaire.accepterConditions) e.accepterConditions = 'Vous devez accepter les conditions d\'utilisation.';
    setErreurs(e); 
    return Object.keys(e).length === 0;
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    if (!validerEtape3()) return;
    setErreurSoumission(''); 
    setEnCours(true);
    
    try {
      const resultat = await inscription({
        prenom: formulaire.prenom, 
        nom: formulaire.nom, 
        email: formulaire.email,
        motDePasse: formulaire.motDePasse, 
        trancheAge: formulaire.trancheAge,
        profession: formulaire.profession, 
        telephone: formulaire.telephone,
        province: formulaire.province, 
        diaspora: formulaire.diaspora,
        autreResidence: formulaire.autreResidence, 
        portrait: formulaire.portrait,
      });
      
      if (resultat.succes || resultat.success) { 
        setSucces(true); 
        setTimeout(() => navigate('/'), 2500);
      } else {
        setErreurSoumission(resultat.erreur || resultat.error || 'Une erreur est survenue lors de l\'inscription.');
      }
    } catch (err) { 
      setErreurSoumission('Erreur de connexion. Veuillez réessayer.'); 
    } finally { 
      setEnCours(false); 
    }
  };

  if (succes) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ 
            textAlign: 'center', 
            background: 'white', 
            padding: '3rem 2rem', 
            borderRadius: '1.5rem', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', 
            maxWidth: '480px' 
          }}
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ duration: 0.6 }} 
            style={{ fontSize: '5rem', marginBottom: '1rem' }}
          >
            🎉🇨🇩
          </motion.div>
          <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Inscription réussie !
          </h2>
          <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
            Bienvenue sur MAONI, {formulaire.prenom} !
          </p>
          <div style={{ width: '60px', height: '4px', background: '#FFD700', margin: '0 auto', borderRadius: '2px' }} />
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '1rem' }}>
            Redirection vers l'accueil...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Inscription | MAONI - Plateforme Citoyenne RDC</title>
        <meta name="description" content="Créez votre compte citoyen sur MAONI pour participer à la réforme constitutionnelle en RDC" />
      </Helmet>
      
      <div style={{ background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{ 
            maxWidth: '700px', 
            margin: '0 auto', 
            background: 'white', 
            padding: '2.5rem', 
            borderRadius: '1.5rem', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            border: '2px solid #FFD700'
          }}
        >
          {/* En-tête */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              src="/images/logo-drc-map.png" 
              alt="MAONI - République Démocratique du Congo" 
              style={{ height: '70px', marginBottom: '0.5rem' }} 
            />
            <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.25rem', fontSize: '1.6rem' }}>
              🇨🇩 Créer un compte
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
              Rejoignez la plateforme citoyenne pour la réforme constitutionnelle
            </p>
            
            {/* Indicateur d'étapes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '1.5rem' }}>
              {[1, 2, 3].map(e => (
                <React.Fragment key={e}>
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: etape >= e ? 1 : 0.8 }}
                    style={{ 
                      width: '34px', 
                      height: '34px', 
                      borderRadius: '50%', 
                      background: etape >= e ? '#0D47A1' : '#E5E7EB', 
                      color: etape >= e ? 'white' : '#9CA3AF', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      boxShadow: etape >= e ? '0 0 0 3px rgba(13,71,161,0.2)' : 'none'
                    }}
                  >
                    {e}
                  </motion.div>
                  {e < 3 && <div style={{ width: '40px', height: '2px', background: etape > e ? '#0D47A1' : '#E5E7EB', borderRadius: '1px' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Message d'erreur */}
          <AnimatePresence>
            {erreurSoumission && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                style={{ 
                  padding: '0.85rem 1rem', 
                  background: '#FEF2F2', 
                  border: '1px solid #FECACA', 
                  borderRadius: '0.75rem', 
                  color: '#DC2626', 
                  marginBottom: '1.5rem', 
                  textAlign: 'center', 
                  fontWeight: 600 
                }}
              >
                ❌ {erreurSoumission}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={gererSoumission} noValidate>
            {/* ÉTAPE 1 : Identité */}
            {etape === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      Prénom <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="prenom" 
                      value={formulaire.prenom} 
                      onChange={gererChangement} 
                      placeholder="Votre prénom"
                      style={{ 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: erreurs.prenom ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.95rem', 
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0D47A1'}
                      onBlur={(e) => e.target.style.borderColor = erreurs.prenom ? '#DC2626' : '#E5E7EB'}
                    />
                    {erreurs.prenom && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.prenom}</div>}
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      Nom <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nom" 
                      value={formulaire.nom} 
                      onChange={gererChangement} 
                      placeholder="Votre nom"
                      style={{ 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: erreurs.nom ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.95rem', 
                        outline: 'none' 
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0D47A1'}
                    />
                    {erreurs.nom && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.nom}</div>}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    Adresse email <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formulaire.email} 
                    onChange={gererChangement} 
                    placeholder="votre@email.com"
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem 1rem', 
                      border: erreurs.email ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                      borderRadius: '0.75rem', 
                      fontSize: '0.95rem', 
                      outline: 'none' 
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0D47A1'}
                  />
                  {erreurs.email && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.email}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      Mot de passe <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input 
                      type="password" 
                      name="motDePasse" 
                      value={formulaire.motDePasse} 
                      onChange={gererChangement} 
                      placeholder="Minimum 6 caractères"
                      style={{ 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: erreurs.motDePasse ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.95rem', 
                        outline: 'none' 
                      }}
                    />
                    {erreurs.motDePasse && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.motDePasse}</div>}
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      Confirmation <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input 
                      type="password" 
                      name="confirmation" 
                      value={formulaire.confirmation} 
                      onChange={gererChangement} 
                      placeholder="Répétez le mot de passe"
                      style={{ 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: erreurs.confirmation ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.95rem', 
                        outline: 'none' 
                      }}
                    />
                    {erreurs.confirmation && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.confirmation}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <motion.button
                    type="button"
                    onClick={() => { if (validerEtape1()) setEtape(2); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      padding: '0.8rem 2rem', 
                      background: '#0D47A1', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '2rem', 
                      cursor: 'pointer', 
                      fontWeight: 700, 
                      fontSize: '0.95rem' 
                    }}
                  >
                    Continuer →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 2 : Profil */}
            {etape === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      Tranche d'âge <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select 
                      name="trancheAge" 
                      value={formulaire.trancheAge} 
                      onChange={gererChangement}
                      style={{ 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: erreurs.trancheAge ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.95rem', 
                        background: 'white', 
                        outline: 'none' 
                      }}
                    >
                      <option value="">Sélectionnez...</option>
                      {TRANCHES_AGE.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {erreurs.trancheAge && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.trancheAge}</div>}
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      Profession <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select 
                      name="profession" 
                      value={formulaire.profession} 
                      onChange={gererChangement}
                      style={{ 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: erreurs.profession ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.95rem', 
                        background: 'white', 
                        outline: 'none' 
                      }}
                    >
                      <option value="">Sélectionnez...</option>
                      {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {erreurs.profession && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.profession}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      Téléphone <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="telephone" 
                      value={formulaire.telephone} 
                      onChange={gererChangement} 
                      placeholder="+243 XX XXX XXXX"
                      style={{ 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: erreurs.telephone ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.95rem', 
                        outline: 'none' 
                      }}
                    />
                    {erreurs.telephone && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.telephone}</div>}
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      Province <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select 
                      name="province" 
                      value={formulaire.province} 
                      onChange={gererChangement}
                      style={{ 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: erreurs.province ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.95rem', 
                        background: 'white', 
                        outline: 'none' 
                      }}
                    >
                      <option value="">Sélectionnez votre province...</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {erreurs.province && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.province}</div>}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="diaspora" 
                      checked={formulaire.diaspora} 
                      onChange={gererChangement} 
                      style={{ width: '18px', height: '18px', accentColor: '#0D47A1' }} 
                    />
                    <span style={{ fontSize: '0.9rem', color: '#374151' }}>Je vis en dehors de la République Démocratique du Congo</span>
                  </label>
                </div>

                <AnimatePresence>
                  {formulaire.diaspora && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }} 
                      style={{ marginBottom: '1rem', overflow: 'hidden' }}
                    >
                      <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                        Pays de résidence
                      </label>
                      <input 
                        type="text" 
                        name="autreResidence" 
                        value={formulaire.autreResidence} 
                        onChange={gererChangement} 
                        placeholder="Exemple : Belgique, France, Canada..."
                        style={{ 
                          width: '100%', 
                          padding: '0.8rem 1rem', 
                          border: '2px solid #E5E7EB', 
                          borderRadius: '0.75rem', 
                          fontSize: '0.95rem', 
                          outline: 'none' 
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    Photo portrait (optionnelle)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {apercuPortrait && (
                      <img 
                        src={apercuPortrait} 
                        alt="Aperçu" 
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFD700' }} 
                      />
                    )}
                    <input 
                      type="file" 
                      name="portrait" 
                      onChange={gererChangement} 
                      accept="image/jpeg,image/png,image/jpg" 
                      style={{ padding: '0.4rem', fontSize: '0.85rem', flex: 1 }} 
                    />
                  </div>
                  {erreurs.portrait && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.portrait}</div>}
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                    Formats : JPG, PNG. Taille max : 5 Mo
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <motion.button
                    type="button"
                    onClick={() => setEtape(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ padding: '0.8rem 1.5rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Retour
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => { if (validerEtape2()) setEtape(3); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ padding: '0.8rem 2rem', background: '#0D47A1', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Continuer →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3 : Confirmation */}
            {etape === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ 
                  padding: '1.5rem', 
                  background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', 
                  borderRadius: '0.75rem', 
                  border: '1px solid #BBF7D0', 
                  marginBottom: '1.5rem' 
                }}>
                  <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                    📋 Récapitulatif de votre inscription
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 2 }}>
                    <p><strong>Nom :</strong> {formulaire.prenom} {formulaire.nom}</p>
                    <p><strong>Email :</strong> {formulaire.email}</p>
                    <p><strong>Âge :</strong> {formulaire.trancheAge || '—'}</p>
                    <p><strong>Profession :</strong> {formulaire.profession || '—'}</p>
                    <p><strong>Téléphone :</strong> {formulaire.telephone || '—'}</p>
                    <p><strong>Province :</strong> {formulaire.province || '—'}</p>
                    {formulaire.diaspora && <p><strong>Diaspora :</strong> {formulaire.autreResidence || 'Oui'}</p>}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="accepterConditions" 
                      checked={formulaire.accepterConditions} 
                      onChange={gererChangement} 
                      style={{ width: '18px', height: '18px', accentColor: '#0D47A1', marginTop: '2px', flexShrink: 0 }} 
                    />
                    <span style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4 }}>
                      J'accepte les <Link to="/terms" target="_blank" style={{ color: '#0D47A1', fontWeight: 600 }}>conditions d'utilisation</Link> et la{' '}
                      <Link to="/privacy" target="_blank" style={{ color: '#0D47A1', fontWeight: 600 }}>politique de confidentialité</Link>.
                    </span>
                  </label>
                  {erreurs.accepterConditions && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{erreurs.accepterConditions}</div>}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                  <motion.button
                    type="button"
                    onClick={() => setEtape(2)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ padding: '0.8rem 1.5rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Retour
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={enCours}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      padding: '0.85rem 2.5rem', 
                      background: enCours ? '#9CA3AF' : 'linear-gradient(135deg, #FFD700, #F59E0B)', 
                      color: '#0D47A1', 
                      fontWeight: 700, 
                      fontSize: '1rem', 
                      border: 'none', 
                      borderRadius: '2rem', 
                      cursor: enCours ? 'not-allowed' : 'pointer', 
                      boxShadow: enCours ? 'none' : '0 6px 20px rgba(255,215,0,0.4)',
                      opacity: enCours ? 0.7 : 1
                    }}
                  >
                    {enCours ? '⏳ Inscription...' : '✅ Créer mon compte'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B7280', fontSize: '0.85rem' }}>
            Déjà inscrit ?{' '}
            <Link to="/login" style={{ color: '#0D47A1', fontWeight: 700, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #FFF9C4, #FFF176)',
            borderRadius: '0.75rem',
            textAlign: 'center',
            border: '1px solid #F9A825'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#374151', margin: 0 }}>
              📱 Pas d'internet ? Composez <strong style={{ color: '#0D47A1' }}>*123#</strong> pour vous inscrire
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

export default Register;