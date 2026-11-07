import { useEffect, useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { PRESETS, ZOOMS, canSpeak, speak, stopSpeaking, useA11y } from '../a11y.jsx';

function Switch({ k, title, desc }) {
  const { s, toggle } = useA11y();
  const id = useId();
  const on = !!s[k];
  return (
    <button type="button" className="sw" role="switch" aria-checked={on} aria-labelledby={id + 't'} aria-describedby={id + 'd'} onClick={() => toggle(k)}>
      <span><span className="t" id={id + 't'}>{title}</span><span className="d" id={id + 'd'}>{desc}</span></span>
      <span className="state-txt" aria-hidden="true">{on ? 'Sí' : 'No'}</span>
      <span className="k" aria-hidden="true" />
    </button>
  );
}

export default function A11yPanel() {
  const { s, set, applyPreset, reset, setPanel } = useA11y();
  const box = useRef(null);
  const close = () => { stopSpeaking(); setPanel(false); };

  useEffect(() => {
    const prev = document.activeElement;
    box.current?.querySelector('h2')?.focus();
    return () => { if (prev && document.contains(prev)) prev.focus(); };
  }, []);

  const onKey = (e) => {
    if (e.key === 'Escape') return close();
    if (e.key !== 'Tab') return;
    const els = [...box.current.querySelectorAll('button:not([disabled])')];
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const presetOn = (p) => Object.entries(p.set).every(([k, v]) => s[k] === v);
  const readPage = () => {
    const main = document.getElementById('main');
    speak(main ? main.innerText.slice(0, 1200) : '');
  };

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <motion.div ref={box} className="modal wide" role="dialog" aria-modal="true" aria-labelledby="a11y-t" onKeyDown={onKey}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <button className="x" type="button" onClick={close}>✕ Cerrar</button>
        <h2 id="a11y-t" tabIndex={-1}>Opciones de accesibilidad</h2>
        <p className="hint">Los cambios se aplican al instante y se guardan en este dispositivo.</p>

        <section className="a11y-sec" aria-labelledby="sec-p">
          <h3 id="sec-p">Perfiles rápidos</h3>
          <div className="presets">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" className="preset" aria-pressed={presetOn(p)} onClick={() => applyPreset(p)}>
                <span aria-hidden="true">{p.icon}</span>{p.name}
              </button>
            ))}
          </div>
        </section>

        <section className="a11y-sec" aria-labelledby="sec-v">
          <h3 id="sec-v"><span aria-hidden="true">👁️</span> Ver mejor</h3>
          <p className="t" id="lbl-zoom" style={{ fontWeight: 700, margin: '0 0 .25rem' }}>Lupa: tamaño de la pantalla</p>
          <div className="seg" role="group" aria-labelledby="lbl-zoom">
            {ZOOMS.map((z) => <button key={z} type="button" aria-pressed={s.zoom === z} onClick={() => set('zoom', z)}>{z} %</button>)}
          </div>
          <p className="t" id="lbl-theme" style={{ fontWeight: 700, margin: '.75rem 0 .25rem' }}>Tema de color</p>
          <div className="seg" role="group" aria-labelledby="lbl-theme">
            {[['light', '☀️ Claro'], ['dark', '🌙 Oscuro'], ['system', '💻 Como mi equipo']].map(([v, l]) => (
              <button key={v} type="button" aria-pressed={s.theme === v} onClick={() => set('theme', v)}>{l}</button>
            ))}
          </div>
          <Switch k="contrast" title="Alto contraste" desc="Colores más fuertes y bordes negros o blancos." />
          <Switch k="spacing" title="Texto espaciado" desc="Más espacio entre letras, palabras y líneas." />
          <Switch k="links" title="Subrayar enlaces" desc="Todos los enlaces se ven subrayados." />
          <Switch k="bigCursor" title="Cursor grande" desc="Puntero del mouse más grande y visible." />
        </section>

        <section className="a11y-sec" aria-labelledby="sec-m">
          <h3 id="sec-m"><span aria-hidden="true">✋</span> Moverse con facilidad</h3>
          <Switch k="bigTargets" title="Botones grandes" desc="Botones y opciones más grandes y separados." />
          <Switch k="focusStrong" title="Foco reforzado" desc="Marco más grueso en el elemento elegido con el teclado." />
          <Switch k="reduceMotion" title="Sin animaciones" desc="Quita movimientos y transiciones." />
          <Switch k="extraTime" title="Más tiempo para cancelar" desc="Tendrás 120 segundos en lugar de 60 para cancelar un pedido." />
        </section>

        <section className="a11y-sec" aria-labelledby="sec-e">
          <h3 id="sec-e"><span aria-hidden="true">🧩</span> Entender y recibir avisos</h3>
          <Switch k="simple" title="Lectura fácil" desc="Muestra ayudas paso a paso y oculta lo que no se puede pedir." />
          <Switch k="stickyAlerts" title="Avisos visibles" desc="Los avisos son más grandes y no se borran hasta que los cierres. Útil si no oyes sonidos." />
          {canSpeak() && (
            <div className="actions">
              <button type="button" className="btn ghost" onClick={readPage}><span aria-hidden="true">🔊</span> Escuchar esta pantalla</button>
              <button type="button" className="btn ghost" onClick={stopSpeaking}><span aria-hidden="true">⏹</span> Detener lectura</button>
            </div>
          )}
        </section>

        <div className="actions a11y-sec">
          <button type="button" className="btn ghost" onClick={reset}>Restablecer todo</button>
          <button type="button" className="btn" onClick={close}>Listo</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
