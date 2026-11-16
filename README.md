# Ficha de Identificação – Anexo A (Polícia Penal RS)

Sistema para cadastro e consulta da **ficha de identificação e saúde (Anexo A)** de pessoas privadas de liberdade, com geração de relatório no mesmo layout do formulário em papel da Secretaria da Saúde do RS.

O repositório tem **duas versões** do sistema:

| Versão | Pasta | Para quê | Armazenamento |
|---|---|---|---|
| **Desktop (Java)** | [`java/`](java) | Computador/notebook com banco de dados | MySQL |
| **Offline (web)** | [`offline/`](offline) | Celular, tablet e computador, **sem internet** | Navegador do aparelho |

> ⚠️ **Dados sensíveis.** O sistema trata dados de saúde e de identificação (LGPD). **Nunca** envie para este repositório registros reais, arquivos de backup (`backup_*.json`) ou senhas. Os dados de exemplo devem ser fictícios.

---

## Funcionalidades

- Login e cadastro de usuários (com validação de CPF, e-mail e senha)
- Ficha completa em **10 abas**: Atendimento, Identificação, Contatos, Dados Socioeconômicos, Condições de Saúde, Saúde da Mulher, Saúde do Homem, Saúde Mental, Situação Vacinal e Atendimento Clínico
- Abas de Saúde da Mulher/Homem exibidas conforme o sexo biológico informado
- Campos dependentes (ex.: etnia só aparece para raça "Indígena") e opções mutuamente exclusivas ("Não sabe responder")
- Validações de CPF, datas, horário, CNS, telefone, pressão arterial, temperatura, peso e altura
- Busca por nome, CPF, nome da mãe, ID, nome social ou em todos os campos
- **Relatório do Anexo A** (um por registro), com logo da Secretaria da Saúde, pronto para imprimir ou salvar em PDF
- Edição e exclusão de registros

---

## Versão Offline (web) – celular e tablet

Um único arquivo, `SistemaPrisional.html`, que funciona **sem internet e sem servidor**. Os registros ficam guardados no próprio navegador (IndexedDB).

### Como usar
1. Copie `offline/SistemaPrisional.html` para o aparelho (cabo, pendrive, nuvem...).
2. Abra com o **Chrome** (Android) ou Chrome/Edge (Windows).
3. Crie o primeiro usuário em **Cadastrar usuário**.

> Abra **sempre pelo mesmo arquivo e navegador**: os dados pertencem a esse "endereço". Antes de usar de verdade, cadastre um registro de teste, feche o navegador por completo e confira se ele continua lá.

### Backup e transferência para outro aparelho
- **Backup → Exportar backup** gera um arquivo `.json`, opcionalmente **cifrado com senha (AES-256-GCM)**.
- Para passar os dados ao notebook: leve o `.json` e o `SistemaPrisional.html`, abra o sistema e use **Importar backup**.
- A importação **une** os dados sem apagar nada. Para o mesmo CPF vale o registro alterado por último, e importar o mesmo arquivo duas vezes não duplica registros.
- Limpar os dados do navegador ou resetar o aparelho **apaga os registros**: faça backup com frequência.

### Modo instalável (opcional)
A pasta [`offline/modo-instalavel`](offline/modo-instalavel) contém os arquivos separados, com `manifest` e *service worker*. Servida em `http://localhost` (ou HTTPS), permite instalar o sistema como app na tela inicial e abrir offline.

### Limitações conhecidas
- Cada aparelho guarda somente os seus registros (não há servidor central).
- O login local **não protege** os dados contra quem tem o aparelho desbloqueado: use bloqueio de tela e criptografia do aparelho.
- iPad/iPhone: abrir HTML local não é prático; não há garantia de funcionamento.

---

## Versão Desktop (Java)

### Requisitos
- **JDK 22 ou superior**
- **MySQL** em execução em `localhost:3306`
- Driver `mysql-connector-j-8.1.0.jar` (baixe em [dev.mysql.com/downloads/connector/j](https://dev.mysql.com/downloads/connector/j/) e coloque em `java/lib/`)

### Configuração do banco
1. Crie o banco (as tabelas são criadas automaticamente na primeira execução):
   ```sql
   CREATE DATABASE sistema_prisional CHARACTER SET utf8mb4;
   ```
2. Ajuste usuário e senha em `java/src/dao/DAO.java` (`ACCESS` e `PASS`).
   **Não envie sua senha real para o GitHub.**
3. Ao iniciar, o sistema cria as tabelas `registro` e `registro_usuarios` e adiciona colunas novas automaticamente em bancos já existentes.

### Executar
- **VS Code:** abra a pasta `java/` e execute `Main.java`.
- **Windows:** `compilar.bat` e depois `executar.bat`.
- **Linux/Mac:** `./compilar.sh` e depois `./executar.sh`.

Na tela de busca, selecione um ou mais registros e clique em **Relatório**: o Anexo A é gerado em HTML, abre no navegador e a janela de impressão (ou "Salvar como PDF") aparece automaticamente.

---

## Estrutura do repositório

```
.
├── java/
│   ├── src/
│   │   ├── Main.java
│   │   ├── dao/      DAO, UserDAO, RegistroDAO (acesso ao MySQL)
│   │   ├── model/    User, Registro
│   │   ├── view/     LoginScreen, SearchScreen, InfoScreen, RelatorioAnexoA
│   │   └── img/      logos e ícones
│   ├── lib/          mysql-connector-j-8.1.0.jar
│   └── compilar.* / executar.*
└── offline/
    ├── SistemaPrisional.html      versão em arquivo único
    ├── LEIA-ME.txt                guia de uso para a equipe
    └── modo-instalavel/
        ├── index.html, manifest.webmanifest, service-worker.js
        ├── css/   js/ (util, schema, db, relatorio, backup, ficha, app)   img/
```

## Tecnologias
- **Java 22**, Swing, JDBC, MySQL
- **HTML, CSS e JavaScript** puros (sem dependências), IndexedDB, Web Crypto (AES-GCM / PBKDF2)

## Aviso legal e uso responsável
Este projeto lida com informações pessoais e de saúde. Antes de usar com dados reais, garanta base legal e controles compatíveis com a **LGPD** (acesso restrito, criptografia do aparelho/banco, backups protegidos e política de retenção).

## Autores
<!-- Preencha com os nomes da equipe -->

## Licença
<!-- Defina a licença do projeto (ex.: MIT) ou remova esta seção -->
