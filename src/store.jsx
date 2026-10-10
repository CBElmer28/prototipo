import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { CANCEL_SECS, MAXQ, newOrder, newUnit, orderTotal, unitItems } from './data.js';

const KEY = 'pardos_apf2_react_v1';
const blank = () => ({ user: null, order: newOrder(), placed: null, addr: null, pay: 'efectivo' });

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.order) return s; } catch { /* sin storage */ }
  return blank();
}

function reducer(s, a) {
  const o = s.order;
  const unit = o.units[o.active];
  const setUnit = (fn) => ({ ...s, order: { ...o, units: o.units.map((u, i) => (i === o.active ? fn(u) : u)) } });
  switch (a.type) {
    case 'qty+': return o.qty >= MAXQ ? s : { ...s, order: { ...o, qty: o.qty + 1, units: [...o.units, newUnit()], active: o.qty } };
    case 'qty-': return o.qty <= 1 ? s : { ...s, order: { ...o, qty: o.qty - 1, units: o.units.slice(0, -1), active: Math.min(o.active, o.qty - 2) } };
    case 'tab': return { ...s, order: { ...o, active: a.i } };
    case 'pick': return setUnit((u) => ({ ...u, [a.g]: a.v, flag: { ...u.flag, [a.g]: false } }));
    case 'addon': return setUnit((u) => ({ ...u, extras: u.extras.includes(a.v) ? u.extras.filter((x) => x !== a.v) : [...u.extras, a.v] }));
    case 'rmitem': return setUnit((u) => (a.g === 'extras' ? { ...u, extras: u.extras.filter((x) => x !== a.v) } : { ...u, [a.g]: null, flag: { ...u.flag, [a.g]: true } }));
    case 'copy': return setUnit(() => JSON.parse(JSON.stringify(o.units[0])));
    case 'attempt': return { ...s, order: { ...o, attempted: true, active: a.i ?? o.active } };
    case 'rmunit': {
      const units = o.units.filter((_, i) => i !== a.i);
      return { ...s, order: units.length ? { ...o, units, qty: units.length, active: 0 } : newOrder() };
    }
    case 'addr': return { ...s, addr: a.v };
    case 'pay': return { ...s, pay: a.v };
    case 'user': return { ...s, user: a.user };
    case 'place': {
      const code = 'PC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      return { ...s, order: newOrder(), placed: { code, endAt: Date.now() + CANCEL_SECS * 1000, status: 'activo', total: orderTotal(o), pay: s.pay || 'efectivo', units: o.units.map((u) => ({ items: unitItems(u).map((t) => t.name) })) } };
    }
    case 'cancel': return { ...s, placed: { ...s.placed, status: 'cancelado' } };
    case 'newOrder': return { ...s, placed: null };
    case 'logout': return blank();
    default: return s;
  }
}

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(false);
  const after = useRef(null);
  const tt = useRef();

  // Persistencia: un estado vacío (tras cerrar sesión) borra la clave por completo.
  useEffect(() => {
    try {
      const empty = !state.user && !state.placed && !state.addr && state.order.qty === 1 && state.order.units.length === 1 && !unitItems(state.order.units[0]).length;
      if (empty) { localStorage.removeItem(KEY); sessionStorage.clear(); } else localStorage.setItem(KEY, JSON.stringify(state));
    } catch { /* sin storage */ }
  }, [state]);

  const notify = useCallback((msg) => { setToast({ msg, id: Date.now() }); clearTimeout(tt.current); tt.current = setTimeout(() => setToast(null), 3200); }, []);
  const openRegister = useCallback((cb) => { after.current = cb || null; setModal(true); }, []);
  const closeRegister = useCallback(() => { after.current = null; setModal(false); }, []);
  const finishRegister = useCallback((user) => {
    dispatch({ type: 'user', user }); setModal(false);
    notify('¡Cuenta verificada! Bienvenido/a, ' + user.nombre.split(' ')[0] + '.');
    const cb = after.current; after.current = null; if (cb) cb();
  }, [notify]);

  return <Ctx.Provider value={{ state, dispatch, toast, notify, modal, openRegister, closeRegister, finishRegister }}>{children}</Ctx.Provider>;
}
