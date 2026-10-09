import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { hasItems } from '../data.js';

export function useLogout() {
  const { dispatch, notify } = useStore();
  const nav = useNavigate();
  return () => { dispatch({ type: 'logout' }); nav('/'); notify('Sesión cerrada. Se borró tu pedido e historial.'); };
}

export default function Header() {
  const { state, openRegister } = useStore();
  const logout = useLogout();
  const live = state.placed && state.placed.status !== 'cancelado';
  const n = !live && hasItems(state.order) ? ` (${state.order.units.length})` : '';
  return (
    <header className="topbar">
      <div className="wrap bar">
        <Link to="/" className="brand" aria-label="Pardos Chicken – Inicio"><span className="logo" aria-hidden="true">P</span><span>Pardos Chicken</span></Link>
        <nav className="nav" aria-label="Principal"><Link to="/">Promociones</Link><Link to="/carta">Carta</Link></nav>
        <div className="bar-right">
          <Link className="btn ghost sm" to={live ? '/estado' : '/personalizar'}>Mi pedido{n}</Link>
          {state.user ? (
            <>
              <span aria-live="polite">Hola, <strong>{state.user.nombre.split(' ')[0]}</strong></span>
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
