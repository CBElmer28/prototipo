import { useEffect, useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { CVD, PRESETS, ZOOMS, canSpeak, speak, stopSpeaking, useA11y } from '../a11y.jsx';
import Icon from './Icon.jsx';

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

const PRESET_ICON = { vision: 'eye', motor: 'hand', simple: 'book', deaf: 'ear' };
const HC_LABEL = { 0: 'Normal', 25: 'Suave', 50: 'Medio', 75: 'Alto', 100: 'Máximo' };

// Panel lateral: entra desde el costado derecho y cubre la pantalla con un fondo oscuro.
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
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <motion.div ref={box} id="a11y-panel" className="drawer" role="dialog" aria-modal="true" aria-labelledby="a11y-t" onKeyDown={onKey}
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}>
        <div className="drawer-head">
          <h2 id="a11y-t" tabIndex={-1}><Icon name="access" size="1.5rem" /> Opciones de accesibilidad</h2>
          <button className="x" type="button" onClick={close}><Icon name="x" /> Cerrar</button>
        </div>
        <p className="hint">Los cambios se aplican al instante y se guardan en este dispositivo.</p>

        <section className="a11y-sec" aria-labelledby="sec-p">
          <h3 id="sec-p">Perfiles rápidos</h3>
          <div className="presets">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" className="preset" aria-pressed={presetOn(p)} onClick={() => applyPreset(p)}>
                <Icon name={PRESET_ICON[p.id]} size="1.5rem" />{p.name}
              </button>
            ))}
          </div>
        </section>

        <section className="a11y-sec" aria-labelledby="sec-v">
          <h3 id="sec-v"><Icon name="eye" /> Ver mejor</h3>
          <p className="lbl" id="lbl-zoom">Lupa: tamaño de la pantalla</p>
          <div className="seg" role="group" aria-labelledby="lbl-zoom">
            {ZOOMS.map((z) => <button key={z} type="button" aria-pressed={s.zoom === z} onClick={() => set('zoom', z)}>{z} %</button>)}
          </div>
          <p className="lbl" id="lbl-theme">Tema de color</p>
          <div className="seg" role="group" aria-labelledby="lbl-theme">
            {[['light', 'sun', 'Claro'], ['dark', 'moon', 'Oscuro'], ['system', 'monitor', 'Como mi equipo']].map(([v, ic, l]) => (
              <button key={v} type="button" aria-pressed={s.theme === v} onClick={() => set('theme', v)}><Icon name={ic} /> {l}</button>
            ))}
          </div>
          <p className="lbl" id="lbl-cvd"><Icon name="palette" /> Daltonismo</p>
          <p className="hint" style={{ marginTop: 0 }}>Cambia los colores de estados y avisos, y ajusta los colores de las fotos.</p>
          <div className="seg cvd" role="group" aria-labelledby="lbl-cvd">
            {CVD.map(([v, l, d]) => (
              <button key={v} type="button" aria-pressed={s.cvd === v} onClick={() => set('cvd', v)}><span className="cvd-t">{l}</span><span className="cvd-d">{d}</span></button>
            ))}
          </div>
          <label className="lbl" htmlFor="hc-range" style={{ display: 'block' }}>Contraste: {HC_LABEL[s.contrast] ?? s.contrast + ' %'}</label>
          <input id="hc-range" className="range" type="range" min={0} max={100} step={25} value={s.contrast}
            aria-valuetext={HC_LABEL[s.contrast] ?? s.contrast + ' %'} aria-describedby="hc-d" onChange={(e) => set('contrast', Number(e.target.value))} />
          <div className="range-scale" aria-hidden="true"><span>Normal</span><span>Máximo</span></div>
          <p className="hint" id="hc-d">Colores más fuertes y bordes más marcados a medida que subes.</p>
          <Switch k="spacing" title="Texto espaciado" desc="Más espacio entre letras, palabras y líneas." />
          <Switch k="links" title="Subrayar enlaces" desc="Todos los enlaces se ven subrayados." />
          <Switch k="bigCursor" title="Cursor grande" desc="Puntero del mouse más grande y visible." />
        </section>

        <section className="a11y-sec" aria-labelledby="sec-m">
          <h3 id="sec-m"><Icon name="hand" /> Moverse con facilidad</h3>
          <Switch k="bigTargets" title="Botones grandes" desc="Botones y opciones más grandes y separados." />
          <Switch k="focusStrong" title="Foco reforzado" desc="Marco más grueso en el elemento elegido con el teclado." />
          <Switch k="reduceMotion" title="Sin animaciones" desc="Quita movimientos y transiciones." />
          <Switch k="extraTime" title="Más tiempo para cancelar" desc="Tendrás 120 segundos en lugar de 60 para cancelar un pedido." />
        </section>

        <section className="a11y-sec" aria-labelledby="sec-e">
          <h3 id="sec-e"><Icon name="book" /> Entender y recibir avisos</h3>
          <Switch k="simple" title="Lectura fácil" desc="Muestra ayudas paso a paso y oculta lo que no se puede pedir." />
          <Switch k="stickyAlerts" title="Avisos visibles" desc="Los avisos son más grandes y no se borran hasta que los cierres. Útil si no oyes sonidos." />
          {canSpeak() && (
            <div className="actions">
              <button type="button" className="btn ghost" onClick={readPage}><Icon name="volume" /> Escuchar esta pantalla</button>
              <button type="button" className="btn ghost" onClick={stopSpeaking}><Icon name="stop" /> Detener lectura</button>
            </div>
          )}
        </section>

        <div className="actions a11y-sec">
          <button type="button" className="btn ghost" onClick={reset}><Icon name="reset" /> Restablecer todo</button>
          <button type="button" className="btn" onClick={close}>Listo</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
