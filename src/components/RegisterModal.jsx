import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DEMO_CODE, V } from '../data.js';
import { useStore } from '../store.jsx';

function Field({ id, label, hint, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="hint" id={id + '-h'}>{hint}</p>}
      <p className="err" id={id + '-e'} role="alert">{error}</p>
    </div>
  );
}

export default function RegisterModal() {
  const { closeRegister, finishRegister } = useStore();
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ dni: '', nombre: '', cel: '', email: '', terms: false, promo: false });
  const [sent, setSent] = useState(false); // se intentó enviar → mostrar todos los errores
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const box = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    return () => { if (prev && document.contains(prev)) prev.focus(); };
  }, []);
  useEffect(() => { box.current?.querySelector('input')?.focus(); }, [step]);

  const onKey = (e) => {
    if (e.key === 'Escape') return closeRegister();
    if (e.key !== 'Tab') return;
    const els = [...box.current.querySelectorAll('button:not([disabled]),input,a[href]')];
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const digits = (k) => (e) => set(k, e.target.value.replace(/\D/g, ''));
  const err = (k) => (f[k].length || sent ? V[k](f[k]) : '');
  const props = (k) => ({ id: k, value: f[k], 'aria-invalid': !!err(k), className: f[k] && !V[k](f[k]) ? 'valid' : undefined, 'aria-describedby': `${k}-h ${k}-e` });
  const termsErr = sent && !f.terms ? 'Debes aceptar los términos y la política de datos (Ley N° 29733).' : '';

  const submit1 = (e) => {
    e.preventDefault(); setSent(true);
    if (['dni', 'nombre', 'cel', 'email'].some((k) => V[k](f[k])) || !f.terms) return;
    setBusy(true); setTimeout(() => { setBusy(false); setStep(2); }, 900);
  };
  const submit2 = (e) => {
    e.preventDefault();
    const m = V.code(code);
    if (m) return setCodeErr(m);
    setBusy(true);
    setTimeout(() => finishRegister({ dni: f.dni, nombre: f.nombre.trim(), cel: f.cel, email: f.email, promo: f.promo }), 800);
  };

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && closeRegister()}>
      <motion.div ref={box} className="modal" role="dialog" aria-modal="true" aria-labelledby="reg-t" onKeyDown={onKey}
        initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
        <button className="x" onClick={closeRegister} aria-label="Cerrar">×</button>
        {step === 1 ? (
          <>
            <h2 id="reg-t">Crea tu cuenta</h2>
            <p className="hint" style={{ marginBottom: 12 }}>Los campos con * son obligatorios.</p>
            <form noValidate onSubmit={submit1}>
              <Field id="dni" label="Número de DNI *" hint="No mostramos ni autocompletamos datos del titular de este DNI." error={err('dni')}>
                <input {...props('dni')} type="text" inputMode="numeric" autoComplete="off" maxLength={8} placeholder="8 dígitos" onChange={digits('dni')} />
              </Field>
              <Field id="nombre" label="Nombres y apellidos *" error={err('nombre')}>
                <input {...props('nombre')} type="text" autoComplete="name" placeholder="Tal como figura en tu DNI" onChange={(e) => set('nombre', e.target.value)} />
              </Field>
              <Field id="cel" label="Celular *" hint={`9 dígitos y empieza con 9 · ${f.cel.length}/9`} error={err('cel')}>
                <div className="pre"><span>+51</span><input {...props('cel')} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={9} placeholder="9XXXXXXXX" onChange={digits('cel')} /></div>
              </Field>
              <Field id="email" label="Correo electrónico *" error={err('email')}>
                <input {...props('email')} type="email" autoComplete="email" placeholder="nombre@correo.com" onChange={(e) => set('email', e.target.value)} />
              </Field>
              <div className="law">
                <strong>Ley N° 29733 — Tratamiento de datos personales</strong>
                <label className="chk"><input type="checkbox" id="terms" checked={f.terms} onChange={(e) => set('terms', e.target.checked)} /><span>Acepto los Términos y Condiciones y la Política de Privacidad. Autorizo el tratamiento de mis datos para gestionar mi cuenta y pedidos. *</span></label>
                <p className="err" id="terms-e" role="alert">{termsErr}</p>
                <label className="chk"><input type="checkbox" id="promo" checked={f.promo} onChange={(e) => set('promo', e.target.checked)} /><span>(Opcional) Deseo recibir promociones y ofertas.</span></label>
              </div>
              <div className="actions">
                <button className="btn" type="submit" disabled={busy}>{busy ? <><span className="spin" /> Enviando código…</> : 'Enviar código de verificación'}</button>
                <button className="btn ghost" type="button" onClick={closeRegister}>Cancelar</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 id="reg-t">Verifica tu identidad</h2>
            <p>Enviamos un código de 6 dígitos a <strong>{f.email}</strong> y al celular <strong>+51 {f.cel}</strong>.</p>
            <div className="banner info">Código de prueba (demo): <strong>{DEMO_CODE}</strong></div>
            <form noValidate onSubmit={submit2}>
              <Field id="code" label="Código de verificación" error={codeErr}>
                <input id="code" type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} aria-invalid={!!codeErr}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setCodeErr(''); }} />
              </Field>
              <div className="actions">
                <button className="btn" type="submit" disabled={busy}>{busy ? <><span className="spin" /> Creando cuenta…</> : 'Verificar y crear cuenta'}</button>
                <button className="btn ghost" type="button" onClick={() => { setStep(1); setSent(false); }}>← Corregir datos</button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
