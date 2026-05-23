import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

// =============================================
// SIGNALEMENT DE PROBLÈME CONSTITUTIONNEL
// Niveau Militaire - Audit Constitutionnel
// Version: 100.0.4
// =============================================

const SubmitIssue = () => {
  const auth = useAuth();
  const utilisateur = auth.utilisateur || auth.user;
  const navigate = useNavigate();

  const [formulaire, setFormulaire] = useState({
    sujet: '', 
    resume: '', 
    contenu: '', 
    consequence: '', 
    accepterConditions: false
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [fichiers, setFichiers] = useState([]);
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);
  const [erreurSoumission, setErreurSoumission] = useState('');
  const [succes, setSucces] = useState(false);
  const [progression, setProgression] = useState(0);
  const [etapeProgression, setEtapeProgression] = useState('');

  // Redirection si non connecté
  useEffect(() => {
    if (!utilisateur && !auth.chargement) {
      navigate('/login', { state: { from: '/submit-issue' } });
    }
  }, [utilisateur, auth.chargement, navigate]);

  const surDepotPhotos = useCallback((f) => {
    const n = f.map(x => ({ fichier: x, apercu: URL.createObjectURL(x), nom: x.name, taille: x.size }));
    setPhotos(prev => [...prev, ...n].slice(0, 5));
  }, []);
  
  const { getRootProps: rPhotos, getInputProps: iPhotos, estActif: aPhotos } = useDropzone({ 
    onDrop: surDepotPhotos, 
    accept: { 'image/*': ['.jpg','.jpeg','.png','.gif','.webp'] }, 
    maxFiles: 5, 
    maxSize: 5 * 1024 * 1024 
  });

  const surDepotVideos = useCallback((f) => {
    const n = f.map(x => ({ fichier: x, apercu: URL.createObjectURL(x), nom: x.name, taille: x.size }));
    setVideos(prev => [...prev, ...n].slice(0, 2));
  }, []);
  
  const { getRootProps: rVideos, getInputProps: iVideos, estActif: aVideos } = useDropzone({ 
    onDrop: surDepotVideos, 
    accept: { 'video/*': ['.mp4','.webm','.mov','.avi'] }, 
    maxFiles: 2, 
    maxSize: 50 * 1024 * 1024 
  });

  const surDepotFichiers = useCallback((f) => {
    const n = f.map(x => ({ fichier: x, nom: x.name, taille: x.size }));
    setFichiers(prev => [...prev, ...n].slice(0, 3));
  }, []);
  
  const { getRootProps: rFichiers, getInputProps: iFichiers, estActif: aFichiers } = useDropzone({ 
    onDrop: surDepotFichiers, 
    accept: { 
      'application/pdf': ['.pdf'], 
      'application/msword': ['.doc'], 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] 
    }, 
    maxFiles: 3, 
    maxSize: 10 * 1024 * 1024 
  });

  const gererChangement = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulaire(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (erreurs[name]) setErreurs(prev => ({ ...prev, [name]: '' }));
  };

  const valider = () => {
    const e = {};
    if (!formulaire.sujet.trim()) e.sujet = "L'article problématique est obligatoire.";
    else if (formulaire.sujet.length > 250) e.sujet = 'Maximum 250 caractères.';
    if (!formulaire.resume.trim()) e.resume = 'Le résumé en une phrase est obligatoire.';
    if (!formulaire.contenu.trim()) e.contenu = 'La description du problème est obligatoire.';
    if (formulaire.contenu.length < 50) e.contenu = 'La description doit contenir au moins 50 caractères.';
    if (!formulaire.consequence.trim()) e.consequence = 'La conséquence pour la RDC est obligatoire.';
    if (!formulaire.accepterConditions) e.accepterConditions = 'Vous devez accepter les conditions de soumission.';
    setErreurs(e); 
    return Object.keys(e).length === 0;
  };

  const televerser = async (fichier, bucket, chemin) => {
    const { error } = await supabase.storage.from(bucket).upload(chemin, fichier, {
      cacheControl: '3600',
      upsert: false
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(chemin);
    return publicUrl;
  };

  const gererSoumission = async (e) => {
    e.preventDefault(); 
    if (!valider()) return; 
    setEnCours(true);
    setProgression(10);
    setEtapeProgression('Vérification des données...');
    
    try {
      // Upload des photos
      setProgression(20);
      setEtapeProgression('Téléchargement des photos...');
      const urlsPhotos = [];
      for (let i = 0; i < photos.length; i++) {
        const ext = photos[i].fichier.name.split('.').pop();
        const path = `${utilisateur.id}/issue_${Date.now()}_photo_${i}.${ext}`;
        const url = await televerser(photos[i].fichier, 'proposal-images', path);
        urlsPhotos.push(url);
      }
      
      // Upload des vidéos
      setProgression(40);
      setEtapeProgression('Téléchargement des vidéos...');
      const urlsVideos = [];
      for (let i = 0; i < videos.length; i++) {
        const ext = videos[i].fichier.name.split('.').pop();
        const path = `${utilisateur.id}/issue_${Date.now()}_video_${i}.${ext}`;
        const url = await televerser(videos[i].fichier, 'proposal-videos', path);
        urlsVideos.push(url);
      }
      
      // Upload des fichiers
      setProgression(60);
      setEtapeProgression('Téléchargement des documents...');
      const urlsFichiers = [];
      for (let i = 0; i < fichiers.length; i++) {
        const ext = fichiers[i].fichier.name.split('.').pop();
        const path = `${utilisateur.id}/issue_${Date.now()}_file_${i}.${ext}`;
        const url = await televerser(fichiers[i].fichier, 'proposal-files', path);
        urlsFichiers.push(url);
      }
      
      // Sauvegarde en base
      setProgression(80);
      setEtapeProgression('Enregistrement du signalement...');
      const { error } = await supabase.from('reports').insert({
        reporter_id: utilisateur.id,
        subject: formulaire.sujet.trim(),
        one_sentence: formulaire.resume.trim(),
        content: formulaire.contenu.trim(),
        consequence: formulaire.consequence.trim(),
        image_urls: urlsPhotos,
        video_urls: urlsVideos,
        file_urls: urlsFichiers,
        status: 'published',
        category: 'constitutional',
        created_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      setProgression(100);
      setEtapeProgression('Terminé !');
      setSucces(true);
      setTimeout(() => navigate('/issues'), 2500);
      
    } catch (err) { 
      console.error('Erreur soumission:', err);
      setErreurSoumission(err.message || 'Une erreur est survenue lors de la soumission.'); 
    } finally { 
      setEnCours(false); 
      setProgression(0);
      setEtapeProgression('');
    }
  };

  if (!utilisateur && !auth.chargement) {
    return null;
  }

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
            padding: '3rem', 
            borderRadius: '1.5rem', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', 
            maxWidth: '500px' 
          }}
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ duration: 0.6 }}
            style={{ fontSize: '5rem' }}
          >
            ⚠️✅
          </motion.div>
          <h2 style={{ color: '#0D47A1', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>
            Signalement soumis avec succès !
          </h2>
          <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
            Merci pour votre contribution à l'amélioration de la Constitution.
          </p>
          <div style={{ width: '60px', height: '4px', background: '#FFD700', margin: '0.5rem auto', borderRadius: '2px' }} />
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '1rem' }}>
            Redirection vers la liste des signalements...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Signaler un Problème Constitutionnel | MAONI RDC</title>
        <meta name="description" content="Signalez un problème dans la Constitution de la RDC pour contribuer à la réforme constitutionnelle" />
      </Helmet>
      
      <div style={{ background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ 
            maxWidth: '850px', 
            margin: '0 auto', 
            background: 'white', 
            padding: '2.5rem', 
            borderRadius: '1.5rem', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            border: '2px solid #DC2626'
          }}
        >
          {/* En-tête */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
            >
              ⚠️📜
            </motion.div>
            <h1 style={{ 
              color: '#DC2626', 
              fontFamily: 'Georgia, serif', 
              fontSize: 'clamp(1.5rem, 4vw, 1.8rem)',
              marginBottom: '0.25rem'
            }}>
              Signaler un Problème Constitutionnel
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
              Identifiez un article problématique et proposez une amélioration
            </p>
          </div>

          {/* Message d'erreur */}
          <AnimatePresence>
            {erreurSoumission && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                style={{ 
                  padding: '0.85rem', 
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

          {/* Barre de progression */}
          {enCours && progression > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#0D47A1', fontWeight: 600 }}>{etapeProgression}</span>
                <span style={{ color: '#6B7280' }}>{progression}%</span>
              </div>
              <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progression}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #DC2626, #EF4444)', borderRadius: '3px' }}
                />
              </div>
            </motion.div>
          )}

          <form onSubmit={gererSoumission}>
            {/* Article problématique */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                Article problématique <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input 
                type="text" 
                name="sujet" 
                value={formulaire.sujet} 
                onChange={gererChangement} 
                placeholder="Ex: Article 220 de la Constitution"
                maxLength={250}
                style={{ 
                  width: '100%', 
                  padding: '0.85rem 1rem', 
                  border: erreurs.sujet ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                  borderRadius: '0.75rem', 
                  fontSize: '0.95rem', 
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#DC2626'}
                onBlur={(e) => e.target.style.borderColor = erreurs.sujet ? '#DC2626' : '#E5E7EB'}
              />
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem', textAlign: 'right' }}>
                {formulaire.sujet.length}/250 caractères
              </div>
              {erreurs.sujet && <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{erreurs.sujet}</div>}
            </div>

            {/* Résumé */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                Problème en une phrase <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea 
                name="resume" 
                value={formulaire.resume} 
                onChange={gererChangement} 
                placeholder="Résumez le problème en une phrase claire et précise..."
                rows={2}
                maxLength={500}
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  border: erreurs.resume ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                  borderRadius: '0.75rem', 
                  fontSize: '0.95rem', 
                  resize: 'vertical', 
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#DC2626'}
                onBlur={(e) => e.target.style.borderColor = erreurs.resume ? '#DC2626' : '#E5E7EB'}
              />
              {erreurs.resume && <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{erreurs.resume}</div>}
            </div>

            {/* Description détaillée */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                Description détaillée <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea 
                name="contenu" 
                value={formulaire.contenu} 
                onChange={gererChangement} 
                placeholder="Décrivez le problème en détail. Expliquez pourquoi cet article pose problème..."
                rows={6}
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  border: erreurs.contenu ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                  borderRadius: '0.75rem', 
                  fontSize: '0.95rem', 
                  resize: 'vertical', 
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#DC2626'}
                onBlur={(e) => e.target.style.borderColor = erreurs.contenu ? '#DC2626' : '#E5E7EB'}
              />
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                Minimum 50 caractères ({formulaire.contenu.length} caractères)
              </div>
              {erreurs.contenu && <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{erreurs.contenu}</div>}
            </div>

            {/* Conséquences */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                Conséquences pour la RDC <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea 
                name="consequence" 
                value={formulaire.consequence} 
                onChange={gererChangement} 
                placeholder="Quelles sont les conséquences de ce problème pour le pays, la démocratie, les citoyens ?"
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  border: erreurs.consequence ? '2px solid #DC2626' : '2px solid #E5E7EB', 
                  borderRadius: '0.75rem', 
                  fontSize: '0.95rem', 
                  resize: 'vertical', 
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#DC2626'}
                onBlur={(e) => e.target.style.borderColor = erreurs.consequence ? '#DC2626' : '#E5E7EB'}
              />
              {erreurs.consequence && <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{erreurs.consequence}</div>}
            </div>

            {/* Photos */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                📸 Photos (optionnel - max 5)
              </label>
              <div 
                {...rPhotos()} 
                style={{ 
                  padding: '1.5rem', 
                  border: `2px dashed ${aPhotos ? '#DC2626' : '#E5E7EB'}`, 
                  borderRadius: '1rem', 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  background: aPhotos ? '#FEF2F2' : '#FAFAFA', 
                  marginBottom: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <input {...iPhotos()} />
                <p style={{ fontWeight: 600 }}>{aPhotos ? 'Déposez les photos ici...' : '📷 Glissez-déposez des photos (JPG, PNG - max 5 Mo)'}</p>
              </div>
              {photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  {photos.map((p, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={p.apercu} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                      <button
                        type="button"
                        onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#DC2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vidéos */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                🎥 Vidéos (optionnel - max 2)
              </label>
              <div 
                {...rVideos()} 
                style={{ 
                  padding: '1rem', 
                  border: `2px dashed ${aVideos ? '#7C3AED' : '#E5E7EB'}`, 
                  borderRadius: '1rem', 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  background: aVideos ? '#F5F3FF' : '#FAFAFA',
                  transition: 'all 0.2s ease'
                }}
              >
                <input {...iVideos()} />
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{aVideos ? 'Déposez les vidéos ici...' : '🎬 Glissez-déposez des vidéos (MP4 - max 50 Mo)'}</p>
              </div>
              {videos.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {videos.map((v, i) => (
                    <div key={i} style={{ padding: '0.5rem', background: '#F9FAFB', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>🎬 {v.nom.substring(0, 30)}{v.nom.length > 30 ? '...' : ''}</span>
                      <button
                        type="button"
                        onClick={() => setVideos(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fichiers */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                📄 Documents (optionnel - max 3)
              </label>
              <div 
                {...rFichiers()} 
                style={{ 
                  padding: '1rem', 
                  border: `2px dashed ${aFichiers ? '#0D47A1' : '#E5E7EB'}`, 
                  borderRadius: '1rem', 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  background: aFichiers ? '#EFF6FF' : '#FAFAFA',
                  transition: 'all 0.2s ease'
                }}
              >
                <input {...iFichiers()} />
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{aFichiers ? 'Déposez les documents ici...' : '📎 Glissez-déposez des documents (PDF, Word - max 10 Mo)'}</p>
              </div>
              {fichiers.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  {fichiers.map((f, i) => (
                    <div key={i} style={{ padding: '0.5rem', background: '#F9FAFB', borderRadius: '0.5rem', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem' }}>📎 {f.nom}</span>
                      <button
                        type="button"
                        onClick={() => setFichiers(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conditions */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="accepterConditions" 
                  checked={formulaire.accepterConditions} 
                  onChange={gererChangement} 
                  style={{ width: '18px', height: '18px', accentColor: '#DC2626', marginTop: '2px' }} 
                />
                <span style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4 }}>
                  Je confirme que cette description est véridique, ne contient pas de propos haineux, 
                  et respecte les valeurs démocratiques de la République Démocratique du Congo.
                </span>
              </label>
              {erreurs.accepterConditions && <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{erreurs.accepterConditions}</div>}
            </div>

            {/* Bouton de soumission */}
            <motion.button 
              type="submit" 
              disabled={enCours}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                background: enCours ? '#9CA3AF' : 'linear-gradient(135deg, #DC2626, #B91C1C)', 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '1rem', 
                border: 'none', 
                borderRadius: '0.75rem', 
                cursor: enCours ? 'not-allowed' : 'pointer', 
                boxShadow: enCours ? 'none' : '0 6px 25px rgba(220,38,38,0.4)',
                opacity: enCours ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {enCours ? '⏳ Soumission en cours...' : '⚠️ Publier le signalement'}
            </motion.button>
          </form>
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

export default SubmitIssue;