import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BASE, TILES, money } from '../data.js';
import { useStore } from '../store.jsx';

// Carrusel del banner: al tener una sola pieza se anima con zoom suave.
export function useStartOrder() {
  const { state, dispatch, notify } = useStore();
  const nav = useNavigate();
  return () => {
    if (state.placed && state.placed.status !== 'cancelado') { notify('Ya tienes un pedido en curso.'); return nav('/estado'); }
    if (state.placed) dispatch({ type: 'newOrder' });
    nav('/personalizar');
  };
}

export default function Home() {
  const { state, openRegister } = useStore();
  const start = useStartOrder();
  const [tick, setTick] = useState(0);
  useEffect(() => { document.title = 'Pardos Chicken – Prototipo APF2'; setTick(1); }, []);
  return (
    <>
      <div className="banner-img"><motion.img key={tick} initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.2 }} src="img/banner.jpg" alt="Promo para dos: lo bueno se comparte" /></div>
      <div className="wrap page">
        {!state.user && <div className="banner info" role="note">¿Primera vez? <button className="link" onClick={() => openRegister()}>Crea tu cuenta</button> para confirmar tu pedido.</div>}
        <motion.section className="promo" aria-labelledby="h-promo" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <img src="img/p-regular.jpg" alt="Promoción Brasa Para Mí" />
          <div>
            <span className="tag">PROMOCIÓN</span>
            <h2 id="h-promo">Brasa Para Mí</h2>
            <p>1/4 Pardos Brasa + papas + ensalada + bebida. Personaliza <strong>cada unidad</strong> por separado.</p>
            <div className="price">{money(BASE)} <small>por unidad</small></div>
            <motion.button className="btn" whileTap={{ scale: 0.97 }} onClick={start}>Pedir Promoción Brasa Para Mí</motion.button>
          </div>
        </motion.section>
        <h2>Categorías</h2>
        <div className="tiles">
          {TILES.map((t, i) => {
            const body = <><img src={`img/${t.img}.jpg`} alt="" /><span>{t.name}{!t.on && <small>Próximamente</small>}</span></>;
            return (
              <motion.div key={t.id} className={`tile-w ${t.id}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={t.on ? { scale: 1.02 } : undefined}>
                {t.on ? <Link to="/carta" className="tile">{body}</Link> : <div className="tile" aria-disabled="true">{body}</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
