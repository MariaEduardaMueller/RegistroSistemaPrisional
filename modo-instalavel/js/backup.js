'use strict';
window.App = window.App || {};
(function () {
  const U = App.U, DB = App.DB;
  const B = App.Backup = {};
  const FORMATO = 'sistema-prisional-backup';

  const temCripto = () => !!(window.crypto && crypto.subtle && window.TextEncoder);
  B.criptoDisponivel = temCripto;

  function paraB64(buf) {
    const b = new Uint8Array(buf); let s = '';
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function deB64(t) { const s = atob(t), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }

  async function chave(senha, salt, iter) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function cifrar(texto, senha) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), iter = 200000;
    const k = await chave(senha, salt, iter);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(texto));
    return { formato: FORMATO, versao: 1, cifrado: true, kdf: 'PBKDF2-SHA256', iter, salt: paraB64(salt), iv: paraB64(iv), dados: paraB64(ct) };
  }
  async function decifrar(env, senha) {
    if (!temCripto()) throw new Error('Este navegador não consegue abrir backups protegidos por senha. Use o Chrome ou o Edge atualizado.');
    try {
      const k = await chave(senha, deB64(env.salt), env.iter || 200000);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(env.iv) }, k, deB64(env.dados));
      return JSON.parse(new TextDecoder().decode(pt));
    } catch (e) { throw new Error('Senha incorreta ou arquivo de backup danificado.'); }
  }

  // Gera o conteúdo do backup (texto JSON). Com senha, o arquivo inteiro é cifrado (AES-256).
  B.gerar = async function (senha) {
    const dados = { formato: FORMATO, versao: 1, exportadoEm: U.agoraISO(), registros: await DB.listarRegistros(), usuarios: await DB.listarUsuarios() };
    const out = senha ? await cifrar(JSON.stringify(dados), senha) : Object.assign({ cifrado: false }, dados);
    return { texto: JSON.stringify(out), total: dados.registros.length, nome: 'backup_sistema_prisional_' + U.stamp() + (senha ? '_protegido' : '') + '.json' };
  };

  B.baixar = function (nome, texto, tipo) {
    const blob = new Blob([texto], { type: tipo || 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nome; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  };

  B.compartilhar = async function (nome, texto) {
    const f = new File([texto], nome, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: nome }); return true; }
    return false;
  };

  B.registrarBackupFeito = () => DB.setMeta('ultimoBackup', U.agoraISO());
  B.ultimoBackup = () => DB.getMeta('ultimoBackup');

  // Lê o arquivo escolhido. Retorna {precisaSenha:true, env} ou {dados}.
  B.ler = async function (arquivo) {
    let env;
    try { env = JSON.parse(await arquivo.text()); } catch (e) { throw new Error('O arquivo escolhido não é um backup válido.'); }
    if (!env || env.formato !== FORMATO) throw new Error('O arquivo escolhido não é um backup deste sistema.');
    return env.cifrado ? { precisaSenha: true, env } : { dados: env };
  };
  B.abrirCifrado = (env, senha) => decifrar(env, senha);

  // Une o backup aos dados do aparelho: nunca apaga nada; em conflito vale o registro mais recente.
  B.mesclar = async function (dados) {
    if (!dados || !Array.isArray(dados.registros)) throw new Error('Backup sem registros.');
    const locais = await DB.listarRegistros();
    const porUuid = new Map(locais.map(r => [r.uuid, r]));
    const porCpf = new Map(locais.filter(r => U.digits(r.cpf)).map(r => [U.digits(r.cpf), r]));
    const res = { novos: 0, atualizados: 0, mantidos: 0, usuariosNovos: 0 };

    for (const inc of dados.registros) {
      const rec = Object.assign(App.registroVazio(), inc);
      const igual = (rec.uuid && porUuid.get(rec.uuid)) || (U.digits(rec.cpf) && porCpf.get(U.digits(rec.cpf)));
      if (!igual) {
        delete rec.id; rec.uuid = rec.uuid || U.uuid();
        const id = await DB.put('registros', rec); rec.id = id;
        porUuid.set(rec.uuid, rec); if (U.digits(rec.cpf)) porCpf.set(U.digits(rec.cpf), rec);
        res.novos++;
      } else if ((rec.atualizadoEm || '') > (igual.atualizadoEm || '')) {
        rec.id = igual.id; rec.uuid = igual.uuid;
        await DB.put('registros', rec);
        res.atualizados++;
      } else res.mantidos++;
    }
    const usuarios = await DB.listarUsuarios(), existentes = new Set(usuarios.map(u => u.user));
    for (const u of (dados.usuarios || [])) {
      if (u && u.user && !existentes.has(u.user)) { await DB.salvarUsuario(u); res.usuariosNovos++; }
    }
    return res;
  };
})();
