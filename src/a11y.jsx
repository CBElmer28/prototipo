import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Ajustes de accesibilidad: se guardan en este dispositivo y se aplican como clases en <html>.
const KEY = 'pardos_v3_a11y';
export const ZOOMS = [100, 125, 150, 175, 200];

export const DEFAULTS = {
  zoom: 100,            // lupa: tamaño de toda la interfaz (rem)
  theme: 'system',      // 'light' | 'dark' | 'system'
  contrast: false,      // alto contraste
  spacing: false,       // texto espaciado (lectura)
  links: false,         // subrayar enlaces
  focusStrong: false,   // foco más grueso
  bigTargets: false,    // botones grandes (motricidad)
  bigCursor: false,     // cursor grande
  reduceMotion: false,  // sin animaciones
  simple: false,        // lectura fácil: ayudas paso a paso y menos opciones
  stickyAlerts: false,  // avisos que no desaparecen solos + más visibles
  extraTime: false,     // más tiempo para cancelar (120 s)
};

// Perfiles rápidos pensados en las personas del proyecto
export const PRESETS = [
  { id: 'vision', icon: '👁️', name: 'Baja visión', set: { zoom: 150, contrast: true, focusStrong: true, links: true, bigCursor: true } },
  { id: 'motor', icon: '✋', name: 'Movilidad reducida', set: { bigTargets: true, focusStrong: true, extraTime: true, reduceMotion: true, stickyAlerts: true } },
  { id: 'simple', icon: '🧩', name: 'Lectura fácil', set: { simple: true, spacing: true, zoom: 125, reduceMotion: true, stickyAlerts: true, extraTime: true } },
  { id: 'deaf', icon: '👂', name: 'Sordera o sin audio', set: { stickyAlerts: true } },
];

function load() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULTS }; }
}

const Ctx = createContext(null);
export const useA11y = () => useContext(Ctx);

function systemDark() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { return false; }
}

export function A11yProvider({ children }) {
  const [s, setS] = useState(load);
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* sin storage */ }
    const h = document.documentElement;
    h.style.fontSize = s.zoom + '%';
    h.dataset.theme = s.theme === 'system' ? (systemDark() ? 'dark' : 'light') : s.theme;
    const cls = { hc: s.contrast, spacing: s.spacing, links: s.links, 'focus-strong': s.focusStrong, 'big-targets': s.bigTargets,
      'big-cursor': s.bigCursor, 'reduce-motion': s.reduceMotion, simple: s.simple, 'alerts-strong': s.stickyAlerts, 'zoom-xl': s.zoom >= 150 };
    Object.entries(cls).forEach(([c, on]) => h.classList.toggle(c, !!on));
  }, [s]);

  const set = useCallback((k, v) => setS((p) => ({ ...p, [k]: v })), []);
  const toggle = useCallback((k) => setS((p) => ({ ...p, [k]: !p[k] })), []);
  const applyPreset = useCallback((p) => setS((cur) => ({ ...cur, ...p.set })), []);
  const reset = useCallback(() => setS({ ...DEFAULTS }), []);
  const zoomStep = useCallback((d) => setS((p) => {
    const i = ZOOMS.indexOf(p.zoom);
    const n = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (i < 0 ? 0 : i) + d))];
    return { ...p, zoom: n };
  }), []);

  const value = useMemo(() => ({ s, set, toggle, applyPreset, reset, zoomStep, panel, setPanel }), [s, set, toggle, applyPreset, reset, zoomStep, panel]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Lectura en voz alta (Web Speech API) para personas con baja visión o dificultad lectora
export function speak(text) {
  try {
    if (!('speechSynthesis' in window) || !text) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-PE'; u.rate = 0.9;
    const v = window.speechSynthesis.getVoices().find((x) => x.lang && x.lang.startsWith('es'));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}
export function stopSpeaking() { try { window.speechSynthesis.cancel(); } catch { /* sin voz */ } }
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
