import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within, configure, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './store.jsx';
import { A11yProvider } from './a11y.jsx';

configure({ asyncUtilTimeout: 4000 });
globalThis.IntersectionObserver = class { constructor(cb) { this.cb = cb; } observe(el) { this.cb([{ isIntersecting: true, target: el }]); } unobserve() {} disconnect() {} };
window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });

beforeEach(() => {
  localStorage.clear(); window.location.hash = '#/'; window.scrollTo = () => {};
  const h = document.documentElement; h.className = ''; h.style.fontSize = ''; delete h.dataset.theme;
});

const setup = () => { const user = userEvent.setup(); render(<HashRouter><A11yProvider><StoreProvider><App /></StoreProvider></A11yProvider></HashRouter>); return user; };
const pick = async (user, name) => { await user.click(await screen.findByLabelText(name)); };

describe('flujo completo v3.0', () => {
  it('catálogo → personalizar → revisar → registro → estado → más tiempo → cancelar → cerrar sesión', async () => {
    const user = setup();
    await user.click(await screen.findByRole('link', { name: /Pardos Brasa/ }));
    const h1 = await screen.findByRole('heading', { name: 'PARDOS BRASA' });
    // 2.4.3 / 2.4.2: al cambiar de pantalla el foco va al título y el documento cambia de título
    await waitFor(() => expect(document.activeElement).toBe(h1));
    expect(document.title).toMatch(/^Carta/);
    await waitFor(() => expect(screen.getAllByRole('article').length).toBeGreaterThan(3));
    await user.type(screen.getByLabelText('Buscar en la carta'), 'zzzz');
    expect(await screen.findByText(/No encontramos productos/)).toBeTruthy();
    await user.clear(screen.getByLabelText('Buscar en la carta'));
    await user.click(await screen.findByRole('button', { name: /^Agregar Promoción Brasa Para Mí/ }));

    await user.click(await screen.findByLabelText('Agregar un combo'));
    await user.click(screen.getByRole('button', { name: 'Revisar y confirmar pedido' }));
    expect((await screen.findAllByText(/Falta elegir/)).length).toBeGreaterThan(0);
    // 2.4.3: el foco pasa al primer grupo pendiente
    await waitFor(() => expect(document.activeElement.className).toContain('acc-h'));

    // pestañas con flechas (patrón ARIA)
    const t1 = screen.getByRole('tab', { name: /Unidad 1/ });
    await user.click(t1);
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('tab', { name: /Unidad 2/ }).getAttribute('aria-selected')).toBe('true'));
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getByRole('tab', { name: /Unidad 1/ }).getAttribute('aria-selected')).toBe('true'));

    for (const n of ['1/4 Pardos Pierna', 'Papas Doradas', 'Ensalada fresca', 'Inca Kola personal helada']) await pick(user, new RegExp(n));
    // 4.1.2: el botón del extra dice qué producto agrega
    await user.click(screen.getByRole('button', { name: /^Agregar Pack Ají/ }));
    expect(screen.getByRole('button', { name: /Agregado Pack Ají/ }).getAttribute('aria-pressed')).toBe('true');
    await user.click(screen.getByRole('tab', { name: /Unidad 2/ }));
    await user.click(screen.getByRole('button', { name: /Copiar de Unidad 1/ }));
    await waitFor(() => expect(screen.getByText('S/ 79.60', { selector: 'strong' })).toBeTruthy());

    await user.click(screen.getByRole('button', { name: 'Revisar y confirmar pedido' }));
    await screen.findByRole('heading', { level: 1, name: /Revisa tu pedido/ });
    expect(screen.getByRole('button', { name: 'Editar unidad 1' })).toBeTruthy();
    await user.click(screen.getByLabelText('Yape / Plin'));
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    const dlg = await screen.findByRole('dialog');
    await user.type(within(dlg).getByLabelText(/Número de DNI/), '1234');
    expect(within(dlg).getByText(/llevas 4/)).toBeTruthy();
    await user.type(within(dlg).getByLabelText(/Celular/), '8');
    expect(within(dlg).getByText(/empezar con 9/)).toBeTruthy();
    await user.clear(within(dlg).getByLabelText(/Celular/));
    await user.type(within(dlg).getByLabelText(/Celular/), '91234');
    expect(within(dlg).getByText(/Faltan 4/)).toBeTruthy();
    await user.type(within(dlg).getByLabelText(/Número de DNI/), '5678');
    await user.type(within(dlg).getByLabelText(/Nombres/), 'Juan Perez');
    await user.type(within(dlg).getByLabelText(/Celular/), '5678');
    await user.type(within(dlg).getByLabelText(/Correo/), 'a@b.com');
    await user.click(within(dlg).getByRole('button', { name: /Enviar código/ }));
    expect(await within(dlg).findByText(/Debes aceptar los términos/)).toBeTruthy();
    await user.click(within(dlg).getByLabelText(/Acepto los Términos/));
    await user.click(within(dlg).getByRole('button', { name: /Enviar código/ }));
    await user.type(await within(dlg).findByLabelText(/Código de verificación/, {}, { timeout: 3000 }), '000000');
    await user.click(within(dlg).getByRole('button', { name: /Verificar/ }));
    expect(await within(dlg).findByText(/no coincide/)).toBeTruthy();
    await user.clear(within(dlg).getByLabelText(/Código de verificación/));
    await user.type(within(dlg).getByLabelText(/Código de verificación/), '482913');
    await user.click(within(dlg).getByRole('button', { name: /Verificar/ }));

    expect(await screen.findByRole('heading', { name: 'Estado del pedido' }, { timeout: 6000 })).toBeTruthy();
    expect(document.getElementById('code').textContent).toMatch(/^PC-/);
    expect(document.getElementById('timer').textContent).toMatch(/^(1:00|0:59)$/);
    // 2.2.1: más tiempo para cancelar
    await user.click(screen.getByRole('button', { name: /Necesito más tiempo/ }));
    await waitFor(() => expect(document.getElementById('timer').textContent).toMatch(/^(2:00|1:59)$/));
    expect(screen.getByText(/Pago: Yape \/ Plin/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancelar pedido' }));
    await user.click(screen.getByRole('button', { name: 'Sí, cancelar' }));
    expect(await screen.findByText(/Pedido cancelado\. No se te cobrará/)).toBeTruthy();

    await user.click(screen.getAllByRole('button', { name: 'Cerrar sesión' })[0]);
    await waitFor(() => expect(localStorage.getItem('pardos_apf2_react_v1')).toBeNull());
    expect(window.location.hash).toBe('#/');
    expect(await screen.findByRole('button', { name: 'Ingresar' })).toBeTruthy();
  }, 30000);
});

describe('opciones de accesibilidad', () => {
  it('panel: modo oscuro, alto contraste, lupa, lectura fácil y restablecer', async () => {
    const user = setup();
    const h = document.documentElement;
    await user.click(await screen.findByRole('button', { name: 'Accesibilidad' }));
    const dlg = await screen.findByRole('dialog', { name: 'Opciones de accesibilidad' });
    await user.click(within(dlg).getByRole('button', { name: /Oscuro/ }));
    expect(h.dataset.theme).toBe('dark');
    // contraste regulable con deslizador
    fireEvent.change(within(dlg).getByRole('slider', { name: /Contraste/ }), { target: { value: '75' } });
    expect(h.style.getPropertyValue('--hcp')).toBe('75%');
    expect(within(dlg).getByRole('slider', { name: /Contraste/ }).getAttribute('aria-valuetext')).toBe('Alto');
    await user.click(within(dlg).getByRole('button', { name: '150 %' }));
    expect(h.style.fontSize).toBe('150%');
    expect(h.classList.contains('zoom-xl')).toBe(true);
    // con la lupa al 150 % el ancho útil no alcanza: la cabecera pasa a botón Menú
    await waitFor(() => expect(h.classList.contains('narrow')).toBe(true));
    await user.click(within(dlg).getByRole('button', { name: /Deuteranopia/ }));
    expect(h.classList.contains('cvd-deutan')).toBe(true);
    await user.click(within(dlg).getByRole('button', { name: /Monocromía/ }));
    expect(h.classList.contains('cvd-achro')).toBe(true);
    expect(h.classList.contains('cvd-deutan')).toBe(false);
    await user.click(within(dlg).getByRole('switch', { name: 'Lectura fácil' }));
    expect(h.classList.contains('simple')).toBe(true);
    expect(JSON.parse(localStorage.getItem('pardos_v3_a11y')).simple).toBe(true);
    await user.click(within(dlg).getByRole('button', { name: 'Restablecer todo' }));
    expect(h.style.getPropertyValue('--hcp')).toBe('0%');
    expect(h.style.fontSize).toBe('100%');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    // el foco vuelve al botón que abrió el panel
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Accesibilidad' })));
  });

  it('cabecera adaptable: con la lupa al 200 % aparece el botón Menú', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: 'Lupa' }));
    for (let i = 0; i < 4; i++) await user.click(screen.getByRole('button', { name: 'Ampliar pantalla' }));
    const menu = await screen.findByRole('button', { name: /Menú/ });
    expect(screen.queryByRole('navigation', { name: 'Principal' })).toBeNull();
    await user.click(menu);
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Carta' })).toBeTruthy();
  });

  it('lupa flotante: amplía y reduce la pantalla', async () => {
    const user = setup();
    const h = document.documentElement;
    await user.click(await screen.findByRole('button', { name: 'Lupa' }));
    await user.click(screen.getByRole('button', { name: 'Ampliar pantalla' }));
    await user.click(screen.getByRole('button', { name: 'Ampliar pantalla' }));
    expect(h.style.fontSize).toBe('150%');
    await user.click(screen.getByRole('button', { name: 'Reducir pantalla' }));
    expect(h.style.fontSize).toBe('125%');
  });

  it('perfil Lectura fácil muestra ayudas y oculta productos no disponibles', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: 'Accesibilidad' }));
    await user.click(screen.getByRole('button', { name: /Lectura fácil/ }));
    await user.click(screen.getByRole('button', { name: 'Listo' }));
    expect(await screen.findByRole('complementary', { name: 'Ayuda en lectura fácil' })).toBeTruthy();
    window.location.hash = '#/carta';
    await waitFor(() => expect(screen.getAllByRole('article').length).toBe(1));
  });
});
