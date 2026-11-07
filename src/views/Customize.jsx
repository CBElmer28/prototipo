import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ADDONS, BASE, GROUPS, MAXQ, money, missing, optOf, orderTotal, unitItems } from '../data.js';
import { useStore } from '../store.jsx';
import EasyHelp from '../components/EasyHelp.jsx';
import Icon from '../components/Icon.jsx';

const PriceTag = ({ p }) => (p === 0 ? <span className="tagp inc">Incluido</span> : <span className="tagp pay">+ {money(p)}</span>);

function StateTag({ done, warn }) {
  if (done) return <span className="state okk"><Icon name="check" size="1em" /> Listo</span>;
  if (warn) return <span className="state miss"><Icon name="alert" size="1em" /> Falta elegir</span>;
  return <span className="state req">Obligatorio</span>;
}

function Group({ g, u, o, idx }) {
  const { dispatch } = useStore();
  const sel = u[g.id] ? optOf(g, u[g.id]) : null;
  const [forced, setForced] = useState({});
  const key = idx + g.id;
  const open = forced[key] ?? !sel;
  const warn = o.attempted || u.flag[g.id];
  return (
    <div className={`acc ${sel ? 'is-ok' : warn ? 'is-miss' : ''}`} id={`grp-${g.id}`}>
      <button className="acc-h" aria-expanded={open} aria-controls={`body-${g.id}`} onClick={() => setForced((f) => ({ ...f, [key]: !open }))}>
        <span><strong>{g.name}:</strong>{sel && <span className="selv"> ({sel[1]})</span>}</span>
        <span className="acc-r"><StateTag done={!!sel} warn={warn} /><motion.span aria-hidden="true" style={{ display: 'inline-flex' }} animate={{ rotate: open ? 180 : 0 }}><Icon name="chevron" /></motion.span></span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="acc-b" id={`body-${g.id}`} role="radiogroup" aria-label={g.name} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
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
  const tabsRef = useRef(null);
  const o = state.order, u = o.units[o.active];
  const miss = missing(u).length, done = GROUPS.length - miss;
  const items = unitItems(u);

  const review = () => {
    const bad = o.units.findIndex((x) => missing(x).length);
    if (bad >= 0) {
      dispatch({ type: 'attempt', i: bad });
      notify(`Completa las opciones obligatorias de la Unidad ${bad + 1} antes de revisar.`);
      // 2.4.3: el foco va al primer grupo pendiente
      const g = missing(o.units[bad])[0];
      setTimeout(() => document.querySelector(`#grp-${g.id} .acc-h`)?.focus(), 80);
      return;
    }
    nav('/revisar');
  };

  // Patrón ARIA de pestañas: flechas, Inicio y Fin; solo la pestaña activa está en el orden de Tab
  const onTabKey = (e) => {
    const n = o.units.length;
    const go = { ArrowRight: (o.active + 1) % n, ArrowLeft: (o.active - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (go === undefined) return;
    e.preventDefault();
    dispatch({ type: 'tab', i: go });
    setTimeout(() => tabsRef.current?.querySelectorAll('[role=tab]')[go]?.focus(), 0);
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
      <EasyHelp icon="utensils" title="Arma tu combo" steps={['Elige una opción en cada cuadro.', 'Cuando todo diga “Listo”, toca “Revisar y confirmar pedido”.']} />
      <div className="layout">
        <section aria-label="Foto y precio"><img className="hero-img" src="img/p-regular.jpg" alt="Promoción Brasa Para Mí: 1/4 de pollo a la brasa con papas y ensalada" /><p className="price" style={{ fontSize: '1.5rem' }}>{money(BASE)} <small>por unidad</small></p></section>
        <section aria-label="Personalización">
          <div className="prog">
            <div className="prog-t" aria-live="polite">Unidad {o.active + 1} · Paso {Math.min(done + 1, GROUPS.length)} de {GROUPS.length} · {miss ? `faltan ${miss} opción(es) obligatoria(s)` : 'todo listo'}</div>
            <div className="bar-t" role="progressbar" aria-label={`Avance de la Unidad ${o.active + 1}`} aria-valuemin={0} aria-valuemax={GROUPS.length} aria-valuenow={done}><motion.i animate={{ width: `${(done / GROUPS.length) * 100}%` }} /></div>
          </div>
          <div className="tabrow">
            <div className="tabs" role="tablist" aria-label="Unidades del combo" ref={tabsRef} onKeyDown={onTabKey}>
              {o.units.map((x, i) => (
                <button key={i} className="tab" role="tab" id={`tab-${i}`} aria-controls="unit-panel" aria-selected={i === o.active} tabIndex={i === o.active ? 0 : -1} onClick={() => dispatch({ type: 'tab', i })}>
                  Unidad {i + 1} {missing(x).length
                    ? <><span className="dot"><Icon name="dot" size="1em" /></span><span className="sr-only">, faltan opciones</span></>
                    : <><span className="okd"><Icon name="check" size="1em" /></span><span className="sr-only">, completa</span></>}
                </button>
              ))}
            </div>
            {o.active > 0 && <button className="btn ghost sm" onClick={() => { dispatch({ type: 'copy' }); notify(`Copiaste la Unidad 1 en la Unidad ${o.active + 1}.`); }}><Icon name="copy" /> Copiar de Unidad 1</button>}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={o.active} id="unit-panel" role="tabpanel" aria-labelledby={`tab-${o.active}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }}>
              {GROUPS.map((g) => <Group key={g.id} g={g} u={u} o={o} idx={o.active} />)}
            </motion.div>
          </AnimatePresence>
          <h2 className="h-sec">Agrega más sabor a tu pedido <small>(Unidad {o.active + 1})</small></h2>
          <div className="addons">
            {ADDONS.map((a) => {
              const on = u.extras.includes(a.id);
              return (
                <motion.div key={a.id} className="addon" whileHover={{ y: -3 }}>
                  <img src={`img/${a.img}.jpg`} alt={`Foto de ${a.name}`} /><span>{a.name}</span><strong>{money(a.price)}</strong>
                  {/* 4.1.2: el nombre accesible incluye el producto ("Agregar Pack Ají") */}
                  <motion.button whileTap={{ scale: 0.94 }} className={`btn sm ${on ? 'ghost' : ''}`} aria-pressed={on} onClick={() => dispatch({ type: 'addon', v: a.id })}>
                    {on ? <><Icon name="check" /> Agregado</> : 'Agregar'}<span className="sr-only"> {a.name}</span>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
          <div className="panel sum">
            <h2 className="h-sec" style={{ margin: '0 0 .375rem' }}>Tu pedido hasta ahora · Unidad {o.active + 1}</h2>
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
