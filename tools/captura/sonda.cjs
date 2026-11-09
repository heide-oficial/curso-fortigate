#!/usr/bin/env node
/* Sonda de DOM do laboratório (uso interno): monta um FortiGate, abre a GUI e imprime trechos do HTML de algumas páginas. */
const lab = require('./lab.cjs');
const S = process.argv[2] || '/tmp';
(async () => {
  const s = await lab.iniciar({ saida: S, so: 'nada' });
  const p = s.page;
  await s.novo({ id: 'sonda', nome: 'Sonda', site: { id: 'site-s', nome: 'S', pais: 'BR', cidade: 'São Paulo', lat: -23.5, lon: -46.6 } });
  await s.adicionar({ id: 'fgt', tipo: 'fortigate', nome: 'FG121GTK25000199', x: 0, y: 0, serial: 'FG121GTK25000199' });
  await s.energia(['fgt']);
  await s.setConfig('fgt', 'sys_adminPassword', 'Atlas#2026');
  await s.setConfig('fgt', 'setup_wizard', { finished: true, step: 'begin', done: ['patch', 'password', 'policy'] });
  await s.gui('fgt', 'Atlas#2026', '/log/system-events');
  await s.limpo(true);
  const out = (t, x) => console.log(`\n===== ${t}\n${x}`);
  const txt = async () => (await p.locator('.content-scroll').first().innerText()).slice(0, 900);
  out('system events', await txt());
  out('system events tabs', await p.locator('.page-tab:visible, .pill-tab:visible, .tab:visible').evaluateAll((els) => els.map((e) => `${e.className} | ${e.textContent.trim()}`).join('\n')));
  await s.rota('/system/replacement-messages');
  out('replacement', await txt());
  await s.rota('/policy/addresses');
  out('addresses', await txt());
  out('ref cells', await p.locator('td:visible').evaluateAll((els) => els.filter((e) => /^\d+$/.test(e.textContent.trim()) && +e.textContent.trim() > 0).slice(0, 5).map((e) => e.outerHTML.slice(0, 200)).join('\n')));
  await s.rota('/dashboard/status');
  out('dashboard buttons', await p.locator('.content-scroll button:visible').evaluateAll((els) => els.slice(0, 10).map((e) => `${e.className} | ${e.textContent.trim()} | ${e.title}`).join('\n')));
  out('widgets', await p.locator('.widget-h .wt:visible').evaluateAll((els) => els.map((e) => e.textContent.trim()).join(' / ')));
  await p.locator('header.banner button[title="Search"]').click();
  await s.espera(500);
  await p.keyboard.type('dns');
  await s.espera(500);
  out('search', await p.locator('body').evaluate(() => [...document.querySelectorAll('[class*="palette"], [class*="cmdk"], [role="dialog"]')].map((e) => `${e.className} :: ${e.innerText.slice(0, 300)}`).join('\n---\n')));
  await p.keyboard.press('Escape');
  await s.rota('/system/admins');
  out('admins', await txt());
  await s.rota('/system/firmware');
  out('firmware', await txt());
  await s.fim();
})().catch((e) => { console.error(e); process.exit(1); });
