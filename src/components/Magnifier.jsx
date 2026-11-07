import { useState } from 'react';
import { ZOOMS, useA11y } from '../a11y.jsx';

// Lupa flotante: agranda toda la pantalla (100 % → 200 %) y la reacomoda sin scroll horizontal.
export default function Magnifier() {
  const { s, zoomStep, set } = useA11y();
  const [open, setOpen] = useState(false);
  return (
    <div className="lupa">
      {open && (
        <div className="lupa-bar" role="group" aria-label="Lupa">
          <button type="button" aria-label="Reducir pantalla" disabled={s.zoom <= ZOOMS[0]} onClick={() => zoomStep(-1)}>−</button>
          <output aria-live="polite" aria-label="Tamaño actual">{s.zoom} %</output>
          <button type="button" aria-label="Ampliar pantalla" disabled={s.zoom >= ZOOMS[ZOOMS.length - 1]} onClick={() => zoomStep(1)}>+</button>
          <button type="button" onClick={() => set('zoom', 100)}>100 %</button>
        </div>
      )}
      <button type="button" className="lupa-fab" aria-expanded={open} aria-label="Lupa: ampliar pantalla" title="Lupa" onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true">🔍</span>
      </button>
    </div>
  );
}
