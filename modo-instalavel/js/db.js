'use strict';
(function () {
  const DB = App.DB = {};
  let dbp = null;

  DB.open = function () {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('Este navegador não oferece armazenamento local (IndexedDB).'));
      const rq = indexedDB.open('sistema_prisional_offline', 1);
      rq.onupgradeneeded = () => {
        const d = rq.result;
        if (!d.objectStoreNames.contains('registros')) {
          const s = d.createObjectStore('registros', { keyPath: 'id', autoIncrement: true });
          s.createIndex('uuid', 'uuid', { unique: true });
        }
        if (!d.objectStoreNames.contains('usuarios')) d.createObjectStore('usuarios', { keyPath: 'user' });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'k' });
      };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error || new Error('Falha ao abrir o banco local.'));
      rq.onblocked = () => rej(new Error('Banco local bloqueado por outra aba aberta. Feche as outras abas do sistema.'));
    });
    return dbp;
  };

  function run(store, mode, fn) {
    return DB.open().then(db => new Promise((res, rej) => {
      const t = db.transaction(store, mode), s = t.objectStore(store);
      let out;
      const rq = fn(s);
      if (rq) rq.onsuccess = () => { out = rq.result; };
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error('Operação cancelada.'));
    }));
  }
  DB.all = store => run(store, 'readonly', s => s.getAll());
  DB.get = (store, key) => run(store, 'readonly', s => s.get(key));
  DB.put = (store, obj) => run(store, 'readwrite', s => s.put(obj));
  DB.del = (store, key) => run(store, 'readwrite', s => s.delete(key));

  DB.getMeta = k => DB.get('meta', k).then(r => (r ? r.v : null));
  DB.setMeta = (k, v) => DB.put('meta', { k, v });

  // ---- registros
  DB.listarRegistros = () => DB.all('registros');
  DB.buscarRegistro = id => DB.get('registros', Number(id));

  DB.salvarRegistro = async function (rec) {
    const todos = await DB.listarRegistros();
    const cpf = App.U.digits(rec.cpf);
    if (cpf && todos.some(r => r.id !== rec.id && App.U.digits(r.cpf) === cpf)) {
      throw new Error('Este CPF já está cadastrado em outro registro.');
    }
    const agora = App.U.agoraISO();
    rec.uuid = rec.uuid || App.U.uuid();
    rec.criadoEm = rec.criadoEm || agora;
    rec.atualizadoEm = agora;
    if (rec.id == null) delete rec.id;
    return DB.put('registros', rec);
  };
  DB.excluirRegistro = id => DB.del('registros', Number(id));

  // ---- usuários (a chave é o nome de usuário em minúsculas)
  DB.listarUsuarios = () => DB.all('usuarios');
  DB.salvarUsuario = u => DB.put('usuarios', u);
})();
