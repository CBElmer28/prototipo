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

## v3.0 accesible (rama `v3`, APF3)
Correcciones de la auditoría WCAG 2.1 AA de la v2.0 y opciones de accesibilidad:
- **Foco y títulos (2.4.3, 2.4.2):** al cambiar de pantalla el foco pasa al título y cambia el título de la pestaña; si faltan opciones, el foco va al primer grupo pendiente.
- **Nombres accesibles (4.1.2):** "Agregar Pack Ají", "Editar unidad 1"; pestañas con flechas, Inicio y Fin.
- **Mensajes de estado (4.1.3):** el temporizador ya no se lee cada segundo; solo avisa a los 30 s, 10 s y al final.
- **Tiempo ajustable (2.2.1):** botón "Necesito más tiempo (+60 s)" y opción de 120 s.
- **Contraste (1.4.3):** "Incluido" más oscuro y franja oscura detrás del texto de las categorías.
- **Etiquetas (3.3.2):** búsqueda con etiqueta visible; campos obligatorios con `aria-required`.
- **Panel ♿ Accesibilidad:** perfiles rápidos (baja visión, movilidad reducida, lectura fácil, sordera), lupa 100–200 %, tema claro/oscuro/sistema, alto contraste, texto espaciado, subrayar enlaces, cursor grande, botones grandes, foco reforzado, sin animaciones, más tiempo, lectura fácil con ayudas paso a paso, avisos visibles que no desaparecen y lectura en voz alta.
- **Lupa flotante 🔍:** amplía toda la pantalla y la reacomoda en una columna sin scroll horizontal.
