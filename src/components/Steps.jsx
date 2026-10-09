const LABELS = ['Personaliza', 'Revisa', 'Confirma', 'Estado'];

export default function Steps({ cur }) {
  return (
    <ol className="steps" aria-label="Progreso del pedido">
      {LABELS.map((t, i) => (
        <li key={t} className={i + 1 < cur ? 'done' : i + 1 === cur ? 'cur' : ''} aria-current={i + 1 === cur ? 'step' : undefined}>
          {i + 1 < cur ? '✓ ' : ''}Paso {i + 1}: {t}
        </li>
      ))}
    </ol>
  );
}
