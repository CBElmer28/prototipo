import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CARDS, CATS, money } from '../data.js';
import { useStartOrder } from './Home.jsx';
import { useA11y } from '../a11y.jsx';
import EasyHelp from '../components/EasyHelp.jsx';

export default function Carta() {
  const start = useStartOrder();
  const { s } = useA11y();
  const [cat, setCat] = useState('todos');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    // Lectura fácil: menos opciones, solo lo que se puede pedir
    return CARDS.filter((p) => (!s.simple || p.on) && (cat === 'todos' || p.cat === cat) && (!term || (p.name + ' ' + p.desc).toLowerCase().includes(term)));
  }, [cat, q, s.simple]);

  return (
    <div className="wrap page">
      <Link to="/">← Volver</Link>
      <h1 style={{ textAlign: 'center' }}>PARDOS BRASA</h1>
      <EasyHelp icon="list" title="Elige tu comida" steps={['Busca la “Promoción Brasa Para Mí”.', 'Toca el botón rojo “Agregar”.']} />
      <div className="tools no-simple" style={{ justifyContent: 'center' }}>
        {CATS.map(([id, name]) => <button key={id} className="chip" aria-pressed={cat === id} onClick={() => setCat(id)}>{name}</button>)}
      </div>
      {/* 3.3.2: etiqueta visible para la búsqueda */}
      <div className="tools">
        <div className="search-field">
          <label htmlFor="buscar">Buscar en la carta</label>
          <input id="buscar" className="search" type="search" placeholder="Ej.: brasa, chicha, papas" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {s.simple && <p className="hint">Mostramos solo los productos que puedes pedir hoy.</p>}
      {loading ? (
        <div className="grid" aria-busy="true" aria-label="Cargando carta">{[0, 1, 2, 3].map((i) => <div key={i} className="card skel"><div className="sk-img" /><div className="sk-l" /><div className="sk-l short" /></div>)}</div>
      ) : (
        <>
          <p className="sr-only" role="status">{list.length === 0 ? '' : `${list.length} producto(s) encontrados.`}</p>
          {list.length === 0 ? (
            <div className="empty" role="status"><strong>No encontramos productos{q ? ` para “${q}”` : ' en esta categoría'}.</strong><p>Prueba con otra palabra o quita el filtro.</p><button className="btn ghost" onClick={() => { setCat('todos'); setQ(''); }}>Quitar filtros</button></div>
          ) : (
            <div className="grid">
              <AnimatePresence>
                {list.map((p) => (
                  <motion.article key={p.id} className="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ y: -4 }}>
                    <img src={`img/${p.img}.jpg`} alt={p.name} loading="lazy" />
                    <h3>{p.name}</h3><p>{p.desc}</p>
                    <div className="cardf"><span className="price">{money(p.price)}</span>
                      {/* 4.1.2: el nombre del botón dice qué producto agrega */}
                      {p.on ? <button className="btn sm" onClick={start}>Agregar<span className="sr-only"> {p.name}</span></button>
                        : <button className="btn sm" disabled>Próximamente<span className="sr-only"> {p.name}</span></button>}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
