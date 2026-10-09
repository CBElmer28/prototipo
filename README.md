# Prototipo APF2 – Pardos Chicken (React + Vite)

Versión dinámica del prototipo: React 18, React Router (HashRouter), Framer Motion y estado global con `useReducer` + localStorage.

## Comandos
- `npm install` — instala dependencias
- `npm run dev` — desarrollo en http://localhost:5173
- `npm run build` — genera `dist/` (estático, `base: './'`)
- `npm test` — prueba de flujo completo (Vitest + Testing Library)

## Desplegar
- **Netlify:** build `npm run build`, publish `dist` (o arrastra `dist/` a https://app.netlify.com/drop).
- **Vercel:** importa la carpeta; detecta Vite solo.
- **GitHub Pages:** sube el contenido de `dist/` (rutas con `#`, no requiere reglas de redirección).

## Estructura
- `src/data.js` datos, precios, validadores · `src/store.jsx` estado global y acciones
- `src/views/` Home, Carta, Customize (vista 3), Review (vista 4), Status (vista 5)
- `src/components/RegisterModal.jsx` (vista 2: DNI, celular, Ley 29733, código de verificación)

## Dinamismo añadido
Transiciones entre pantallas, acordeones animados, skeleton de carga en la carta, filtros/búsqueda animados, barra de progreso por unidad, toasts, modal animado y total que reacciona al cambio.
