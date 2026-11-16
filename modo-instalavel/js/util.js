'use strict';
window.App = window.App || {};
(function () {
  const U = App.U = {};

  U.esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  U.norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  U.digits = s => String(s == null ? '' : s).replace(/\D/g, '');

  U.uuid = function () {
    if (window.crypto && crypto.randomUUID) { try { return crypto.randomUUID(); } catch (e) { /* contexto inseguro */ } }
    const b = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(b); else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  };

  U.randomHex = function (n) {
    const b = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(b); else for (let i = 0; i < n; i++) b[i] = Math.floor(Math.random() * 256);
    return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  };

  // SHA-256 em JavaScript puro (funciona mesmo quando crypto.subtle não está disponível)
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  U.sha256 = function (str) {
    const msg = new TextEncoder().encode(str);
    const l = msg.length, nb = ((l + 9 + 63) >> 6) << 6;
    const buf = new Uint8Array(nb); buf.set(msg); buf[l] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(nb - 8, Math.floor((l * 8) / 4294967296)); dv.setUint32(nb - 4, (l * 8) >>> 0);
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Uint32Array(64);
    const rr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < nb; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + mj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(x => x.toString(16).padStart(8, '0')).join('');
  };
  U.hashSenha = (salt, senha) => U.sha256(salt + ':' + senha);

  // ---- máscaras
  U.maskCPF = v => { const t = U.digits(v).slice(0, 11); let o = ''; for (let i = 0; i < t.length; i++) { if (i === 3 || i === 6) o += '.'; else if (i === 9) o += '-'; o += t[i]; } return o; };
  U.maskDate = v => { const t = U.digits(v).slice(0, 8); let o = ''; for (let i = 0; i < t.length; i++) { if (i === 2 || i === 4) o += '/'; o += t[i]; } return o; };
  U.maskTime = v => { const t = U.digits(v).slice(0, 4); return t.length > 2 ? t.slice(0, 2) + ':' + t.slice(2) : t; };
  U.maskPhone = v => {
    const t = U.digits(v).slice(0, 11); let o = '';
    for (let i = 0; i < t.length; i++) {
      if (i === 0) o += '('; else if (i === 2) o += ') ';
      else if ((t.length === 11 && i === 7) || (t.length < 11 && i === 6)) o += '-';
      o += t[i];
    }
    return o;
  };
  U.maskDec = v => { let s = String(v).replace(/[^\d.,]/g, ''); const m = s.search(/[.,]/); if (m >= 0) s = s.slice(0, m + 1) + s.slice(m + 1).replace(/[.,]/g, ''); return s; };

  // ---- validações
  U.dataValida = function (s) {
    const m = /^(0\d|[12]\d|3[01])[/-](0\d|1[0-2])[/-]((?:19|20)\d{2})$/.exec(String(s || '').trim());
    if (!m) return false;
    const d = +m[1], mo = +m[2], y = +m[3], dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
  };
  U.cpfBasico = c => { const t = U.digits(c); return t.length === 11 && !/^(\d)\1{10}$/.test(t); };
  U.cpfEstrito = function (c) {
    const t = U.digits(c);
    if (t.length !== 11 || /^(\d)\1{10}$/.test(t)) return false;
    const d = Array.from(t, Number);
    let s = 0; for (let i = 0; i < 9; i++) s += d[i] * (10 - i);
    let p = 11 - (s % 11); if (p >= 10) p = 0;
    s = 0; for (let i = 0; i < 10; i++) s += d[i] * (11 - i);
    let q = 11 - (s % 11); if (q >= 10) q = 0;
    return d[9] === p && d[10] === q;
  };
  U.emailValido = e => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e);
  U.numero = s => { const x = parseFloat(String(s).replace(',', '.')); return isNaN(x) ? NaN : x; };

  U.idadeDe = function (dataNasc) {
    if (!U.dataValida(dataNasc)) return '';
    const [d, m, y] = dataNasc.split(/[/-]/).map(Number), hoje = new Date();
    let a = hoje.getFullYear() - y;
    if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) a--;
    return a >= 0 && a <= 120 ? a : '';
  };

  U.agoraISO = () => new Date().toISOString();
  U.dataHoraBR = iso => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('pt-BR'); };
  U.stamp = function () { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`; };
})();
