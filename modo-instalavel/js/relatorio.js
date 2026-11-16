'use strict';
window.App = window.App || {};
(function () {
  const U = App.U;
  const CSS =
    '@page{size:A4;margin:12mm}*{box-sizing:border-box}' +
    "body{font-family:'Times New Roman',Times,serif;font-size:11.5px;color:#000;margin:0;background:#eee}" +
    '.page{width:210mm;min-height:297mm;margin:10px auto;padding:10mm 12mm;background:#fff;page-break-after:always}' +
    '.page:last-child{page-break-after:auto}' +
    '.head{text-align:center;margin-bottom:10px;line-height:1.2}' +
    '.head img{height:26mm;width:auto}' +
    '.head .gov{font-size:9px;letter-spacing:3px;color:#444}' +
    '.head .rs{font-size:14px;font-weight:bold;border-bottom:1px solid #444;display:inline-block;padding:0 4px 2px}' +
    '.head .sec2{font-size:8px;letter-spacing:1px;color:#444}' +
    '.anexo{text-align:center;font-weight:bold;font-size:13px;margin:8px 0 4px}' +
    '.form{border:1px solid #555;border-bottom:0}' +
    '.bar{background:#bfbfbf;text-align:center;font-weight:bold;padding:2px;border-bottom:1px solid #555;border-top:1px solid #555;letter-spacing:.5px}' +
    '.row{border-bottom:1px solid #999;padding:3px 5px;min-height:19px}' +
    '.flex{display:flex;border-bottom:1px solid #999}' +
    '.flex>.cell{padding:3px 5px;flex:1;border-right:1px solid #999}.flex>.cell:last-child{border-right:0}' +
    '.cell .it{display:block;margin:1px 0}' +
    '.v{font-family:Arial,Helvetica,sans-serif;font-size:10.5px;border-bottom:1px solid #666;padding:0 3px;display:inline-block;min-width:60px}' +
    '.vb{font-family:Arial,Helvetica,sans-serif;font-size:10.5px;display:block;border-bottom:1px solid #666;min-height:15px;margin-top:2px;padding:0 3px}' +
    '.x{font-family:Arial,Helvetica,sans-serif;font-weight:bold}' +
    '.sign{margin-top:40px;display:flex;justify-content:space-around;text-align:center;font-size:11px}' +
    '.sign div{border-top:1px solid #000;width:42%;padding-top:3px}' +
    '@media print{body{background:#fff}.page{margin:0;padding:0;width:auto;min-height:0}}';

  const e = U.esc, n = U.norm;
  const v = o => { const s = o == null ? '' : String(o); return '<span class="v">' + (s === '' ? '&nbsp;' : e(s)) + '</span>'; };
  const box = m => m ? '(<span class="x">&nbsp;X&nbsp;</span>)' : '(&nbsp;&nbsp;&nbsp;&nbsp;)';
  const it = (m, t) => '<span class="it">' + box(m) + ' ' + t + '</span>';
  const sn = (rot, sim) => '<span class="it"><b>' + rot + '</b> ' + box(!sim) + ' Não ' + box(sim) + ' Sim</span>';
  const vac = (nome, tem, ns) => nome + ' ' + box(tem) + ' Sim ' + box(ns) + ' não sabe &nbsp; ';
  const row = h => '<div class="row">' + h + '</div>';
  const bar = t => '<div class="bar">' + t + '</div>';
  const vb = t => '<span class="vb">' + e(t) + '</span>';

  function cabecalho() {
    const img = window.IMG && IMG.saude;
    return img
      ? '<div class="head"><img src="' + img + '" alt="Governo do Estado do Rio Grande do Sul - Secretaria da Saúde"></div>'
      : '<div class="head"><div class="gov">GOVERNO DO ESTADO</div><div class="rs">RIO GRANDE DO SUL</div><div class="sec2">SECRETARIA DA SAÚDE</div></div>';
  }

  function pagina(r) {
    const sexo = n(r.sexoBio), fem = sexo.startsWith('fem'), masc = sexo.startsWith('masc');
    let h = '';

    // ---------- PÁGINA 1: identificação ----------
    h += '<div class="page">' + cabecalho() + '<div class="anexo">ANEXO A</div><div class="form">';
    h += row('<b>Responsável pelo atendimento:</b> ' + v(r.responsavel));
    h += row('<b>Data:</b> ' + v(r.data) + ' &nbsp;&nbsp; <b>Horário:</b> ' + v(r.horario) + ' &nbsp;&nbsp; <b>Data de entrada na Unidade:</b> ' + v(r.dataEntrada));
    h += row('<b>Transferência de outra Unidade Prisional:</b> ' + box(!r.transferencia) + ' Não ' + box(r.transferencia) + ' Sim');
    h += row('<b>Se sim, qual a procedência:</b> ' + v(r.transferenciaMotivo));

    h += bar('IDENTIFICAÇÃO');
    h += row('<b>Nome Completo:</b> ' + v(r.nome));
    h += row('<b>Nome Social:</b> ' + v(r.nomeSocial));
    h += row('<b>Data de Nascimento:</b> ' + v(r.dataNasc) + ' &nbsp;&nbsp;&nbsp; <b>Idade:</b> ' + v(r.idade > 0 ? r.idade + ' anos' : ''));
    h += row('<b>CPF:</b> ' + v(r.cpf) + ' &nbsp;&nbsp; <b>RG:</b> ' + v(r.rg) + ' &nbsp;&nbsp; <b>CNS:</b> ' + v(r.cns));
    h += row('<b>Município de Nascimento:</b> ' + v(r.municipioNascimento) + ' &nbsp;&nbsp; <b>UF:</b> ' + v(r.ufNascimento));

    const nac = n(r.nacionalidade), bra = nac.startsWith('brasil'), nat = nac.startsWith('natural');
    const est = nac !== '' && !bra && !nat;
    const pais = n(r.paisOrigem) !== '' ? r.paisOrigem : (nac === 'estrangeiro' ? '' : (est ? r.nacionalidade : ''));
    h += row('<b>Nacionalidade:</b><br>' + box(bra) + ' Brasileira ' + box(nat) + ' Naturalizado ' + box(est) + ' Estrangeiro. <b>Qual país?</b> ' + v(est ? pais : ''));
    h += row('<b>Nome da mãe:</b> ' + v(r.nomeMae));
    h += row('<b>Nome do pai:</b> ' + v(r.nomePai) + ' &nbsp; ' + box(r.paiDesconhecido) + ' Desconhecido');

    const ec = n(r.estadoCivil), ecOutro = ec.startsWith('divor') || ec.startsWith('viuv');
    h += row('<b>Estado Civil:</b> ' + box(ec.startsWith('solt')) + ' Solteiro ' + box(ec.startsWith('casa')) + ' Casado ' + box(ec.startsWith('uniao')) +
      ' União Estável ' + box(ecOutro) + ' Outro: ' + v(ecOutro ? r.estadoCivil : ''));
    h += row('<b>Endereço (Rua, Nº, Bairro e Cidade):</b> ' + v(r.endereco));
    h += row(box(n(r.zona).startsWith('rural')) + ' Zona Rural &nbsp;&nbsp; ' + box(n(r.zona).startsWith('urban')) + ' Zona Urbana');
    h += row('<b>Situação de rua:</b> ' + box(!r.situacaoRua) + ' Não ' + box(r.situacaoRua) + ' Sim. <b>Qual município?</b> ' + v(r.municipioSituacaoRua));

    const raca = n(r.raca);
    h += row('<b>Raça/cor (AUTODECLARADA):</b><br>' + box(raca.startsWith('branc')) + ' Branco ' + box(raca.startsWith('preta') || raca.startsWith('preto')) + ' Preto ' +
      box(raca.startsWith('pard')) + ' Pardo ' + box(raca.startsWith('amarel')) + ' Amarelo ' + box(raca.startsWith('indig')) + ' Indígena. <b>Qual etnia?</b> ' + v(r.etnia));

    const ge = n(r.genero), or = n(r.orientSex);
    h += '<div class="flex">';
    h += '<div class="cell"><b>Sexo Biológico (AUTODECLARADO)</b>' + it(fem, 'Feminino') + it(masc, 'Masculino') + it(sexo.startsWith('inter'), 'Intersexo') + it(sexo.startsWith('nao desejo'), 'Não desejo informar') + '</div>';
    h += '<div class="cell"><b>Identidade de Gênero (AUTODECLARADA)</b>' +
      it(ge.startsWith('homem cis') || ge === 'homem', 'Homem') + it(ge.startsWith('mulher cis') || ge === 'mulher', 'Mulher') +
      it(ge.startsWith('homem trans'), 'Homem trans') + it(ge.startsWith('mulher trans') || ge.startsWith('travesti'), 'Mulher trans / Travesti') +
      it(ge.startsWith('nao bin'), 'Não binário') + it(ge.startsWith('nao desejo'), 'Não desejo informar') + '</div>';
    h += '<div class="cell"><b>Orientação sexual (AUTODECLARADA)</b>' +
      it(or.startsWith('hetero'), 'Heterossexual') + it(or.startsWith('homo'), 'Homossexual (gay/lésbica)') + it(or.startsWith('bi'), 'Bissexual') +
      it(or.startsWith('outr'), 'Outra. Qual?' + (or.startsWith('outr') && n(r.orientacaoOutra) !== '' ? ' ' + v(r.orientacaoOutra) : '')) +
      it(or.startsWith('nao desejo'), 'Não desejo informar') + '</div></div>';

    h += bar('CONTATOS');
    [1, 2].forEach(i => {
      const p = 'contato' + i, par = n(r[p + 'Parentesco']);
      h += row('<b>CONTATO ' + i + ' - Nome:</b> ' + v(r[p + 'Nome']));
      h += row('<b>Essa pessoa é seu/sua:</b> ' + box(par === 'pai') + ' Pai ' + box(par === 'mae') + ' Mãe ' + box(par.startsWith('irmao')) + ' Irmão/Irmã ' +
        box(par.startsWith('conjuge')) + ' Cônjuge ' + box(par === 'outro') + ' Outro: ' + v(par === 'outro' ? r[p + 'ParentescoOutro'] : ''));
      h += row('<b>Telefone com DDD:</b> ' + v(r[p + 'Telefone']));
      h += row('<b>Endereço (Rua, Nº, Bairro e Cidade):</b> ' + v(r[p + 'Endereco']));
    });
    h += '</div></div>';

    // ---------- PÁGINA 2: social e saúde ----------
    h += '<div class="page">' + cabecalho() + '<div class="form">' + bar('DADOS SOCIAIS E ECONÔMICOS');
    const esc = n(r.escolaridade);
    h += '<div class="flex"><div class="cell"><b>Escolaridade:</b>' + it(esc.startsWith('analf'), 'Analfabeto') +
      it(esc === 'fundamental incompleto', 'Fundamental incompleto') + it(esc === 'fundamental completo', 'Fundamental completo') +
      it(esc === 'medio incompleto', 'Médio incompleto') + it(esc === 'medio completo', 'Médio completo') +
      it(esc === 'superior incompleto', 'Superior incompleto') + it(esc === 'superior completo', 'Superior completo') + it(esc.startsWith('pos'), 'Pós-graduação') + '</div>';
    h += '<div class="cell"><b>Profissão/ ocupação/ fonte de renda:</b>' + vb(r.profissao) + '</div>';
    h += '<div class="cell"><b>A família recebe algum benefício atualmente?</b>' + it(!r.beneficio, 'Não') + it(r.beneficio, 'Sim. Qual?') + vb(r.beneficioDescricao) + '</div></div>';

    h += row('<b>Possui filhos?</b> ' + box(!r.possuiFilhos) + ' Não ' + box(r.possuiFilhos) + ' Sim. <b>Quantos:</b> ' + v(r.numeroFilhos));
    h += row('<b>Idade:</b> ' + v(r.filhosDescricao));
    h += row('<b>Possui outros dependentes?</b> ' + box(!r.possuiDependentes) + ' Não ' + box(r.possuiDependentes) + ' Sim. <b>Quantos?</b> ' + v(r.numeroDependentes));
    h += row('<b>Encaminhamentos:</b><br>&bull; Ofertar encaminhamento para conhecer ou estudar no NEEJA: ' + box(!r.encaminharNeeja) + ' Não ' + box(r.encaminharNeeja) +
      ' Sim<br>&bull; Ofertar conversa com a Assistência Social: ' + box(!r.encaminharAssistencia) + ' Não ' + box(r.encaminharAssistencia) + ' Sim');

    h += bar('CONDIÇÕES DE SAÚDE');
    const tri = (tit, sim, ns, desc) => '<div class="cell"><b>' + tit + '</b><br>' + box(!sim && !ns) + ' Não ' + box(sim) + ' Sim<br><b>Qual(is):</b>' + vb(desc) + box(ns) + ' não sabe responder</div>';
    h += '<div class="flex">' + tri('Possui alguma deficiência:', r.possuiDeficiencia, r.naoSabeDeficiencia, r.deficienciaDescricao) +
      tri('Possui alergias ou intolerância alimentar:', r.possuiAlergia, r.naoSabeAlergia, r.alergiaDescricao) +
      tri('Realizou cirurgias:', r.realizouCirurgia, r.naoSabeCirurgia, r.cirurgiaDescricao) + '</div>';

    h += '<div class="flex"><div class="cell"><b>Condições crônicas:</b>' + sn('Hipertensão', r.hipertensao) + sn('Diabetes', r.diabetes) +
      sn('Doença autoimune', r.autoimune) + sn('Outra condição crônica', r.outraCondicaoCronica) + it(r.naoSabeCondicoesCronicas, 'não sabe responder') + vb(r.condicoesCronicasObs) + '</div>';
    h += '<div class="cell"><b>Histórico doenças infecciosas:</b>' + sn('Sífilis', r.sifilis) + sn('HPV', r.hpv) + sn('HIV', r.hiv) + sn('Tuberculose', r.tuberculose) +
      sn('Hepatite B', r.hepatiteB) + sn('Hepatite C', r.hepatiteC) + sn('Outra doença infecciosa', r.outraDoencaInfecciosa) +
      it(r.naoSabeDoencasInfecciosas, 'não sabe responder') + vb(r.doencasInfecciosasObs) + '</div>';
    h += '<div class="cell"><b>Possui doença de pele:</b><br>' + box(!r.possuiDoencaPele && !r.naoSabeDoencaPele) + ' Não<br>' + box(r.possuiDoencaPele) + ' Sim<br><b>Qual(is):</b>' +
      vb(r.doencaPeleDescricao) + box(r.naoSabeDoencaPele) + ' não sabe responder' + vb(r.doencaPeleObs) + '</div></div>';

    h += row('<b>Resultados no teste rápido porta de entrada:</b> HIV ' + box(!r.hiv) + ' Não ' + box(r.hiv) + ' Sim &nbsp;&nbsp; Tuberculose ' + box(!r.tuberculose) + ' Não ' + box(r.tuberculose) + ' Sim');
    h += row('<b>Usa medicamento contínuo?</b> ' + box(!r.usaMedicamentoContinuo) + ' Não ' + box(r.usaMedicamentoContinuo) + ' Sim. <b>Qual(is)?</b> ' + v(r.medicamentoContinuoDescricao) +
      ' &nbsp;&nbsp; <b>Tipo sanguíneo:</b> ' + v(r.tipoSanguineo));
    h += row('<b>Encaminhamentos:</b> ' + v(r.encaminhos));

    if (fem || !masc) {
      h += bar('SAÚDE DA MULHER (FEMININO)');
      h += row('<b>Gestante?</b> ' + box(!r.gestante && !r.naoSabeGestacao) + ' Não ' + box(r.gestante) + ' Sim. <b>Semanas:</b> ' + v(r.semanaGestacao) + ' ' + box(r.naoSabeGestacao) + ' não sabe responder');
      h += row('<b>Teste de gravidez (&beta;-HCG):</b> ' + box(r.testeGravidezPositivo) + ' Positivo ' + box(r.testeGravidezNegativo) + ' Negativo ' + box(r.testeGravidezNaoRealizado) + ' Não realizado');
      h += row('<b>Usa anticoncepcional?</b> ' + box(!r.usaContraceptivo) + ' Não ' + box(r.usaContraceptivo) + ' Sim. <b>Qual?</b> ' + v(r.tipoContraceptivo));
      h += row('<b>Realizou Papanicolau?</b> ' + box(r.realizouPapanicolau) + ' Sim. <b>Ano:</b> ' + v(r.anoPapanicolau));
      h += row('<b>Encaminhamentos:</b> ' + box(r.oferecerContraceptivo) + ' Oferecer anticoncepcional ' + box(r.oferecerExamePreventivo) + ' Oferecer exame preventivo ' + box(r.encaminharPreNatal) + ' Encaminhar pré-natal');
    }
    if (masc || !fem) {
      h += bar('SAÚDE DO HOMEM (MASCULINO)');
      h += row('<b>Realizou exame de próstata?</b> ' + box(r.realizouExameProstata) + ' Sim. <b>Ano:</b> ' + v(r.anoExameProstata));
      h += row('<b>Histórico familiar de próstata?</b> ' + box(r.historicoFamiliaProstata) + ' Sim. <b>Familiar:</b> ' + v(r.familiarComProstata));
      h += row('<b>Realizou vasectomia?</b> ' + box(r.realizouVasectomia) + ' Sim &nbsp;&nbsp; <b>Parceira gestante?</b> ' + box(r.parceiraGestante) + ' Sim &nbsp;&nbsp; <b>Participa do pré-natal?</b> ' + box(r.participaPreNatal) + ' Sim');
      h += row('<b>Encaminhamentos:</b> ' + box(r.oferecerVasectomia) + ' Oferecer vasectomia ' + box(r.encaminharPreNatalParceiro) + ' Encaminhar pré-natal do parceiro');
    }
    h += '</div></div>';

    // ---------- PÁGINA 3: saúde mental, substâncias, vacinas, exame clínico ----------
    h += '<div class="page">' + cabecalho() + '<div class="form">' + bar('SAÚDE MENTAL');
    h += row('<b>Vínculo com CAPS?</b> ' + box(!r.vinculoCaps) + ' Não ' + box(r.vinculoCaps) + ' Sim. <b>Qual CAPS/Município?</b> ' + v(r.nomeCapsMunicipio));
    h += row('<b>Transtornos:</b> ' + box(r.ansiedade) + ' Ansiedade ' + box(r.depressao) + ' Depressão ' + box(r.bipolaridade) + ' Bipolaridade ' + box(r.esquizofrenia) + ' Esquizofrenia ' +
      box(r.autismo) + ' Autismo ' + box(r.naoSabeTranstornoMental) + ' não sabe responder<br><b>Outro:</b> ' + v(r.outroTranstornoMental));
    h += row('<b>Usa medicamento controlado?</b> ' + box(!r.usaMedicamentoControlado && !r.naoSabeMedicamentoControlado) + ' Não ' + box(r.usaMedicamentoControlado) + ' Sim ' +
      box(r.naoSabeMedicamentoControlado) + ' não sabe responder. <b>Qual(is)?</b> ' + v(r.medicamentoControladoDescricao));
    h += row('<b>Acompanhamento em saúde mental?</b> ' + box(!r.acompanhamentoSaudeMental) + ' Não ' + box(r.acompanhamentoSaudeMental) + ' Sim. <b>Motivo:</b> ' + v(r.motivoAcompanhamentoSaudeMental));

    h += bar('USO DE SUBSTÂNCIAS');
    h += row(box(r.usaAlcool) + ' Álcool ' + box(r.usaCigarro) + ' Cigarro ' + box(r.usaMaconha) + ' Maconha ' + box(r.usaCrack) + ' Crack ' + box(r.usaCocaina) + ' Cocaína ' +
      box(r.usaAnfetaminas) + ' Anfetaminas ' + box(r.usaDrogasK) + ' Droga K<br><b>Outras substâncias:</b> ' + v(r.outrasSubstancias));
    h += row('<b>Interesse em tratamento?</b> ' + box(!r.interesseTratamento) + ' Não ' + box(r.interesseTratamento) + ' Sim. <b>Para qual substância?</b> ' + v(r.substanciaParaTratamento));
    h += row('<b>Encaminhamentos:</b> ' + box(r.oferecerPsicologo) + ' Psicólogo ' + box(r.oferecerPsiquiatra) + ' Psiquiatra ' + box(r.encaminharRenovacaoReceitas) + ' Renovação de receitas ' + box(r.oferecerGruposApoio) + ' Grupos de apoio');

    h += bar('VACINAÇÃO');
    h += row('<b>Possui vacina:</b> ' + vac('COVID', r.vacinaCovid, r.naoSabeVacinaCovid) + vac('Influenza', r.vacinaInfluenza, r.naoSabeVacinaInfluenza) +
      vac('Tétano', r.vacinaTetano, r.naoSabeVacinaTetano) + vac('Hepatite B', r.vacinaHepatiteB, r.naoSabeVacinaHepatiteB));
    h += row('<b>Ofertar:</b> ' + box(r.oferecerVacinaCovid) + ' COVID ' + box(r.oferecerVacinaInfluenza) + ' Influenza ' + box(r.oferecerVacinaFebreAmarela) + ' Febre Amarela ' +
      box(r.oferecerVacinaDuplaAdulto) + ' Dupla Adulto ' + box(r.oferecerVacinaTripliceViral) + ' Tríplice Viral<br><b>Outras vacinas:</b> ' + v(r.outrasVacinas) +
      ' &nbsp; ' + box(r.oferecerCarteirinha) + ' Oferecer carteirinha de vacinação');

    h += bar('EXAME CLÍNICO');
    h += row('<b>Peso:</b> ' + v(r.peso) + ' <b>Altura:</b> ' + v(r.altura) + ' <b>IMC:</b> ' + v(r.imc));
    h += row('<b>Pressão arterial:</b> ' + v(r.pressaoArterial) + ' <b>FC:</b> ' + v(r.frequenciaCardiaca) + ' <b>SpO&sup2;:</b> ' + v(r.saturacaoOxigenio) + ' <b>Temperatura:</b> ' + v(r.temperatura));
    h += row('<b>Sintomas:</b> ' + box(r.tosse) + ' Tosse ' + box(r.coriza) + ' Coriza ' + box(r.espirros) + ' Espirros ' + box(r.febre) + ' Febre ' + box(r.calafrios) +
      ' Calafrios &nbsp; <b>Outros:</b> ' + v(r.outrosSintomas) + ' &nbsp; <b>Início:</b> ' + v(r.dataInicioSintomas));
    h += row('<b>Lesões/ferimentos?</b> ' + box(!r.lesoesFerimentos) + ' Não ' + box(r.lesoesFerimentos) + ' Sim. <b>Local:</b> ' + v(r.localLesoes));
    h += row('<b>Condição geral:</b> ' + v(r.condicaoGeral));
    h += row('<b>Coleta de escarro:</b> ' + box(r.coletaEscarro) + ' Sim');
    h += row('<b>Outras queixas?</b> ' + box(r.outrasQueixas) + ' Sim. ' + v(r.outrasQueixasDescricao));
    h += row('<b>Queixa odontológica?</b> ' + box(r.queixaOdontologica) + ' Sim. ' + v(r.queixaOdontologicaDescricao) + ' &nbsp; <b>Necessita dentista?</b> ' + box(r.necessitaDentista) + ' Sim');
    h += row('<b>Encaminhamento final:</b> ' + v(r.encaminhamentoFinal));
    h += '</div><div class="sign"><div>Responsável pelo atendimento</div><div>Assinatura da pessoa atendida</div></div></div>';
    return h;
  }

  App.Relatorio = {
    gerar(registros) {
      return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Anexo A - Relatório</title><style>' + CSS + '</style></head><body>' +
        registros.map(pagina).join('') + '</body></html>';
    }
  };
})();
