export const BASE = 35.9;
export const PAID = 3.9;
export const MAXQ = 4;
export const CANCEL_SECS = 60;
export const ADDR = 'Av. Eglinton 123, Miraflores · 35-45 min';
export const PAYMENTS = [['efectivo', 'Efectivo (contraentrega)'], ['pos', 'Tarjeta con POS (contraentrega)'], ['yape', 'Yape / Plin']];
export const payName = (id) => (PAYMENTS.find((p) => p[0] === id) || PAYMENTS[0])[1];
export const DEMO_CODE = '482913';

export const GROUPS = [
  { id: 'pollo', name: 'Porción de Pollo', opts: [['pierna', '1/4 Pardos Pierna', 0], ['pecho', '1/4 Pardos Pecho', 0]] },
  { id: 'comp', name: 'Complemento', opts: [['fritas', 'Papas Fritas', 0], ['doradas', 'Papas Doradas', 0]] },
  { id: 'ens', name: 'Escoge tu guarnición de ensalada', opts: [['fresca', 'Ensalada fresca', 0], ['cocida', 'Ensalada cocida', 0], ['mixta', 'Ensalada mixta', PAID]] },
  { id: 'beb', name: 'Bebida', opts: [['inca', 'Inca Kola personal helada', 0], ['coca', 'Coca-Cola personal helada', 0], ['chicha', 'Chicha morada 500 ml', PAID]] },
];
export const ADDONS = [
  { id: 'aji', name: 'Pack Ají', price: PAID, img: 'a-aji' },
  { id: 'mayo', name: 'Pack Mayonesa', price: PAID, img: 'a-mayo' },
  { id: 'vinag', name: 'Pack Vinagreta', price: PAID, img: 'a-vinag' },
  { id: 'papasx', name: 'Papas fritas para compartir', price: 16.9, img: 'a-papas' },
];
export const CARDS = [
  { id: 'brasa', cat: 'promo', img: 'p-regular', name: 'Promoción Brasa Para Mí', desc: '1/4 Pardos Brasa + papas + ensalada + bebida. Personaliza cada unidad por separado.', price: BASE, on: true },
  { id: 'chicha', cat: 'entero', img: 'p-chicha', name: 'Promoción Tu Chicha 1.5 LT.', desc: '1 Pardos Brasa + papas fritas + guarnición + botella de chicha de 1.5 LT.', price: 95.5 },
  { id: 'g15', cat: 'entero', img: 'p-g15', name: 'Promoción Tú Eliges con Gaseosa 1.5 LT.', desc: '1 Pardos Brasa + papas fritas + guarnición + Inca Kola 1.5 LT.', price: 90.9 },
  { id: 'g225', cat: 'entero', img: 'p-g225', name: 'Promoción Tú Eliges con Gaseosa 2.25 LT.', desc: '1 Pardos Brasa + papas fritas + guarnición + Inca Kola 2.25 LT.', price: 95.5 },
  { id: 'solo', cat: 'entero', img: 'p-brasa', name: '1 Pardos Brasa', desc: 'Este producto incluye salsas.', price: 60.5 },
  { id: 'papas', cat: 'entero', img: 'p-papas', name: '1 Pardos Brasa con papas fritas o ensalada', desc: 'Elige tu acompañamiento.', price: 66.9 },
];
export const CATS = [['todos', '1 Pardos Brasa'], ['entero', '1/2 Pardos Brasa'], ['cuarto', '1/4 Pardos Brasa'], ['promo', 'Promociones']];
export const TILES = [
  { id: 'brasa', name: 'Pardos Brasa', img: 'cat-brasa', on: true },
  { id: 'parr', name: 'Pardos Parrillero', img: 'cat-parrillero' },
  { id: 'ens', name: 'Ensaladas', img: 'cat-ensaladas' },
  { id: 'anti', name: 'Anticuchos y Mollejitas', img: 'cat-anticuchos' },
];

export const money = (n) => 'S/ ' + n.toFixed(2);
export const optOf = (g, v) => g.opts.find((o) => o[0] === v);

export const newUnit = () => ({ pollo: null, comp: null, ens: null, beb: null, extras: [], flag: {} });
export const newOrder = () => ({ qty: 1, active: 0, units: [newUnit()], attempted: false });

export function unitItems(u) {
  const out = [];
  GROUPS.forEach((g) => {
    if (u[g.id]) { const o = optOf(g, u[g.id]); out.push({ g: g.id, v: o[0], name: o[1], price: o[2] }); }
  });
  u.extras.forEach((v) => { const a = ADDONS.find((x) => x.id === v); out.push({ g: 'extras', v, name: a.name, price: a.price }); });
  return out;
}
export const unitPrice = (u) => BASE + unitItems(u).reduce((a, i) => a + i.price, 0);
export const missing = (u) => GROUPS.filter((g) => !u[g.id]);
export const orderTotal = (o) => o.units.reduce((a, u) => a + unitPrice(u), 0);
export const hasItems = (o) => o.units.some((u) => unitItems(u).length);

export const V = {
  dni: (v) => (v.length === 8 ? '' : v.length === 0 ? 'Ingresa tu DNI.' : `El DNI debe tener 8 dígitos (llevas ${v.length}).`),
  nombre: (v) => (/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{3,}$/.test(v.trim()) && v.trim().includes(' ') ? '' : 'Escribe tus nombres y apellidos tal como figuran en tu DNI.'),
  cel: (v) => (v.length === 0 ? 'Ingresa tu celular.' : v[0] !== '9' ? 'El celular debe empezar con 9.' : v.length < 9 ? `Faltan ${9 - v.length} dígito(s): el celular tiene 9 dígitos.` : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Escribe un correo válido (ej. nombre@correo.com).'),
  code: (v) => (v.length === 6 ? (v === DEMO_CODE ? '' : 'El código no coincide. Revisa e inténtalo de nuevo.') : 'Ingresa los 6 dígitos del código.'),
};
