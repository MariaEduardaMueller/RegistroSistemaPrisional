'use strict';
window.App = window.App || {};
(function () {
  const U = App.U, DB = App.DB, esc = U.esc, $ = id => document.getElementById(id);
  const UI = App.UI = {};
  App.sessao = null;

  // ---------------------------------------------------------------- diálogos
  UI.dialogo = function ({ titulo, corpo, botoes, aoAbrir }) {
    return new Promise(resolve => {
      const fundo = document.createElement('div');
      fundo.className = 'fundo';
      fundo.innerHTML = `<div class="dlg" role="dialog" aria-modal="true"><h3>${esc(titulo || '')}</h3><div class="corpo">${corpo || ''}</div><div class="acoes"></div></div>`;
      const ac = fundo.querySelector('.acoes');
      botoes.forEach(b => {
        const bt = document.createElement('button');
        bt.type = 'button'; bt.className = 'btn' + (b.cls ? ' ' + b.cls : ''); bt.textContent = b.rot;
        bt.addEventListener('click', async () => {
          if (b.acao) { bt.disabled = true; let r; try { r = await b.acao(fundo); } finally { bt.disabled = false; } if (r === false) return; }
          fundo.remove(); resolve(b.valor);
        });
        ac.appendChild(bt);
      });
      document.body.appendChild(fundo);
      if (aoAbrir) aoAbrir(fundo);
      const primeiro = fundo.querySelector('input,select'); if (primeiro) primeiro.focus();
    });
  };
  UI.alert = (msg, titulo) => UI.dialogo({ titulo: titulo || 'Aviso', corpo: `<div class="msg">${esc(msg)}</div>`, botoes: [{ rot: 'OK', valor: true, cls: 'prim' }] });
  UI.confirm = (msg, titulo, o) => { o = o || {}; return UI.dialogo({ titulo: titulo || 'Confirmar', corpo: `<div class="msg">${esc(msg)}</div>`, botoes: [{ rot: o.cancel || 'Cancelar', valor: false }, { rot: o.ok || 'OK', valor: true, cls: o.perigo ? 'perigo' : 'prim' }] }); };

  const msgDlg = (f, t, ok) => { const m = f.querySelector('#bkMsg'); m.className = 'msg ' + (ok ? 'ok' : 'ruim'); m.textContent = t; };
  const semUsuario = sim => { $('avisoSemUsuario').hidden = !sim; };

  // ---------------------------------------------------------------- telas
  const TELAS = ['tela-login', 'tela-busca', 'tela-ficha', 'tela-relatorio'];
  function mostrar(id) { TELAS.forEach(t => { $(t).hidden = t !== id; }); window.scrollTo(0, 0); App.telaAtual = id; }

  // ---------------------------------------------------------------- login / cadastro de usuário
  async function entrar() {
    const chave = $('loginUser').value.trim().toLowerCase(), senha = $('loginSenha').value;
    if (!chave || !senha) return UI.alert('Preencha os campos obrigatórios.');
    try {
      const u = (await DB.listarUsuarios()).find(x => x.user === chave);
      if (!u || u.hash !== U.hashSenha(u.salt, senha)) return UI.alert('Usuário ou senha incorretos.', 'Tente novamente');
      App.sessao = { user: u.user, nome: u.userExibicao || u.user };
      $('loginSenha').value = '';
      $('quem').textContent = 'Usuário: ' + App.sessao.nome;
      await abrirBusca();
    } catch (err) { UI.alert(err.message || String(err), 'Erro'); }
  }

  async function cadastrarUsuario() {
    const corpo = (IMG.cadastro ? `<img class="logo-cad" src="${IMG.cadastro}" alt="">` : '') +
      '<label class="campo"><span>Usuário (3 a 20 letras, números ou _)</span><input id="cuUser" type="text" autocapitalize="off" autocorrect="off" maxlength="20"></label>' +
      '<label class="campo"><span>Senha (mínimo 6 caracteres)</span><input id="cuSenha" type="password" autocomplete="new-password"></label>' +
      '<label class="campo"><span>CPF</span><input id="cuCpf" type="text" inputmode="numeric" maxlength="14" placeholder="000.000.000-00"></label>' +
      '<label class="campo"><span>E-mail</span><input id="cuEmail" type="text" inputmode="email" autocapitalize="off" maxlength="100"></label>' +
      '<div class="nota ruim" id="cuErro"></div>';
    await UI.dialogo({
      titulo: 'Cadastro de usuário', corpo,
      aoAbrir: f => { const c = f.querySelector('#cuCpf'); c.addEventListener('input', () => { c.value = U.maskCPF(c.value); }); },
      botoes: [{ rot: 'Cancelar', valor: false }, {
        rot: 'Salvar', valor: true, cls: 'prim',
        acao: async f => {
          const g = id => f.querySelector('#' + id).value.trim(), erro = m => { f.querySelector('#cuErro').textContent = m; return false; };
          const user = g('cuUser'), senha = f.querySelector('#cuSenha').value.trim(), cpf = g('cuCpf'), email = g('cuEmail');
          if (!user || !senha || !cpf || !email) return erro('Todos os campos são obrigatórios!');
          if (!/^\w{3,20}$/.test(user)) return erro('Usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números e underscore!');
          if (senha.length < 6) return erro('Senha deve ter pelo menos 6 caracteres!');
          if (!U.cpfEstrito(cpf)) return erro('CPF inválido! Use o formato 000.000.000-00 ou apenas números.');
          if (!U.emailValido(email)) return erro('Email inválido! Use um formato válido como: exemplo@dominio.com');
          const us = await DB.listarUsuarios();
          if (us.some(u => u.user === user.toLowerCase())) return erro('Este nome de usuário já está em uso! Escolha outro.');
          if (us.some(u => U.digits(u.cpf) === U.digits(cpf))) return erro('Este CPF já está cadastrado! Cada CPF pode ter apenas um cadastro.');
          if (us.some(u => (u.email || '').toLowerCase() === email.toLowerCase())) return erro('Este email já está cadastrado! Use outro endereço de email.');
          const salt = U.randomHex(16);
          await DB.salvarUsuario({ user: user.toLowerCase(), userExibicao: user, salt, hash: U.hashSenha(salt, senha), cpf, email, criadoEm: U.agoraISO() });
          semUsuario(false);
          $('loginUser').value = user;
          return true;
        }
      }]
    }).then(ok => { if (ok) UI.alert('Usuário cadastrado com sucesso! Agora é só acessar.', 'Cadastro'); });
  }

  function sair() { App.sessao = null; $('loginUser').value = ''; $('loginSenha').value = ''; mostrar('tela-login'); }

  // ---------------------------------------------------------------- busca
  let todos = [], visiveis = [], sel = new Set();

  async function abrirBusca() {
    mostrar('tela-busca');
    await carregar();
  }
  async function carregar() {
    todos = (await DB.listarRegistros()).sort((a, b) => U.norm(a.nome).localeCompare(U.norm(b.nome)));
    sel = new Set([...sel].filter(id => todos.some(r => r.id === id)));
    filtrar(); bannerBackup();
  }
  function filtrar() {
    const tipo = $('buscaTipo').value, termo = U.norm($('buscaTermo').value), td = U.digits($('buscaTermo').value);
    visiveis = todos.filter(r => {
      if (!termo) return true;
      switch (tipo) {
        case 'Nome': return U.norm(r.nome).includes(termo);
        case 'CPF': return td ? U.digits(r.cpf).includes(td) : U.norm(r.cpf).includes(termo);
        case 'Nome da Mãe': return U.norm(r.nomeMae).includes(termo);
        case 'ID': return String(r.id) === $('buscaTermo').value.trim();
        case 'Nome Social': return U.norm(r.nomeSocial).includes(termo);
        default: return Object.keys(r).some(k => typeof r[k] === 'string' && U.norm(r[k]).includes(termo)) || String(r.id) === termo;
      }
    });
    desenhar();
  }
  function desenhar() {
    $('tbody').innerHTML = visiveis.length ? visiveis.map(r =>
      `<tr data-id="${r.id}" class="${sel.has(r.id) ? 'sel' : ''}"><td class="c"><input type="checkbox" data-sel="${r.id}" ${sel.has(r.id) ? 'checked' : ''}></td>` +
      `<td>${r.id}</td><td>${esc(r.nome)}</td><td>${esc(r.cpf)}</td><td>${r.idade || ''}</td><td>${esc(r.nomeMae)}</td>` +
      `<td><button class="btn peq" type="button" data-abrir="${r.id}">Abrir</button></td></tr>`).join('')
      : `<tr><td colspan="7" class="vazio">${todos.length ? 'Nenhum registro encontrado.' : 'Nenhum registro cadastrado. Toque em “+ Novo registro”.'}</td></tr>`;
    $('contagem').textContent = `${visiveis.length} de ${todos.length} registro(s)` + (sel.size ? ` — ${sel.size} selecionado(s)` : '');
    $('btnRel').disabled = $('btnExcluir').disabled = sel.size === 0;
    $('selTodos').checked = visiveis.length > 0 && visiveis.every(r => sel.has(r.id));
  }
  async function bannerBackup() {
    const b = $('bannerBackup');
    if (!todos.length) { b.hidden = true; return; }
    const ult = await App.Backup.ultimoBackup();
    const dias = ult ? Math.floor((Date.now() - new Date(ult)) / 86400000) : null;
    if (ult && dias < 7) { b.hidden = true; return; }
    b.innerHTML = (ult ? `Último backup há ${dias} dia(s).` : 'Nenhum backup feito ainda.') + ' Faça um backup para não perder os registros se o aparelho for reiniciado ou limpo. <button class="btn peq" type="button" id="bannerBtn">Fazer backup</button>';
    b.hidden = false; $('bannerBtn').onclick = abrirBackup;
  }

  async function excluir() {
    const regs = todos.filter(r => sel.has(r.id));
    if (!regs.length) return;
    const nomes = regs.slice(0, 5).map(r => '• ' + r.nome).join('\n') + (regs.length > 5 ? `\n• … e mais ${regs.length - 5}` : '');
    const ok = await UI.confirm(`Excluir ${regs.length} registro(s)?\n\n${nomes}\n\nEsta ação não pode ser desfeita.`, 'Confirmar exclusão', { ok: 'Excluir', perigo: true });
    if (!ok) return;
    for (const r of regs) await DB.excluirRegistro(r.id);
    sel.clear(); await carregar();
  }

  // ---------------------------------------------------------------- ficha
  async function abrirFicha(id) {
    try { await App.Ficha.abrir(id); mostrar('tela-ficha'); } catch (err) { UI.alert(err.message || String(err), 'Erro'); }
  }
  async function salvarFicha() {
    if (await App.Ficha.salvar()) { await UI.alert('Registro salvo com sucesso!', 'Sucesso'); await abrirBusca(); }
  }
  async function cancelarFicha() {
    if (App.Ficha.alterado() && !(await UI.confirm('Há alterações não salvas. Deseja descartá-las?', 'Descartar alterações', { ok: 'Descartar', cancel: 'Continuar editando', perigo: true }))) return;
    await abrirBusca();
  }

  // ---------------------------------------------------------------- relatório
  let htmlRelatorio = '';
  function mostrarRelatorio(regs) {
    htmlRelatorio = App.Relatorio.gerar(regs);
    const fr = $('relFrame');
    fr.onload = ajustarRelatorio;
    fr.srcdoc = htmlRelatorio;
    mostrar('tela-relatorio');
  }
  function ajustarRelatorio() {
    const fr = $('relFrame'), wrap = $('relWrap'), doc = fr.contentDocument;
    if (!doc || !doc.documentElement) return;
    const W = 830, s = Math.min(1, (wrap.clientWidth - 16) / W);
    fr.style.width = W + 'px';
    const h = doc.documentElement.scrollHeight;
    fr.style.height = h + 'px'; fr.style.transform = `scale(${s})`;
    wrap.style.height = (h * s + 16) + 'px';
  }
  function imprimirRelatorio() { const w = $('relFrame').contentWindow; w.focus(); w.print(); }
  function baixarRelatorio() { App.Backup.baixar('Anexo_A_' + U.stamp() + '.html', htmlRelatorio, 'text/html'); }

  // ---------------------------------------------------------------- backup
  async function abrirBackup() {
    const B = App.Backup, ult = await B.ultimoBackup(), total = (await DB.listarRegistros()).length;
    const cripto = B.criptoDisponivel();
    const corpo =
      `<p class="nota">Registros neste aparelho: <b>${total}</b><br>Último backup: <b id="bkUlt">${ult ? U.dataHoraBR(ult) : 'nunca'}</b></p>` +
      (cripto ? '<label class="chk"><input type="checkbox" id="bkProt" checked><span>Proteger com senha (recomendado)</span></label>' +
        '<div id="bkSenhas"><label class="campo"><span>Senha do backup (mínimo 6 caracteres)</span><input id="bkS1" type="password" autocomplete="new-password"></label>' +
        '<label class="campo"><span>Repita a senha</span><input id="bkS2" type="password" autocomplete="new-password"></label>' +
        '<p class="nota">Guarde bem a senha: sem ela o backup não pode ser aberto.</p></div>'
        : '<p class="aviso">Este navegador não permite proteger o backup com senha. O arquivo será gerado sem senha: guarde-o em local seguro.</p>') +
      '<div id="bkMsg" class="msg"></div><input id="bkArq" type="file" accept=".json,application/json" hidden>';
    const msg = msgDlg;
    const exportar = share => async f => {
      let senha = null;
      if (cripto && f.querySelector('#bkProt').checked) {
        const a = f.querySelector('#bkS1').value, b = f.querySelector('#bkS2').value;
        if (a.length < 6) { msg(f, 'A senha deve ter pelo menos 6 caracteres.', false); return false; }
        if (a !== b) { msg(f, 'As senhas não conferem.', false); return false; }
        senha = a;
      }
      try {
        const bk = await B.gerar(senha);
        let feito = false;
        if (share) { try { feito = await B.compartilhar(bk.nome, bk.texto); } catch (e) { if (e && e.name === 'AbortError') return false; } }
        if (!feito) B.baixar(bk.nome, bk.texto);
        await B.registrarBackupFeito();
        f.querySelector('#bkUlt').textContent = U.dataHoraBR(U.agoraISO());
        msg(f, `Backup com ${bk.total} registro(s) ${share && feito ? 'compartilhado' : 'salvo'}: ${bk.nome}` + (share && feito ? '' : '\nProcure o arquivo na pasta Downloads (Transferências) do aparelho.'), true);
        bannerBackup();
      } catch (err) { msg(f, 'Erro ao gerar o backup: ' + (err.message || err), false); }
      return false;
    };
    const botoes = [{ rot: 'Exportar backup', valor: 1, cls: 'prim', acao: exportar(false) }];
    if (navigator.share && navigator.canShare) botoes.push({ rot: 'Compartilhar…', valor: 1, acao: exportar(true) });
    botoes.push({ rot: 'Importar backup…', valor: 1, acao: async f => { f.querySelector('#bkArq').click(); return false; } });
    botoes.push({ rot: 'Fechar', valor: 0 });
    await UI.dialogo({
      titulo: 'Backup dos registros', corpo, botoes,
      aoAbrir: f => {
        const p = f.querySelector('#bkProt'); if (p) p.addEventListener('change', () => { f.querySelector('#bkSenhas').hidden = !p.checked; });
        f.querySelector('#bkArq').addEventListener('change', async ev => {
          const arq = ev.target.files[0]; ev.target.value = ''; if (!arq) return;
          try { await importar(arq, f, msg); } catch (err) { msg(f, err.message || String(err), false); }
        });
      }
    });
    await carregar();
  }
  async function importar(arq, f, msg) {
    const B = App.Backup;
    const r = await B.ler(arq);
    let dados = r.dados;
    if (r.precisaSenha) {
      const senha = await pedirSenha();
      if (senha == null) { msg(f, 'Importação cancelada.', false); return; }
      dados = await B.abrirCifrado(r.env, senha);
    }
    const n = (dados.registros || []).length;
    const ok = await UI.confirm(`Importar ${n} registro(s) do backup?\n\nOs dados serão UNIDOS aos que já estão neste aparelho: nada é apagado. Se a mesma pessoa (mesmo CPF) existir nos dois lados, vale o registro alterado por último.`, 'Importar backup', { ok: 'Importar' });
    if (!ok) return;
    const res = await B.mesclar(dados);
    msg(f, `Importação concluída: ${res.novos} novo(s), ${res.atualizados} atualizado(s), ${res.mantidos} já estavam iguais ou mais recentes` + (res.usuariosNovos ? `; ${res.usuariosNovos} usuário(s) de acesso adicionado(s).` : '.'), true);
    semUsuario(false);
  }
  async function importacaoInicial() {
    await UI.dialogo({
      titulo: 'Importar backup', corpo: '<p class="nota">Escolha o arquivo de backup gerado em outro aparelho. Os usuários de acesso e os registros serão copiados para este aparelho.</p><div id="bkMsg" class="msg"></div><input id="bkArq" type="file" accept=".json,application/json" hidden>',
      botoes: [{ rot: 'Escolher arquivo…', valor: 1, cls: 'prim', acao: async f => { f.querySelector('#bkArq').click(); return false; } }, { rot: 'Fechar', valor: 0 }],
      aoAbrir: f => f.querySelector('#bkArq').addEventListener('change', async ev => {
        const arq = ev.target.files[0]; ev.target.value = ''; if (!arq) return;
        try { await importar(arq, f, msgDlg); } catch (err) { msgDlg(f, err.message || String(err), false); }
      })
    });
  }
  function pedirSenha() {
    let valor = null;
    return UI.dialogo({
      titulo: 'Backup protegido', corpo: '<label class="campo"><span>Digite a senha do backup</span><input id="ipS" type="password" autocomplete="off"></label>',
      botoes: [{ rot: 'Cancelar', valor: null }, { rot: 'Abrir', valor: 'ok', cls: 'prim', acao: async d => { valor = d.querySelector('#ipS').value; return true; } }]
    }).then(r => (r === 'ok' ? valor : null));
  }

  // ---------------------------------------------------------------- inicialização
  async function iniciar() {
    if (window.IMG) { $('logoLogin').src = IMG.panel; $('logoTopo').src = IMG.icone; }
    App.Ficha.construir();

    $('btnEntrar').onclick = entrar;
    $('loginSenha').addEventListener('keydown', e => { if (e.key === 'Enter') entrar(); });
    $('loginUser').addEventListener('keydown', e => { if (e.key === 'Enter') $('loginSenha').focus(); });
    $('btnCadUser').onclick = cadastrarUsuario;
    $('btnImpInicial').onclick = importacaoInicial;
    $('btnSair').onclick = sair;
    $('btnLocalizar').onclick = filtrar;
    $('btnLimpar').onclick = () => { $('buscaTermo').value = ''; $('buscaTipo').selectedIndex = 0; filtrar(); };
    $('buscaTermo').addEventListener('keydown', e => { if (e.key === 'Enter') filtrar(); });
    $('btnNovo').onclick = () => abrirFicha(null);
    $('btnExcluir').onclick = excluir;
    $('btnBackup').onclick = abrirBackup;
    $('btnRel').onclick = () => { const regs = todos.filter(r => sel.has(r.id)); if (regs.length) mostrarRelatorio(regs); };
    $('selTodos').onchange = e => { visiveis.forEach(r => (e.target.checked ? sel.add(r.id) : sel.delete(r.id))); desenhar(); };
    $('tbody').addEventListener('click', e => {
      const ab = e.target.closest('[data-abrir]'); if (ab) return abrirFicha(Number(ab.dataset.abrir));
      const cb = e.target.closest('[data-sel]');
      if (cb) { const id = Number(cb.dataset.sel); cb.checked ? sel.add(id) : sel.delete(id); desenhar(); }
    });
    $('fSalvar').onclick = salvarFicha;
    $('fCancelar').onclick = cancelarFicha;
    $('fAnt').onclick = () => App.Ficha.abaSeguinte(-1);
    $('fProx').onclick = () => App.Ficha.abaSeguinte(1);
    $('rVoltar').onclick = () => mostrar('tela-busca');
    $('rImprimir').onclick = imprimirRelatorio;
    $('rBaixar').onclick = baixarRelatorio;
    window.addEventListener('resize', () => { if (App.telaAtual === 'tela-relatorio') ajustarRelatorio(); });
    window.addEventListener('beforeunload', e => { if (App.telaAtual === 'tela-ficha' && App.Ficha.alterado()) { e.preventDefault(); e.returnValue = ''; } });

    mostrar('tela-login');
    try {
      await DB.open();
      semUsuario((await DB.listarUsuarios()).length === 0);
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
    } catch (err) {
      const e = $('erroFatal'); e.textContent = 'Não foi possível abrir o armazenamento deste aparelho: ' + (err.message || err) +
        '\nSe estiver em navegação anônima/privada, abra o arquivo em uma janela normal.'; e.hidden = false;
      $('btnEntrar').disabled = $('btnCadUser').disabled = true;
    }
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('service-worker.js').catch(() => { });
  }
  document.addEventListener('DOMContentLoaded', iniciar);
})();
