import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const SubmitIssue = () => {
  const auth = useAuth();
  const utilisateur = auth.utilisateur || auth.user;
  const navigate = useNavigate();

  const [formulaire, setFormulaire] = useState({
    sujet: '', resume: '', contenu: '', consequence: '', accepterConditions: false
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [fichiers, setFichiers] = useState([]);
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);
  const [erreurSoumission, setErreurSoumission] = useState('');
  const [succes, setSucces] = useState(false);

  const surDepotPhotos = useCallback((f) => {
    const n = f.map(x => ({ fichier: x, apercu: URL.createObjectURL(x), nom: x.name, taille: x.size }));
    setPhotos(prev => [...prev, ...n].slice(0, 5));
  }, []);
  const { getRootProps: rPhotos, getInputProps: iPhotos, estActif: aPhotos } = useDropzone({ onDrop: surDepotPhotos, accept: { 'image/*': ['.jpg','.jpeg','.png','.gif','.webp'] }, maxFiles: 5, maxSize: 5*1024*1024 });

  const surDepotVideos = useCallback((f) => {
    const n = f.map(x => ({ fichier: x, apercu: URL.createObjectURL(x), nom: x.name, taille: x.size }));
    setVideos(prev => [...prev, ...n].slice(0, 2));
  }, []);
  const { getRootProps: rVideos, getInputProps: iVideos, estActif: aVideos } = useDropzone({ onDrop: surDepotVideos, accept: { 'video/*': ['.mp4','.webm','.mov','.avi'] }, maxFiles: 2, maxSize: 50*1024*1024 });

  const surDepotFichiers = useCallback((f) => {
    const n = f.map(x => ({ fichier: x, nom: x.name, taille: x.size }));
    setFichiers(prev => [...prev, ...n].slice(0, 3));
  }, []);
  const { getRootProps: rFichiers, getInputProps: iFichiers, estActif: aFichiers } = useDropzone({ onDrop: surDepotFichiers, accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, maxFiles: 3, maxSize: 10*1024*1024 });

  const gererChangement = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulaire(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (erreurs[name]) setErreurs(prev => ({ ...prev, [name]: '' }));
  };

  const valider = () => {
    const e = {};
    if (!formulaire.sujet.trim()) e.sujet = 'L\'article problématique est obligatoire.';
    else if (formulaire.sujet.length > 250) e.sujet = 'Maximum 250 caractères.';
    if (!formulaire.resume.trim()) e.resume = 'Le résumé en une phrase est obligatoire.';
    if (!formulaire.contenu.trim()) e.contenu = 'La description du problème est obligatoire.';
    if (!formulaire.consequence.trim()) e.consequence = 'La conséquence pour la RDC est obligatoire.';
    if (!formulaire.accepterConditions) e.accepterConditions = 'Vous devez accepter les conditions.';
    setErreurs(e); return Object.keys(e).length === 0;
  };

  const televerser = async (fichier, bucket, chemin) => {
    const { error } = await supabase.storage.from(bucket).upload(chemin, fichier);
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(chemin).data.publicUrl;
  };

  const gererSoumission = async (e) => {
    e.preventDefault(); if (!valider()) return; setEnCours(true);
    try {
      const urlsPhotos = [], urlsVideos = [], urlsFichiers = [];
      for (let i = 0; i < photos.length; i++) urlsPhotos.push(await televerser(photos[i].fichier, 'proposal-images', `${utilisateur.id}/issue_${Date.now()}_p${i}.${photos[i].fichier.name.split('.').pop()}`));
      for (let i = 0; i < videos.length; i++) urlsVideos.push(await televerser(videos[i].fichier, 'proposal-videos', `${utilisateur.id}/issue_${Date.now()}_v${i}.${videos[i].fichier.name.split('.').pop()}`));
      for (let i = 0; i < fichiers.length; i++) urlsFichiers.push(await televerser(fichiers[i].fichier, 'proposal-files', `${utilisateur.id}/issue_${Date.now()}_f${i}.${fichiers[i].fichier.name.split('.').pop()}`));

      const { error } = await supabase.from('issues').insert({
        user_id: utilisateur.id, subject: formulaire.sujet.trim(), one_sentence: formulaire.resume.trim(),
        content: formulaire.contenu.trim(), consequence: formulaire.consequence.trim(),
        image_urls: urlsPhotos, video_urls: urlsVideos, file_urls: urlsFichiers, status: 'published'
      });
      if (error) throw error;
      setSucces(true);
      setTimeout(() => navigate('/issues'), 2000);
    } catch (err) { setErreurSoumission(err.message || 'Erreur.'); }
    finally { setEnCours(false); }
  };

  if (succes) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
          style={{ textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif' }}>Problème soumis avec succès !</h2>
          <p style={{ color: '#6B7280' }}>Redirection...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Décrire un Problème | MAONI</title></Helmet>
      <div style={{ background: '#F1F5F9', minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#C62828', fontFamily: 'Georgia, serif', fontSize: '1.8rem' }}>⚠️ Décrire un Problème</h1>
            <p style={{ color: '#6B7280' }}>Décrivez un problème lié à la Constitution actuelle</p>
          </div>

          {erreurSoumission && <div style={{ padding: '0.85rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.75rem', color: '#DC2626', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>❌ {erreurSoumission}</div>}

          <form onSubmit={gererSoumission}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Article Problématique <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="text" name="sujet" value={formulaire.sujet} onChange={gererChangement} placeholder="Ex: Article 220 de la Constitution" maxLength={250}
                style={{ width: '100%', padding: '0.75rem', border: erreurs.sujet ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              {erreurs.sujet && <div style={{ color: '#DC2626', fontSize: '0.82rem' }}>{erreurs.sujet}</div>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Problème en une Phrase <span style={{ color: '#DC2626' }}>*</span></label>
              <textarea name="resume" value={formulaire.resume} onChange={gererChangement} placeholder="Résumez le problème en une phrase..." rows={2} maxLength={500}
                style={{ width: '100%', padding: '0.75rem', border: erreurs.resume ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
              {erreurs.resume && <div style={{ color: '#DC2626', fontSize: '0.82rem' }}>{erreurs.resume}</div>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Description du Problème <span style={{ color: '#DC2626' }}>*</span></label>
              <textarea name="contenu" value={formulaire.contenu} onChange={gererChangement} placeholder="Décrivez le problème en détail..." rows={5}
                style={{ width: '100%', padding: '0.75rem', border: erreurs.contenu ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
              {erreurs.contenu && <div style={{ color: '#DC2626', fontSize: '0.82rem' }}>{erreurs.contenu}</div>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Conséquence pour la RDC <span style={{ color: '#DC2626' }}>*</span></label>
              <textarea name="consequence" value={formulaire.consequence} onChange={gererChangement} placeholder="Quelles sont les conséquences de ce problème pour le pays ?" rows={3}
                style={{ width: '100%', padding: '0.75rem', border: erreurs.consequence ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
              {erreurs.consequence && <div style={{ color: '#DC2626', fontSize: '0.82rem' }}>{erreurs.consequence}</div>}
            </div>

            {/* Photos */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>📸 Joindre une photo (max 5)</label>
              <div {...rPhotos()} style={{ padding: '1.5rem', border: `2px dashed ${aPhotos ? '#0D47A1' : '#D1D5DB'}`, borderRadius: '1rem', textAlign: 'center', cursor: 'pointer', background: aPhotos ? '#EFF6FF' : '#FAFAFA', marginBottom: '0.5rem' }}>
                <input {...iPhotos()} />
                <p style={{ fontWeight: 600 }}>{aPhotos ? 'Déposez...' : 'Glissez-déposez des photos (JPG, PNG - max 5 Mo)'}</p>
              </div>
              {photos.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>{photos.map((p,i) => <img key={i} src={p.apercu} alt="" style={{ width:'100%', height:'80px', objectFit:'cover', borderRadius:'0.5rem' }} />)}</div>}
            </div>

            {/* Vidéos */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>🎥 Joindre une vidéo (max 2)</label>
              <div {...rVideos()} style={{ padding: '1.5rem', border: `2px dashed ${aVideos ? '#7C3AED' : '#D1D5DB'}`, borderRadius: '1rem', textAlign: 'center', cursor: 'pointer', background: aVideos ? '#F5F3FF' : '#FAFAFA', marginBottom: '0.5rem' }}>
                <input {...iVideos()} />
                <p style={{ fontWeight: 600 }}>{aVideos ? 'Déposez...' : 'Glissez-déposez des vidéos (MP4 - max 50 Mo)'}</p>
              </div>
            </div>

            {/* Fichiers */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>📄 Joindre un fichier (max 3)</label>
              <div {...rFichiers()} style={{ padding: '1.5rem', border: `2px dashed ${aFichiers ? '#0D47A1' : '#D1D5DB'}`, borderRadius: '1rem', textAlign: 'center', cursor: 'pointer', background: aFichiers ? '#EFF6FF' : '#FAFAFA', marginBottom: '0.5rem' }}>
                <input {...iFichiers()} />
                <p style={{ fontWeight: 600 }}>{aFichiers ? 'Déposez...' : 'Glissez-déposez des fichiers (PDF, Word - max 10 Mo)'}</p>
              </div>
              {fichiers.length > 0 && fichiers.map((f,i) => <div key={i} style={{ padding: '0.5rem', background: '#F9FAFB', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>📎 {f.nom}</div>)}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" name="accepterConditions" checked={formulaire.accepterConditions} onChange={gererChangement} style={{ width: 20, height: 20, accentColor: '#0D47A1' }} />
                <span>Je confirme que cette description est véridique et respecte les valeurs démocratiques.</span>
              </label>
            </div>

            <motion.button type="submit" disabled={enCours} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #C62828, #DC2626)', color: 'white', fontWeight: 700, fontSize: '1.05rem', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', boxShadow: '0 6px 25px rgba(198,40,40,0.3)', opacity: enCours ? 0.7 : 1 }}>
              {enCours ? '⏳ Soumission...' : '⚠️ Publier le problème'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default SubmitIssue;