import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ADDR, CANCEL_SECS, PAYMENTS, hasItems, missing, money, orderTotal, unitItems, unitPrice } from '../data.js';
import { useStore } from '../store.jsx';
import Steps from '../components/Steps.jsx';

function Bounce({ i }) {
  const { dispatch, notify } = useStore();
  useEffect(() => { dispatch({ type: 'attempt', i }); notify('Completa las opciones obligatorias antes de revisar.'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Navigate to="/personalizar" replace />;
}

export default function Review() {
  const { state, dispatch, notify, openRegister } = useStore();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  const [addr, setAddr] = useState(state.addr || ADDR);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const o = state.order;

  if (state.placed && state.placed.status !== 'cancelado') return <Navigate to="/estado" replace />;
  const bad = o.units.findIndex((u) => missing(u).length);
  if (hasItems(o) && bad >= 0) return <Bounce i={bad} />;

  if (!hasItems(o)) {
    return (
      <div className="wrap page"><h1>Tu pedido está vacío</h1><Steps cur={2} />
        <div className="empty"><strong>No tienes productos en tu pedido.</strong><p>Elige la promoción para comenzar.</p><Link className="btn" to="/carta">Ir a la carta</Link></div>
      </div>
    );
  }

  const place = () => {
    setBusy(true);
    timer.current = setTimeout(() => { dispatch({ type: 'place' }); nav('/estado'); notify('¡Pedido confirmado!'); }, 1200);
  };
  const confirm = () => (state.user ? place() : openRegister(place));
  const saveAddr = () => { if (addr.trim().length < 5) return notify('Escribe una dirección válida.'); dispatch({ type: 'addr', v: addr.trim() }); setEdit(false); notify('Dirección actualizada.'); };

  return (
    <div className="wrap page">
      <h1>Revisa tu pedido antes de confirmar</h1>
      <Steps cur={2} />
      <div className="layout">
        <section>
          <AnimatePresence initial={false}>
            {o.units.map((u, i) => (
              <motion.div key={i + '-' + unitItems(u).map((t) => t.v).join()} layout className="item-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }}>
                <div><strong>Unidad {i + 1} — Brasa Para Mí</strong>
                  <ul>{unitItems(u).map((t) => <li key={t.g + t.v}>{t.name}{t.price ? <> <span className="tagp pay">+ {money(t.price)}</span></> : null}</li>)}</ul></div>
                <div style={{ textAlign: 'right' }}><div className="price">{money(unitPrice(u))}</div>
                  <button className="btn ghost sm" onClick={() => { dispatch({ type: 'tab', i }); nav('/personalizar'); }}>Editar</button>{' '}
                  <button className="btn ghost sm" aria-label={`Quitar unidad ${i + 1}`} onClick={() => { dispatch({ type: 'rmunit', i }); notify('Quitaste una unidad del pedido.'); }}>Quitar</button></div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="panel"><h3 style={{ margin: '0 0 6px' }}>Entrega</h3>
            {edit ? (
              <><div className="field"><label htmlFor="addr">Dirección de entrega</label><input id="addr" type="text" value={addr} autoFocus onChange={(e) => setAddr(e.target.value)} /></div><button className="btn sm" onClick={saveAddr}>Guardar</button></>
            ) : (
              <div className="ghead"><span>{state.addr || ADDR}</span><button className="link" onClick={() => setEdit(true)}>Cambiar</button></div>
            )}
          </div>
          <div className="panel"><h3 style={{ margin: '0 0 6px' }}>Método de pago</h3>
            <div role="radiogroup" aria-label="Método de pago">
              {PAYMENTS.map(([id, name]) => (
                <label key={id} className="opt"><input type="radio" name="pay" checked={(state.pay || 'efectivo') === id} onChange={() => dispatch({ type: 'pay', v: id })} /><span className="n">{name}</span></label>
              ))}
            </div>
            <p className="hint">Pagas al recibir tu pedido. Puedes cambiarlo antes de confirmar.</p>
          </div>
        </section>
        <aside className="panel sticky">
          <div className="banner info" style={{ marginTop: 0 }}>Antes de confirmar: al confirmar se enviará tu pedido a la cocina. Podrás cancelarlo sin costo durante {CANCEL_SECS} s.</div>
          <div className="total"><span>Total</span><span>{money(orderTotal(o))}</span></div>
          <button className="btn" style={{ width: '100%' }} id="confirm" disabled={busy} onClick={confirm}>{busy ? <><span className="spin" /> Confirmando…</> : 'Confirmar pedido'}</button>
          <Link className="btn ghost" style={{ width: '100%', marginTop: 8 }} to="/personalizar">Seguir editando</Link>
        </aside>
      </div>
    </div>
  );
}
