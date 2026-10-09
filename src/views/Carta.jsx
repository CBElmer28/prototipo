import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CARDS, CATS, money } from '../data.js';
import { useStartOrder } from './Home.jsx';

export default function Carta() {
  const start = useStartOrder();
  const [cat, setCat] = useState('todos');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CARDS.filter((p) => (cat === 'todos' || p.cat === cat) && (!s || (p.name + ' ' + p.desc).toLowerCase().includes(s)));
  }, [cat, q]);

  return (
    <div className="wrap page">
      <Link to="/">← Volver</Link>
      <h1 style={{ textAlign: 'center' }}>PARDOS BRASA</h1>
      <div className="tools" style={{ justifyContent: 'center' }}>
        {CATS.map(([id, name]) => <button key={id} className="chip" aria-pressed={cat === id} onClick={() => setCat(id)}>{name}</button>)}
      </div>
      <div className="tools"><input className="search" type="search" placeholder="¿Qué se te antoja?" aria-label="Buscar en la carta" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {loading ? (
        <div className="grid" aria-busy="true" aria-label="Cargando carta">{[0, 1, 2, 3].map((i) => <div key={i} className="card skel"><div className="sk-img" /><div className="sk-l" /><div className="sk-l short" /></div>)}</div>
      ) : list.length === 0 ? (
        <div className="empty" role="status"><strong>No encontramos productos{q ? ` para “${q}”` : ' en esta categoría'}.</strong><p>Prueba con otra palabra o quita el filtro.</p><button className="btn ghost" onClick={() => { setCat('todos'); setQ(''); }}>Quitar filtros</button></div>
      ) : (
        <div className="grid">
          <AnimatePresence>
            {list.map((p) => (
              <motion.article key={p.id} className="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ y: -4 }}>
                <img src={`img/${p.img}.jpg`} alt={p.name} loading="lazy" />
                <h3>{p.name}</h3><p>{p.desc}</p>
                <div className="cardf"><span className="price">{money(p.price)}</span>
                  {p.on ? <button className="btn sm" onClick={start}>Agregar</button> : <button className="btn sm" disabled aria-disabled="true" title="No disponible en esta demo">Próximamente</button>}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
