import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ADDR, CANCEL_SECS, money, payName } from '../data.js';
import { useStore } from '../store.jsx';
import { useLogout } from '../components/Header.jsx';
import Steps from '../components/Steps.jsx';
import EasyHelp from '../components/EasyHelp.jsx';

function useLeft(placed) {
  const calc = () => (placed ? Math.max(0, Math.ceil((placed.endAt - Date.now()) / 1000)) : 0);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    if (!placed || placed.status === 'cancelado') return undefined;
    const id = setInterval(() => { const l = calc(); setLeft(l); if (l <= 0) clearInterval(id); }, 250);
    return () => clearInterval(id);
  }, [placed]); // eslint-disable-line react-hooks/exhaustive-deps
  return left;
}

const fmt = (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;

export default function Status() {
  const { state, dispatch, notify } = useStore();
  const logout = useLogout();
  const p = state.placed;
  const left = useLeft(p);
  const [ask, setAsk] = useState(false);
  const [say, setSay] = useState('');
  const said = useRef(new Set());

  // 4.1.3: el lector solo anuncia hitos (30 s, 10 s y fin), no cada segundo
  useEffect(() => {
    if (!p || p.status !== 'activo') return;
    for (const m of [30, 10]) {
      if (left === m && !said.current.has(m)) { said.current.add(m); setSay(`Quedan ${m} segundos para cancelar sin costo.`); }
    }
    if (left === 0 && !said.current.has(0)) { said.current.add(0); notify('Se acabó el tiempo de cancelación. Tu pedido ya está en cocina.'); }
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return <Navigate to="/" replace />;

  const total = p.secs || CANCEL_SECS;
  const cancelled = p.status === 'cancelado';
  const active = !cancelled && left > 0;
  const cur = active ? 0 : 1;
  const canExtend = active && (p.ext || 0) < 3;
  const extend = () => { dispatch({ type: 'extend' }); said.current.clear(); setSay('Agregamos 60 segundos más para cancelar.'); };

  return (
    <div className="wrap page">
      <h1>Estado del pedido</h1>
      <Steps cur={cancelled ? 3 : 4} />
      <EasyHelp icon="⏱️" title="Tu pedido está hecho" steps={['Guarda tu código.', 'Si te equivocaste, toca “Cancelar pedido” antes de que el reloj llegue a 0.', 'Si necesitas más tiempo, toca “Necesito más tiempo”.']} />
      <p className="sr-only" role="status" aria-live="polite">{say}</p>
      <div className="layout">
        <section className="panel" aria-label="Seguimiento del pedido">
          <p className="hint" style={{ margin: 0 }}>Código de tu pedido</p>
          <motion.div className="code" id="code" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{p.code}</motion.div>
          {cancelled ? <div className="banner bad" role="alert">Pedido cancelado. No se te cobrará nada.</div>
            : active ? <div className="banner ok" role="status"><span aria-hidden="true">✓ </span>Pedido {p.code} confirmado. Te avisaremos cuando salga de cocina.</div>
            : <div className="banner info"><span aria-hidden="true">👨‍🍳 </span>Tu pedido ya está en cocina y no puede cancelarse.</div>}
          {!cancelled && (
            <>
              <p style={{ margin: 0, fontWeight: 700 }} id="timer-l">{active ? 'Puedes cancelar sin costo en' : 'Tiempo de cancelación terminado'}</p>
              {/* role=timer no se anuncia solo; los avisos van en la región de estado de arriba */}
              <div className="timer" id="timer" role="timer" aria-labelledby="timer-l">{fmt(left)}</div>
              <div className="bar-t" aria-hidden="true"><i style={{ width: `${Math.min(100, (left / total) * 100)}%` }} /></div>
              {canExtend && <button className="btn ghost" style={{ marginTop: '.75rem' }} onClick={extend}><span aria-hidden="true">⏱ </span>Necesito más tiempo (+60 s)</button>}
              <ol className="track" aria-label="Etapas del pedido">{['Recibido', 'En cocina', 'En camino', 'Entregado'].map((t, i) => <li key={t} className={i < cur ? 'done' : i === cur ? 'cur' : ''} aria-current={i === cur ? 'step' : undefined}><span aria-hidden="true" />{t}{i < cur ? <span className="sr-only"> (completado)</span> : null}</li>)}</ol>
            </>
          )}
          <div className="actions">
            {cancelled ? <Link className="btn" to="/carta" onClick={() => dispatch({ type: 'newOrder' })}>Hacer un nuevo pedido</Link>
              : (
                <AnimatePresence mode="wait" initial={false}>
                  {ask ? (
                    <motion.div key="ask" className="banner bad" style={{ width: '100%' }} role="alertdialog" aria-labelledby="ask-t" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <span id="ask-t">¿Seguro que quieres cancelar el pedido?</span>
                      <div className="actions"><button className="btn" autoFocus onClick={() => { dispatch({ type: 'cancel' }); setAsk(false); notify('Pedido cancelado.'); }}>Sí, cancelar</button><button className="btn ghost" onClick={() => setAsk(false)}>No, mantenerlo</button></div>
                    </motion.div>
                  ) : <motion.button key="btn" className="btn" id="cancel" disabled={!active} onClick={() => setAsk(true)}>Cancelar pedido</motion.button>}
                </AnimatePresence>
              )}
          </div>
          <div className="banner info" style={{ marginTop: 16 }}>Al cerrar sesión: se limpia el estado y el historial del pedido en este dispositivo.
            <div className="actions"><button className="btn ghost" onClick={logout}>Cerrar sesión</button></div></div>
        </section>
        <aside className="panel sum" aria-labelledby="det-t">
          <h2 id="det-t" style={{ margin: 0, fontSize: '1.125rem' }}>Detalle</h2>
          {p.units.map((u, i) => <div key={i} className="item-card"><div><h3>Unidad {i + 1}</h3><ul>{u.items.map((t) => <li key={t}>{t}</li>)}</ul></div></div>)}
          <div className="total"><span>Total</span><span>{money(p.total)}</span></div>
          <p className="hint">Entrega: {state.addr || ADDR}<br />Pago: {payName(p.pay)}</p>
        </aside>
      </div>
    </div>
  );
}
