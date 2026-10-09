import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ADDONS, BASE, GROUPS, MAXQ, money, missing, optOf, orderTotal, unitItems } from '../data.js';
import { useStore } from '../store.jsx';

const PriceTag = ({ p }) => (p === 0 ? <span className="tagp inc">Incluido</span> : <span className="tagp pay">+ {money(p)}</span>);

function StateTag({ done, warn }) {
  if (done) return <span className="state okk">✓ Listo</span>;
  if (warn) return <span className="state miss"><span aria-hidden="true">⚠</span> Falta elegir</span>;
  return <span className="state req">Obligatorio</span>;
}

function Group({ g, u, o, idx }) {
  const { dispatch } = useStore();
  const sel = u[g.id] ? optOf(g, u[g.id]) : null;
  const [forced, setForced] = useState({}); // abierto/cerrado manual por unidad
  const key = idx + g.id;
  const open = forced[key] ?? !sel;
  const warn = o.attempted || u.flag[g.id];
  return (
    <div className={`acc ${sel ? 'is-ok' : warn ? 'is-miss' : ''}`}>
      <button className="acc-h" aria-expanded={open} onClick={() => setForced((f) => ({ ...f, [key]: !open }))}>
        <span><strong>{g.name}:</strong>{sel && <span className="selv"> ({sel[1]})</span>}</span>
        <span className="acc-r"><StateTag done={!!sel} warn={warn} /><motion.span aria-hidden="true" animate={{ rotate: open ? 180 : 0 }}>▾</motion.span></span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="acc-b" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            {g.opts.map(([v, name, price]) => (
              <label key={v} className="opt">
                <input type="radio" name={g.id} checked={u[g.id] === v}
                  onChange={() => { dispatch({ type: 'pick', g: g.id, v }); setForced((f) => ({ ...f, [key]: false })); }} />
                <span className="n">{name}</span><PriceTag p={price} />
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Customize() {
  const { state, dispatch, notify } = useStore();
  const nav = useNavigate();
  const o = state.order, u = o.units[o.active];
  const miss = missing(u).length, done = GROUPS.length - miss;
  const items = unitItems(u);

  const review = () => {
    const bad = o.units.findIndex((x) => missing(x).length);
    if (bad >= 0) { dispatch({ type: 'attempt', i: bad }); return notify('Completa las opciones obligatorias antes de revisar.'); }
    nav('/revisar');
  };

  return (
    <div className="wrap page">
      <Link to="/carta">← Volver</Link>
      <div className="ghead">
        <h1>Promoción Brasa Para Mí</h1>
        <div className="qty" role="group" aria-label="Cantidad de combos">
          <button aria-label="Quitar un combo" disabled={o.qty <= 1} onClick={() => { dispatch({ type: 'qty-' }); notify('Se quitó la última unidad.'); }}>−</button>
          <motion.output key={o.qty} initial={{ scale: 1.5 }} animate={{ scale: 1 }} aria-live="polite">{o.qty}</motion.output>
          <button aria-label="Agregar un combo" disabled={o.qty >= MAXQ} onClick={() => { dispatch({ type: 'qty+' }); notify(`Unidad ${o.qty + 1} agregada: personalízala en su pestaña.`); }}>+</button>
        </div>
      </div>
      <div className="layout">
        <section><img className="hero-img" src="img/p-regular.jpg" alt="Promoción Brasa Para Mí" /><p className="price" style={{ fontSize: 24 }}>{money(BASE)} <small>por unidad</small></p></section>
        <section aria-label="Personalización">
          <div className="prog">
            <div className="prog-t" aria-live="polite">Unidad {o.active + 1} · Paso {Math.min(done + 1, GROUPS.length)} de {GROUPS.length} · {miss ? `faltan ${miss} opción(es) obligatoria(s)` : 'todo listo ✓'}</div>
            <div className="bar-t" aria-hidden="true"><motion.i animate={{ width: `${(done / GROUPS.length) * 100}%` }} /></div>
          </div>
          <div className="tabrow">
            <div className="tabs" role="tablist" aria-label="Unidades del combo">
              {o.units.map((x, i) => (
                <button key={i} className="tab" role="tab" aria-selected={i === o.active} onClick={() => dispatch({ type: 'tab', i })}>
                  Unidad {i + 1} {missing(x).length ? <span className="dot" aria-label="faltan opciones">●</span> : <span className="okd" aria-label="completa">✓</span>}
                </button>
              ))}
            </div>
            {o.active > 0 && <button className="btn ghost sm" onClick={() => { dispatch({ type: 'copy' }); notify(`Copiaste la Unidad 1 en la Unidad ${o.active + 1}.`); }}>⧉ Copiar de Unidad 1</button>}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={o.active} role="tabpanel" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }}>
              {GROUPS.map((g) => <Group key={g.id} g={g} u={u} o={o} idx={o.active} />)}
            </motion.div>
          </AnimatePresence>
          <h3>Agrega más sabor a tu pedido <small>(Unidad {o.active + 1})</small></h3>
          <div className="addons">
            {ADDONS.map((a) => {
              const on = u.extras.includes(a.id);
              return (
                <motion.div key={a.id} className="addon" whileHover={{ y: -3 }}>
                  <img src={`img/${a.img}.jpg`} alt="" /><span>{a.name}</span><strong>{money(a.price)}</strong>
                  <motion.button whileTap={{ scale: 0.94 }} className={`btn sm ${on ? 'ghost' : ''}`} aria-pressed={on} onClick={() => dispatch({ type: 'addon', v: a.id })}>{on ? '✓ Agregado' : 'Agregar'}</motion.button>
                </motion.div>
              );
            })}
          </div>
          <div className="panel sum">
            <h3 style={{ margin: '0 0 6px' }}>Tu pedido hasta ahora · Unidad {o.active + 1}</h3>
            {items.length === 0 && <p className="hint">Aún no eliges nada.</p>}
            <AnimatePresence initial={false}>
              {items.map((t) => (
                <motion.div key={t.g + t.v} className="row" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <span>{t.name} <PriceTag p={t.price} /></span>
                  <button className="link" aria-label={`Quitar ${t.name}`} onClick={() => dispatch({ type: 'rmitem', g: t.g, v: t.v })}>Quitar</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
      <motion.div className="cartbar" initial={{ y: 60 }} animate={{ y: 0 }}>
        <span>{o.units.length} unid.</span>
        <button className="btn" onClick={review}>Revisar y confirmar pedido</button>
        <motion.strong key={orderTotal(o)} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>{money(orderTotal(o))}</motion.strong>
      </motion.div>
    </div>
  );
}
