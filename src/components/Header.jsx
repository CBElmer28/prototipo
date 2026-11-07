import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useA11y } from '../a11y.jsx';
import { hasItems } from '../data.js';
import Icon from './Icon.jsx';

export function useLogout() {
  const { dispatch, notify } = useStore();
  const nav = useNavigate();
  return () => { dispatch({ type: 'logout' }); nav('/'); notify('Sesión cerrada. Se borró tu pedido e historial.'); };
}

export default function Header() {
  const { state, openRegister } = useStore();
  const { narrow } = useA11y();
  const loc = useLocation();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const live = state.placed && state.placed.status !== 'cancelado';
  const n = !live && hasItems(state.order) ? ` (${state.order.units.length})` : '';

  useEffect(() => { setOpen(false); }, [loc.pathname, narrow]);

  const links = <><NavLink to="/" end>Promociones</NavLink><NavLink to="/carta">Carta</NavLink></>;
  const actions = (
    <>
      <Link className="btn ghost sm" to={live ? '/estado' : '/personalizar'}>Mi pedido{n}</Link>
      {state.user ? (
        <>
          <span className="hello">Hola, <strong>{state.user.nombre.split(' ')[0]}</strong></span>
          <button className="btn sm" onClick={logout}>Cerrar sesión</button>
        </>
      ) : (
        <button className="btn sm" onClick={() => openRegister()}>Ingresar</button>
      )}
    </>
  );

  return (
    <header className="topbar" onKeyDown={(e) => { if (e.key === 'Escape' && open) { setOpen(false); document.getElementById('menu-btn')?.focus(); } }}>
      <div className="wrap bar">
        <Link to="/" className="brand" aria-label="Pardos Chicken – Inicio"><span className="logo" aria-hidden="true">P</span><span className="brand-t">Pardos Chicken</span></Link>
        {narrow ? (
          <button type="button" id="menu-btn" className="menu-btn" aria-expanded={open} aria-controls="menu-panel" onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'x' : 'menu'} /> {open ? 'Cerrar' : 'Menú'}
          </button>
        ) : (
          <>
            <nav className="nav" aria-label="Principal">{links}</nav>
            <div className="bar-right">{actions}</div>
          </>
        )}
      </div>
      {narrow && open && (
        <div className="menu-panel" id="menu-panel">
          <div className="wrap">
            <nav className="menu-nav" aria-label="Principal">{links}</nav>
            <div className="menu-actions">{actions}</div>
          </div>
        </div>
      )}
    </header>
  );
}
