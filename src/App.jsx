import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import Toast from './components/Toast.jsx';
import RegisterModal from './components/RegisterModal.jsx';
import Home from './views/Home.jsx';
import Carta from './views/Carta.jsx';
import Customize from './views/Customize.jsx';
import Review from './views/Review.jsx';
import Status from './views/Status.jsx';
import { useStore } from './store.jsx';

export default function App() {
  const loc = useLocation();
  const { modal } = useStore();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <>
      <a className="skip" href="#main">Saltar al contenido</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <Routes location={loc}>
              <Route path="/" element={<Home />} />
              <Route path="/carta" element={<Carta />} />
              <Route path="/personalizar" element={<Customize />} />
              <Route path="/revisar" element={<Review />} />
              <Route path="/estado" element={<Status />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="foot"><div className="wrap">Prototipo académico APF2 · Interacción Hombre-Máquina · No es el sitio oficial de Pardos Chicken. Los datos ingresados no se envían a ningún servidor.</div></footer>
      <AnimatePresence>{modal && <RegisterModal key="reg" />}</AnimatePresence>
      <Toast />
    </>
  );
}
