import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

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
      setFormulaire(prev => ({ ...prev, portrait: fichier }));
      if (fichier) {
        const lecteur = new FileReader();
        lecteur.onloadend = () => setApercuPortrait(lecteur.result);
        lecteur.readAsDataURL(fichier);
      }
    } else if (type === 'checkbox') {
      setFormulaire(prev => ({ ...prev, [name]: checked }));
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
    setErreurs(e); return Object.keys(e).length === 0;
  };

  const validerEtape2 = () => {
    const e = {};
    if (!formulaire.trancheAge) e.trancheAge = 'Veuillez sélectionner votre tranche d\'âge.';
    if (!formulaire.profession.trim()) e.profession = 'La profession est obligatoire.';
    if (!formulaire.telephone.trim()) e.telephone = 'Le numéro de téléphone est obligatoire.';
    if (!formulaire.province) e.province = 'Veuillez sélectionner votre province.';
    setErreurs(e); return Object.keys(e).length === 0;
  };

  const validerEtape3 = () => {
    const e = {};
    if (!formulaire.accepterConditions) e.accepterConditions = 'Vous devez accepter les conditions d\'utilisation.';
    setErreurs(e); return Object.keys(e).length === 0;
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    if (!validerEtape3()) return;
    setErreurSoumission(''); setEnCours(true);
    try {
      const resultat = await inscription({
        prenom: formulaire.prenom, nom: formulaire.nom, email: formulaire.email,
        motDePasse: formulaire.motDePasse, trancheAge: formulaire.trancheAge,
        profession: formulaire.profession, telephone: formulaire.telephone,
        province: formulaire.province, diaspora: formulaire.diaspora,
        autreResidence: formulaire.autreResidence, portrait: formulaire.portrait,
      });
      if (resultat.succes) { setSucces(true); setTimeout(() => navigate('/'), 2000); }
      else setErreurSoumission(resultat.erreur || 'Une erreur est survenue.');
    } catch (err) { setErreurSoumission('Erreur de connexion. Veuillez réessayer.'); }
    finally { setEnCours(false); }
  };

  if (succes) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          style={{ textAlign: 'center', background: 'white', padding: '3rem 2rem', borderRadius: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxWidth: '480px' }}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</motion.div>
          <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Inscription réussie !</h2>
          <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Bienvenue sur MAONI, {formulaire.prenom} !</p>
          <div style={{ width: '60px', height: '4px', background: '#FFD700', margin: '0 auto', borderRadius: '2px' }} />
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '1rem' }}>Redirection vers l'accueil...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Créer un compte | MAONI</title></Helmet>
      <div style={{ background: '#F1F5F9', minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ maxWidth: '650px', margin: '0 auto', background: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img src="/images/logo-drc-map.png" alt="MAONI" style={{ height: '65px', marginBottom: '0.75rem' }} />
            <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.25rem', fontSize: '1.5rem' }}>🇨🇩 Créer un compte</h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Rejoignez la plateforme citoyenne</p>
            {/* Étapes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', alignItems: 'center', marginTop: '1rem' }}>
              {[1, 2, 3].map(e => (
                <React.Fragment key={e}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: etape >= e ? '#0D47A1' : '#E5E7EB', color: etape >= e ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.3s ease' }}>{e}</div>
                  {e < 3 && <div style={{ width: '30px', height: '2px', background: etape > e ? '#0D47A1' : '#E5E7EB' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {erreurSoumission && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.75rem', color: '#DC2626', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                ❌ {erreurSoumission}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={gererSoumission} noValidate>
            {/* ÉTAPE 1 : Identité */}
            {etape === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Prénom <span style={{ color: '#DC2626' }}>*</span></label>
                    <input type="text" name="prenom" value={formulaire.prenom} onChange={gererChangement} placeholder="Votre prénom"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.prenom ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                    {erreurs.prenom && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.prenom}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Nom <span style={{ color: '#DC2626' }}>*</span></label>
                    <input type="text" name="nom" value={formulaire.nom} onChange={gererChangement} placeholder="Votre nom"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.nom ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                    {erreurs.nom && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.nom}</div>}
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Adresse email <span style={{ color: '#DC2626' }}>*</span></label>
                  <input type="email" name="email" value={formulaire.email} onChange={gererChangement} placeholder="votre@email.com"
                    style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.email ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  {erreurs.email && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.email}</div>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Mot de passe <span style={{ color: '#DC2626' }}>*</span></label>
                    <input type="password" name="motDePasse" value={formulaire.motDePasse} onChange={gererChangement} placeholder="Minimum 6 caractères"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.motDePasse ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                    {erreurs.motDePasse && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.motDePasse}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Confirmation <span style={{ color: '#DC2626' }}>*</span></label>
                    <input type="password" name="confirmation" value={formulaire.confirmation} onChange={gererChangement} placeholder="Répétez le mot de passe"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.confirmation ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                    {erreurs.confirmation && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.confirmation}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => { if (validerEtape1()) setEtape(2); }}
                    style={{ padding: '0.75rem 2rem', background: '#0D47A1', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>Continuer →</button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 2 : Profil */}
            {etape === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Tranche d'âge <span style={{ color: '#DC2626' }}>*</span></label>
                    <select name="trancheAge" value={formulaire.trancheAge} onChange={gererChangement}
                      style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.trancheAge ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', background: 'white', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                      <option value="">Sélectionnez...</option>
                      {TRANCHES_AGE.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {erreurs.trancheAge && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.trancheAge}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Profession <span style={{ color: '#DC2626' }}>*</span></label>
                    <input type="text" name="profession" value={formulaire.profession} onChange={gererChangement} placeholder="Votre profession"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.profession ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                    {erreurs.profession && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.profession}</div>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Téléphone <span style={{ color: '#DC2626' }}>*</span></label>
                    <input type="tel" name="telephone" value={formulaire.telephone} onChange={gererChangement} placeholder="+243 XX XXX XXXX"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.telephone ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                    {erreurs.telephone && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.telephone}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Province <span style={{ color: '#DC2626' }}>*</span></label>
                    <select name="province" value={formulaire.province} onChange={gererChangement}
                      style={{ width: '100%', padding: '0.7rem 0.9rem', border: erreurs.province ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', background: 'white', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                      <option value="">Sélectionnez votre province...</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {erreurs.province && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.province}</div>}
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#374151' }}>
                    <input type="checkbox" name="diaspora" checked={formulaire.diaspora} onChange={gererChangement} style={{ width: '18px', height: '18px', accentColor: '#0D47A1' }} />
                    Je vis en dehors de la République Démocratique du Congo
                  </label>
                </div>
                <AnimatePresence>
                  {formulaire.diaspora && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '1rem', overflow: 'hidden' }}>
                      <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Pays de résidence</label>
                      <input type="text" name="autreResidence" value={formulaire.autreResidence} onChange={gererChangement} placeholder="Exemple : Belgique, France, Canada..." style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Photo portrait (optionnelle)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {apercuPortrait && <img src={apercuPortrait} alt="Aperçu" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFD700' }} />}
                    <input type="file" name="portrait" onChange={gererChangement} accept="image/*" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '4px' }}>Formats : JPG, PNG. Max 5 Mo.</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setEtape(1)} style={{ padding: '0.75rem 1.5rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>← Retour</button>
                  <button type="button" onClick={() => { if (validerEtape2()) setEtape(3); }} style={{ padding: '0.75rem 2rem', background: '#0D47A1', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>Continuer →</button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3 : Confirmation */}
            {etape === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ padding: '1.5rem', background: '#F0FDF4', borderRadius: '0.75rem', border: '1px solid #BBF7D0', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem' }}>📋 Résumé de votre inscription</h3>
                  <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 2 }}>
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
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: '#374151', lineHeight: 1.5 }}>
                    <input type="checkbox" name="accepterConditions" checked={formulaire.accepterConditions} onChange={gererChangement} style={{ width: '18px', height: '18px', accentColor: '#0D47A1', marginTop: '2px', flexShrink: 0 }} />
                    <span>J'accepte les <Link to="/terms" target="_blank" style={{ color: '#0D47A1', fontWeight: 600 }}>conditions d'utilisation</Link> et la <Link to="/privacy" target="_blank" style={{ color: '#0D47A1', fontWeight: 600 }}>politique de confidentialité</Link>.</span>
                  </label>
                  {erreurs.accepterConditions && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px' }}>{erreurs.accepterConditions}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setEtape(2)} style={{ padding: '0.75rem 1.5rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>← Retour</button>
                  <motion.button type="submit" disabled={enCours} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '0.85rem 2.5rem', background: 'linear-gradient(135deg, #FFD700, #F9A825)', color: '#0D47A1', fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: '2rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,215,0,0.4)', opacity: enCours ? 0.7 : 1 }}>
                    {enCours ? '⏳ Inscription...' : '✅ Créer mon compte'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B7280', fontSize: '0.95rem' }}>
            Déjà inscrit ?{' '}
            <Link to="/login" style={{ color: '#0D47A1', fontWeight: 700, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Register;