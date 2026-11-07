import { useState } from 'react';
import { ZOOMS, useA11y } from '../a11y.jsx';
import Icon from './Icon.jsx';

// Pestañas fijas en el costado derecho: Accesibilidad y Lupa (fuera de la cabecera).
export default function SideDock() {
  const { s, zoomStep, set, panel, setPanel } = useA11y();
  const [lupa, setLupa] = useState(false);
  return (
    <div className="dock" role="region" aria-label="Herramientas de accesibilidad">
      <button type="button" className="dock-btn" aria-expanded={panel} aria-controls="a11y-panel" onClick={() => setPanel(true)}>
        <Icon name="access" size="1.75rem" /><span>Accesibilidad</span>
      </button>
      <div className="dock-lupa">
        {lupa && (
          <div className="lupa-bar" id="lupa-bar" role="group" aria-label="Lupa">
            <button type="button" aria-label="Reducir pantalla" disabled={s.zoom <= ZOOMS[0]} onClick={() => zoomStep(-1)}><Icon name="zoomOut" /></button>
            <output aria-live="polite">{s.zoom} %</output>
            <button type="button" aria-label="Ampliar pantalla" disabled={s.zoom >= ZOOMS[ZOOMS.length - 1]} onClick={() => zoomStep(1)}><Icon name="zoomIn" /></button>
            <button type="button" className="txt" onClick={() => set('zoom', 100)}>100 %</button>
          </div>
        )}
        <button type="button" className="dock-btn" aria-expanded={lupa} aria-controls="lupa-bar" onClick={() => setLupa((o) => !o)}>
          <Icon name="search" size="1.75rem" /><span>Lupa</span>
        </button>
      </div>
    </div>
  );
}
