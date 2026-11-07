import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useA11y } from '../a11y.jsx';
import { hasItems } from '../data.js';

export function useLogout() {
  const { dispatch, notify } = useStore();
  const nav = useNavigate();
  return () => { dispatch({ type: 'logout' }); nav('/'); notify('Sesión cerrada. Se borró tu pedido e historial.'); };
}

export default function Header() {
  const { state, openRegister } = useStore();
  const { setPanel } = useA11y();
  const logout = useLogout();
  const live = state.placed && state.placed.status !== 'cancelado';
  const n = !live && hasItems(state.order) ? ` (${state.order.units.length})` : '';
  return (
    <header className="topbar">
      <div className="wrap bar">
        <Link to="/" className="brand" aria-label="Pardos Chicken – Inicio"><span className="logo" aria-hidden="true">P</span><span>Pardos Chicken</span></Link>
        <nav className="nav" aria-label="Principal"><NavLink to="/" end>Promociones</NavLink><NavLink to="/carta">Carta</NavLink></nav>
        <div className="bar-right">
          <button type="button" className="btn sm a11y-btn" onClick={() => setPanel(true)}><span aria-hidden="true">♿</span> Accesibilidad</button>
          <Link className="btn ghost sm" to={live ? '/estado' : '/personalizar'}>Mi pedido{n}</Link>
          {state.user ? (
            <>
              <span>Hola, <strong>{state.user.nombre.split(' ')[0]}</strong></span>
              <button className="btn sm" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <button className="btn sm" onClick={() => openRegister()}>Ingresar</button>
          )}
        </div>
      </div>
    </header>
  );
}
