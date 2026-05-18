import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CATEGORIES = [
  { valeur: 'constitutional', etiquette: 'Réforme Constitutionnelle' },
  { valeur: 'electoral', etiquette: 'Système Électoral' },
  { valeur: 'decentralization', etiquette: 'Décentralisation' },
  { valeur: 'justice', etiquette: 'Justice et Droits' },
  { valeur: 'economy', etiquette: 'Économie et Développement' },
  { valeur: 'security', etiquette: 'Sécurité et Défense' },
  { valeur: 'education', etiquette: 'Éducation' },
  { valeur: 'health', etiquette: 'Santé' },
  { valeur: 'other', etiquette: 'Autre' },
];

const MODULES_EDITEUR = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'video'],
    ['clean']
  ]
};

const SubmitProposal = () => {
  const auth = useAuth();
  const utilisateur = auth.utilisateur || auth.user;
  const navigate = useNavigate();

  const [formulaire, setFormulaire] = useState({
    sujet: '', resume: '', contenu: '', categorie: 'constitutional', accepterConditions: false
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [fichiers, setFichiers] = useState([]);
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);
  const [erreurSoumission, setErreurSoumission] = useState('');
  const [progression, setProgression] = useState({});
  const [succes, setSucces] = useState(false);
  const [etape, setEtape] = useState(1);

  const surDepotPhotos = useCallback((fichiersAcceptes) => {
    const nouvelles = fichiersAcceptes.map(f => ({ fichier: f, apercu: URL.createObjectURL(f), nom: f.name, taille: f.size }));
    setPhotos(prev => [...prev, ...nouvelles].slice(0, 5));
  }, []);
  const { getRootProps: racinePhotos, getInputProps: entreePhotos, estActif: actifPhotos } = useDropzone({
    onDrop: surDepotPhotos, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }, maxFiles: 5, maxSize: 5 * 1024 * 1024
  });

  const surDepotVideos = useCallback((fichiersAcceptes) => {
    const nouvelles = fichiersAcceptes.map(f => ({ fichier: f, apercu: URL.createObjectURL(f), nom: f.name, taille: f.size }));
    setVideos(prev => [...prev, ...nouvelles].slice(0, 2));
  }, []);
  const { getRootProps: racineVideos, getInputProps: entreeVideos, estActif: actifVideos } = useDropzone({
    onDrop: surDepotVideos, accept: { 'video/*': ['.mp4', '.webm', '.mov', '.avi'] }, maxFiles: 2, maxSize: 50 * 1024 * 1024
  });

  const surDepotFichiers = useCallback((fichiersAcceptes) => {
    const nouvelles = fichiersAcceptes.map(f => ({ fichier: f, nom: f.name, taille: f.size }));
    setFichiers(prev => [...prev, ...nouvelles].slice(0, 3));
  }, []);
  const { getRootProps: racineFichiers, getInputProps: entreeFichiers, estActif: actifFichiers } = useDropzone({
    onDrop: surDepotFichiers, accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, maxFiles: 3, maxSize: 10 * 1024 * 1024
  });

  const retirerPhoto = (i) => { URL.revokeObjectURL(photos[i].apercu); setPhotos(prev => prev.filter((_, idx) => idx !== i)); };
  const retirerVideo = (i) => { URL.revokeObjectURL(videos[i].apercu); setVideos(prev => prev.filter((_, idx) => idx !== i)); };
  const retirerFichier = (i) => setFichiers(prev => prev.filter((_, idx) => idx !== i));

  const gererChangement = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulaire(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (erreurs[name]) setErreurs(prev => ({ ...prev, [name]: '' }));
  };
  const gererChangementContenu = (v) => { setFormulaire(prev => ({ ...prev, contenu: v })); if (erreurs.contenu) setErreurs(prev => ({ ...prev, contenu: '' })); };

  const validerFormulaire = () => {
    const e = {};
    if (!formulaire.sujet.trim()) e.sujet = 'L\'objet de votre proposition est obligatoire.';
    else if (formulaire.sujet.length > 250) e.sujet = `Maximum 250 caractères (${formulaire.sujet.length}/250).`;
    if (!formulaire.resume.trim()) e.resume = 'Le résumé en une phrase est obligatoire.';
    if (!formulaire.contenu || formulaire.contenu.replace(/<[^>]*>/g, '').trim().length < 50) e.contenu = 'Le contenu détaillé doit contenir au moins 50 caractères.';
    if (!formulaire.accepterConditions) e.accepterConditions = 'Vous devez accepter les conditions de soumission.';
    setErreurs(e); return Object.keys(e).length === 0;
  };

  const televerser = async (fichier, bucket, chemin) => {
    const { error } = await supabase.storage.from(bucket).upload(chemin, fichier, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(chemin);
    return publicUrl;
  };

  const gererSoumission = async (e) => {
    e.preventDefault(); setErreurSoumission(''); if (!validerFormulaire()) return; setEnCours(true);
    try {
      const urlsPhotos = []; const urlsVideos = []; const urlsFichiers = [];
      for (let i = 0; i < photos.length; i++) {
        setProgression(prev => ({ ...prev, [`photo_${i}`]: 'Téléversement...' }));
        const ext = photos[i].fichier.name.split('.').pop();
        urlsPhotos.push(await televerser(photos[i].fichier, 'proposal-images', `${utilisateur.id}/${Date.now()}_p${i}.${ext}`));
        setProgression(prev => ({ ...prev, [`photo_${i}`]: '✓' }));
      }
      for (let i = 0; i < videos.length; i++) {
        setProgression(prev => ({ ...prev, [`video_${i}`]: 'Téléversement...' }));
        const ext = videos[i].fichier.name.split('.').pop();
        urlsVideos.push(await televerser(videos[i].fichier, 'proposal-videos', `${utilisateur.id}/${Date.now()}_v${i}.${ext}`));
        setProgression(prev => ({ ...prev, [`video_${i}`]: '✓' }));
      }
      for (let i = 0; i < fichiers.length; i++) {
        setProgression(prev => ({ ...prev, [`fichier_${i}`]: 'Téléversement...' }));
        const ext = fichiers[i].fichier.name.split('.').pop();
        urlsFichiers.push(await televerser(fichiers[i].fichier, 'proposal-files', `${utilisateur.id}/${Date.now()}_f${i}.${ext}`));
        setProgression(prev => ({ ...prev, [`fichier_${i}`]: '✓' }));
      }

      const { data: proposition, error: errBase } = await supabase.from('proposals').insert({
        user_id: utilisateur.id, subject: formulaire.sujet.trim(), one_sentence: formulaire.resume.trim(),
        content: formulaire.contenu, image_urls: urlsPhotos, video_urls: urlsVideos, file_urls: urlsFichiers,
        category: formulaire.categorie, status: 'published', yes_count: 0, no_count: 0
      }).select().single();

      if (errBase) throw errBase;
      setSucces(true);
      setTimeout(() => navigate(`/proposals/${proposition.id}`), 2500);
    } catch (err) {
      setErreurSoumission(err.message || 'Une erreur est survenue lors de la soumission.');
    } finally { setEnCours(false); }
  };

  if (succes) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          style={{ textAlign: 'center', background: 'white', padding: '3rem 2rem', borderRadius: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxWidth: '500px' }}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</motion.div>
          <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Proposition soumise avec succès !</h2>
          <p style={{ color: '#6B7280', marginBottom: '1rem' }}>Votre proposition est maintenant visible par tous les citoyens.</p>
          <div style={{ width: '60px', height: '4px', background: '#FFD700', margin: '0 auto', borderRadius: '2px' }} />
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '1rem' }}>Redirection en cours...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Soumettre une Proposition | MAONI</title></Helmet>
      <div style={{ background: '#F1F5F9', minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>

          {/* En-tête avec étapes */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              ✍️ Soumettre une Proposition
            </h1>
            <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '1.25rem' }}>
              Partagez votre vision pour l'avenir constitutionnel de la République Démocratique du Congo
            </p>
            {/* Indicateur d'étapes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              {[1, 2, 3].map(e => (
                <React.Fragment key={e}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: etape >= e ? '#0D47A1' : '#E5E7EB', color: etape >= e ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s ease' }}>{e}</div>
                  {e < 3 && <div style={{ width: '40px', height: '2px', background: etape > e ? '#0D47A1' : '#E5E7EB', transition: 'all 0.3s ease' }} />}
                </React.Fragment>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
              {etape === 1 ? 'Rédaction' : etape === 2 ? 'Pièces jointes' : 'Validation'}
            </p>
          </div>

          {/* Message d'erreur */}
          <AnimatePresence>
            {erreurSoumission && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '0.85rem 1.25rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.75rem', color: '#DC2626', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                ❌ {erreurSoumission}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={gererSoumission}>
            {/* SECTION 1 : Rédaction */}
            {etape === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem', color: '#374151' }}>Catégorie <span style={{ color: '#DC2626' }}>*</span></label>
                  <select name="categorie" value={formulaire.categorie} onChange={gererChangement}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.95rem', background: 'white', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#0D47A1'} onBlur={e => e.target.style.borderColor = '#D1D5DB'}>
                    {CATEGORIES.map(c => <option key={c.valeur} value={c.valeur}>{c.etiquette}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem', color: '#374151' }}>Objet de votre proposition <span style={{ color: '#DC2626' }}>*</span></label>
                  <input type="text" name="sujet" value={formulaire.sujet} onChange={gererChangement} placeholder="Exemple : Modification de l'article 220 de la Constitution" maxLength={250}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: erreurs.sujet ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = erreurs.sujet ? '#DC2626' : '#0D47A1'} onBlur={e => e.target.style.borderColor = erreurs.sujet ? '#DC2626' : '#D1D5DB'} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.8rem', color: '#9CA3AF' }}>
                    <span>Maximum 250 caractères</span>
                    <span style={{ fontWeight: 600, color: formulaire.sujet.length > 240 ? '#DC2626' : '#6B7280' }}>{formulaire.sujet.length}/250</span>
                  </div>
                  {erreurs.sujet && <div style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>{erreurs.sujet}</div>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem', color: '#374151' }}>Votre proposition en une phrase <span style={{ color: '#DC2626' }}>*</span></label>
                  <textarea name="resume" value={formulaire.resume} onChange={gererChangement} placeholder="Résumez votre proposition en une phrase percutante..." rows={3} maxLength={500}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: erreurs.resume ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.95rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = erreurs.resume ? '#DC2626' : '#0D47A1'} onBlur={e => e.target.style.borderColor = erreurs.resume ? '#DC2626' : '#D1D5DB'} />
                  {erreurs.resume && <div style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>{erreurs.resume}</div>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem', color: '#374151' }}>Votre proposition détaillée <span style={{ color: '#DC2626' }}>*</span></label>
                  <div style={{ border: erreurs.contenu ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.75rem', overflow: 'hidden' }}>
                    <ReactQuill theme="snow" value={formulaire.contenu} onChange={gererChangementContenu} modules={MODULES_EDITEUR}
                      placeholder="Développez votre proposition en détail... (minimum 50 caractères)" style={{ minHeight: '300px', background: 'white' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '4px' }}>Vous pouvez formater votre texte, ajouter des listes, des liens, des vidéos, etc.</div>
                  {erreurs.contenu && <div style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>{erreurs.contenu}</div>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEtape(2)}
                    style={{ padding: '0.75rem 2rem', background: '#0D47A1', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                    Continuer →
                  </button>
                </div>
              </motion.div>
            )}

            {/* SECTION 2 : Pièces jointes */}
            {etape === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem', color: '#374151' }}>📸 Photos jointes <span style={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.85rem' }}>(optionnel - max 5)</span></label>
                  <div {...racinePhotos()} style={{ padding: '2rem', border: `2px dashed ${actifPhotos ? '#0D47A1' : '#D1D5DB'}`, borderRadius: '1rem', textAlign: 'center', cursor: 'pointer', background: actifPhotos ? '#EFF6FF' : '#FAFAFA', transition: 'all 0.3s ease', marginBottom: '0.75rem' }}>
                    <input {...entreePhotos()} />
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                    {actifPhotos ? <p style={{ color: '#0D47A1', fontWeight: 600, margin: 0 }}>Déposez vos photos ici...</p> : <><p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>Glissez-déposez vos photos ici</p><p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>ou cliquez pour sélectionner (JPG, PNG, GIF - max 5 Mo)</p></>}
                  </div>
                  {photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                      {photos.map((p, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                          <img src={p.apercu} alt={`Aperçu ${i + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                          <button type="button" onClick={() => retirerPhoto(i)} style={{ position: 'absolute', top: 4, right: 4, background: '#DC2626', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, lineHeight: 1 }}>×</button>
                          {progression[`photo_${i}`] && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', textAlign: 'center' }}>{progression[`photo_${i}`]}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem', color: '#374151' }}>🎥 Vidéos jointes <span style={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.85rem' }}>(optionnel - max 2, 50 Mo)</span></label>
                  <div {...racineVideos()} style={{ padding: '2rem', border: `2px dashed ${actifVideos ? '#7C3AED' : '#D1D5DB'}`, borderRadius: '1rem', textAlign: 'center', cursor: 'pointer', background: actifVideos ? '#F5F3FF' : '#FAFAFA', transition: 'all 0.3s ease', marginBottom: '0.75rem' }}>
                    <input {...entreeVideos()} />
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎬</div>
                    {actifVideos ? <p style={{ color: '#7C3AED', fontWeight: 600, margin: 0 }}>Déposez vos vidéos ici...</p> : <><p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>Glissez-déposez vos vidéos ici</p><p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>ou cliquez pour sélectionner (MP4, WebM - max 50 Mo)</p></>}
                  </div>
                  {videos.length > 0 && videos.map((v, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: '0.5rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                      <video src={v.apercu} controls style={{ width: '100%', maxHeight: '200px', display: 'block' }} />
                      <button type="button" onClick={() => retirerVideo(i)} style={{ position: 'absolute', top: 4, right: 4, background: '#DC2626', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem', color: '#374151' }}>📄 Documents joints <span style={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.85rem' }}>(optionnel - max 3)</span></label>
                  <div {...racineFichiers()} style={{ padding: '2rem', border: `2px dashed ${actifFichiers ? '#0D47A1' : '#D1D5DB'}`, borderRadius: '1rem', textAlign: 'center', cursor: 'pointer', background: actifFichiers ? '#EFF6FF' : '#FAFAFA', transition: 'all 0.3s ease', marginBottom: '0.75rem' }}>
                    <input {...entreeFichiers()} />
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
                    {actifFichiers ? <p style={{ color: '#0D47A1', fontWeight: 600, margin: 0 }}>Déposez vos fichiers ici...</p> : <><p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>Glissez-déposez vos fichiers ici</p><p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>ou cliquez pour sélectionner (PDF, Word - max 10 Mo)</p></>}
                  </div>
                  {fichiers.length > 0 && fichiers.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #E5E7EB', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                        <span>📎</span>
                        <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, color: '#374151', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.nom}</div><div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{(f.taille / 1024).toFixed(1)} Ko</div></div>
                      </div>
                      <button type="button" onClick={() => retirerFichier(i)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '1.3rem', padding: '0 0.25rem', lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setEtape(1)}
                    style={{ padding: '0.75rem 1.5rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
                    ← Retour
                  </button>
                  <button type="button" onClick={() => setEtape(3)}
                    style={{ padding: '0.75rem 2rem', background: '#0D47A1', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                    Continuer →
                  </button>
                </div>
              </motion.div>
            )}

            {/* SECTION 3 : Validation */}
            {etape === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ padding: '1.5rem', background: '#F0FDF4', borderRadius: '0.75rem', border: '1px solid #BBF7D0', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '1rem' }}>📋 Résumé de votre proposition</h3>
                  <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.8 }}>
                    <p><strong>Catégorie :</strong> {CATEGORIES.find(c => c.valeur === formulaire.categorie)?.etiquette}</p>
                    <p><strong>Objet :</strong> {formulaire.sujet || '—'}</p>
                    <p><strong>Résumé :</strong> {formulaire.resume || '—'}</p>
                    <p><strong>Contenu :</strong> {(formulaire.contenu || '').replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                    <p><strong>Photos :</strong> {photos.length} fichier(s)</p>
                    <p><strong>Vidéos :</strong> {videos.length} fichier(s)</p>
                    <p><strong>Documents :</strong> {fichiers.length} fichier(s)</p>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>
                    <input type="checkbox" name="accepterConditions" checked={formulaire.accepterConditions} onChange={gererChangement} style={{ width: 20, height: 20, accentColor: '#0D47A1', marginTop: 2, flexShrink: 0, cursor: 'pointer' }} />
                    <span>Je confirme que ma proposition respecte les valeurs démocratiques, l'unité nationale et les lois de la République Démocratique du Congo. Je certifie que ce contenu n'est pas haineux, discriminatoire ou violent.</span>
                  </label>
                  {erreurs.accepterConditions && <div style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>{erreurs.accepterConditions}</div>}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setEtape(2)}
                    style={{ padding: '0.75rem 1.5rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
                    ← Retour
                  </button>
                  <motion.button type="submit" disabled={enCours || !formulaire.accepterConditions}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '0.85rem 2.5rem', background: 'linear-gradient(135deg, #0D47A1, #1565C0)', color: 'white', fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: '2rem', cursor: 'pointer', boxShadow: '0 6px 25px rgba(13,71,161,0.3)', opacity: enCours || !formulaire.accepterConditions ? 0.6 : 1 }}>
                    {enCours ? '⏳ Soumission...' : '🚀 Publier ma proposition'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default SubmitProposal;