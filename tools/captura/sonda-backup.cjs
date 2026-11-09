#!/usr/bin/env node
/* Sonda (uso interno): baixa um backup pela GUI e o restaura, intacto, editado e criptografado. */
const fs = require('fs');
const path = require('path');
const lab = require('./lab.cjs');
const S = process.argv[2] || '/tmp';
(async () => {
  const s = await lab.iniciar({ saida: S, so: 'nada' });
  const p = s.page;
  const FGT = 'fgt', SENHA = 'Atlas#2026';
  await s.novo({ id: 'sonda-bk', nome: 'Sonda bk', site: { id: 'site-s', nome: 'S', pais: 'BR', cidade: 'São Paulo', lat: -23.5, lon: -46.6 } });
  await s.adicionar({ id: FGT, tipo: 'fortigate', nome: 'FG121GTK25000199', x: 0, y: 0, serial: 'FG121GTK25000199' });
  await s.energia([FGT]);
  await s.setConfig(FGT, 'sys_adminPassword', SENHA);
  await s.setConfig(FGT, 'setup_wizard', { finished: true, step: 'begin', done: ['patch', 'password', 'policy'] });
  const cfg0 = await p.evaluate(() => window.__cap.config('fgt'));
  await s.setConfig(FGT, 'sys_admins', [...cfg0.sys_admins, { id: 2, name: 'carla.suporte', kind: 'admin', type: 'Local', profile: 'prof_admin', trusted: ['10.10.99.0/255.255.255.0'], twoFactor: 'Disabled', comments: '', theme: 'inherit' }]);
  await s.gui(FGT, SENHA, '/dashboard/status');
  await s.limpo(true);
  const out = (t, x) => console.log(`\n===== ${t}\n${x}`);
  const botaoAdmin = () => p.locator('header.banner:visible button.banner-btn').last();
  const item = (t) => p.locator('.menu-item:visible', { hasText: new RegExp(`^\\s*${t}\\s*$`) }).first();
  const botaoVis = (t, d) => (d || p).locator('button:visible', { hasText: new RegExp(`^\\s*${t}\\s*$`) }).first();
  const abrirMenu = async (t) => { await botaoAdmin().click(); await s.espera(300); await item('Configuration').click(); await s.espera(300); await item(t).click(); await s.espera(500); return p.locator('.dialog:visible').last(); };
  const backup = async (senha) => {
    const dlg = await abrirMenu('Backup');
    if (senha) { await s.campo('Encryption', dlg).locator('.toggle').first().click(); await s.campo('Password', dlg).locator('input').first().fill(senha); await s.campo('Confirm password', dlg).locator('input').first().fill(senha); }
    const [d] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), botaoVis('OK', dlg).click()]);
    const f = path.join(S, d.suggestedFilename()); await d.saveAs(f); return f;
  };
  const restore = async (f, senha) => {
    const dlg = await abrirMenu('Restore');
    await dlg.locator('input[type=file]').first().setInputFiles(f);
    if (senha) await s.campo('Password', dlg).locator('input').first().fill(senha);
    await botaoVis('OK', dlg).click(); await s.espera(1500);
    return (await p.locator('.toast').allInnerTexts()).join(' | ');
  };
  const estado = async () => JSON.stringify(await p.evaluate(() => { const c = window.__cap.config('fgt'); return { host: c.sys_settings?.hostname, admins: c.sys_admins?.map((a) => a.name) }; }));

  const f1 = await backup('');
  const t1 = fs.readFileSync(f1, 'utf8');
  out('arquivo ' + path.basename(f1), t1.split('\n').slice(0, 14).join('\n') + `\n... (${t1.split('\n').length} linhas)\n` + t1.split('\n').filter((l) => /^config /.test(l)).join(' | ') + '\nÚltima linha: ' + t1.trimEnd().split('\n').pop().slice(0, 60) + '…');
  out('restore intacto', await restore(f1) + '\n' + await estado());
  const f2 = path.join(S, 'editado.conf');
  fs.writeFileSync(f2, t1.replace(/( {4}set hostname )"[^"]*"/, '$1"FGT-FILIAL"'));
  out('restore editado', await restore(f2) + '\n' + await estado());
  const f3 = await backup('Backup#Atlas26');
  out('criptografado', fs.readFileSync(f3, 'utf8').split('\n').slice(0, 6).join('\n'));
  out('restore sem senha', await restore(f3));
  await s.espera(3500);
  const aberto = p.locator('.dialog:visible').last();
  await s.campo('Password', aberto).locator('input').first().fill('Backup#Atlas26');
  await botaoVis('OK', aberto).click(); await s.espera(1500);
  out('restore com senha', (await p.locator('.toast').allInnerTexts()).join(' | ') + '\n' + await estado());
  out('cli show system global', await s.cli('show system global'));
  await s.fecharCli();
  await s.fim();
})().catch((e) => { console.error(e); process.exit(1); });
