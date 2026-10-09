import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ADDR, CANCEL_SECS, money } from '../data.js';
import { useStore } from '../store.jsx';
import { useLogout } from '../components/Header.jsx';
import Steps from '../components/Steps.jsx';

function useLeft(placed) {
  const calc = () => (placed ? Math.max(0, Math.ceil((placed.endAt - Date.now()) / 1000)) : 0);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    if (!placed || placed.status === 'cancelado') return;
    const id = setInterval(() => { const l = calc(); setLeft(l); if (l <= 0) clearInterval(id); }, 250);
    return () => clearInterval(id);
  }, [placed]); // eslint-disable-line react-hooks/exhaustive-deps
  return left;
}

export default function Status() {
  const { state, dispatch, notify } = useStore();
  const logout = useLogout();
  const p = state.placed;
  const left = useLeft(p);
  const [ask, setAsk] = useState(false);
  useEffect(() => { if (p && left === 0 && p.status === 'activo') notify('Se acabó el tiempo de cancelación.'); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return <Navigate to="/" replace />;

  const cancelled = p.status === 'cancelado';
  const active = !cancelled && left > 0;
  const cur = active ? 0 : 1;
  return (
    <div className="wrap page">
      <h1>Estado del pedido</h1>
      <Steps cur={cancelled ? 3 : 4} />
      <div className="layout">
        <section className="panel" aria-live="polite">
          <p className="hint" style={{ margin: 0 }}>Código de tu pedido</p>
          <motion.div className="code" id="code" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{p.code}</motion.div>
          {cancelled ? <div className="banner bad" role="alert">Pedido cancelado. No se te cobrará nada.</div>
            : active ? <div className="banner ok" role="status">✓ Pedido {p.code} confirmado. Te avisaremos cuando salga de cocina.</div>
            : <div className="banner info">👨‍🍳 Tu pedido ya está en cocina y no puede cancelarse.</div>}
          {!cancelled && (
            <>
              <p style={{ margin: 0, fontWeight: 700 }}>{active ? 'Puedes cancelar sin costo en' : 'Tiempo de cancelación terminado'}</p>
              <div className="timer" id="timer" role="timer" aria-label="Tiempo restante para cancelar">0:{String(left).padStart(2, '0')}</div>
              <div className="bar-t" aria-hidden="true"><i style={{ width: `${(left / CANCEL_SECS) * 100}%` }} /></div>
              <ol className="track">{['Recibido', 'En cocina', 'En camino', 'Entregado'].map((t, i) => <li key={t} className={i < cur ? 'done' : i === cur ? 'cur' : ''}><span />{t}</li>)}</ol>
            </>
          )}
          <div className="actions">
            {cancelled ? <Link className="btn" to="/carta" onClick={() => dispatch({ type: 'newOrder' })}>Hacer un nuevo pedido</Link>
              : (
                <AnimatePresence mode="wait" initial={false}>
                  {ask ? (
                    <motion.div key="ask" className="banner bad" style={{ width: '100%' }} role="alertdialog" aria-label="Confirmar cancelación" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      ¿Seguro que quieres cancelar el pedido?
                      <div className="actions"><button className="btn" onClick={() => { dispatch({ type: 'cancel' }); setAsk(false); notify('Pedido cancelado.'); }}>Sí, cancelar</button><button className="btn ghost" onClick={() => setAsk(false)}>No, mantenerlo</button></div>
                    </motion.div>
                  ) : <motion.button key="btn" className="btn" id="cancel" disabled={!active} onClick={() => setAsk(true)}>Cancelar pedido</motion.button>}
                </AnimatePresence>
              )}
          </div>
          <div className="banner info" style={{ marginTop: 16 }}>Al cerrar sesión: se limpia el estado y el historial del pedido en este dispositivo.
            <div className="actions"><button className="btn ghost" onClick={logout}>Cerrar sesión</button></div></div>
        </section>
        <aside className="panel sum">
          <h2 style={{ margin: 0, fontSize: 18 }}>Detalle</h2>
          {p.units.map((u, i) => <div key={i} className="item-card"><div><strong>Unidad {i + 1}</strong><ul>{u.items.map((t) => <li key={t}>{t}</li>)}</ul></div></div>)}
          <div className="total"><span>Total</span><span>{money(p.total)}</span></div>
          <p className="hint">Entrega: {state.addr || ADDR}</p>
        </aside>
      </div>
    </div>
  );
}
