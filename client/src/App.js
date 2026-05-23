import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// =============================================
// APPLICATION PRINCIPALE - Niveau Présidentiel
// Routes sécurisées | Animations | Performance
// République Démocratique du Congo
// Version: 100.0.4
// =============================================

// Lazy loading des pages
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
const PresidentialDashboard = lazy(() => import('./pages/PresidentialDashboard'));

// =============================================
// COMPOSANT DE CHARGEMENT - Style Présidentiel
// =============================================
const Chargeur = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    flexDirection: 'column', 
    gap: '1rem', 
    background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)' 
  }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{ 
        width: '50px', 
        height: '50px', 
        border: '4px solid #E5E7EB', 
        borderTopColor: '#0D47A1', 
        borderRadius: '50%' 
      }}
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ color: '#0D47A1', fontWeight: 600, fontSize: '1rem' }}
    >
      Chargement de MAONI...
    </motion.p>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ color: '#9CA3AF', fontSize: '0.8rem' }}
    >
      Plateforme de consultation citoyenne
    </motion.p>
  </div>
);

// =============================================
// ROUTE PROTÉGÉE - Authentification requise
// =============================================
const RouteProtegee = ({ children, redirectTo = '/login' }) => {
  const { estAuthentifie, chargement } = useAuth();
  const location = useLocation();

  if (chargement) return <Chargeur />;
  if (!estAuthentifie) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  return children;
};

// =============================================
// ROUTE ADMIN - Rôle présidentiel requis
// =============================================
const RouteAdmin = ({ children }) => {
  const { estAuthentifie, chargement, estAdmin, profil } = useAuth();
  const location = useLocation();

  if (chargement) return <Chargeur />;
  if (!estAuthentifie) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!estAdmin && profil?.role !== 'presidential') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// =============================================
// BOUTON RETOUR EN HAUT - Navigation rapide
// =============================================
const RetourHaut = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const defiler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', defiler);
    return () => window.removeEventListener('scroll', defiler);
  }, []);
  
  if (!visible) return null;
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Retour en haut de la page"
      title="Retour en haut"
      style={{ 
        position: 'fixed', 
        bottom: '24px', 
        right: '24px', 
        zIndex: 1000, 
        width: '48px', 
        height: '48px', 
        borderRadius: '50%', 
        background: 'linear-gradient(135deg, #0D47A1, #1565C0)', 
        color: 'white', 
        border: '2px solid #FFD700', 
        cursor: 'pointer', 
        fontSize: '1.3rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        boxShadow: '0 6px 25px rgba(13,71,161,0.5)',
        transition: 'all 0.2s ease'
      }}
    >
      ↑
    </motion.button>
  );
};

// =============================================
// ANIMATION DE TRANSITION ENTRE PAGES
// =============================================
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1]
};

// =============================================
// COMPOSANT PRINCIPAL APP
// =============================================
function App() {
  const { horsLigne } = useAuth();
  const location = useLocation();

  // Si hors ligne, afficher la page dédiée
  if (horsLigne) {
    return (
      <Suspense fallback={<Chargeur />}>
        <HorsLigne />
      </Suspense>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      position: 'relative'
    }}>
      <Header />
      
      <main style={{ flex: 1, position: 'relative' }}>
        <Suspense fallback={<Chargeur />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              style={{ height: '100%' }}
            >
              <Routes location={location}>
                {/* Routes publiques */}
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
                
                {/* Routes protégées (authentification requise) */}
                <Route path="/submit-proposal" element={
                  <RouteProtegee>
                    <SoumettreProposition />
                  </RouteProtegee>
                } />
                <Route path="/submit-issue" element={
                  <RouteProtegee>
                    <SoumettreProbleme />
                  </RouteProtegee>
                } />
                <Route path="/profile" element={
                  <RouteProtegee>
                    <Profil />
                  </RouteProtegee>
                } />
                
                {/* Routes admin (rôle présidentiel requis) */}
                <Route path="/dashboard" element={
                  <RouteAdmin>
                    <PresidentialDashboard />
                  </RouteAdmin>
                } />
                
                {/* Fallback - 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      
      <Footer />
      <RetourHaut />
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulseGlow {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(13,71,161,0.4);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(13,71,161,0);
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;