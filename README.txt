FICHA DE IDENTIFICAÇÃO (ANEXO A) – VERSÃO OFFLINE PARA TABLET
=============================================================

O QUE É
  Um único arquivo, SistemaPrisional.html, que funciona SEM internet e SEM servidor.
  Os registros ficam guardados dentro do próprio navegador do aparelho.
  Tem tudo da versão em Java: login, cadastro de usuário, busca, ficha com 10 abas,
  validações e o relatório no formato do Anexo A (com a logo da Secretaria da Saúde).


1) COLOCAR NO TABLET (uma vez só)
  - Copie SistemaPrisional.html para o tablet (cabo USB, pendrive OTG, Google Drive,
    e-mail, Bluetooth...). Guarde numa pasta fixa, ex.: Downloads/Ficha.
  - Abra o arquivo com o CHROME (no Android: gerenciador de arquivos > tocar no arquivo
    > "Abrir com" > Chrome).
  - Toque em "Cadastrar usuário" e crie o primeiro acesso.

  IMPORTANTE – abra SEMPRE do mesmo jeito (mesmo arquivo, mesma pasta, mesmo navegador).
  Os dados pertencem a esse "caminho". Se abrir por outro caminho/navegador, os registros
  parecerão ter sumido (continuam no caminho antigo).
  >>> ANTES DE USAR DE VERDADE: cadastre um registro de teste, feche o Chrome por completo,
      abra de novo e confira se o registro continua lá. <<<

  Alternativa mais robusta (opcional): a pasta "modo-instalavel" pode ser servida no próprio
  tablet por um app de servidor local (endereço http://localhost:porta). Nesse modo o Chrome
  oferece "Instalar app" e o sistema ganha ícone na tela inicial.


2) USO NO DIA A DIA
  - Registros > "+ Novo registro". Campos com * são obrigatórios.
  - Use "Próxima ▶ / ◀ Anterior" para andar pelas abas; as abas Saúde da Mulher / do Homem
    aparecem conforme o sexo biológico escolhido.
  - Busca: escolha o tipo, digite e toque em Localizar.
  - Relatório: marque um ou mais registros > "Relatório" > "Imprimir / Salvar PDF"
    (escolha "Salvar como PDF" como impressora) ou "Baixar arquivo HTML".


3) BACKUP (FAÇA TODO DIA DE USO)
  Registros > Backup > Exportar backup. Será criado um arquivo .json na pasta Downloads.
  - Deixe marcado "Proteger com senha": o arquivo fica cifrado (AES-256). SEM A SENHA NÃO HÁ
    COMO ABRIR – anote em local seguro.
  - Limpar dados do navegador, desinstalar o Chrome ou resetar o tablet APAGA os registros.
    O backup é a única cópia de segurança. Guarde-o fora do tablet também.


4) PASSAR OS DADOS PARA O NOTEBOOK/COMPUTADOR (depois, em outro momento)
  a) No tablet: Backup > Exportar backup (com senha).
  b) Leve o arquivo .json ao notebook (cabo, pendrive, e-mail para si mesmo...).
  c) No notebook, copie também o SistemaPrisional.html e abra com Chrome ou Edge
     (duplo clique).
  d) Na primeira tela, toque em "Importar backup" (aparece quando ainda não há usuários)
     e escolha o arquivo .json. Os usuários de acesso e os registros são copiados.
     Se já houver usuários no notebook: entre > Backup > Importar backup.

  A importação NUNCA apaga nada: junta os dados. Se a mesma pessoa (mesmo CPF) existir nos
  dois lados, vale o registro alterado por último. Importar o mesmo arquivo duas vezes não
  duplica registros. Pode repetir o processo quantas vezes precisar (ex.: toda semana).


5) SEGURANÇA (dados de saúde – LGPD)
  - Ative bloqueio de tela e criptografia do tablet. O login do sistema NÃO protege os dados
    contra quem tem o aparelho desbloqueado; quem protege é o bloqueio do aparelho.
  - Não deixe backups sem senha em e-mail, WhatsApp ou nuvem pessoal.
  - Cada tablet guarda só os seus registros. Para reunir vários tablets, importe o backup de
    cada um no computador central.


6) REQUISITOS
  - Android (tablet ou celular) com Chrome atualizado, ou tablet Windows com Chrome/Edge, ou computador.
  - Em celular a ficha aparece em uma coluna; a tela de busca rola para o lado se necessário.
  - iPad/iPhone: abrir um arquivo HTML local no Safari/Files não é prático nem garantido. Para iPad
    seria necessário hospedar o sistema em um endereço https (ou usar o modo localhost com
    um app de servidor) – confirme com um teste antes de adotar.
