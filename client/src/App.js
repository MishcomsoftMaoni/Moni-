import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const Accueil = lazy(() => import('./pages/Home'));
const Propositions = lazy(() => import('./pages/Proposals'));
const Issues = lazy(() => import('./pages/Issues'));
const DetailProposition = lazy(() => import('./pages/ProposalDetail'));
const SoumettreProposition = lazy(() => import('./pages/SubmitProposal'));
const SoumettreProbleme = lazy(() => import('./pages/SubmitIssue'));
const Statistiques = lazy(() => import('./pages/Statistics'));
const Constitution = lazy(() => import('./pages/Constitution'));
const Connexion = lazy(() => import('./pages/Login'));
const Inscription = lazy(() => import('./pages/Register'));
const Profil = lazy(() => import('./pages/Profile'));
const Conditions = lazy(() => import('./pages/Terms'));
const Confidentialite = lazy(() => import('./pages/Privacy'));
const HorsLigne = lazy(() => import('./pages/Offline'));

const Chargeur = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', background: '#F1F5F9' }}>
    <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#0D47A1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <p style={{ color: '#0D47A1', fontWeight: 600, fontSize: '1rem' }}>Chargement...</p>
  </div>
);

const RouteProtegee = ({ children }) => {
  const { estAuthentifie, chargement } = useAuth();
  if (chargement) return <Chargeur />;
  if (!estAuthentifie) return <Navigate to="/login" replace />;
  return children;
};

const RetourHaut = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const defiler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', defiler);
    return () => window.removeEventListener('scroll', defiler);
  }, []);
  if (!visible) return null;
  return (
    <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Retour en haut"
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, #0D47A1, #1565C0)', color: 'white', border: '2px solid #FFD700', cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 25px rgba(13,71,161,0.5)' }}>
      ↑
    </motion.button>
  );
};

function App() {
  const { horsLigne } = useAuth();
  const emplacement = useLocation();

  if (horsLigne) {
    return <Suspense fallback={<Chargeur />}><HorsLigne /></Suspense>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<Chargeur />}>
          <AnimatePresence mode="wait">
            <Routes location={emplacement} key={emplacement.pathname}>
              <Route path="/" element={<Accueil />} />
              <Route path="/proposals" element={<Propositions />} />
              <Route path="/proposals/:id" element={<DetailProposition />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/statistics" element={<Statistiques />} />
              <Route path="/constitution" element={<Constitution />} />
              <Route path="/login" element={<Connexion />} />
              <Route path="/register" element={<Inscription />} />
              <Route path="/terms" element={<Conditions />} />
              <Route path="/privacy" element={<Confidentialite />} />
              <Route path="/submit-proposal" element={<RouteProtegee><SoumettreProposition /></RouteProtegee>} />
              <Route path="/submit-issue" element={<RouteProtegee><SoumettreProbleme /></RouteProtegee>} />
              <Route path="/profile" element={<RouteProtegee><Profil /></RouteProtegee>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <RetourHaut />
    </div>
  );
}

export default App;