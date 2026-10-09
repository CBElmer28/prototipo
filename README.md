# Prototipo APF2 – Pardos Chicken (React + Vite)

Versión dinámica del prototipo: React 18, React Router (HashRouter), Framer Motion y estado global con `useReducer` + localStorage.

## Comandos
- `npm install` — instala dependencias
- `npm run dev` — desarrollo en http://localhost:5173
- `npm run build` — genera `dist/` (estático, `base: './'`)
- `npm test` — prueba de flujo completo (Vitest + Testing Library)

## Desplegar en Vercel
**Opción A – CLI (la más rápida):**
```
npm i -g vercel
vercel login
vercel --prod
```
Acepta los valores por defecto (Vite se detecta solo; `vercel.json` ya define build y `dist`).

**Opción B – GitHub:** sube `prototipo-react` a un repo → vercel.com/new → Import → Deploy. Cada `git push` redespliega.

Tras desplegar, abre la URL en una ventana de incógnito para confirmar que es pública (Settings → Deployment Protection debe estar en *Disabled* si pide login).

## Estructura
- `src/data.js` datos, precios, validadores · `src/store.jsx` estado global y acciones
- `src/views/` Home, Carta, Customize (vista 3), Review (vista 4), Status (vista 5)
- `src/components/RegisterModal.jsx` (vista 2: DNI, celular, Ley 29733, código de verificación)

## Dinamismo añadido
Transiciones entre pantallas, acordeones animados, skeleton de carga en la carta, filtros/búsqueda animados, barra de progreso por unidad, toasts, modal animado y total que reacciona al cambio.
