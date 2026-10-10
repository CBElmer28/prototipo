import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within, configure } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './store.jsx';

configure({ asyncUtilTimeout: 4000 });
globalThis.IntersectionObserver = class { constructor(cb) { this.cb = cb; } observe(el) { this.cb([{ isIntersecting: true, target: el }]); } unobserve() {} disconnect() {} };

beforeEach(() => { localStorage.clear(); window.location.hash = '#/'; window.scrollTo = () => {}; });

const setup = () => { const user = userEvent.setup(); render(<HashRouter><StoreProvider><App /></StoreProvider></HashRouter>); return user; };
const pick = async (user, name) => { await user.click(await screen.findByLabelText(name)); };

describe('flujo completo APF2', () => {
  it('catálogo → personalizar → revisar → registro → estado → cancelar → cerrar sesión', async () => {
    const user = setup();
    await user.click(await screen.findByRole('link', { name: /Pardos Brasa/ }));
    await screen.findByRole('heading', { name: 'PARDOS BRASA' });
    await waitFor(() => expect(screen.getAllByRole('article').length).toBeGreaterThan(3));
    await user.type(screen.getByLabelText('Buscar en la carta'), 'zzzz');
    expect(await screen.findByText(/No encontramos productos/)).toBeTruthy();
    await user.clear(screen.getByLabelText('Buscar en la carta'));
    await user.click((await screen.findAllByRole('button', { name: 'Agregar' }))[0]);

    // 2 unidades; bloquea revisar y marca "Falta elegir"
    await user.click(await screen.findByLabelText('Agregar un combo'));
    await user.click(screen.getByRole('button', { name: 'Revisar y confirmar pedido' }));
    expect((await screen.findAllByText(/Falta elegir/)).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('tab', { name: /Unidad 1/ }));
    for (const n of ['1/4 Pardos Pierna', 'Papas Doradas', 'Ensalada fresca', 'Inca Kola personal helada']) await pick(user, new RegExp(n));
    await user.click(screen.getAllByRole('button', { name: /Agregar/ }).find((b) => b.closest('.addon')));
    await user.click(screen.getByRole('tab', { name: /Unidad 2/ }));
    await user.click(screen.getByRole('button', { name: /Copiar de Unidad 1/ }));
    await waitFor(() => expect(screen.getByText('S/ 79.60', { selector: 'strong' })).toBeTruthy());

    await user.click(screen.getByRole('button', { name: 'Revisar y confirmar pedido' }));
    await screen.findByRole('heading', { name: /Revisa tu pedido/ });
    await user.click(screen.getByLabelText('Yape / Plin'));
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    // registro con validación en vivo
    const dlg = await screen.findByRole('dialog');
    await user.type(within(dlg).getByLabelText(/Número de DNI/), '1234');
    expect(within(dlg).getByText(/llevas 4/)).toBeTruthy();
    await user.type(within(dlg).getByLabelText(/Celular/), '8');
    expect(within(dlg).getByText(/empezar con 9/)).toBeTruthy();
    await user.clear(within(dlg).getByLabelText(/Celular/));
    await user.type(within(dlg).getByLabelText(/Celular/), '91234');
    expect(within(dlg).getByText(/Faltan 4/)).toBeTruthy();
    expect(within(dlg).getByText(/5\/9/)).toBeTruthy();
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

    // estado del pedido
    expect(await screen.findByRole('heading', { name: 'Estado del pedido' }, { timeout: 6000 })).toBeTruthy();
    expect(document.getElementById('code').textContent).toMatch(/^PC-/);
    expect(document.getElementById('timer').textContent).toMatch(/^0:(60|59)$/);
    expect(screen.getByText(/Pago: Yape \/ Plin/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancelar pedido' }));
    await user.click(screen.getByRole('button', { name: 'Sí, cancelar' }));
    expect(await screen.findByText(/Pedido cancelado\. No se te cobrará/)).toBeTruthy();

    // cerrar sesión limpia todo
    await user.click(screen.getAllByRole('button', { name: 'Cerrar sesión' })[0]);
    await waitFor(() => expect(localStorage.getItem('pardos_apf2_react_v1')).toBeNull());
    expect(window.location.hash).toBe('#/');
    expect(await screen.findByRole('button', { name: 'Ingresar' })).toBeTruthy();
  }, 30000);
});
