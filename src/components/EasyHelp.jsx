import { canSpeak, speak, useA11y } from '../a11y.jsx';
import Icon from './Icon.jsx';

// Ayuda en lectura fácil (pasos cortos). Solo se ve con "Lectura fácil" activado.
export default function EasyHelp({ icon, title, steps }) {
  const { s } = useA11y();
  if (!s.simple) return null;
  return (
    <aside className="easy" aria-label="Ayuda en lectura fácil">
      <span className="ico"><Icon name={icon} size="2rem" /></span>
      <div>
        <h2>{title}</h2>
        <ol>{steps.map((t) => <li key={t}>{t}</li>)}</ol>
        {canSpeak() && <button type="button" className="btn ghost sm" onClick={() => speak(title + '. ' + steps.join('. '))}><Icon name="volume" /> Escuchar ayuda</button>}
      </div>
    </aside>
  );
}
