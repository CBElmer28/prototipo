import { canSpeak, speak, useA11y } from '../a11y.jsx';

// Ayuda en lectura fácil (pasos cortos con íconos). Solo se ve con "Lectura fácil" activado.
export default function EasyHelp({ icon, title, steps }) {
  const { s } = useA11y();
  if (!s.simple) return null;
  return (
    <aside className="easy" aria-label="Ayuda en lectura fácil">
      <span className="ico" aria-hidden="true">{icon}</span>
      <div>
        <h2>{title}</h2>
        <ol>{steps.map((t) => <li key={t}>{t}</li>)}</ol>
        {canSpeak() && <button type="button" className="btn ghost sm" onClick={() => speak(title + '. ' + steps.join('. '))}><span aria-hidden="true">🔊</span> Escuchar ayuda</button>}
      </div>
    </aside>
  );
}
