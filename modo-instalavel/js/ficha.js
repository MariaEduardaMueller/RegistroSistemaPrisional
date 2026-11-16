'use strict';
window.App = window.App || {};
(function () {
  const U = App.U, DB = App.DB;
  const F = App.Ficha = {};
  const els = {};
  let form, nav, estado = {};

  const esc = U.esc;
  function campoHTML(c) {
    const o = c.o, req = o.req ? ' <b class="req">*</b>' : '';
    if (c.t === 'c') return `<label class="chk" data-k="${c.k}"><input type="checkbox" name="${c.k}"><span>${esc(c.l)}</span></label>`;
    if (c.t === 's') {
      return `<label class="campo" data-k="${c.k}"><span>${esc(c.l)}${req}</span><select name="${c.k}">` +
        o.o.map(x => `<option value="${esc(x)}">${x === '' ? '—' : esc(x)}</option>`).join('') + '</select></label>';
    }
    const im = { d: 'numeric', h: 'numeric', n: 'numeric', cpf: 'numeric', tel: 'tel', dec: 'decimal' }[c.t] || 'text';
    const ml = { cpf: 14, d: 10, h: 5, tel: 15 }[c.t] || o.ml || 200;
    const ph = { d: 'DD/MM/AAAA', h: 'HH:MM', cpf: '000.000.000-00', tel: '(00) 00000-0000' }[c.t] || '';
    return `<label class="campo" data-k="${c.k}"><span>${esc(c.l)}${req}</span><input name="${c.k}" type="text" inputmode="${im}" maxlength="${ml}" placeholder="${ph}" autocomplete="off" autocapitalize="${c.t === 't' ? 'words' : 'off'}"></label>`;
  }

  F.construir = function () {
    form = document.getElementById('fichaForm'); nav = document.getElementById('fichaAbas');
    nav.innerHTML = App.schema.map(s => `<button type="button" class="aba-btn" data-aba="${s.id}">${esc(s.titulo)}</button>`).join('');
    form.innerHTML = App.schema.map(s =>
      `<section class="aba" data-aba="${s.id}"><h2 class="aba-titulo">${esc(s.titulo)}</h2>` +
      s.grupos.map(g => `<fieldset class="grupo"><legend>${esc(g.t)}</legend><div class="grid">` +
        g.campos.map(c => campoHTML(App.campoPor[c[0]])).join('') + '</div></fieldset>').join('') + '</section>').join('');
    App.campos.forEach(c => { els[c.k] = form.querySelector(`[name="${c.k}"]`); });
    form.addEventListener('input', onAlterar);
    form.addEventListener('change', onAlterar);
    nav.addEventListener('click', ev => { const b = ev.target.closest('.aba-btn'); if (b && !b.classList.contains('oculta')) F.mostrarAba(b.dataset.aba); });
  };

  const valorDe = c => (c.t === 'c' ? els[c.k].checked : els[c.k].value);
  function valores() { const r = {}; App.campos.forEach(c => { r[c.k] = valorDe(c); }); return r; }
  function definir(c, val) {
    const el = els[c.k];
    if (c.t === 'c') el.checked = !!val; else el.value = val == null ? '' : String(val);
    if (c.t === 's' && el.value !== String(val == null ? '' : val)) el.value = '';
  }
  function vazio(c) { return c.t === 'c' ? !els[c.k].checked : els[c.k].value === ''; }

  function atualizarDependentes(limpar) {
    for (let passo = 0; passo < 4; passo++) {
      const r = valores(); let mudou = false;
      App.campos.forEach(c => {
        if (!c.o.en) return;
        const ligado = !!c.o.en(r), el = els[c.k];
        el.disabled = !ligado;
        el.closest('label').classList.toggle('off', !ligado);
        if (!ligado && limpar && !vazio(c)) { definir(c, c.t === 'c' ? false : ''); mudou = true; }
      });
      if (!mudou) break;
    }
  }

  function abaVisivel(id) { return !nav.querySelector(`[data-aba="${id}"]`).classList.contains('oculta'); }
  function aplicarSexo(sexo, limpar) {
    const amb = sexo === 'Intersexo' || sexo === 'Não desejo informar';
    const mostrar = { mulher: sexo === 'Feminino' || amb, homem: sexo === 'Masculino' || amb };
    ['mulher', 'homem'].forEach(id => {
      nav.querySelector(`[data-aba="${id}"]`).classList.toggle('oculta', !mostrar[id]);
      if (!mostrar[id] && limpar) App.campos.filter(c => c.aba === id).forEach(c => definir(c, c.t === 'c' ? false : ''));
    });
    if (!abaVisivel(estado.aba)) F.mostrarAba('ident');
  }

  function onAlterar(ev) {
    const el = ev.target, c = App.campoPor[el.name];
    if (!c) return;
    estado.sujo = true;
    if (c.t === 'cpf') el.value = U.maskCPF(el.value);
    else if (c.t === 'd') el.value = U.maskDate(el.value);
    else if (c.t === 'h') el.value = U.maskTime(el.value);
    else if (c.t === 'tel') el.value = U.maskPhone(el.value);
    else if (c.t === 'n') el.value = U.digits(el.value);
    else if (c.t === 'dec') el.value = U.maskDec(el.value);

    if (c.t === 'c' && el.checked) {
      App.EXCL.forEach(x => {
        if (x.solo === c.k) x.outros.forEach(k => { els[k].checked = false; });
        else if (x.outros && x.outros.includes(c.k)) els[x.solo].checked = false;
        else if (x.grupo && x.grupo.includes(c.k)) x.grupo.forEach(k => { if (k !== c.k) els[k].checked = false; });
      });
    }
    if (c.k === 'dataNasc') { const i = U.idadeDe(el.value); if (i !== '') els.idade.value = String(i); }
    if (c.k === 'imc') estado.imcManual = el.value !== '';
    if ((c.k === 'peso' || c.k === 'altura') && !estado.imcManual) {
      const p = U.numero(els.peso.value), a = U.numero(els.altura.value);
      els.imc.value = (p > 0 && a > 0 && a <= 3) ? (p / (a * a)).toFixed(1).replace('.', ',') : '';
    }
    atualizarDependentes(true);
    if (c.k === 'sexoBio') aplicarSexo(el.value, true);
  }

  F.mostrarAba = function (id) {
    estado.aba = id;
    nav.querySelectorAll('.aba-btn').forEach(b => b.classList.toggle('ativa', b.dataset.aba === id));
    form.querySelectorAll('.aba').forEach(s => s.classList.toggle('ativa', s.dataset.aba === id));
    const ativo = nav.querySelector('.aba-btn.ativa'); if (ativo && ativo.scrollIntoView) ativo.scrollIntoView({ block: 'nearest', inline: 'center' });
    const topo = document.getElementById('tela-ficha'); if (topo) topo.scrollTop = 0; window.scrollTo(0, 0);
  };
  F.abaSeguinte = function (d) {
    const ids = Array.from(nav.querySelectorAll('.aba-btn')).filter(b => !b.classList.contains('oculta')).map(b => b.dataset.aba);
    const i = Math.min(ids.length - 1, Math.max(0, ids.indexOf(estado.aba) + d));
    F.mostrarAba(ids[i]);
  };

  F.abrir = async function (id) {
    let rec = null;
    if (id != null) { rec = await DB.buscarRegistro(id); if (!rec) throw new Error('Registro não encontrado.'); }
    estado = { id: rec ? rec.id : null, orig: rec, sujo: false, imcManual: !!(rec && rec.imc), aba: 'atend' };
    const base = App.registroVazio();
    App.campos.forEach(c => definir(c, rec && rec[c.k] != null && !(c.k === 'idade' && !rec[c.k]) ? rec[c.k] : base[c.k]));
    atualizarDependentes(false);
    aplicarSexo(els.sexoBio.value, false);
    document.getElementById('fichaTitulo').textContent = rec ? `Editar registro #${rec.id}` : 'Novo registro';
    if (!rec) {
      const d = new Date(), p = n => String(n).padStart(2, '0');
      els.data.value = `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
      els.horario.value = `${p(d.getHours())}:${p(d.getMinutes())}`;
      if (App.sessao) els.responsavel.value = App.sessao.nome;
    }
    F.mostrarAba('atend');
  };
  F.alterado = () => !!estado.sujo;

  // ---------- validação (mesmas regras do sistema Java + campos novos)
  function validar(v) {
    const erros = [], avisos = [];
    if (!v.nome) erros.push('Nome completo é obrigatório');
    if (!v.cpf) erros.push('CPF é obrigatório'); else if (!U.cpfBasico(v.cpf)) erros.push('CPF deve conter 11 dígitos válidos');
    const idade = parseInt(v.idade, 10);
    if (!(idade >= 1 && idade <= 120)) erros.push('Idade deve ser um valor válido (1-120)');
    if (!v.nomeMae) erros.push('Nome da mãe é obrigatório');
    if (!v.responsavel) erros.push('Responsável pelo atendimento é obrigatório');
    [['dataNasc', 'Data de nascimento'], ['dataEntrada', 'Data de entrada'], ['data', 'Data do atendimento'], ['dataInicioSintomas', 'Data de início dos sintomas']]
      .forEach(([k, n]) => { if (v[k] && !U.dataValida(v[k])) erros.push(n + ' deve ser uma data válida no formato DD/MM/AAAA'); });
    if (v.horario && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.horario)) erros.push('Horário deve estar no formato HH:MM (00:00 a 23:59)');
    if (v.cns && U.digits(v.cns).length !== 15) erros.push('CNS deve conter 15 dígitos');
    if (v.nacionalidade === 'Estrangeiro' && !v.paisOrigem) erros.push('Informe o país de origem do estrangeiro');
    [1, 2].forEach(i => { const t = U.digits(v['contato' + i + 'Telefone']); if (t && t.length !== 10 && t.length !== 11) erros.push('Telefone do Contato ' + i + ' deve ter DDD + 8 ou 9 dígitos'); });

    // avisos (o usuário pode continuar)
    if (v.peso) { const p = U.numero(v.peso); if (isNaN(p)) avisos.push('Peso deve ser um número válido'); else if (p <= 0 || p > 300) avisos.push('Peso deve ser um valor válido (1-300 kg)'); }
    if (v.altura) { const a = U.numero(v.altura); if (isNaN(a)) avisos.push('Altura deve ser um número válido'); else if (a <= 0 || a > 3) avisos.push('Altura deve ser um valor válido (0,1-3,0 metros)'); }
    if (v.pressaoArterial && !/^\d{2,3}\/\d{2,3}$/.test(v.pressaoArterial)) avisos.push('Pressão arterial deve estar no formato XXX/XX (ex: 120/80)');
    if (v.temperatura) { const t = U.numero(v.temperatura); if (isNaN(t)) avisos.push('Temperatura deve ser um número válido'); else if (t < 30 || t > 45) avisos.push('Temperatura deve estar entre 30°C e 45°C'); }
    if (v.gestante && v.naoSabeGestacao) avisos.push('Não é possível estar grávida e não saber ao mesmo tempo');
    if (v.testeGravidezPositivo && !v.gestante) avisos.push('Teste de gravidez positivo deve corresponder à gestação selecionada');
    if (v.usaContraceptivo && !v.tipoContraceptivo) avisos.push('Se usa contraceptivo, deve especificar qual método');
    if (v.vinculoCaps && !v.nomeCapsMunicipio) avisos.push('Se possui vínculo com CAPS, deve informar o nome/município');
    if (v.usaMedicamentoContinuo && !v.medicamentoContinuoDescricao) avisos.push('Se usa medicamento contínuo, deve especificar quais');
    if (v.usaMedicamentoControlado && !v.medicamentoControladoDescricao) avisos.push('Se usa medicamento controlado, deve especificar quais');
    if (v.possuiFilhos && !v.numeroFilhos) avisos.push('Se possui filhos, deve informar quantos');
    if (v.possuiDependentes && !v.numeroDependentes) avisos.push('Se possui dependentes, deve informar quantos');
    return { erros, avisos };
  }
  const lista = a => a.map(x => '• ' + x).join('\n');

  F.salvar = async function () {
    const v = valores();
    Object.keys(v).forEach(k => { if (typeof v[k] === 'string') v[k] = v[k].trim(); });
    const { erros, avisos } = validar(v);
    if (erros.length) { await App.UI.alert(lista(erros), 'Corrija antes de salvar'); return false; }
    if (avisos.length) {
      const ok = await App.UI.confirm('Problemas nos dados:\n' + lista(avisos), 'Avisos de validação', { ok: 'Salvar mesmo assim', cancel: 'Voltar e corrigir' });
      if (!ok) return false;
    }
    const rec = Object.assign({}, estado.orig || {}, v);
    rec.idade = parseInt(v.idade, 10) || 0;
    rec.id = estado.id == null ? undefined : estado.id;
    if (!rec.criadoPor && App.sessao) rec.criadoPor = App.sessao.nome;
    if (App.sessao) rec.atualizadoPor = App.sessao.nome;
    try {
      const novoId = await DB.salvarRegistro(rec);
      estado.id = novoId; estado.sujo = false;
      return true;
    } catch (err) { await App.UI.alert(err.message || String(err), 'Não foi possível salvar'); return false; }
  };
})();
