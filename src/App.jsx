import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import Toast from './components/Toast.jsx';
import RegisterModal from './components/RegisterModal.jsx';
import A11yPanel from './components/A11yPanel.jsx';
import SideDock from './components/SideDock.jsx';
import Home from './views/Home.jsx';
import Carta from './views/Carta.jsx';
import Customize from './views/Customize.jsx';
import Review from './views/Review.jsx';
import Status from './views/Status.jsx';
import { useStore } from './store.jsx';
import { useA11y } from './a11y.jsx';

// 2.4.2: cada pantalla tiene su propio título
const TITLES = { '/': 'Inicio', '/carta': 'Carta', '/personalizar': 'Personaliza tu pedido', '/revisar': 'Revisa tu pedido', '/estado': 'Estado del pedido' };

export default function App() {
  const loc = useLocation();
  const { modal } = useStore();
  const { s, panel } = useA11y();
  const first = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${TITLES[loc.pathname] || 'Inicio'} · Pardos Chicken – Prototipo v3.0`;
    if (first.current) { first.current = false; return undefined; }
    // 2.4.3: al cambiar de pantalla el foco pasa al título nuevo, así el lector anuncia dónde estás
    const t = setTimeout(() => {
      const h = document.querySelector('#main h1');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }, 60);
    return () => clearTimeout(t);
  }, [loc.pathname]);

  return (
    <MotionConfig reducedMotion={s.reduceMotion ? 'always' : 'user'}>
      {/* Filtros de corrección de color para fotos (daltonización, matrices de Machado et al. 2009) */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id="cvd-protan"><feColorMatrix type="matrix" values="1 0 0 0 0 0.4789 0.4769 0.0442 0 0 0.5973 -0.6887 1.0914 0 0 0 0 0 1 0" /></filter>
        <filter id="cvd-deutan"><feColorMatrix type="matrix" values="1 0 0 0 0 0.1628 0.7250 0.1122 0 0 0.4547 -0.6454 1.1907 0 0 0 0 0 1 0" /></filter>
        <filter id="cvd-tritan"><feColorMatrix type="matrix" values="0.7412 -0.4072 0.6660 0 0 0.0751 0.5852 0.3397 0 0 0 0 1 0 0 0 0 0 1 0" /></filter>
      </svg>
      <a className="skip" href="#main">Saltar al contenido</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <motion.div key={loc.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Routes location={loc}>
            <Route path="/" element={<Home />} />
            <Route path="/carta" element={<Carta />} />
            <Route path="/personalizar" element={<Customize />} />
            <Route path="/revisar" element={<Review />} />
            <Route path="/estado" element={<Status />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </main>
      <footer className="foot"><div className="wrap">Prototipo académico APF3 · v3.0 accesible · Interacción Hombre-Máquina · No es el sitio oficial de Pardos Chicken. Los datos ingresados no se envían a ningún servidor.</div></footer>
      <AnimatePresence>{modal && <RegisterModal key="reg" />}</AnimatePresence>
      <AnimatePresence>{panel && <A11yPanel key="a11y" />}</AnimatePresence>
      <SideDock />
      <Toast />
    </MotionConfig>
  );
}
