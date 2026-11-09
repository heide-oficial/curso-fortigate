#!/usr/bin/env node
/* Sonda (uso interno): cria perfil e admin pela GUI e confere o que a CLI enxerga. */
const lab = require('./lab.cjs');
const S = process.argv[2] || '/tmp';
(async () => {
  const s = await lab.iniciar({ saida: S, so: 'nada' });
  const p = s.page;
  const FGT = 'fgt', SENHA = 'Atlas#2026';
  await s.novo({ id: 'sonda-adm', nome: 'Sonda adm', site: { id: 'site-s', nome: 'S', pais: 'BR', cidade: 'São Paulo', lat: -23.5, lon: -46.6 } });
  await s.adicionar({ id: FGT, tipo: 'fortigate', nome: 'FG121GTK25000199', x: 0, y: 0, serial: 'FG121GTK25000199' });
  await s.adicionar({ id: 'admin-pc', tipo: 'pc-windows', nome: 'ADMIN-PC', x: 120, y: 470 });
  await s.rede('admin-pc', { mode: 'static', ip: '10.10.99.10', mask: '255.255.255.0', gateway: '10.10.99.1' });
  await s.energia([FGT, 'admin-pc']);
  await s.conectar([FGT, 'mgmt'], ['admin-pc', 'eth0'], 'cabo-mgmt');
  const cfg0 = await p.evaluate(() => window.__cap.config('fgt'));
  await s.setConfig(FGT, 'net_interfaces', cfg0.net_interfaces.map((r) => (r.name === 'mgmt' ? { ...r, ip: '10.10.99.1/255.255.255.0' } : r)));
  await s.setConfig(FGT, 'sys_adminPassword', SENHA);
  await s.setConfig(FGT, 'setup_wizard', { finished: true, step: 'begin', done: ['patch', 'password', 'policy'] });
  if (process.env.EDGE) {
    await s.abrir('admin-pc');
    await p.locator('button.dk-tb[title="Microsoft Edge"]:visible').first().click();
    const end = p.locator('input[aria-label="Address"]:visible').last();
    await end.waitFor(); await end.fill('https://10.10.99.1'); await end.press('Enter');
    await p.locator('.login-in:visible').first().waitFor();
    await p.locator('.login-in:visible').nth(0).fill('admin'); await p.locator('.login-in:visible').nth(1).fill(SENHA);
    await p.locator('.login-btn:visible').first().click(); await s.espera(1500); await s.fecharNovidades();
    console.log('edge ok');
  }
  await s.gui(FGT, SENHA, '/system/admin-profiles');
  await s.limpo(true);
  const painel = () => p.locator('.edit-pane:visible').last();
  const linha = (r) => s.campo(r, painel());
  const botaoVis = (t, d) => (d || p).locator('button:visible', { hasText: new RegExp(`^\\s*${t}\\s*$`) }).first();
  const criar = () => p.locator('.content-scroll button:visible', { hasText: /^\s*Create [Nn]ew\s*$/ }).first();
  const out = (t, x) => console.log(`\n===== ${t}\n${x}`);
  await criar().click(); await painel().waitFor(); await s.espera(400);
  await linha('Name').locator('input').first().fill('Atlas-Leitura');
  await botaoVis('OK', painel()).click(); await s.espera(700);
  await s.rota('/system/admins');
  await criar().click(); await s.espera(300);
  await p.locator('.menu-item:visible', { hasText: /^\s*Administrator\s*$/ }).first().click();
  await painel().waitFor(); await s.espera(400);
  await linha('Username').locator('input').first().fill('carla.suporte');
  await linha('Password').locator('input').first().fill('Suporte#2026');
  await linha('Confirm Password').locator('input').first().fill('Suporte#2026');
  await linha('Administrator profile').locator('select').first().selectOption('Atlas-Leitura');
  if (process.env.TH) {
    const th = linha('Restrict login to trusted hosts');
    await th.scrollIntoViewIfNeeded();
    if (!(await th.locator('.toggle').first().evaluate((e) => e.classList.contains('on')))) await th.locator('.toggle').first().click();
    await s.espera(300);
    await linha('Trusted Hosts').locator('input').first().fill('10.10.99.0/24');
    await s.espera(300);
  }
  await botaoVis('OK', painel()).click(); await s.espera(600);
  const conf = p.locator('.dialog:visible').filter({ hasText: /administrative password/i }).last();
  if (await conf.count()) { await conf.locator('input').first().fill(SENHA); await botaoVis('OK', conf).click(); await s.espera(800); }
  out('session admins', JSON.stringify(await p.evaluate(() => { const c = window.__cap.config('fgt'); return [c.sys_admins?.map((a) => a.name), c.sys_adminProfiles?.map((a) => a.name)]; })));
  const nomes = async () => JSON.stringify(await p.evaluate(() => window.__cap.config('fgt').sys_admins?.map((a) => a.name)));
  const botaoAdmin = () => p.locator('header.banner:visible button.banner-btn').last();
  const item = (t) => p.locator('.menu-item:visible', { hasText: new RegExp(`^\\s*${t}\\s*$`) }).first();
  const entrar = async (u, w) => { await p.locator('.login-in:visible').first().waitFor(); await p.locator('.login-in:visible').nth(0).fill(u); await p.locator('.login-in:visible').nth(1).fill(w); await p.locator('.login-btn:visible').first().click(); await s.espera(1200); await s.fecharNovidades(); };
  await s.rota('/dashboard/status');
  await botaoAdmin().click(); await s.espera(300); await item('Logout').click();
  await entrar('carla.suporte', 'Suporte#2026');
  out('depois do login da carla', await nomes());
  await s.rota('/network/interfaces');
  await botaoAdmin().click(); await s.espera(300); await item('Logout').click();
  await entrar('admin', SENHA);
  out('depois de voltar ao admin', await nomes());
  for (const c of ['show system accprofile Atlas-Leitura', 'show system admin carla.suporte', 'get system admin list']) out(c, await s.cli(c));
  await s.fecharCli();
  await s.fim();
})().catch((e) => { console.error(e); process.exit(1); });
