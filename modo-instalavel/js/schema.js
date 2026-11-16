'use strict';
window.App = window.App || {};
(function () {
  const ANO = new Date().getFullYear();
  const ANOS = [''];
  for (let i = 0; i < 25; i++) ANOS.push(String(ANO - i));
  ANOS.push('Nunca fez');
  const SEMANAS = ['']; for (let i = 1; i <= 40; i++) SEMANAS.push(String(i)); SEMANAS.push('Não sabe');
  const UFS = ['', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  const PARENTESCO = ['', 'Pai', 'Mãe', 'Irmão/Irmã', 'Cônjuge', 'Outro'];

  // campo: [chave, tipo, rótulo, opções]
  // tipos: t texto | d data | h hora | n só dígitos | cpf | tel | dec decimal | s lista | c caixa de marcação
  // opções: o (lista), en (função: campo habilitado?), req (obrigatório), ml (tamanho máximo)
  const sec = (id, titulo, grupos) => ({ id, titulo, grupos });
  const g = (t, campos) => ({ t, campos });

  App.schema = [
    sec('atend', 'Atendimento', [
      g('Informações do Atendimento', [
        ['responsavel', 't', 'Responsável pelo atendimento', { req: 1 }],
        ['data', 'd', 'Data do atendimento'],
        ['horario', 'h', 'Horário (HH:MM)'],
        ['dataEntrada', 'd', 'Data de entrada na Unidade']]),
      g('Informações de Transferência', [
        ['transferencia', 'c', 'Transferência de outra Unidade Prisional'],
        ['transferenciaMotivo', 't', 'Procedência (se sim)', { en: r => r.transferencia }]])]),

    sec('ident', 'Identificação', [
      g('Informações Pessoais', [
        ['nome', 't', 'Nome completo', { req: 1 }],
        ['nomeSocial', 't', 'Nome social'],
        ['cpf', 'cpf', 'CPF', { req: 1 }],
        ['rg', 't', 'RG'],
        ['cns', 'n', 'CNS (Cartão do SUS)', { ml: 15 }],
        ['nomeMae', 't', 'Nome da mãe', { req: 1 }],
        ['nomePai', 't', 'Nome do pai', { en: r => !r.paiDesconhecido }],
        ['paiDesconhecido', 'c', 'Pai desconhecido'],
        ['nacionalidade', 's', 'Nacionalidade', { o: ['', 'Brasileira', 'Naturalizado', 'Estrangeiro'] }],
        ['paisOrigem', 't', 'Se estrangeiro, qual país?', { en: r => r.nacionalidade === 'Estrangeiro' }]]),
      g('Dados de Nascimento', [
        ['dataNasc', 'd', 'Data de nascimento'],
        ['idade', 'n', 'Idade (anos)', { req: 1, ml: 3 }],
        ['municipioNascimento', 't', 'Município de nascimento'],
        ['ufNascimento', 's', 'UF', { o: UFS }]]),
      g('Endereço', [
        ['endereco', 't', 'Endereço (Rua, Nº, Bairro e Cidade)'],
        ['zona', 's', 'Zona', { o: ['', 'Rural', 'Urbana'] }],
        ['situacaoRua', 'c', 'Situação de rua'],
        ['municipioSituacaoRua', 't', 'Se sim, qual município?', { en: r => r.situacaoRua }]]),
      g('Identidade', [
        ['estadoCivil', 's', 'Estado civil', { o: ['', 'Solteiro(a)', 'Casado(a)', 'União Estável', 'Divorciado(a)', 'Viúvo(a)'] }],
        ['raca', 's', 'Raça/cor (autodeclarada)', { o: ['', 'Branca', 'Preta', 'Parda', 'Amarela', 'Indígena'] }],
        ['etnia', 't', 'Se indígena, qual etnia?', { en: r => r.raca === 'Indígena' }],
        ['sexoBio', 's', 'Sexo biológico (autodeclarado)', { o: ['', 'Masculino', 'Feminino', 'Intersexo', 'Não desejo informar'] }],
        ['genero', 's', 'Identidade de gênero (autodeclarada)', { o: ['', 'Homem Cis', 'Mulher Cis', 'Homem Trans', 'Mulher Trans', 'Não binário', 'Não desejo informar'] }],
        ['orientSex', 's', 'Orientação sexual (autodeclarada)', { o: ['', 'Heterossexual', 'Homossexual', 'Bissexual', 'Outro', 'Não desejo informar'] }],
        ['orientacaoOutra', 't', 'Se outra, qual?', { en: r => r.orientSex === 'Outro' }]])]),

    sec('contatos', 'Contatos', [1, 2].map(i => g('Contato ' + i, [
      ['contato' + i + 'Nome', 't', 'Nome'],
      ['contato' + i + 'Parentesco', 's', 'Essa pessoa é seu/sua', { o: PARENTESCO }],
      ['contato' + i + 'ParentescoOutro', 't', 'Se outro, qual?', { en: r => r['contato' + i + 'Parentesco'] === 'Outro' }],
      ['contato' + i + 'Telefone', 'tel', 'Telefone com DDD'],
      ['contato' + i + 'Endereco', 't', 'Endereço (Rua, Nº, Bairro e Cidade)']]))),

    sec('socio', 'Dados Socioeconômicos', [
      g('Escolaridade e Ocupação', [
        ['escolaridade', 's', 'Escolaridade', { o: ['', 'Analfabeto', 'Fundamental Incompleto', 'Fundamental Completo', 'Médio Incompleto', 'Médio Completo', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação'] }],
        ['profissao', 't', 'Profissão / ocupação / fonte de renda']]),
      g('Benefícios Familiares', [
        ['beneficio', 'c', 'A família recebe algum benefício atualmente?'],
        ['beneficioDescricao', 't', 'Se sim, quais benefícios?', { en: r => r.beneficio }]]),
      g('Filhos', [
        ['possuiFilhos', 'c', 'Possui filhos?'],
        ['numeroFilhos', 's', 'Quantos filhos', { o: ['', '1', '2', '3', '4', '5', '6+'], en: r => r.possuiFilhos }],
        ['filhosDescricao', 't', 'Idade(s)', { en: r => r.possuiFilhos }]]),
      g('Outros Dependentes', [
        ['possuiDependentes', 'c', 'Possui outros dependentes?'],
        ['numeroDependentes', 's', 'Quantos', { o: ['', '1', '2', '3', '4', '5+'], en: r => r.possuiDependentes }]]),
      g('Serviços a Ofertar', [
        ['encaminharNeeja', 'c', 'Oferecer encaminhamento para conhecer ou estudar no NEEJA?'],
        ['encaminharAssistencia', 'c', 'Oferecer conversa com a Assistência Social?']])]),

    sec('saude', 'Condições de Saúde', [
      g('Deficiência', [
        ['possuiDeficiencia', 'c', 'Possui alguma deficiência?'],
        ['naoSabeDeficiencia', 'c', 'Não sabe responder'],
        ['deficienciaDescricao', 't', 'Qual(is)?', { en: r => r.possuiDeficiencia }]]),
      g('Alergias / Intolerância', [
        ['possuiAlergia', 'c', 'Possui alergias ou intolerância alimentar?'],
        ['naoSabeAlergia', 'c', 'Não sabe responder'],
        ['alergiaDescricao', 't', 'Qual(is)?', { en: r => r.possuiAlergia }]]),
      g('Cirurgias', [
        ['realizouCirurgia', 'c', 'Realizou cirurgias?'],
        ['naoSabeCirurgia', 'c', 'Não sabe responder'],
        ['cirurgiaDescricao', 't', 'Qual(is)?', { en: r => r.realizouCirurgia }]]),
      g('Condições Crônicas', [
        ['hipertensao', 'c', 'Hipertensão'], ['diabetes', 'c', 'Diabetes'], ['hiv', 'c', 'HIV'],
        ['autoimune', 'c', 'Autoimune'], ['outraCondicaoCronica', 'c', 'Outra'],
        ['naoSabeCondicoesCronicas', 'c', 'Não sabe responder'],
        ['condicoesCronicasObs', 't', 'Observação']]),
      g('Histórico de Doenças Infecciosas', [
        ['sifilis', 'c', 'Sífilis'], ['hpv', 'c', 'HPV'], ['tuberculose', 'c', 'Tuberculose'],
        ['hepatiteB', 'c', 'Hepatite B'], ['hepatiteC', 'c', 'Hepatite C'], ['outraDoencaInfecciosa', 'c', 'Outra'],
        ['naoSabeDoencasInfecciosas', 'c', 'Não sabe responder'],
        ['doencasInfecciosasObs', 't', 'Observação']]),
      g('Doenças de Pele', [
        ['possuiDoencaPele', 'c', 'Possui doenças de pele?'],
        ['naoSabeDoencaPele', 'c', 'Não sabe responder'],
        ['doencaPeleDescricao', 't', 'Qual(is)?', { en: r => r.possuiDoencaPele }],
        ['doencaPeleObs', 't', 'Observação']]),
      g('Medicamentos Contínuos', [
        ['usaMedicamentoContinuo', 'c', 'Usa medicamento contínuo?'],
        ['medicamentoContinuoDescricao', 't', 'Qual(is)?', { en: r => r.usaMedicamentoContinuo }]]),
      g('Outros Dados', [
        ['tipoSanguineo', 's', 'Tipo sanguíneo', { o: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Não sabe'] }],
        ['encaminhos', 't', 'Encaminhamentos']])]),

    sec('mulher', 'Saúde da Mulher', [
      g('Gestação', [
        ['gestante', 'c', 'Gestação no momento'],
        ['naoSabeGestacao', 'c', 'Não sabe'],
        ['semanaGestacao', 's', 'Quantas semanas', { o: SEMANAS, en: r => r.gestante }]]),
      g('Método Contraceptivo', [
        ['usaContraceptivo', 'c', 'Faz uso de método contraceptivo?'],
        ['tipoContraceptivo', 's', 'Qual método?', { o: ['', 'Pílula', 'Anticoncepcional Injetável', 'DIU', 'Implante', 'Preservativo', 'Outro'], en: r => r.usaContraceptivo }]]),
      g('Exame Preventivo (Papanicolau)', [
        ['realizouPapanicolau', 'c', 'Já realizou exame preventivo / Papanicolau?'],
        ['anoPapanicolau', 's', 'Qual o ano?', { o: ANOS, en: r => r.realizouPapanicolau }]]),
      g('Serviços a Ofertar', [
        ['oferecerContraceptivo', 'c', 'Ofertar continuidade ou início da utilização de método contraceptivo'],
        ['oferecerExamePreventivo', 'c', 'Ofertar consulta para realizar exame preventivo'],
        ['encaminharPreNatal', 'c', 'Encaminhar para o pré-natal']])]),

    sec('homem', 'Saúde do Homem', [
      g('Exame Preventivo de Próstata', [
        ['realizouExameProstata', 'c', 'Já realizou o exame preventivo para o câncer de próstata?'],
        ['anoExameProstata', 's', 'Qual o ano?', { o: ANOS, en: r => r.realizouExameProstata }]]),
      g('Histórico Familiar', [
        ['historicoFamiliaProstata', 'c', 'Possui histórico de câncer de próstata na família?'],
        ['familiarComProstata', 's', 'Qual familiar?', { o: ['', 'Pai', 'Irmão', 'Tio', 'Avô', 'Primo de primeiro grau', 'Outro familiar'], en: r => r.historicoFamiliaProstata }]]),
      g('Saúde Reprodutiva', [
        ['realizouVasectomia', 'c', 'Você realizou vasectomia?'],
        ['parceiraGestante', 'c', 'Sua parceira está gestante?'],
        ['participaPreNatal', 'c', 'Está participando do pré-natal?']]),
      g('Serviços a Ofertar', [
        ['oferecerVasectomia', 'c', 'Ofertar encaminhamento para realizar vasectomia'],
        ['encaminharPreNatalParceiro', 'c', 'Encaminhar para realizar pré-natal do parceiro']])]),

    sec('mental', 'Saúde Mental', [
      g('Vinculação com CAPS', [
        ['vinculoCaps', 'c', 'Possui vínculo com CAPS?'],
        ['nomeCapsMunicipio', 't', 'Qual nome e município desse CAPS?', { en: r => r.vinculoCaps }]]),
      g('Transtornos Mentais', [
        ['ansiedade', 'c', 'Ansiedade'], ['depressao', 'c', 'Depressão'], ['bipolaridade', 'c', 'Bipolaridade'],
        ['esquizofrenia', 'c', 'Esquizofrenia'], ['autismo', 'c', 'Autismo'],
        ['naoSabeTranstornoMental', 'c', 'Não sabe responder'],
        ['outroTranstornoMental', 't', 'Outro(a)']]),
      g('Medicamentos Controlados', [
        ['usaMedicamentoControlado', 'c', 'Usa medicamento controlado?'],
        ['naoSabeMedicamentoControlado', 'c', 'Não sabe responder'],
        ['medicamentoControladoDescricao', 't', 'Qual(is)?', { en: r => r.usaMedicamentoControlado }]]),
      g('Acompanhamento em Saúde Mental', [
        ['acompanhamentoSaudeMental', 'c', 'Estava em acompanhamento em saúde mental no momento da prisão?'],
        ['motivoAcompanhamentoSaudeMental', 't', 'Qual motivo?', { en: r => r.acompanhamentoSaudeMental }]]),
      g('Uso de Substâncias', [
        ['usaAlcool', 'c', 'Álcool'], ['usaCigarro', 'c', 'Cigarro'], ['usaMaconha', 'c', 'Maconha'], ['usaCrack', 'c', 'Crack'],
        ['usaCocaina', 'c', 'Cocaína'], ['usaAnfetaminas', 'c', 'Anfetaminas'], ['usaDrogasK', 'c', 'Drogas K'],
        ['outrasSubstancias', 't', 'Outra(s)']]),
      g('Interesse em Tratamento', [
        ['interesseTratamento', 'c', 'Gostaria de realizar algum tratamento para cessar ou reduzir o uso?'],
        ['substanciaParaTratamento', 't', 'De qual substância?', { en: r => r.interesseTratamento }]]),
      g('Serviços a Ofertar', [
        ['oferecerPsicologo', 'c', 'Ofertar consulta com a psicóloga'],
        ['oferecerPsiquiatra', 'c', 'Ofertar consulta com psiquiatra'],
        ['encaminharRenovacaoReceitas', 'c', 'Encaminhar para renovação de receitas'],
        ['oferecerGruposApoio', 'c', 'Ofertar encaminhamento para grupos de apoio para cessar ou reduzir o uso (se existir)']])]),

    sec('vacinas', 'Situação Vacinal', [
      g('Vacina COVID-19', [['vacinaCovid', 'c', 'Recebeu a vacina da COVID-19 no último ano'], ['naoSabeVacinaCovid', 'c', 'Não sabe responder']]),
      g('Vacina Influenza', [['vacinaInfluenza', 'c', 'Recebeu a vacina da influenza no último ano'], ['naoSabeVacinaInfluenza', 'c', 'Não sabe responder']]),
      g('Vacina Tétano', [['vacinaTetano', 'c', 'Recebeu a vacina do tétano nos últimos 10 anos'], ['naoSabeVacinaTetano', 'c', 'Não sabe responder']]),
      g('Vacina Hepatite B', [['vacinaHepatiteB', 'c', 'Recebeu a vacina da hepatite B alguma vez na vida'], ['naoSabeVacinaHepatiteB', 'c', 'Não sabe responder']]),
      g('Ofertar as Vacinas Disponíveis', [
        ['oferecerVacinaCovid', 'c', 'COVID-19'], ['oferecerVacinaInfluenza', 'c', 'Influenza'], ['oferecerVacinaFebreAmarela', 'c', 'Febre Amarela'],
        ['oferecerVacinaDuplaAdulto', 'c', 'Dupla Adulto (dT)'], ['oferecerVacinaTripliceViral', 'c', 'Tríplice Viral'],
        ['outrasVacinas', 't', 'Outras vacinas'],
        ['oferecerCarteirinha', 'c', 'Ofertar cópia da carteira de vacinação']])]),

    sec('clinico', 'Atendimento Clínico', [
      g('Dados Biológicos', [
        ['peso', 'dec', 'Peso (kg)'], ['altura', 'dec', 'Altura (m)'], ['imc', 'dec', 'IMC']]),
      g('Sinais Vitais', [
        ['pressaoArterial', 't', 'Pressão arterial (ex: 120/80)'], ['frequenciaCardiaca', 't', 'Frequência cardíaca'],
        ['saturacaoOxigenio', 't', 'Saturação de O2'], ['temperatura', 'dec', 'Temperatura (°C)']]),
      g('Sintomas Respiratórios', [
        ['tosse', 'c', 'Tosse'], ['coriza', 'c', 'Coriza'], ['espirros', 'c', 'Espirros'], ['febre', 'c', 'Febre'], ['calafrios', 'c', 'Calafrios'],
        ['outrosSintomas', 't', 'Outros sintomas'], ['dataInicioSintomas', 'd', 'Data de início dos sintomas']]),
      g('Lesões / Ferimentos', [
        ['lesoesFerimentos', 'c', 'Apresenta lesões/ferimentos no corpo'],
        ['localLesoes', 't', 'Local do ferimento', { en: r => r.lesoesFerimentos }],
        ['condicaoGeral', 't', 'Condição do ferimento', { en: r => r.lesoesFerimentos }]]),
      g('Teste de Gravidez', [
        ['testeGravidezPositivo', 'c', 'Positivo'], ['testeGravidezNegativo', 'c', 'Negativo'], ['testeGravidezNaoRealizado', 'c', 'Não realizado']]),
      g('Procedimentos Adicionais', [['coletaEscarro', 'c', 'Coleta de escarro']]),
      g('Outras Queixas', [
        ['outrasQueixas', 'c', 'Apresenta alguma outra queixa'],
        ['outrasQueixasDescricao', 't', 'Descreva a queixa', { en: r => r.outrasQueixas }]]),
      g('Queixas Odontológicas', [
        ['queixaOdontologica', 'c', 'Apresenta alguma queixa odontológica'],
        ['queixaOdontologicaDescricao', 't', 'Descreva a queixa odontológica', { en: r => r.queixaOdontologica }],
        ['necessitaDentista', 'c', 'Necessita avaliação imediata de dentista']]),
      g('Encaminhamentos', [['encaminhamentoFinal', 't', 'Encaminhamentos finais']])])
  ];

  // "Não sabe" × opções específicas, e grupos de escolha única
  App.EXCL = [
    { solo: 'naoSabeDeficiencia', outros: ['possuiDeficiencia'] },
    { solo: 'naoSabeAlergia', outros: ['possuiAlergia'] },
    { solo: 'naoSabeCirurgia', outros: ['realizouCirurgia'] },
    { solo: 'naoSabeDoencaPele', outros: ['possuiDoencaPele'] },
    { solo: 'naoSabeMedicamentoControlado', outros: ['usaMedicamentoControlado'] },
    { solo: 'naoSabeVacinaCovid', outros: ['vacinaCovid'] },
    { solo: 'naoSabeVacinaInfluenza', outros: ['vacinaInfluenza'] },
    { solo: 'naoSabeVacinaTetano', outros: ['vacinaTetano'] },
    { solo: 'naoSabeVacinaHepatiteB', outros: ['vacinaHepatiteB'] },
    { solo: 'naoSabeGestacao', outros: ['gestante'] },
    { solo: 'naoSabeCondicoesCronicas', outros: ['hipertensao', 'diabetes', 'hiv', 'autoimune', 'outraCondicaoCronica'] },
    { solo: 'naoSabeDoencasInfecciosas', outros: ['sifilis', 'hpv', 'tuberculose', 'hepatiteB', 'hepatiteC', 'outraDoencaInfecciosa'] },
    { solo: 'naoSabeTranstornoMental', outros: ['ansiedade', 'depressao', 'bipolaridade', 'esquizofrenia', 'autismo'] },
    { grupo: ['testeGravidezPositivo', 'testeGravidezNegativo', 'testeGravidezNaoRealizado'] }
  ];

  // lista plana de campos e registro vazio
  App.campos = [];
  App.schema.forEach(s => s.grupos.forEach(gr => gr.campos.forEach(c => App.campos.push({ k: c[0], t: c[1], l: c[2], o: c[3] || {}, aba: s.id }))));
  App.campoPor = {}; App.campos.forEach(c => { App.campoPor[c.k] = c; });
  App.registroVazio = function () {
    const r = {};
    App.campos.forEach(c => { r[c.k] = c.t === 'c' ? false : ''; });
    return r;
  };
})();
