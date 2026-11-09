#!/usr/bin/env node
/*
 * Imagens do módulo 01 — Primeiro acesso e administração básica.
 *
 * Uso: node tools/captura/m01.cjs [--saida midia/m01] [--so arquivo1,arquivo2]
 * Requer o laboratório em modo de desenvolvimento (porta 5173).
 *
 * Do FortiGate de fábrica à administração segura, fotografando cada passo: console pelo PuTTY do notebook,
 * GUI pelo navegador do ADMIN-PC, tour da GUI, CLI, configurações do sistema, administradores, FortiGuard,
 * backup, restauração, upgrade e a recuperação de senha pela conta maintainer.
 * Grava em saidas-cli.json as saídas dos comandos do Guia de comandos CLI.
 */
const fs = require('node:fs');
const path = require('node:path');
const lab = require('./lab.cjs');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const SAIDA = path.resolve(args.saida || 'midia/m01');
const ATE = args.ate || null;
const SENHA = 'Atlas#2026';
const SERIAL = 'FG121GTK25000101';
const FGT = 'fgt-mtz';
const SITE = { id: 'site-matriz', nome: 'Matriz', pais: 'BR', cidade: 'São Paulo', lat: -23.55, lon: -46.63 };
const FORM = 900;
const LISTA = 1250;

(async () => {
  const s = await lab.iniciar({ saida: SAIDA, so: args.so });
  const p = s.page;
  const saidas = {};
  const falhas = [];
  const parar = async (etapa) => { if (ATE !== etapa) return false; fs.writeFileSync(path.join(SAIDA, 'saidas-cli.json'), `${JSON.stringify(saidas, null, 2)}\n`); await s.fim(); return true; };
  await p.addStyleTag({ content: '.tp-tool { visibility: hidden !important; }' });

  /** Roda um trecho; se falhar, registra e segue (o estado é refeito no início de cada trecho). */
  const tentar = async (nome, fn) => {
    try { await fn(); } catch (e) {
      falhas.push(nome);
      console.warn(`  FALHOU ${nome}: ${String(e.message).split('\n')[0]}`);
      await p.keyboard.press('Escape').catch(() => {});
    }
  };

  /* ---------- Atalhos ---------- */
  const no = (id) => p.locator(`.react-flow__node[data-id="${id}"]`).first();
  const card = (chave) => p.locator(`.ld-card[data-card="${chave}"]`).first();
  const painel = () => p.locator('.edit-pane:visible').last();
  const linha = (rotulo, dentro) => s.campo(rotulo, dentro || painel());
  const campo = (rotulo) => s.campo(rotulo);
  const conteudo = () => p.locator('.content-scroll:visible').first();
  const rolarAte = async (loc) => { await loc.scrollIntoViewIfNeeded(); await s.espera(300); };
  const botaoVis = (texto, dentro) => (dentro || p).locator('button:visible', { hasText: new RegExp(`^\\s*${texto}\\s*$`) }).first();
  const criar = (n = 0) => p.locator('.content-scroll button:visible', { hasText: /^\s*Create [Nn]ew\s*$/ }).nth(n);
  const btnEdit = () => p.locator('.content-scroll button.btn:not(.sm):visible', { hasText: /^\s*Edit\s*$/ }).first();
  const itemMenu = (texto) => p.locator('.menu-item:visible', { hasText: new RegExp(`^\\s*${texto}\\s*$`) }).first();
  const menusAbertos = () => p.locator('.menu:visible');
  // O último botão da barra superior é o do administrador logado (mostra o nome da conta).
  const botaoAdmin = () => p.locator('header.banner:visible button.banner-btn').last();
  const widget = (titulo) => p.locator('.widget-h .wt:visible', { hasText: titulo }).first().locator('xpath=ancestor::div[contains(@class,"widget-h")]/..');
  const linhaWidget = (titulo, rotulo) => widget(titulo).getByText(rotulo, { exact: true }).first().locator('xpath=..');
  const preencher = async (loc, valor) => { const i = loc.locator('input').first(); await i.fill(''); await i.fill(String(valor)); };
  const fotoOk = async (nome, descricao, dentro) => { const ok = botaoVis('OK', dentro || painel()); await rolarAte(ok); await s.foto(nome, { recorte: [ok], margem: 70, destaque: [ok], descricao }); };

  /** Abre uma página pelo menu lateral, fotografando o grupo aberto com o item em destaque. */
  const menu = async (nome, grupo, item, descricao) => {
    const esc = (t) => t.replace(/[&]/g, '\\$&');
    const sub = () => p.locator('.nav-item:visible', { hasText: new RegExp(`^\\s*${esc(item)}\\s*$`) }).first();
    const g = p.locator('.nav-item:visible', { hasText: new RegExp(`^\\s*${esc(grupo)}\\s*$`) }).first();
    if (!(await sub().isVisible().catch(() => false))) { await g.click(); await s.espera(500); }
    if (nome) await s.foto(nome, { recorte: [g, sub()], margem: 30, destaque: [g, sub()], descricao });
    await sub().click();
    await s.espera(900);
  };
  const aba = async (texto) => { await p.locator('.tab:visible, .page-tab:visible, .pill-tab:visible', { hasText: new RegExp(`^\\s*${texto}`) }).first().click(); await s.espera(500); };
  const abaLoc = (texto) => p.locator('.tab:visible, .page-tab:visible, .pill-tab:visible', { hasText: new RegExp(`^\\s*${texto}`) }).first();
  /** Menu do administrador > Configuration > item, fotografando cada nível. */
  const menuConfiguration = async (item, fotos = {}) => {
    if (fotos.botao) await s.foto(fotos.botao, { recorte: [p.locator('header.banner:visible button[title=\"Notifications\"]').first(), botaoAdmin()], margem: 40, destaque: [botaoAdmin()], descricao: 'Botão do administrador na barra superior' });
    await botaoAdmin().click();
    await s.espera(400);
    if (fotos.menu) await s.foto(fotos.menu, { recorte: [botaoAdmin(), menusAbertos().nth(0)], margem: 24, destaque: [itemMenu('Configuration')], descricao: 'Menu do administrador com o item Configuration' });
    await itemMenu('Configuration').click();
    await s.espera(400);
    if (fotos.sub) await s.foto(fotos.sub, { recorte: [botaoAdmin(), menusAbertos().nth(0), menusAbertos().nth(1)], margem: 24, destaque: [itemMenu(item)], descricao: `Submenu Configuration com o item ${item}` });
    await itemMenu(item).click();
    await s.espera(600);
  };
  /** Seleciona uma linha da lista de interfaces e fotografa a linha e o botão Edit, antes de clicar nele. */
  const abrirEdicao = async (nome, foto) => {
    await s.rota('/network/interfaces');
    const l = p.locator('tr:visible').filter({ has: p.locator('td', { hasText: new RegExp(`^\\s*(?:\\S+ \\()?${nome}\\)?\\s*$`) }) }).first();
    await rolarAte(l);
    for (const outra of await p.locator('tr.sel:visible').all()) await outra.locator('td').nth(2).click();
    if (!(await l.evaluate((e) => e.classList.contains('sel')))) await l.locator('td').nth(2).click();
    await s.espera(400);
    if (foto) await s.foto(foto, { largura: LISTA, recorte: [btnEdit(), l], margem: 16, destaque: [l, btnEdit()], descricao: `${nome} selecionada na lista e o botão Edit` });
    await btnEdit().click();
    await painel().waitFor();
    await s.espera(600);
  };
  const guardarCli = async (comando, chave = comando) => {
    const antes = (await s.cli([])).length;
    const tela = await s.cli(comando);
    saidas[chave] = `${'FGT-MTZ # '}${tela.slice(antes).trim()}`.replace(/\n?\S+ # $/, '').replace(/^FGT-MTZ # \S?/, `FGT-MTZ # ${comando.charAt(0)}`);
  };
  const cliFrame = () => p.locator('.cli-modal .cli-frame').first();
  const diagrama = async () => { await s.voltar(); await s.limpo(false); await s.tela(2400, 1500); await s.enquadrar(); };
  const abrirOrig = s.abrir;
  s.abrir = async (...a) => { await s.tela(); return abrirOrig(...a); };

  /* ---------- Terminal do PuTTY (console serial ou SSH) ---------- */
  const tela = () => p.locator('.pt-screen:visible').last();
  const janela = (sel) => p.locator(`.dk-win:visible:has(${sel})`).last();
  const textoTela = async () => (await tela().innerText()).trimEnd();
  const digitar = async (linhaCmd, esperarPrompt = true) => {
    await tela().click();
    await p.keyboard.type(linhaCmd);
    await p.keyboard.press('Enter');
    await s.espera(500);
    if (esperarPrompt) for (let i = 0; i < 40 && !/[#$:]\s*$/.test(await textoTela()); i++) await s.espera(150);
  };
  const fotoTela = async (nome, descricao) => { await s.foto(nome, { recorte: [janela('.pt-screen')], margem: 10, descricao }); };
  const abrirPutty = async (fotos = {}) => {
    const iniciar = p.locator('button.dk-tb.start:visible').first();
    if (fotos.desktop) await s.foto(fotos.desktop.nome, { recorte: [iniciar], margem: 220, destaque: [iniciar], descricao: fotos.desktop.descricao });
    await iniciar.click();
    await s.espera(400);
    const item = p.locator('.dk-start button:visible', { hasText: /PuTTY/ }).first();
    if (fotos.menu) await s.foto(fotos.menu, { recorte: [p.locator('.dk-start:visible').first()], margem: 16, destaque: [item], descricao: 'Menu Iniciar com o PuTTY' });
    await item.click();
    await p.locator('.pt-config:visible').last().waitFor();
    await s.espera(400);
  };

  /* =================== A. Laboratório =================== */
  await s.novo({ id: 'curso-m01', nome: 'Curso – Módulo 01', site: SITE });
  // De fábrica, o hostname de um FortiGate físico é o número de série.
  await s.adicionar({ id: FGT, tipo: 'fortigate', nome: SERIAL, x: 420, y: 140, serial: SERIAL });
  await s.adicionar({ id: 'admin-pc', tipo: 'pc-windows', nome: 'ADMIN-PC', x: 120, y: 470 });
  await s.rede('admin-pc', { mode: 'static', ip: '10.10.99.10', mask: '255.255.255.0', gateway: '10.10.99.1' });
  await s.adicionar({ id: 'notebook', tipo: 'pc-windows', nome: 'NOTEBOOK-TI', x: 760, y: 470 });
  await s.energia([FGT, 'admin-pc', 'notebook']);
  const extras = (await s.nos()).filter((n) => n.kind === 'ups' || n.kind === 'power-strip');
  await p.addStyleTag({ content: extras.map((n) => `.react-flow__node[data-id="${n.id}"]`).join(', ') + ' { visibility: hidden !important; }' });
  await s.conectar([FGT, 'mgmt'], ['admin-pc', 'eth0'], 'cabo-mgmt');
  await s.conectar([FGT, 'console'], ['notebook', 'usb0'], 'cabo-console');
  await s.tela(2400, 1500);
  await s.enquadrar();
  const nos = () => [no(FGT), no('admin-pc'), no('notebook')];
  const cards = async () => s.todos('.ld-card');
  await s.foto('00-topologia-gerencia', { recorte: [...nos(), ...(await cards())], margem: 60, descricao: 'Topologia do módulo 01: ADMIN-PC na porta mgmt e NOTEBOOK-TI na porta de console do FortiGate' });
  await s.foto('01-1-fortigate-121g', { recorte: [no(FGT)], margem: 30, descricao: 'FortiGate 121G no diagrama do laboratório' });
  await s.foto('01-2-topologia-console', { recorte: [...nos(), ...(await cards())], margem: 60, destaque: [no(FGT), no('notebook'), { cabo: 'cabo-console' }], descricao: 'Cabo de console entre a porta CON do FortiGate e o NOTEBOOK-TI' });

  /* =================== B. Console pelo PuTTY =================== */
  await s.abrir('notebook');
  await s.limpo(true);
  await abrirPutty({ desktop: { nome: '01-2-notebook', descricao: 'Área de trabalho do NOTEBOOK-TI com o botão Iniciar' }, menu: '01-2-menu-iniciar' });
  const cfgPutty = () => janela('.pt-config');
  const ptLabel = (t) => p.locator('.pt-config:visible label', { hasText: t }).first();
  await s.foto('01-2-putty-1', { recorte: [cfgPutty()], margem: 10, destaque: [p.locator('.pt-type:visible').first()], descricao: 'PuTTY: Connection type Serial' });
  await s.foto('01-2-putty-2', { recorte: [cfgPutty()], margem: 10, destaque: [ptLabel('Serial line')], descricao: 'PuTTY: Serial line COM3' });
  await s.foto('01-2-putty-3', { recorte: [cfgPutty()], margem: 10, destaque: [p.locator('.pt-config:visible .pt-speed').first()], descricao: 'PuTTY: Speed 9600' });
  await s.foto('01-2-putty-4', { recorte: [cfgPutty()], margem: 10, destaque: [botaoVis('Open', p.locator('.pt-config:visible'))], descricao: 'PuTTY: botão Open' });
  await botaoVis('Open', p.locator('.pt-config:visible')).click();
  await tela().waitFor();
  for (let i = 0; i < 40 && !/login:\s*$/.test(await textoTela() + ' '); i++) await s.espera(200);
  await fotoTela('01-2-console-1', 'Console no PuTTY com o prompt de login do FortiGate de fábrica');
  await digitar('admin');
  await digitar('');
  await fotoTela('01-2-console-2', 'Login admin com senha em branco e a troca obrigatória de senha');
  await digitar(SENHA, false);
  await digitar(SENHA);
  await fotoTela('01-2-console-3', 'Nova senha confirmada, Welcome! e o prompt');
  const linhasMgmt = ['config system interface', 'edit mgmt', 'set mode static', 'set ip 10.10.99.1 255.255.255.0', 'set allowaccess ping https ssh', 'end'];
  for (const [i, l] of linhasMgmt.entries()) { await digitar(l); await fotoTela(`01-2-mgmt-${i + 1}`, `Console: ${l}`); }
  await digitar('show system interface mgmt');
  await fotoTela('01-2-mgmt-show', 'show system interface mgmt na console');
  saidas['show-mgmt'] = (await textoTela()).split(/\n(?=\S+ # show system interface mgmt)/).pop().replace(/\n\S+ #\s*$/, '');

  /* =================== C. Primeiro acesso pela GUI =================== */
  await diagrama();
  await s.foto('01-2-topologia-mgmt', { recorte: [...nos(), ...(await cards())], margem: 60, destaque: [no(FGT), no('admin-pc'), { cabo: 'cabo-mgmt' }, card(`${FGT}|mgmt`), card('admin-pc|eth0')], descricao: 'Cabo de rede entre a porta mgmt (10.10.99.1/24) e o ADMIN-PC (10.10.99.10/24)' });
  await s.abrir('admin-pc');
  await s.limpo(true);
  const edge = p.locator('button.dk-tb[title="Microsoft Edge"]:visible').first();
  await s.foto('01-2-admin-pc', { recorte: [edge], margem: 220, destaque: [edge], descricao: 'Barra de tarefas do ADMIN-PC com o Microsoft Edge' });
  await edge.click();
  const endereco = p.locator('input[aria-label="Address"]:visible').last();
  await endereco.waitFor();
  await endereco.fill('https://10.10.99.1');
  const navegador = p.locator('.dk-win:visible:has(input[aria-label="Address"])').last();
  await s.foto('01-2-edge-url', { recorte: [navegador], margem: 8, destaque: [endereco], descricao: 'Endereço https://10.10.99.1 digitado no Edge' });
  await endereco.press('Enter');
  await p.locator('.login-card:visible').first().waitFor();
  await s.espera(600);
  await s.foto('01-2-login-gui', { recorte: [navegador], margem: 8, destaque: [p.locator('.login-card:visible').first()], descricao: 'Página de login da GUI no Edge do ADMIN-PC' });
  await p.locator('.login-in:visible').nth(0).fill('admin');
  await p.locator('.login-in:visible').nth(1).fill(SENHA);
  await s.foto('01-2-login-dados', { recorte: [navegador], margem: 8, destaque: [p.locator('.login-in:visible').nth(0), p.locator('.login-in:visible').nth(1), p.locator('.login-btn:visible').first()], descricao: 'Usuário admin, senha e o botão Login' });
  await p.locator('.login-btn:visible').first().click();
  await botaoVis('Begin').waitFor({ timeout: 15000 });
  const assistente = () => p.locator('div:visible', { hasText: /^Setup Progress$/ }).last().locator('xpath=../..');
  await s.foto('01-2-assistente-1', { recorte: [assistente()], margem: 20, destaque: [botaoVis('Begin')], descricao: 'Assistente FortiGate Setup com o botão Begin' });
  await botaoVis('Begin').click();
  await s.espera(600);
  await tentar('assistente-2', async () => {
    const chave = assistente().locator('.toggle').first();
    if (await chave.evaluate((e) => e.classList.contains('on'))) await chave.click();
    await s.espera(300);
    await s.foto('01-2-assistente-2', { recorte: [assistente()], margem: 20, destaque: [chave, botaoVis('OK', assistente())], descricao: 'Automatic Patch Upgrades desativado e o botão OK' });
  });
  await botaoVis('OK', assistente()).click();
  await s.espera(600);
  const naoCriar = p.getByText('Do not create firewall policy now.', { exact: true }).first();
  await naoCriar.click();
  const radio = assistente().locator('input[type=radio]').first();
  if ((await radio.count()) && !(await radio.isChecked())) await radio.check();
  await s.espera(300);
  await s.foto('01-2-assistente-3', { recorte: [assistente()], margem: 20, destaque: [naoCriar, botaoVis('Save')], descricao: 'Initial Policy Configuration: Do not create firewall policy now e Save' });
  await botaoVis('Save').click();
  await s.espera(500);
  await tentar('assistente-4', async () => {
    const ciente = p.getByText(/I acknowledge/).first();
    await ciente.waitFor({ timeout: 5000 });
    await ciente.click();
    const caixa = ciente.locator('xpath=ancestor::*[.//button[normalize-space()="OK"]][1]');
    const marca = caixa.locator('input[type=checkbox]').first();
    if ((await marca.count()) && !(await marca.isChecked())) await marca.check();
    const dlg = caixa;
    await s.foto('01-2-assistente-4', { recorte: [dlg], margem: 16, destaque: [ciente, botaoVis('OK', dlg)], descricao: 'Confirmação sem policy inicial: I acknowledge e OK' });
    await botaoVis('OK', dlg).click();
  });
  await s.espera(800);
  await s.fecharNovidades();
  await s.foto('01-2-dashboard', { recorte: [navegador], margem: 8, descricao: 'Dashboard da GUI no Edge do ADMIN-PC, depois do assistente' });

  /* A partir daqui, a GUI em tela cheia */
  await s.gui(FGT, SENHA, '/dashboard/status');
  await s.limpo(true);

  if (await parar('C')) return;

  /* =================== D. Reset de fábrica (só as telas) =================== */
  await tentar('reset', async () => {
    await menuConfiguration('Reset to factory defaults', { botao: '01-2-reset-0', menu: '01-2-reset-1', sub: '01-2-reset-2' });
    const dlg = p.locator('.dialog:visible').last();
    await dlg.waitFor();
    await s.foto('01-2-reset-3', { recorte: [dlg], margem: 16, destaque: [botaoVis('OK', dlg)], descricao: 'Confirmação do reset de fábrica com o botão OK' });
    await botaoVis('Cancel', dlg).click();
  });

  /* =================== E. Tour da GUI =================== */
  await tentar('menus', async () => {
    await s.rota('/dashboard/status');
    await s.foto('01-1-menu-gui-1', { destaque: [p.locator('.nav:visible').first()], descricao: 'Menu lateral da GUI' });
    const grupos = ['Dashboard', 'Network', 'Policy & Objects', 'Security Profiles', 'VPN', 'User & Authentication', 'WiFi & Switch Controller', 'System', 'Security Fabric', 'Log & Report'];
    for (const [i, g] of grupos.entries()) {
      const item = p.locator('.nav-item:visible', { hasText: new RegExp(`^\\s*${g.replace(/[&]/g, '\\$&')}\\s*$`) }).first();
      await s.foto(`01-1-menu-gui-${i + 2}`, { destaque: [item], descricao: `Menu ${g}` });
    }
  });
  await tentar('barra', async () => {
    const banner = p.locator('header.banner:visible').first();
    await s.foto('01-1-elementos-gui-1', { destaque: [banner], descricao: 'Barra superior da GUI' });
    const itens = [['2', 'header.banner:visible button[title=\"Search\"]', 'Busca'], ['3', 'header.banner:visible button[title=\"FortiAI\"]', 'FortiAI'], ['4', 'header.banner:visible button[title=\"CLI\"]', 'CLI'], ['5', 'header.banner:visible button[title=\"Notifications\"]', 'Notificações']];
    for (const [n, sel, d] of itens) await s.foto(`01-1-elementos-gui-${n}`, { recorte: [p.locator(sel).first()], margem: 160, destaque: [p.locator(sel).first()], descricao: d });
    await s.foto('01-1-elementos-gui-6', { recorte: [botaoAdmin()], margem: 160, destaque: [botaoAdmin()], descricao: 'Menu do administrador' });
  });
  await tentar('busca', async () => {
    const lupa = p.locator('header.banner:visible button[title=\"Search\"]').first();
    await lupa.click();
    await s.espera(400);
    const pular = p.locator('.menu-item:visible', { hasText: 'Jump to page' }).first();
    await s.foto('01-1-busca-0', { recorte: [lupa, menusAbertos().last()], margem: 30, destaque: [lupa, pular], descricao: 'Menu da busca com Jump to page' });
    await pular.click();
    await s.espera(400);
    await p.keyboard.type('dns');
    await s.espera(500);
    const pal = p.locator('.palette:visible').first();
    await s.foto('01-1-busca', { recorte: [pal], margem: 16, destaque: [pal.locator('input').first(), pal.locator('.palette-item').first()], descricao: 'Busca da GUI com "dns" digitado e os resultados' });
    await p.keyboard.press('Escape');
  });
  await tentar('widgets', async () => {
    await s.rota('/dashboard/status');
    const add = botaoVis('Add widget');
    await s.foto('01-1-add-widget-0', { recorte: [add], margem: 120, destaque: [add], descricao: 'Botão Add widget do dashboard' });
    await add.click();
    await s.espera(600);
    const pane = p.locator('.slide-pane:visible, .dialog:visible').last();
    await s.foto('01-1-add-widget', { recorte: [pane], margem: 10, descricao: 'Lista de widgets para acrescentar ao dashboard' });
    await p.keyboard.press('Escape');
    const fechar = pane.locator('button', { hasText: /^\s*(Close|Cancel)\s*$/ }).first();
    if (await fechar.isVisible().catch(() => false)) await fechar.click();
  });
  await tentar('fabric', async () => {
    await menu('01-1-menu-fabric', 'Security Fabric', 'Fabric Connectors', 'Menu Security Fabric > Fabric Connectors');
    await s.foto('01-1-fabric-connectors', { destaque: [conteudo()], descricao: 'Security Fabric > Fabric Connectors' });
  });
  await tentar('temas', async () => {
    await menu('01-3-menu-settings', 'System', 'Settings', 'Menu System > Settings');
    await s.foto('01-3-tema-0', { recorte: [abaLoc('General'), abaLoc('Preference')], margem: 30, destaque: [abaLoc('Preference')], descricao: 'Abas de System > Settings com Preference em destaque' });
    await aba('Preference');
    await p.locator('.form-section-h:visible', { hasText: 'Theming' }).first().waitFor();
    await s.foto('01-3-tema-1', { largura: FORM, recorte: [p.locator('.form-section-h:visible', { hasText: 'Theming' }).first(), campo('Restrict user override')], margem: 28, destaque: [campo('System theme'), campo('Restrict user override')], unir: true, descricao: 'Seção Theming' });
    await p.locator('.sys-tsel-v:visible').first().click();
    await p.locator('.sys-tsel-m:visible').first().waitFor();
    await s.foto('01-3-tema-2', { recorte: [p.locator('.sys-tsel-m:visible').first(), campo('System theme')], margem: 24, destaque: [p.locator('.sys-tsel-m:visible').first()], descricao: 'Lista de temas com o Jade' });
    await p.locator('.sys-tsel-v:visible').first().click();
    const aplicar = botaoVis('Apply');
    await rolarAte(aplicar);
    await s.foto('01-3-tema-apply', { recorte: [aplicar], margem: 70, destaque: [aplicar], descricao: 'Botão Apply' });
    await botaoAdmin().click();
    await s.espera(400);
    await s.foto('01-3-tema-pers-0', { recorte: [botaoAdmin(), menusAbertos().nth(0)], margem: 24, destaque: [itemMenu('Personalize')], descricao: 'Menu do administrador com Personalize' });
    await itemMenu('Personalize').click();
    const sp = p.locator('.slide-pane:visible').last();
    await sp.waitFor();
    await s.foto('01-3-tema-3', { recorte: [sp.locator('.sp-h').first(), sp.locator('button', { hasText: /Customize/ }).first()], margem: 36, descricao: 'Painel Personalize' });
    const x = sp.locator('.sp-h .x button').first();
    if (await x.count()) await x.click(); else await p.keyboard.press('Escape');
  });
  await tentar('sysinfo', async () => {
    await s.rota('/dashboard/status');
    const w = widget('System Information');
    await w.waitFor();
    await s.foto('01-1-system-information-1', { recorte: [w], margem: 20, destaque: [w], descricao: 'Widget System Information' });
    const linhas = [['2', 'Hostname'], ['3', 'Serial number'], ['4', 'Firmware'], ['5', 'Mode'], ['6', 'System time']];
    for (const [n, r] of linhas) await s.foto(`01-1-system-information-${n}`, { recorte: [w], margem: 20, destaque: [linhaWidget('System Information', r)], descricao: `System Information: ${r}` });
  });
  await tentar('feature-visibility', async () => {
    await menu('01-1-fv-menu', 'System', 'Feature Visibility', 'Menu System > Feature Visibility');
    await p.locator('.fv-name:visible').first().waitFor();
    await s.foto('01-1-feature-visibility-1', { destaque: [conteudo()], descricao: 'System > Feature Visibility' });
    const item = p.locator('.fv-item-h:visible').filter({ has: p.locator('.fv-name', { hasText: /^\s*DNS Database\s*$/ }) }).first();
    await rolarAte(item);
    await item.locator('.toggle').first().click();
    await s.espera(300);
    await s.foto('01-1-feature-visibility-2', { recorte: [item], margem: 120, destaque: [item], descricao: 'DNS Database ativado' });
    const aplicar = botaoVis('Apply');
    await s.foto('01-1-fv-apply', { recorte: [aplicar], margem: 70, destaque: [aplicar], descricao: 'Botão Apply' });
    await aplicar.click();
    await s.espera(600);
    const net = p.locator('.nav-item:visible', { hasText: /^\s*Network\s*$/ }).first();
    if (!(await p.locator('.nav-item:visible', { hasText: /^\s*DNS Servers\s*$/ }).count())) await net.click();
    await s.espera(400);
    const dnsServers = p.locator('.nav-item:visible', { hasText: /^\s*DNS Servers\s*$/ }).first();
    await s.foto('01-1-feature-visibility-3', { recorte: [net, dnsServers], margem: 40, destaque: [dnsServers], descricao: 'Menu Network com o item DNS Servers' });
  });
  await tentar('listas', async () => {
    await menu('01-3-menu-addresses', 'Policy & Objects', 'Addresses', 'Menu Policy & Objects > Addresses');
    await criar().waitFor();
    await s.foto('01-3-lista-objetos-1', { destaque: [conteudo()], descricao: 'Policy & Objects > Addresses' });
    await s.foto('01-3-lista-objetos-2', { largura: LISTA, recorte: [criar(), p.locator('.content-scroll thead:visible').first()], margem: 24, destaque: [criar()], descricao: 'Botão Create new' });
    const busca = p.locator('.content-scroll input[placeholder="Search"]:visible').first();
    await s.foto('01-3-lista-objetos-3', { largura: LISTA, recorte: [criar(), p.locator('.content-scroll thead:visible').first()], margem: 24, destaque: [busca], descricao: 'Campo de busca' });
    const ref = p.locator('.content-scroll th:visible', { hasText: /^Ref/ }).first();
    await s.foto('01-3-lista-objetos-4', { recorte: [ref, p.locator('.content-scroll tbody tr:visible').nth(8)], margem: 30, destaque: [ref], descricao: 'Coluna Ref.' });
    const selecionar = async (texto) => {
      const l = p.locator('tr:visible').filter({ has: p.locator('td', { hasText: new RegExp(`^\\s*${texto.replace('.', '\\.')}\\s*$`) }) }).first();
      await rolarAte(l);
      for (const outra of await p.locator('tr.sel:visible').all()) await outra.locator('td').nth(2).click();
      if (!(await l.evaluate((e) => e.classList.contains('sel')))) await l.locator('td').nth(2).click();
      await s.espera(500);
      return l;
    };
    const acoes = () => p.locator('tr.actions:visible').first();
    const lgm = await selecionar('gmail.com');
    await s.foto('01-3-lista-objetos-5', { largura: LISTA, recorte: [lgm, acoes()], margem: 30, destaque: [lgm, acoes()], unir: true, descricao: 'gmail.com selecionado: os botões Edit e Clone aparecem, mas não Delete' });
    const num = lgm.locator('td a').first();
    await num.click();
    await s.espera(800);
    const refs = p.locator('.slide-pane:visible').last();
    await s.foto('01-3-lista-objetos-6', { recorte: [refs.locator('.sp-h').first(), refs.getByText('G Suite').first()], margem: 40, descricao: 'Referências do objeto gmail.com' });
    const fechar = refs.locator('button', { hasText: /^\s*Close\s*$/ }).first();
    if (await fechar.isVisible().catch(() => false)) await fechar.click(); else await p.keyboard.press('Escape');
    await s.espera(400);
    const livre = await selecionar('wildcard.dropbox.com');
    await s.foto('01-3-lista-objetos-7', { largura: LISTA, recorte: [livre, acoes()], margem: 30, destaque: [livre, acoes()], unir: true, descricao: 'wildcard.dropbox.com, sem referências: o botão Delete aparece' });
  });

  if (await parar('E')) return;

  /* =================== F. CLI =================== */
  await tentar('ssh', async () => {
    await s.abrir('admin-pc');
    await s.limpo(true);
    await abrirPutty();
    await p.locator('.pt-type:visible label', { hasText: 'SSH' }).first().click();
    await s.espera(300);
    await p.locator('.pt-config:visible label', { hasText: 'Host Name' }).first().locator('input').fill('10.10.99.1');
    await s.foto('01-3-ssh-1', { recorte: [cfgPutty()], margem: 10, destaque: [p.locator('.pt-config:visible label', { hasText: 'Host Name' }).first(), p.locator('.pt-config:visible .pt-speed').first(), p.locator('.pt-type:visible').first(), botaoVis('Open', p.locator('.pt-config:visible'))], descricao: 'PuTTY no ADMIN-PC: SSH para 10.10.99.1, porta 22' });
    await botaoVis('Open', p.locator('.pt-config:visible')).click();
    await tela().waitFor();
    await s.espera(800);
    const t = await textoTela();
    if (/login as:|login:\s*$/.test(t)) { await digitar('admin', false); }
    if (/password:\s*$/i.test(await textoTela())) await digitar(SENHA);
    await s.espera(500);
    await fotoTela('01-3-ssh-2', 'Sessão SSH no FortiGate a partir do ADMIN-PC');
  });
  await s.gui(FGT, SENHA, '/dashboard/status');
  await s.limpo(true);
  await tentar('cli-console', async () => {
    const btnCli = p.locator('header.banner button[title="CLI"]:visible').first();
    await btnCli.click();
    await s.espera(400);
    const op = p.getByText('CLI Console', { exact: true }).first();
    await s.foto('01-3-cli-menu', { recorte: [btnCli, op], margem: 40, destaque: [btnCli, op], descricao: 'Botão da CLI e a opção CLI Console' });
    await op.click();
    await p.locator('.cli-modal .cli-screen').last().waitFor();
    await s.cli('show system interface mgmt');
    await s.foto('01-3-cli-console-gui', { recorte: [cliFrame()], margem: 10, descricao: 'CLI Console com show system interface mgmt' });
    await s.cli('show full-configuration system interface mgmt');
    await s.foto('01-3-show-full', { recorte: [cliFrame()], margem: 10, descricao: 'show full-configuration system interface mgmt' });
    await s.fecharCli();
    // set x append x unselect, cada um seguido de show
    await s.cli(['config system interface', 'edit port10', 'set allowaccess ping https ssh', 'show'], { novo: true });
    await s.foto('01-3-set-0', { recorte: [cliFrame()], margem: 10, descricao: 'port10 com allowaccess ping https ssh' });
    await s.cli(['set allowaccess snmp', 'show']);
    await s.foto('01-3-set-1', { recorte: [cliFrame()], margem: 10, descricao: 'set allowaccess snmp substitui a lista' });
    await s.cli(['set allowaccess ping https ssh', 'append allowaccess snmp', 'show']);
    await s.foto('01-3-set-2', { recorte: [cliFrame()], margem: 10, descricao: 'append allowaccess snmp acrescenta' });
    await s.cli(['unselect allowaccess ssh', 'show']);
    await s.foto('01-3-set-3', { recorte: [cliFrame()], margem: 10, descricao: 'unselect allowaccess ssh retira' });
    await s.cli(['abort', 'end']);
    await s.fecharCli();
    await s.cli(['config system interface', 'edit port10'], { novo: true });
    const telaCli = p.locator('.cli-modal .cli-screen').last();
    await telaCli.click();
    await p.keyboard.type('set allowaccess ?');
    await s.espera(600);
    await s.foto('01-3-ajuda', { recorte: [cliFrame()], margem: 10, descricao: 'O ? lista as opções de allowaccess' });
    await p.keyboard.press('Control+C');
    await s.cli(['abort', 'end']);
    await telaCli.click();
    await p.keyboard.type('get system stat');
    await p.keyboard.press('Tab');
    await s.espera(500);
    await s.foto('01-3-tab', { recorte: [cliFrame()], margem: 10, descricao: 'Tab completa o comando' });
    await p.keyboard.press('Control+C');
    await s.espera(300);
    await guardarCli('get system status', 'system-status');
    await guardarCli('get system performance status', 'performance');
    await s.fecharCli();
  });

  if (await parar('F')) return;

  /* =================== G. Configurações do sistema =================== */
  await tentar('settings', async () => {
    await menu('01-4-menu-settings', 'System', 'Settings', 'Menu System > Settings');
    await campo('Hostname').waitFor();
    await s.foto('01-4-system-settings-1', { destaque: [conteudo()], descricao: 'System > Settings, aba General' });
    await preencher(campo('Hostname'), 'FGT-MTZ');
    await s.foto('01-4-system-settings-2', { largura: FORM, recorte: [campo('Hostname')], margem: 40, destaque: [campo('Hostname')], descricao: 'Hostname FGT-MTZ' });
    await campo('Time zone').locator('select').first().selectOption('(UTC-3:00) America/Sao_Paulo').catch(() => {});
    await s.foto('01-4-system-settings-3', { largura: FORM, recorte: [campo('Date/Time display'), campo('Time zone')], margem: 30, destaque: [campo('Time zone')], descricao: 'Fuso horário America/Sao_Paulo' });
    await s.foto('01-4-system-settings-4', { largura: FORM, recorte: [campo('Set time'), campo('Sync interval')], margem: 30, destaque: [campo('Set time'), campo('Select server'), campo('Sync interval')], unir: true, descricao: 'Set time NTP, servidor e intervalo de sincronização' });
    const aplicar = botaoVis('Apply');
    await rolarAte(aplicar);
    await s.foto('01-4-system-settings-apply', { recorte: [aplicar], margem: 70, destaque: [aplicar], descricao: 'Botão Apply' });
    await aplicar.click();
    await s.espera(900);
  });
  await tentar('ntp', async () => {
    await s.cli(['config system ntp', 'set type custom', 'config ntpserver', 'edit 1', 'set server a.ntp.br', 'next', 'end', 'end'], { novo: true });
    await s.foto('01-4-ntp-cli', { recorte: [cliFrame()], margem: 10, descricao: 'NTP a.ntp.br configurado pela CLI Console' });
    await guardarCli('show system ntp', 'ntp');
    await s.fecharCli();
    await s.rota('/system/settings');
    await campo('Set time').waitFor();
    await s.foto('01-4-ntp-gui', { largura: FORM, recorte: [campo('Set time'), campo('Sync interval')], margem: 30, destaque: [campo('Select server'), campo('Server')], descricao: 'System > Settings mostrando o servidor NTP Custom a.ntp.br' });
  });
  await tentar('dns', async () => {
    await menu('01-4-menu-dns', 'Network', 'DNS', 'Menu Network > DNS');
    await campo('DNS servers').waitFor();
    await s.foto('01-4-dns-1', { destaque: [conteudo()], descricao: 'Network > DNS' });
    await s.foto('01-4-dns-2', { largura: FORM, recorte: [campo('DNS servers'), campo('Secondary DNS server')], margem: 30, destaque: [campo('DNS servers'), campo('Primary DNS server'), campo('Secondary DNS server')], unir: true, descricao: 'Servidores DNS do FortiGuard' });
    const protocolos = p.locator('.form-section-h:visible', { hasText: /DNS Protocols/ }).first();
    await s.foto('01-4-dns-3', { largura: FORM, recorte: [protocolos, campo('Server hostname')], margem: 30, destaque: [campo('DNS (UDP/53)'), campo('TLS (TCP/853)'), campo('HTTPS (TCP/443)'), campo('SSL certificate'), campo('Server hostname')], unir: true, descricao: 'Protocolos de DNS' });
    await campo('DNS servers').locator('.seg button, .seg span', { hasText: /^\s*Specify\s*$/ }).first().click();
    await s.espera(400);
    await s.foto('01-4-dns-specify', { largura: FORM, recorte: [campo('DNS servers'), campo('Local domain name')], margem: 30, destaque: [campo('DNS servers'), campo('Primary DNS server'), campo('Secondary DNS server')], unir: true, descricao: 'Opção Specify com os campos de servidor' });
    await s.rota('/dashboard/status');
  });
  await tentar('sysinfo-depois', async () => {
    await s.rota('/dashboard/status');
    const w = widget('System Information');
    await w.waitFor();
    await s.foto('01-4-sysinfo-depois', { recorte: [w], margem: 20, destaque: [linhaWidget('System Information', 'Hostname'), linhaWidget('System Information', 'System time')], descricao: 'System Information com o hostname FGT-MTZ e a hora' });
  });
  await tentar('admin-access', async () => {
    await menu(null, 'Network', 'Interfaces');
    await abrirEdicao('mgmt', '01-4-mgmt-0');
    await rolarAte(linha('IPv4'));
    await s.foto('01-4-admin-access', { largura: FORM, recorte: [p.locator('.edit-pane:visible .form-section-h', { hasText: 'Administrative Access' }).first(), linha('IPv4')], margem: 24, destaque: [linha('IPv4')], descricao: 'Administrative Access da mgmt: HTTPS, SSH e PING' });
    await fotoOk('01-4-mgmt-ok', 'Botão OK da edição da mgmt');
    await botaoVis('OK', painel()).click();
    await s.espera(600);
  });
  await tentar('access', async () => {
    await s.rota('/system/settings');
    await campo('Hostname').waitFor();
    await s.foto('01-4-administration-settings-0', { recorte: [abaLoc('General'), abaLoc('Preference')], margem: 30, destaque: [abaLoc('Access')], descricao: 'Aba Access de System > Settings' });
    await aba('Access');
    const sec = p.locator('.form-section-h:visible', { hasText: /Administration settings/i }).first();
    await rolarAte(sec);
    await s.foto('01-4-administration-settings-1', { largura: FORM, recorte: [sec, campo('Idle timeout')], margem: 24, destaque: [campo('HTTP port'), campo('HTTPS port'), campo('SSH port')], unir: true, descricao: 'Portas administrativas' });
    await preencher(campo('Idle timeout'), '15');
    await s.foto('01-4-administration-settings-2', { largura: FORM, recorte: [sec, campo('Idle timeout')], margem: 24, destaque: [campo('Idle timeout')], descricao: 'Idle timeout de 15 minutos' });
    await s.foto('01-4-administration-settings-3', { largura: FORM, recorte: [sec, campo('Idle timeout')], margem: 24, destaque: [campo('HTTPS server certificate'), campo('Allow concurrent sessions')], descricao: 'Certificado da GUI e sessões simultâneas' });
    const aplicar = botaoVis('Apply');
    await rolarAte(aplicar);
    await s.foto('01-4-administration-apply', { recorte: [aplicar], margem: 70, destaque: [aplicar], descricao: 'Botão Apply' });
    await aplicar.click();
    await s.espera(800);
  });
  await tentar('revisoes', async () => {
    await s.rota('/system/settings');
    for (const t of ['General', 'Access', 'Device', 'Preference']) {
      await aba(t);
      if (await campo('Create a configuration revision on logout').count()) break;
    }
    const r = campo('Create a configuration revision on logout');
    await conteudo().evaluate((e) => { e.scrollTop = e.scrollHeight; });
    await s.espera(400);
    const sec = p.locator('.form-section-h:visible', { hasText: /^\s*Configuration\s*$/ }).first();
    await s.foto('01-7-revisao', { largura: FORM, recorte: [(await sec.count()) ? sec : r, r], margem: 40, destaque: [r], descricao: 'Create a configuration revision on logout' });
  });
  await tentar('logs', async () => {
    await menu('01-4-menu-eventos', 'Log & Report', 'System Events', 'Menu Log & Report > System Events');
    await s.foto('01-4-log-resumo', { destaque: [conteudo()], descricao: 'System Events, aba Summary' });
    await s.foto('01-4-log-aba', { recorte: [abaLoc('Summary'), abaLoc('Logs')], margem: 30, destaque: [abaLoc('Logs')], descricao: 'Aba Logs' });
    await aba('Logs');
    await s.espera(600);
    await s.foto('01-4-log-login', { destaque: [conteudo().locator('table').last()], descricao: 'Logs de eventos com os logins administrativos' });
    const linhaLogin = p.locator('tr:visible', { hasText: /login/i }).first();
    await linhaLogin.dblclick().catch(() => linhaLogin.click());
    await s.espera(700);
    const det = p.locator('.slide-pane:visible, .log-details:visible, .detail-pane:visible').last();
    if (await det.isVisible().catch(() => false)) await s.foto('01-4-log-detalhe', { recorte: [det], margem: 10, descricao: 'Detalhes do evento de login' });
    await p.keyboard.press('Escape');
  });

  if (await parar('G')) return;

  /* =================== H. Administradores =================== */
  await tentar('perfis', async () => {
    await menu('01-5-menu-perfis', 'System', 'Admin Profiles', 'Menu System > Admin Profiles');
    await p.locator('td:visible', { hasText: 'super_admin' }).first().waitFor();
    await s.foto('01-5-admin-profiles', { largura: LISTA, recorte: [criar(), p.locator('tr:visible', { hasText: 'prof_admin' }).first()], margem: 30, destaque: [p.locator('tr:visible', { hasText: 'super_admin' }).first(), p.locator('tr:visible', { hasText: 'prof_admin' }).first()], descricao: 'Perfis super_admin e prof_admin' });
    await s.foto('01-5-admin-profile-0', { largura: LISTA, recorte: [criar(), p.locator('.content-scroll thead:visible').first()], margem: 24, destaque: [criar()], descricao: 'Botão Create new' });
    await criar().click();
    await painel().waitFor();
    await s.espera(500);
    await preencher(linha('Name'), 'Atlas-Leitura');
    await s.foto('01-5-admin-profile-1', { largura: FORM, recorte: [painel().locator('.ep-h'), painel().locator('table').first()], margem: 20, destaque: [linha('Name')], descricao: 'Novo perfil Atlas-Leitura, ainda com as permissões padrão' });
    const lerTudo = painel().locator('button:visible', { hasText: /^\s*Read\s*$/ }).first();
    await lerTudo.click();
    await s.espera(300);
    await s.foto('01-5-admin-profile-2', { largura: FORM, recorte: [painel().locator('.ep-h'), painel().locator('table').first()], margem: 20, destaque: [lerTudo, painel().locator('table').first()], descricao: 'Set All > Read: leitura em todas as áreas' });
    const cliPerm = linha('Permit usage of CLI commands');
    const idle = painel().locator('.form-section-h', { hasText: 'Override Idle Timeout' }).first();
    if (await cliPerm.count()) { await rolarAte(cliPerm); await s.foto('01-5-admin-profile-3', { largura: FORM, recorte: [cliPerm, idle], margem: 30, destaque: [cliPerm, idle], descricao: 'Outras opções do perfil' }); }
    await fotoOk('01-5-admin-profile-ok', 'Botão OK do perfil');
    await botaoVis('OK', painel()).click();
    await s.espera(700);
    await s.foto('01-5-admin-profile-lista', { largura: LISTA, recorte: [p.locator('.content-scroll thead:visible').first(), p.locator('tr:visible', { hasText: 'Atlas-Leitura' }).first()], margem: 20, destaque: [p.locator('tr:visible', { hasText: 'Atlas-Leitura' }).first()], descricao: 'Perfil Atlas-Leitura na lista' });
  });
  await tentar('conta', async () => {
    await menu('01-5-menu-admins', 'System', 'Administrators', 'Menu System > Administrators');
    await criar().click();
    await s.espera(400);
    await s.foto('01-5-admin-conta-0', { recorte: [criar(), menusAbertos().last()], margem: 40, destaque: [criar(), itemMenu('Administrator')], descricao: 'Create new > Administrator' });
    await itemMenu('Administrator').click();
    await painel().waitFor();
    await s.espera(500);
    await preencher(linha('Username'), 'carla.suporte');
    await linha('Password').locator('input').first().fill('Suporte#2026');
    await linha('Confirm Password').locator('input').first().fill('Suporte#2026');
    await s.foto('01-5-admin-conta-1', { largura: FORM, recorte: [painel().locator('.ep-h'), linha('Confirm Password')], margem: 20, destaque: [linha('Username'), linha('Type'), linha('Password'), linha('Confirm Password')], unir: true, descricao: 'Username, Type, Password e Confirm Password' });
    await linha('Administrator profile').locator('select').first().selectOption('Atlas-Leitura');
    await s.espera(300);
    await rolarAte(linha('Administrator profile'));
    await s.foto('01-5-admin-conta-2', { largura: FORM, recorte: [linha('Administrator profile')], margem: 60, destaque: [linha('Administrator profile')], descricao: 'Perfil Atlas-Leitura' });
    const th = linha('Restrict login to trusted hosts');
    await rolarAte(th);
    if (!(await th.locator('.toggle').first().evaluate((e) => e.classList.contains('on')))) await th.locator('.toggle').first().click();
    await s.espera(300);
    const host1 = linha('Trusted Hosts');
    await host1.locator('input').first().fill('10.10.99.0/24');
    await s.espera(300);
    await s.foto('01-5-admin-conta-3', { largura: FORM, recorte: [th, host1], margem: 40, destaque: [th, host1], unir: true, descricao: 'Trusted hosts: 10.10.99.0/24' });
    await tentar('conta-2fa', async () => { const f = linha('Two-factor Authentication'); await rolarAte(f); await s.foto('01-5-admin-conta-4', { largura: FORM, recorte: [f], margem: 60, destaque: [f], descricao: 'Two-factor Authentication' }); });
    await fotoOk('01-5-admin-conta-ok', 'Botão OK da conta');
    await botaoVis('OK', painel()).click();
    await s.espera(800);
    await s.foto('01-5-admin-conta-lista', { largura: LISTA, recorte: [p.locator('.content-scroll thead:visible').first(), p.locator('tr:visible', { hasText: 'carla.suporte' }).first()], margem: 20, destaque: [p.locator('tr:visible', { hasText: 'carla.suporte' }).first()], descricao: 'Conta carla.suporte na lista' });
  });
  await tentar('senha', async () => {
    await s.rota('/system/settings');
    await aba('Access');
    const sec = p.locator('.form-section-h:visible', { hasText: /^\s*Security\s*$/ }).first();
    await rolarAte(sec);
    const pol = campo('Password policy');
    if (await pol.count()) { const t = pol.locator('.toggle').first(); if ((await t.count()) && !(await t.evaluate((e) => e.classList.contains('on')))) await t.click(); }
    await s.espera(300);
    const fim = (await campo('Password expiration').count()) ? campo('Password expiration') : campo('Minimum length');
    await s.foto('01-5-password-policy', { largura: FORM, recorte: [sec, fim], margem: 24, destaque: [sec, fim], unir: true, descricao: 'Política de senha dos administradores' });
    await s.rota('/dashboard/status');
  });
  await tentar('login-carla', async () => {
    await botaoAdmin().click();
    await s.espera(400);
    await s.foto('01-5-logout', { recorte: [botaoAdmin(), menusAbertos().nth(0)], margem: 24, destaque: [itemMenu('Logout')], descricao: 'Menu do administrador com Logout' });
    await itemMenu('Logout').click();
    await p.locator('.login-in:visible').first().waitFor();
    await p.locator('.login-in:visible').nth(0).fill('carla.suporte');
    await p.locator('.login-in:visible').nth(1).fill('Suporte#2026');
    await s.foto('01-5-login-carla', { recorte: [p.locator('.login-card:visible').first()], margem: 30, destaque: [p.locator('.login-in:visible').nth(0), p.locator('.login-in:visible').nth(1), p.locator('.login-btn:visible').first()], descricao: 'Login como carla.suporte' });
    await p.locator('.login-btn:visible').first().click();
    await s.espera(1200);
    await s.fecharNovidades();
    await s.rota('/network/interfaces');
    await s.espera(600);
    await s.foto('01-5-carla-leitura', { destaque: [p.locator('.content-scroll button:visible').first()], descricao: 'GUI como carla.suporte: somente leitura' });
    await botaoAdmin().click();
    await s.espera(300);
    await itemMenu('Logout').click();
    await p.locator('.login-in:visible').first().waitFor();
    await p.locator('.login-in:visible').nth(0).fill('admin');
    await p.locator('.login-in:visible').nth(1).fill(SENHA);
    await p.locator('.login-btn:visible').first().click();
    await s.espera(1200);
    await s.fecharNovidades();
  });
  await tentar('widget-admins', async () => {
    await s.rota('/dashboard/status');
    const w = widget('Administrators');
    if (await w.count()) { await rolarAte(w); await s.foto('01-5-widget-admins', { recorte: [w], margem: 20, destaque: [w], descricao: 'Widget Administrators' }); }
  });
  await tentar('log-alteracao', async () => {
    await s.rota('/log/system-events');
    await aba('Logs');
    await s.espera(600);
    await s.foto('01-5-log-alteracoes', { destaque: [conteudo().locator('table').last()], descricao: 'Eventos de alteração de configuração e logins' });
  });

  if (await parar('H')) return;

  /* =================== I. FortiGuard e licenças =================== */
  await tentar('fortiguard', async () => {
    await menu('01-6-menu-fortiguard', 'System', 'FortiGuard', 'Menu System > FortiGuard');
    await s.foto('01-6-fortiguard', { destaque: [conteudo()], descricao: 'System > FortiGuard, Subscriptions' });
    await s.foto('01-6-fortiguard-aba', { recorte: [abaLoc('Subscriptions'), abaLoc('FortiGuard settings')], margem: 30, destaque: [abaLoc('FortiGuard settings')], descricao: 'Aba FortiGuard settings' });
    await aba('FortiGuard settings');
    await s.espera(500);
    await s.foto('01-6-updates', { destaque: [conteudo()], descricao: 'FortiGuard settings' });
    const atualizar = p.locator('button:visible', { hasText: /Update licenses/ }).first();
    if (await atualizar.count()) await s.foto('01-6-update-now', { recorte: [atualizar], margem: 90, destaque: [atualizar], descricao: 'Botão Update licenses & definitions now' });
  });
  await tentar('licencas', async () => {
    await s.rota('/dashboard/status');
    await widget('Licenses').waitFor();
    await s.foto('01-6-licencas-widget', { recorte: [widget('Licenses')], margem: 24, descricao: 'Widget Licenses só com FortiCare' });
    await s.rota('/system/fortiguard');
    await aba('Subscriptions');
    await s.foto('01-6-fortiguard-disponiveis-0', { recorte: [abaLoc('Licensed'), abaLoc('Available')], margem: 30, destaque: [abaLoc('Available')], descricao: 'Aba Available for purchase' });
    await aba('Available');
    await s.foto('01-6-fortiguard-disponiveis', { destaque: [conteudo()], descricao: 'Serviços disponíveis para compra' });
    await s.setConfig(FGT, 'sys_license', { plan: 'utp', addons: [] });
    await s.rota('/dashboard/status');
    await widget('Licenses').waitFor();
    await s.foto('01-6-licencas-utp', { recorte: [widget('Licenses')], margem: 24, descricao: 'Widget Licenses com o bundle UTP' });
    await s.setConfig(FGT, 'sys_license', { plan: 'utp', addons: [], expired: true });
    await s.rota('/dashboard/status');
    await widget('Licenses').waitFor();
    await s.foto('01-6-licencas-expiradas', { recorte: [widget('Licenses')], margem: 24, descricao: 'Widget Licenses com o UTP vencido' });
    await s.rota('/system/fortiguard');
    await aba('Subscriptions');
    await aba('Expired');
    await s.foto('01-6-fortiguard-expiradas', { destaque: [conteudo()], descricao: 'Aba Expired' });
    await s.setConfig(FGT, 'sys_license', { plan: 'utp', addons: [] });
  });
  await tentar('registro', async () => {
    await menu('01-7-menu-firmware', 'System', 'Firmware & Registration', 'Menu System > Firmware & Registration');
    const l = p.locator('td:visible', { hasText: 'FGT-MTZ' }).first();
    await l.click();
    await s.espera(400);
    const reg = p.locator('tr.actions button:visible', { hasText: 'Register' }).first();
    await s.foto('01-6-registro', { largura: LISTA, recorte: [l, reg], margem: 40, destaque: [reg], descricao: 'Botão Register do FGT-MTZ' });
    await s.foto('01-7-firmware', { destaque: [conteudo()], descricao: 'System > Firmware & Registration' });
  });

  if (await parar('I')) return;

  /* =================== J. Backup, restauração e upgrade =================== */
  let arquivoBackup = null;
  await tentar('backup', async () => {
    await s.rota('/dashboard/status');
    await menuConfiguration('Backup', { botao: '01-7-backup-passo-0', menu: '01-7-backup-passo-1', sub: '01-7-backup-passo-2' });
    const dlg = p.locator('.dialog:visible').last();
    await dlg.waitFor();
    await s.foto('01-7-backup-1', { recorte: [dlg], margem: 14, destaque: [s.campo('Backup to', dlg)], descricao: 'Backup to: Local PC' });
    const enc = s.campo('Encryption', dlg);
    await enc.locator('.toggle').first().click();
    await s.espera(300);
    await s.campo('Password', dlg).locator('input').first().fill('Backup#Atlas26');
    await s.campo('Confirm password', dlg).locator('input').first().fill('Backup#Atlas26');
    await s.foto('01-7-backup-2', { recorte: [dlg], margem: 14, destaque: [enc], descricao: 'Encryption ligada' });
    await s.foto('01-7-backup-3', { recorte: [dlg], margem: 14, destaque: [s.campo('Password', dlg), s.campo('Confirm password', dlg)], descricao: 'Senha do backup' });
    await s.foto('01-7-backup-4', { recorte: [dlg], margem: 14, destaque: [botaoVis('OK', dlg)], descricao: 'Botão OK para baixar o backup' });
    const [download] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }), botaoVis('OK', dlg).click()]);
    arquivoBackup = path.join(SAIDA, '..', `.${download.suggestedFilename()}`);
    await download.saveAs(arquivoBackup);
    saidas['backup-arquivo'] = download.suggestedFilename();
    saidas['backup-cabecalho'] = fs.readFileSync(arquivoBackup, 'utf8').split('\n')[0];
  });
  await tentar('restore', async () => {
    await s.rota('/dashboard/status');
    await menuConfiguration('Restore', { sub: '01-7-restore-passo-1' });
    const dlg = p.locator('.dialog:visible').last();
    await dlg.waitFor();
    await s.foto('01-7-restore', { recorte: [dlg], margem: 14, destaque: [dlg.locator('button', { hasText: /Upload/ }).first()], descricao: 'Restore: botão Upload' });
    if (arquivoBackup) {
      await dlg.locator('input[type=file]').first().setInputFiles(arquivoBackup);
      await s.espera(400);
      const pw = s.campo('Password', dlg);
      if (await pw.count()) await pw.locator('input').first().fill('Backup#Atlas26');
      await s.foto('01-7-restore-2', { recorte: [dlg], margem: 14, destaque: [dlg.locator('button', { hasText: /Upload/ }).first(), pw, botaoVis('OK', dlg)], descricao: 'Arquivo escolhido, senha e OK' });
    }
    await botaoVis('Cancel', dlg).click();
  });
  await tentar('upgrade', async () => {
    const fotoBotao = async (nome, texto, descricao) => { const b = botaoVis(texto, painel()); await s.foto(nome, { recorte: [b], margem: 90, destaque: [b], descricao }); };
    await s.rota('/system/firmware');
    const l = p.locator('td:visible', { hasText: 'FGT-MTZ' }).first();
    await l.click();
    await s.espera(400);
    const up = p.locator('tr.actions button:visible', { hasText: 'Upgrade' }).first();
    await s.foto('01-7-upgrade-1', { largura: LISTA, recorte: [l, p.locator('tr.actions button:visible', { hasText: 'Register' }).first()], margem: 40, destaque: [up], descricao: 'FGT-MTZ selecionado e o botão Upgrade' });
    await up.click();
    await painel().waitFor();
    await s.espera(500);
    // O conteúdo do passo fica no alto e os botões no rodapé do painel: duas fotos, o conteúdo e o botão.
    const conteudoPasso = () => painel().locator('.ep-main > *').last();
    const passo = async (nome, descricao, destaque = []) => {
      await s.foto(nome, { largura: 1400, recorte: [painel().locator('.ep-h'), conteudoPasso()], margem: 16, destaque, descricao });
    };
    await passo('01-7-upgrade-2', 'Tipo de upgrade');
    await fotoBotao('01-7-upgrade-next', 'Next', 'Botão Next do assistente');
    await botaoVis('Next', painel()).click();
    await s.espera(500);
    const versao = painel().locator('.fw-ver:visible').first();
    if (await versao.count()) await versao.click().catch(() => {});
    await passo('01-7-upgrade-3', 'Versão de destino e o botão Next', [versao]);
    await botaoVis('Next', painel()).click();
    await s.espera(500);
    const pw = linha('Password');
    if (await pw.count()) { await pw.locator('input').first().fill('Backup#Atlas26'); await linha('Confirm password').locator('input').first().fill('Backup#Atlas26'); }
    const espec = painel().locator('.seg button, .seg span', { hasText: /^\s*Specify\s*$/ }).first();
    if (await espec.count()) await espec.click();
    await s.espera(300);
    await passo('01-7-upgrade-4', 'Agendamento e backup antes do upgrade', [espec]);
    await botaoVis('Next', painel()).click();
    await s.espera(500);
    await passo('01-7-upgrade-5', 'Revisão do upgrade');
    const conf = painel().locator('button:visible', { hasText: /Confirm and Backup Config/ }).first();
    if (await conf.count()) await s.foto('01-7-upgrade-confirm', { recorte: [conf], margem: 90, destaque: [conf], descricao: 'Botão Confirm and Backup Config' });
    await botaoVis('Cancel', painel()).click();
  });

  if (await parar('J')) return;

  /* =================== L. Saídas para o Guia de comandos CLI =================== */
  await tentar('saidas', async () => {
    await s.gui(FGT, SENHA, '/dashboard/status');
    await s.limpo(true);
    for (const [cmd, chave] of [
      ['get system admin list', 'admin-list'],
      ['show system accprofile Atlas-Leitura', 'accprofile'],
      ['show system admin carla.suporte', 'admin-carla'],
      ['show system admin | grep -f trusthost', 'trusthost'],
      ['get system fortiguard', 'fortiguard'],
      ['diagnose autoupdate versions', 'autoupdate'],
      ['get webfilter status', 'webfilter'],
      ['get system dns', 'dns'],
      ['diagnose sys ntp status', 'ntp-status'],
      ['diagnose sys flash list', 'flash'],
      ['show system global', 'global'],
      ['show full-configuration system global | grep admintimeout', 'grep'],
      ['execute ping update.fortiguard.net', 'ping-fortiguard'],
    ]) await guardarCli(cmd, chave);
    await s.fecharCli();
  });

  /* =================== K. Recuperação de senha pela conta maintainer =================== */
  await tentar('maintainer', async () => {
    await diagrama();
    await s.patch(FGT, { powered: false });
    await s.espera(1500);
    await s.foto('01-2-maintainer-1', { recorte: [...nos(), ...(await cards())], margem: 60, destaque: [no(FGT), no('notebook'), { cabo: 'cabo-console' }], descricao: 'FortiGate desligado da energia, com o notebook na console' });
    await s.abrir('notebook');
    await s.limpo(true);
    if (!(await tela().isVisible().catch(() => false))) {
      await abrirPutty();
      await botaoVis('Open', p.locator('.pt-config:visible')).click();
      await tela().waitFor();
    }
    await s.patch(FGT, { powered: true });
    for (let i = 0; i < 40 && !/Booting OS|System is starting/.test(await textoTela()); i++) await s.espera(300);
    await fotoTela('01-2-maintainer-2', 'Boot do FortiGate na console depois de ligado');
    for (let i = 0; i < 80 && !/login:\s*$/.test(await textoTela() + ' '); i++) await s.espera(300);
    await digitar('maintainer');
    await digitar(`bcpb${SERIAL}`);
    await fotoTela('01-2-maintainer-3', 'Login como maintainer com bcpb + número de série');
    for (const l of ['config system admin', 'edit admin', 'set password Atlas#Nova26', 'end']) await digitar(l);
    await fotoTela('01-2-maintainer-4', 'Senha do admin redefinida');
  });

  fs.writeFileSync(path.join(SAIDA, 'saidas-cli.json'), `${JSON.stringify(saidas, null, 2)}\n`);
  if (falhas.length) console.warn(`Trechos com falha: ${falhas.join(', ')}`);
  await s.fim();
})().catch((e) => { console.error(e); process.exit(1); });
