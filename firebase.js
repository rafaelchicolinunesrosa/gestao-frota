/**
 * firebase.js - Configuração e Inicialização do Firebase & Firestore
 * 
 * Este arquivo configura a conexão com o Firebase (Auth, Firestore, Storage).
 * 
 * 💡 RECURSO ANTIGRAVITY PREMIUM: 
 * Se as credenciais do Firebase não forem fornecidas ou forem mantidas com os placeholders padrão,
 * o sistema ativa automaticamente o "Modo de Demonstração (Demo Mode)" usando um simulador 
 * reativo em memória/localStorage que replica fielmente o comportamento em tempo real do Cloud Firestore!
 */

(function() {
// Insira as credenciais do seu projeto Firebase abaixo:
const firebaseConfig = {
  apiKey: "AIzaSyAvDOJXeXC9jj5o-w4amEC59JAC2-7cJ5c",
  authDomain: "gestao-frota-demutran.firebaseapp.com",
  projectId: "gestao-frota-demutran",
  storageBucket: "gestao-frota-demutran.firebasestorage.app",
  messagingSenderId: "488547283933",
  appId: "1:488547283933:web:5867c07d2474db68333c34",
  measurementId: "G-0GLQRVN2WT"
};

let isDemoMode = false;
let db = null;
let auth = null;
let storage = null;

// Verifica se as chaves ainda são placeholders padrão
if (
  !firebaseConfig.apiKey || 
  typeof firebaseConfig.apiKey !== 'string' || 
  firebaseConfig.apiKey.includes("SUA_API_KEY") || 
  !firebaseConfig.projectId || 
  typeof firebaseConfig.projectId !== 'string' || 
  firebaseConfig.projectId.includes("SEU_PROJECT_ID")
) {
  console.warn("⚠️ Firebase não configurado ou chaves padrão detectadas. Ativando Modo de Demonstração (Demo Mode) Local!");
  isDemoMode = true;
}

// Inicializadores
if (!isDemoMode) {
  try {
    // Inicialização do Firebase real (caso esteja rodando no navegador via CDN compat ou bundler)
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
      storage = firebase.storage();
      console.log("🔥 Firebase inicializado com sucesso em modo Cloud!");
    } else {
      console.warn("SDK do Firebase não carregado globalmente. Usando simulação.");
      isDemoMode = true;
    }
  } catch (error) {
    console.error("Erro ao inicializar o Firebase real:", error);
    isDemoMode = true;
  }
}

// ==========================================
// SIMULADOR FIRESTORE EM TEMPO REAL (DEMO)
// ==========================================
class FirestoreSimulator {
  constructor() {
    this.listeners = {};
    this.useLocalStorage = true;
    try {
      localStorage.setItem('__test_ls__', '1');
      localStorage.removeItem('__test_ls__');
    } catch (e) {
      console.warn("⚠️ LocalStorage não está disponível ou foi bloqueado pelo navegador. Utilizando banco em memória!");
      this.useLocalStorage = false;
      this.memoryDb = {};
    }
    this.initDemoData();
    
    // Sincronismo reativo multi-abas em tempo real para o modo de demonstração
    if (this.useLocalStorage) {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('db_')) {
          const collection = e.key.replace('db_', '');
          this.triggerListeners(collection);
        }
      });
    }
  }

  // Inicializa dados padrão do departamento de trânsito
  initDemoData() {
    const setItem = (key, val) => {
      if (this.useLocalStorage) {
        localStorage.setItem(key, val);
      } else {
        this.memoryDb[key] = val;
      }
    };
    const getItem = (key) => {
      if (this.useLocalStorage) {
        return localStorage.getItem(key);
      } else {
        return this.memoryDb[key] || null;
      }
    };

    if (!getItem('db_materiais')) {
      setItem('db_materiais', JSON.stringify({
        'cone': { nome: 'Cone de Sinalização', quantidade_patio: 120, ativo: true },
        'super_cone': { nome: 'Super Cone (Canelado)', quantidade_patio: 45, ativo: true },
        'balizador': { nome: 'Balizador Cônico', quantidade_patio: 80, ativo: true }
      }));
    }

    if (!getItem('db_agentes')) {
      setItem('db_agentes', JSON.stringify({
        '100201': { matricula: '100201', nome: 'Agente Silva', ativo: true },
        '100202': { matricula: '100202', nome: 'Agente Santos', ativo: true },
        '100203': { matricula: '100203', nome: 'Agente Oliveira', ativo: true },
        '100204': { matricula: '100204', nome: 'Agente Rodrigues', ativo: true },
        '100205': { matricula: '100205', nome: 'Agente Barbosa', ativo: true }
      }));
    }

    if (!getItem('db_viaturas')) {
      setItem('db_viaturas', JSON.stringify({
        'VTR-12': {
          prefixo: 'VTR-12',
          tipo: 'VTR',
          odometro_atual: 45200,
          status_atual: 'disponivel',
          combustivel_atual: '3/4',
          id_checklist_atual: null,
          regras_manutencao: {
            troca_oleo_odometro_meta: 50000,
            troca_oleo_intervalo: 5000,
            ultima_troca_oleo_odometro: 45000
          },
          avarias_ativas: [
            { descricao: 'Arranhão para-choque traseiro esquerdo', fotoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80', data_registro: new Date().toISOString() }
          ],
          carga_atual: {},
          historico: [
            { tipo: 'avaria_registrada', data: new Date(Date.now() - 3600000*48).toISOString(), avaria_descricao: 'Arranhão para-choque traseiro esquerdo', avaria_foto: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80', origem: 'Abertura de Plantão' }
          ]
        },
        'VTM-03': {
          prefixo: 'VTM-03',
          tipo: 'VTM',
          odometro_atual: 12450,
          status_atual: 'disponivel',
          combustivel_atual: '1/2',
          id_checklist_atual: null,
          regras_manutencao: {
            troca_oleo_odometro_meta: 13000,
            troca_oleo_intervalo: 3000,
            ultima_troca_oleo_odometro: 10000
          },
          avarias_ativas: [],
          carga_atual: {},
          historico: []
        },
        'VTR-09': {
          prefixo: 'VTR-09',
          tipo: 'VTR',
          odometro_atual: 98100,
          status_atual: 'baixada',
          combustivel_atual: '1/4',
          id_checklist_atual: null,
          regras_manutencao: {
            troca_oleo_odometro_meta: 95000,
            troca_oleo_intervalo: 5000,
            ultima_troca_oleo_odometro: 90000
          },
          avarias_ativas: [
            { descricao: 'Problema na embreagem', fotoUrl: '', data_registro: new Date().toISOString() }
          ],
          carga_atual: {},
          historico: [
            { tipo: 'avaria_registrada', data: new Date(Date.now() - 3600000*24).toISOString(), avaria_descricao: 'Problema na embreagem', avaria_foto: '', origem: 'Fechamento de Plantão' },
            { tipo: 'baixa', data: new Date(Date.now() - 3600000*23).toISOString(), observacao: 'Problema na embreagem detectado no plantão - aguardando oficina mecânica' }
          ]
        }
      }));
    }

    if (!getItem('db_checklists')) {
      setItem('db_checklists', JSON.stringify({}));
    }

    if (!getItem('db_dispositivos')) {
      setItem('db_dispositivos', JSON.stringify({}));
    }

    if (!getItem('db_codigos_ativacao')) {
      setItem('db_codigos_ativacao', JSON.stringify({}));
    }

    if (!getItem('db_uids_autorizados')) {
      setItem('db_uids_autorizados', JSON.stringify({}));
    }
  }

  // Obter dados de uma coleção
  getData(collection) {
    const getItem = (key) => {
      if (this.useLocalStorage) {
        return localStorage.getItem(key);
      } else {
        return this.memoryDb[key] || null;
      }
    };
    const data = getItem(`db_${collection}`);
    return data ? JSON.parse(data) : {};
  }

  // Gravar dados em uma coleção
  saveData(collection, data) {
    const setItem = (key, val) => {
      if (this.useLocalStorage) {
        localStorage.setItem(key, val);
      } else {
        this.memoryDb[key] = val;
      }
    };
    setItem(`db_${collection}`, JSON.stringify(data));
    this.triggerListeners(collection);
  }

  // Obter documento individual
  getDocument(collection, docId) {
    const db = this.getData(collection);
    return db[docId] || null;
  }

  // Salvar documento individual
  setDocument(collection, docId, data) {
    const db = this.getData(collection);
    db[docId] = { ...db[docId], ...data };
    this.saveData(collection, db);
  }

  // Inscrever para atualizações em tempo real (onSnapshot)
  subscribe(collection, docId, callback) {
    const key = docId ? `${collection}/${docId}` : collection;
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);

    // Enviar estado inicial imediatamente
    setTimeout(() => {
      if (docId) {
        callback(this.getDocument(collection, docId));
      } else {
        callback(Object.values(this.getData(collection)));
      }
    }, 100);

    // Retorna função de unsubscribe
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  triggerListeners(collection) {
    // Gatilho para a coleção inteira
    if (this.listeners[collection]) {
      const colData = Object.values(this.getData(collection));
      this.listeners[collection].forEach(callback => callback(colData));
    }
    // Gatilho para documentos individuais
    const db = this.getData(collection);
    Object.keys(db).forEach(docId => {
      const key = `${collection}/${docId}`;
      if (this.listeners[key]) {
        this.listeners[key].forEach(callback => callback(db[docId]));
      }
    });
  }
}

const simulator = isDemoMode ? new FirestoreSimulator() : null;

// ==========================================
// MÉTODOS DE AÇÃO EXPORTADOS (ABSTRAÇÃO)
// ==========================================

/**
 * Escuta atualizações de uma viatura específica em tempo real
 */
function listenViatura(prefixo, callback) {
  if (isDemoMode) {
    return simulator.subscribe('viaturas', prefixo, callback);
  } else {
    return db.collection('viaturas').doc(prefixo).onSnapshot(doc => {
      callback(doc.exists ? doc.data() : null);
    });
  }
}

/**
 * Escuta a lista completa de materiais ativos
 */
function listenMateriais(callback) {
  if (isDemoMode) {
    return simulator.subscribe('materiais', null, () => {
      const materiaisObj = simulator.getData('materiais');
      const materiais = Object.entries(materiaisObj).map(([id, data]) => ({ id, ...data }));
      callback(materiais);
    });
  } else {
    return db.collection('materiais').where('ativo', '==', true).onSnapshot(snapshot => {
      const materiais = [];
      snapshot.forEach(doc => materiais.push({ id: doc.id, ...doc.data() }));
      callback(materiais);
    });
  }
}

/**
 * Cadastra um novo material operacional de forma customizada (se não existir)
 */
async function adicionarMaterialCustom(nome, quantidade = 0) {
  const id = 'custom_' + nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
  const novoMaterial = {
    nome: nome,
    quantidade_patio: parseInt(quantidade) || 0,
    ativo: true
  };
  if (isDemoMode) {
    const materiais = simulator.getData('materiais');
    if (!materiais[id]) {
      materiais[id] = novoMaterial;
      simulator.saveData('materiais', materiais);
    }
    return id;
  } else {
    const matRef = db.collection('materiais').doc(id);
    const matDoc = await matRef.get();
    if (!matDoc.exists) {
      await matRef.set(novoMaterial);
    }
    return id;
  }
}

/**
 * Remove um material operacional da base de dados (deleta do estoque)
 */
async function deletarMaterial(materialId) {
  if (isDemoMode) {
    const materiais = simulator.getData('materiais');
    if (materiais[materialId]) {
      delete materiais[materialId];
      simulator.saveData('materiais', materiais);
    }
  } else {
    await db.collection('materiais').doc(materialId).delete();
  }
}

/**
 * Comprime e redimensiona uma imagem no navegador antes do upload para melhorar a performance.
 */
function comprimirImagem(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            try {
              const compressedFile = new File([blob], (file.name || 'foto.jpg').replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } catch (e) {
              console.warn("Fallback: Construtor File não suportado, usando Blob de forma direta.", e);
              // Fallback para Blob puro atribuindo propriedades do File para compatibilidade
              blob.name = (file.name || 'foto.jpg').replace(/\.[^/.]+$/, "") + ".jpg";
              blob.lastModified = Date.now();
              resolve(blob);
            }
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => {
        console.warn("Erro ao ler elemento de imagem, usando arquivo original.");
        resolve(file);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      console.warn("Erro no FileReader, usando arquivo original.");
      resolve(file);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Realiza o upload de um arquivo de imagem para o Firebase Storage ou simula o upload em modo demo.
 */
async function uploadFoto(file) {
  let compressedFile = file;
  try {
    compressedFile = await comprimirImagem(file);
  } catch (err) {
    console.warn("Erro ao comprimir imagem, usando arquivo original:", err);
  }

  if (isDemoMode) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      const fileToRead = compressedFile instanceof Blob ? compressedFile : file;
      reader.readAsDataURL(fileToRead);
    });
  } else {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Tempo limite de upload excedido (15s). Certifique-se de que ativou o serviço 'Storage' no Console do Firebase e liberou as regras de gravação para todos (allow read, write: if true;) na aba de regras do Storage!"));
      }, 15000);
    });

    const uploadPromise = (async () => {
      const fileName = compressedFile.name || file.name || `foto_${Date.now()}.jpg`;
      const extension = fileName.split('.').pop() || 'jpg';
      const filename = `foto_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${extension}`;
      const storageRef = storage.ref().child(`fotos/${filename}`);
      const snapshot = await storageRef.put(compressedFile);
      const url = await snapshot.ref.getDownloadURL();
      return url;
    })();

    try {
      const url = await Promise.race([uploadPromise, timeoutPromise]);
      return url;
    } catch (error) {
      console.error("Erro no upload para o Storage:", error);
      throw error;
    }
  }
}

/**
 * Busca todos os agentes cadastrados para preenchimento de equipe
 */
function getAgentes(callback) {
  if (isDemoMode) {
    return simulator.subscribe('agentes', null, callback);
  } else {
    return db.collection('agentes').where('ativo', '==', true).onSnapshot(snapshot => {
      const agentes = [];
      snapshot.forEach(doc => agentes.push(doc.data()));
      callback(agentes);
    }, error => {
      console.error("Erro ao escutar agentes:", error);
    });
  }
}

/**
 * Realiza o login anônimo do Agente
 */
async function loginAgenteAnomino() {
  if (isDemoMode) {
    console.log("🔓 Login Anônimo Simulado Concluído!");
    return { uid: "demo_agent_" + Math.random().toString(36).substr(2, 9) };
  } else {
    const userCredential = await auth.signInAnonymously();
    return {
      uid: userCredential.user.uid
    };
  }
}

/**
 * Abre o Check-list da Viatura (Check-in)
 */
async function abrirChecklist(prefixo, aberturaData) {
  if (isDemoMode) {
    const checklistId = 'CHK_' + Date.now();
    const checklistDoc = {
      id: checklistId,
      viatura_id: prefixo,
      tipo_viatura: simulator.getDocument('viaturas', prefixo).tipo,
      status: 'aberto',
      abertura: {
        ...aberturaData,
        data: new Date().toISOString()
      },
      movimentacoes: [],
      fechamento: null
    };

    // 1. Gravar checklist
    const checklists = simulator.getData('checklists');
    checklists[checklistId] = checklistDoc;
    simulator.saveData('checklists', checklists);

    // 2. Descontar materiais da base
    const materiais = simulator.getData('materiais');
    Object.entries(aberturaData.carga_inicial).forEach(([matId, qtd]) => {
      if (materiais[matId]) {
        materiais[matId].quantidade_patio = Math.max(0, materiais[matId].quantidade_patio - qtd);
      }
    });
    simulator.saveData('materiais', materiais);

    // 3. Atualizar viatura para "em_operacao"
    const viatura = simulator.getDocument('viaturas', prefixo);
    
    let novasAvarias = viatura.avarias_ativas || [];
    if (!viatura.historico) viatura.historico = [];
    
    if (aberturaData.novas_avarias && aberturaData.novas_avarias.length > 0) {
      novasAvarias = [...novasAvarias, ...aberturaData.novas_avarias];
      aberturaData.novas_avarias.forEach(av => {
        viatura.historico.push({
          tipo: 'avaria_registrada',
          data: av.data_registro || new Date().toISOString(),
          avaria_descricao: av.descricao,
          avaria_foto: av.fotoUrl || '',
          origem: 'Abertura de Plantão'
        });
      });
    }

    viatura.status_atual = 'em_operacao';
    viatura.id_checklist_atual = checklistId;
    viatura.carga_atual = { ...aberturaData.carga_inicial };
    viatura.equipe_atual = aberturaData.equipe;
    viatura.odometro_atual = aberturaData.odometro;
    viatura.combustivel_atual = aberturaData.combustivel;
    viatura.avarias_ativas = novasAvarias;
    simulator.setDocument('viaturas', prefixo, viatura);

    return checklistId;
  } else {
    // Implementação Firestore Real com Transaction
    const checklistRef = db.collection('checklists').doc();
    const viaturaRef = db.collection('viaturas').doc(prefixo);

    return db.runTransaction(async (transaction) => {
      // 1. Leituras iniciais
      const viaturaDoc = await transaction.get(viaturaRef);
      if (!viaturaDoc.exists) throw new Error("Viatura não existe!");

      // Ler todos os documentos de materiais necessários ANTES de qualquer escrita
      const materialDocs = {};
      for (const matId of Object.keys(aberturaData.carga_inicial || {})) {
        const matRef = db.collection('materiais').doc(matId);
        materialDocs[matId] = await transaction.get(matRef);
      }

      // 2. Operações de Escrita

      // Gravar checklist
      transaction.set(checklistRef, {
        id: checklistRef.id,
        viatura_id: prefixo,
        tipo_viatura: viaturaDoc.data().tipo,
        status: 'aberto',
        abertura: {
          ...aberturaData,
          data: new Date().toISOString()
        },
        movimentacoes: [],
        fechamento: null
      });

      // Atualizar materiais da base
      for (const [matId, qtd] of Object.entries(aberturaData.carga_inicial || {})) {
        const matDoc = materialDocs[matId];
        if (matDoc && matDoc.exists) {
          transaction.update(db.collection('materiais').doc(matId), {
            quantidade_patio: firebase.firestore.FieldValue.increment(-qtd)
          });
        }
      }

      // Atualizar Viatura
      let novasAvarias = viaturaDoc.data().avarias_ativas || [];
      const historico = viaturaDoc.data().historico || [];

      if (aberturaData.novas_avarias && aberturaData.novas_avarias.length > 0) {
        novasAvarias = [...novasAvarias, ...aberturaData.novas_avarias];
        aberturaData.novas_avarias.forEach(av => {
          historico.push({
            tipo: 'avaria_registrada',
            data: av.data_registro || new Date().toISOString(),
            avaria_descricao: av.descricao,
            avaria_foto: av.fotoUrl || '',
            origem: 'Abertura de Plantão'
          });
        });
      }

      transaction.update(viaturaRef, {
        status_atual: 'em_operacao',
        id_checklist_atual: checklistRef.id,
        carga_atual: aberturaData.carga_inicial,
        equipe_atual: aberturaData.equipe,
        odometro_atual: aberturaData.odometro,
        combustivel_atual: aberturaData.combustivel || viaturaDoc.data().combustivel,
        avarias_ativas: novasAvarias,
        historico: historico
      });

      return checklistRef.id;
    });
  }
}

/**
 * Escuta atualizações de um checklist específico em tempo real
 */
function listenChecklist(checklistId, callback) {
  if (isDemoMode) {
    return simulator.subscribe('checklists', checklistId, callback);
  } else {
    return db.collection('checklists').doc(checklistId).onSnapshot(doc => {
      callback(doc.exists ? doc.data() : null);
    });
  }
}

/**
 * Registra movimentação de materiais (Rua / Base)
 */
async function registrarMovimentacao(prefixo, checklistId, movimento) {
  const mov = {
    ...movimento,
    data: new Date().toISOString()
  };

  if (mov.tipo === 'deixei_via') {
    mov.id = 'LOT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    mov.quantidade_restante = mov.quantidade;
    mov.checklist_id = checklistId;
  }

  if (isDemoMode) {
    const checklist = simulator.getDocument('checklists', checklistId);
    if (!checklist) return;

    checklist.movimentacoes.push(mov);
    const checklists = simulator.getData('checklists');
    checklists[checklistId] = checklist;
    simulator.saveData('checklists', checklists);

    // Se for recolhimento por referência, atualizar a quantidade restante do lote
    if (mov.tipo === 'recolhi_via' && mov.referencia_mov_id && mov.referencia_checklist_id) {
      const targetChk = checklists[mov.referencia_checklist_id];
      if (targetChk && targetChk.movimentacoes) {
        const targetIdx = targetChk.movimentacoes.findIndex(m => m.id === mov.referencia_mov_id);
        if (targetIdx !== -1) {
          const lot = targetChk.movimentacoes[targetIdx];
          const totalRestante = lot.quantidade_restante || 0;
          const recolhido = mov.quantidade || 0;
          const perda = Math.max(0, totalRestante - recolhido);

          if (mov.nao_encontrado) {
            lot.nao_encontrado = true;
            lot.quantidade_perdida = (lot.quantidade_perdida || 0) + perda;
            lot.quantidade_restante = perda; // Fica o saldo perdido na rua para baixa do supervisor
          } else {
            lot.quantidade_restante = Math.max(0, totalRestante - recolhido);
          }
          simulator.saveData('checklists', checklists);
        }
      }
    }

    const viatura = simulator.getDocument('viaturas', prefixo);
    const materialId = mov.material_id;
    const qtd = mov.quantidade;

    if (!viatura.carga_atual) viatura.carga_atual = {};
    
    if (mov.tipo === 'deixei_via') {
      viatura.carga_atual[materialId] = Math.max(0, (viatura.carga_atual[materialId] || 0) - qtd);
    } else if (mov.tipo === 'recolhi_via') {
      viatura.carga_atual[materialId] = (viatura.carga_atual[materialId] || 0) + qtd;
    } else if (mov.tipo === 'peguei_base') {
      viatura.carga_atual[materialId] = (viatura.carga_atual[materialId] || 0) + qtd;
      const materiais = simulator.getData('materiais');
      if (materiais[materialId]) {
        materiais[materialId].quantidade_patio = Math.max(0, materiais[materialId].quantidade_patio - qtd);
        simulator.saveData('materiais', materiais);
      }
    } else if (mov.tipo === 'devolvi_base') {
      viatura.carga_atual[materialId] = Math.max(0, (viatura.carga_atual[materialId] || 0) - qtd);
      const materiais = simulator.getData('materiais');
      if (materiais[materialId]) {
        materiais[materialId].quantidade_patio = (materiais[materialId].quantidade_patio || 0) + qtd;
        simulator.saveData('materiais', materiais);
      }
    }

    simulator.setDocument('viaturas', prefixo, viatura);
  } else {
    const checklistRef = db.collection('checklists').doc(checklistId);
    const viaturaRef = db.collection('viaturas').doc(prefixo);

    return db.runTransaction(async (transaction) => {
      // 1. Leituras iniciais
      const checklistDoc = await transaction.get(checklistRef);
      const viaturaDoc = await transaction.get(viaturaRef);
      if (!checklistDoc.exists || !viaturaDoc.exists) throw new Error("Documento não encontrado");

      // Se for recolhimento por referência em modo Firestore real, ler checklist referenciado ANTES de qualquer escrita
      let refChecklistDoc = null;
      const isRecolhiViaRef = mov.tipo === 'recolhi_via' && mov.referencia_mov_id && mov.referencia_checklist_id;
      if (isRecolhiViaRef) {
        const refChecklistRef = db.collection('checklists').doc(mov.referencia_checklist_id);
        refChecklistDoc = await transaction.get(refChecklistRef);
      }

      // 2. Operações de Escrita
      const viaturaCarga = { ...viaturaDoc.data().carga_atual };
      const materialId = mov.material_id;
      const qtd = mov.quantidade;

      transaction.update(checklistRef, {
        movimentacoes: firebase.firestore.FieldValue.arrayUnion(mov)
      });

      // Atualizar o checklist referenciado
      if (isRecolhiViaRef && refChecklistDoc && refChecklistDoc.exists) {
        const refData = refChecklistDoc.data();
        const refMovs = refData.movimentacoes || [];
        const targetIdx = refMovs.findIndex(m => m.id === mov.referencia_mov_id);
        if (targetIdx !== -1) {
          const lot = refMovs[targetIdx];
          const totalRestante = lot.quantidade_restante || 0;
          const recolhido = mov.quantidade || 0;
          const perda = Math.max(0, totalRestante - recolhido);

          if (mov.nao_encontrado) {
            lot.nao_encontrado = true;
            lot.quantidade_perdida = (lot.quantidade_perdida || 0) + perda;
            lot.quantidade_restante = perda; // Fica o saldo perdido na rua para baixa do supervisor
          } else {
            lot.quantidade_restante = Math.max(0, totalRestante - recolhido);
          }
          const refChecklistRef = db.collection('checklists').doc(mov.referencia_checklist_id);
          transaction.update(refChecklistRef, { movimentacoes: refMovs });
        }
      }

      if (mov.tipo === 'deixei_via') {
        viaturaCarga[materialId] = Math.max(0, (viaturaCarga[materialId] || 0) - qtd);
        transaction.update(viaturaRef, { carga_atual: viaturaCarga });
      } else if (mov.tipo === 'recolhi_via') {
        viaturaCarga[materialId] = (viaturaCarga[materialId] || 0) + qtd;
        transaction.update(viaturaRef, { carga_atual: viaturaCarga });
      } else if (mov.tipo === 'peguei_base') {
        viaturaCarga[materialId] = (viaturaCarga[materialId] || 0) + qtd;
        transaction.update(viaturaRef, { carga_atual: viaturaCarga });
        transaction.update(db.collection('materiais').doc(materialId), {
          quantidade_patio: firebase.firestore.FieldValue.increment(-qtd)
        });
      } else if (mov.tipo === 'devolvi_base') {
        viaturaCarga[materialId] = Math.max(0, (viaturaCarga[materialId] || 0) - qtd);
        transaction.update(viaturaRef, { carga_atual: viaturaCarga });
        transaction.update(db.collection('materiais').doc(materialId), {
          quantidade_patio: firebase.firestore.FieldValue.increment(qtd)
        });
      }
    });
  }
}

/**
 * Atualiza integrantes da equipe no meio do serviço
 */
async function alterarIntegrantes(prefixo, checklistId, novaEquipe) {
  if (isDemoMode) {
    const checklist = simulator.getDocument('checklists', checklistId);
    if (!checklist) return;
    checklist.abertura.equipe = novaEquipe;
    
    const checklists = simulator.getData('checklists');
    checklists[checklistId] = checklist;
    simulator.saveData('checklists', checklists);

    const viatura = simulator.getDocument('viaturas', prefixo);
    viatura.equipe_atual = novaEquipe;
    simulator.setDocument('viaturas', prefixo, viatura);
  } else {
    const batch = db.batch();
    batch.update(db.collection('checklists').doc(checklistId), {
      "abertura.equipe": novaEquipe
    });
    batch.update(db.collection('viaturas').doc(prefixo), {
      equipe_atual: novaEquipe
    });
    await batch.commit();
  }
}

/**
 * Fecha o Check-list da Viatura (Check-out)
 */
async function fecharChecklist(prefixo, checklistId, fechamentoData) {
  if (isDemoMode) {
    const checklist = simulator.getDocument('checklists', checklistId);
    if (!checklist) return;

    checklist.status = 'fechado';
    checklist.fechamento = {
      ...fechamentoData,
      data: new Date().toISOString()
    };

    const checklists = simulator.getData('checklists');
    checklists[checklistId] = checklist;
    simulator.saveData('checklists', checklists);

    const viatura = simulator.getDocument('viaturas', prefixo);
    const materiais = simulator.getData('materiais');

    Object.entries(viatura.carga_atual || {}).forEach(([matId, qtd]) => {
      if (materiais[matId]) {
        materiais[matId].quantidade_patio = (materiais[matId].quantidade_patio || 0) + qtd;
      }
    });
    simulator.saveData('materiais', materiais);

    let novasAvarias = viatura.avarias_ativas || [];
    if (!viatura.historico) viatura.historico = [];
    if (fechamentoData.novas_avarias && fechamentoData.novas_avarias.length > 0) {
      novasAvarias = [...novasAvarias, ...fechamentoData.novas_avarias];
      fechamentoData.novas_avarias.forEach(av => {
        viatura.historico.push({
          tipo: 'avaria_registrada',
          data: av.data_registro || new Date().toISOString(),
          avaria_descricao: av.descricao,
          avaria_foto: av.fotoUrl || '',
          origem: 'Fechamento de Plantão'
        });
      });
    }

    viatura.historico.push({
      tipo: 'plantao_encerrado',
      data: new Date().toISOString(),
      observacao: fechamentoData.observacoes || 'Plantão encerrado sem observações adicionais.',
      odometro: fechamentoData.odometro_final,
      combustivel: fechamentoData.combustivel_final
    });

    viatura.status_atual = 'disponivel';
    viatura.id_checklist_atual = null;
    viatura.carga_atual = {};
    viatura.equipe_atual = null;
    viatura.odometro_atual = fechamentoData.odometro_final;
    viatura.combustivel_atual = fechamentoData.combustivel_final;
    viatura.avarias_ativas = novasAvarias;
    
    simulator.setDocument('viaturas', prefixo, viatura);
  } else {
    const checklistRef = db.collection('checklists').doc(checklistId);
    const viaturaRef = db.collection('viaturas').doc(prefixo);

    return db.runTransaction(async (transaction) => {
      const checklistDoc = await transaction.get(checklistRef);
      const viaturaDoc = await transaction.get(viaturaRef);
      if (!checklistDoc.exists || !viaturaDoc.exists) throw new Error("Documentos não encontrados");

      const viaturaDados = viaturaDoc.data();
      const cargaRestante = viaturaDados.carga_atual || {};

      for (const [matId, qtd] of Object.entries(cargaRestante)) {
        transaction.update(db.collection('materiais').doc(matId), {
          quantidade_patio: firebase.firestore.FieldValue.increment(qtd)
        });
      }

      let novasAvarias = viaturaDados.avarias_ativas || [];
      const historico = viaturaDados.historico || [];
      if (fechamentoData.novas_avarias && fechamentoData.novas_avarias.length > 0) {
        novasAvarias = [...novasAvarias, ...fechamentoData.novas_avarias];
        fechamentoData.novas_avarias.forEach(av => {
          historico.push({
            tipo: 'avaria_registrada',
            data: av.data_registro || new Date().toISOString(),
            avaria_descricao: av.descricao,
            avaria_foto: av.fotoUrl || '',
            origem: 'Fechamento de Plantão'
          });
        });
      }

      historico.push({
        tipo: 'plantao_encerrado',
        data: new Date().toISOString(),
        observacao: fechamentoData.observacoes || 'Plantão encerrado sem observações adicionais.',
        odometro: fechamentoData.odometro_final,
        combustivel: fechamentoData.combustivel_final
      });

      transaction.update(checklistRef, {
        status: 'fechado',
        fechamento: {
          ...fechamentoData,
          data: new Date().toISOString()
        }
      });

      transaction.update(viaturaRef, {
        status_atual: 'disponivel',
        id_checklist_atual: null,
        carga_atual: {},
        equipe_atual: null,
        odometro_atual: fechamentoData.odometro_final,
        combustivel_atual: fechamentoData.combustivel_final,
        avarias_ativas: novasAvarias,
        historico: historico
      });
    });
  }
}

// ==========================================
// MÉTODOS DE AÇÃO DO SUPERVISOR (DASHBOARD)
// ==========================================

/**
 * Autentica o supervisor no sistema
 */
async function loginSupervisor(usuario, senha) {
  if (isDemoMode) {
    const supervisores = simulator.getData('supervisores') || {};
    if (usuario === 'controlador' && senha === 'frota123') {
      return { uid: 'supervisor_demo', email: 'controlador@frota.local' };
    }
    const matchId = Object.keys(supervisores).find(email => email.trim().toLowerCase() === usuario.trim().toLowerCase());
    if (matchId && supervisores[matchId].senha === senha) {
      return { uid: 'supervisor_' + matchId, email: supervisores[matchId].email };
    }
    throw new Error("Usuário ou senha do supervisor incorretos!");
  } else {
    const userCredential = await auth.signInWithEmailAndPassword(usuario, senha);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email
    };
  }
}

async function adicionarSupervisor(email, senha) {
  if (isDemoMode) {
    const supervisores = simulator.getData('supervisores') || {};
    const id = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    supervisores[id] = {
      email: email.trim(),
      senha: senha
    };
    simulator.saveData('supervisores', supervisores);
  } else {
    // Cria um app secundário temporário para criar o usuário sem deslogar o controlador atual!
    const secondaryApp = firebase.initializeApp(firebaseConfig, "SecondaryApp_" + Date.now());
    try {
      await secondaryApp.auth().createUserWithEmailAndPassword(email.trim(), senha);
      // Registra também uma referência no Firestore para auditoria
      await secondaryApp.firestore().collection('supervisores').doc(email.trim().toLowerCase()).set({
        email: email.trim(),
        data_cadastro: new Date().toISOString()
      });
    } catch (err) {
      console.error("Erro ao cadastrar supervisor no Firebase:", err);
      throw err;
    } finally {
      await secondaryApp.delete();
    }
  }
}

/**
 * Registra a realização de uma troca de óleo na viatura e atualiza a próxima meta
 */
async function registrarTrocaOleo(prefixo, odometroTroca, proximaMeta) {
  if (isDemoMode) {
    const viaturas = simulator.getData('viaturas');
    if (viaturas[prefixo]) {
      if (!viaturas[prefixo].regras_manutencao) {
        viaturas[prefixo].regras_manutencao = {};
      }
      viaturas[prefixo].regras_manutencao.ultima_troca_oleo_odometro = odometroTroca;
      viaturas[prefixo].regras_manutencao.troca_oleo_odometro_meta = proximaMeta;
      simulator.saveData('viaturas', viaturas);
    }
  } else {
    await db.collection('viaturas').doc(prefixo).update({
      "regras_manutencao.ultima_troca_oleo_odometro": odometroTroca,
      "regras_manutencao.troca_oleo_odometro_meta": proximaMeta
    });
  }
}

/**
 * Altera o status atual de uma viatura (ex: enviar para oficina ou liberar)
 */
async function atualizarViaturaStatus(prefixo, status, observacao = '') {
  const logItem = {
    tipo: status === 'baixada' ? 'baixa' : 'retorno_servico',
    data: new Date().toISOString(),
    observacao: observacao || 'Sem observações'
  };

  if (isDemoMode) {
    const viaturas = simulator.getData('viaturas');
    if (viaturas[prefixo]) {
      viaturas[prefixo].status_atual = status;
      if (!viaturas[prefixo].historico) viaturas[prefixo].historico = [];
      viaturas[prefixo].historico.push(logItem);
      simulator.saveData('viaturas', viaturas);
    }
  } else {
    const docRef = db.collection('viaturas').doc(prefixo);
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (doc.exists) {
        const data = doc.data();
        const historico = data.historico || [];
        historico.push(logItem);
        transaction.update(docRef, { 
          status_atual: status,
          historico: historico
        });
      }
    });
  }
}

/**
 * Cadastra um novo veículo no sistema
 */
async function adicionarViatura(prefixo, tipo, fotos_entrada = []) {
  const novaVtr = {
    prefixo,
    tipo,
    odometro_atual: 0,
    status_atual: 'disponivel',
    combustivel_atual: '1/2',
    id_checklist_atual: null,
    regras_manutencao: {
      troca_oleo_odometro_meta: tipo === 'VTR' ? 5000 : 3000,
      troca_oleo_intervalo: tipo === 'VTR' ? 5000 : 3000,
      ultima_troca_oleo_odometro: 0
    },
    avarias_ativas: [],
    carga_atual: {},
    fotos_entrada: fotos_entrada || [],
    historico: []
  };
  
  if (isDemoMode) {
    const viaturas = simulator.getData('viaturas');
    if (!viaturas[prefixo]) {
      viaturas[prefixo] = novaVtr;
      simulator.saveData('viaturas', viaturas);
    } else {
      throw new Error("Esta viatura já está cadastrada!");
    }
  } else {
    const docRef = db.collection('viaturas').doc(prefixo);
    const doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set(novaVtr);
    } else {
      throw new Error("Esta viatura já está cadastrada!");
    }
  }
}

/**
 * Remove uma avaria ativa da viatura (Consertada / Resolvida)
 */
async function resolverAvaria(prefixo, avariaIndex) {
  if (isDemoMode) {
    const viaturas = simulator.getData('viaturas');
    if (viaturas[prefixo]) {
      const avarias = viaturas[prefixo].avarias_ativas || [];
      const avariaResolvida = avarias[avariaIndex];
      
      avarias.splice(avariaIndex, 1);
      viaturas[prefixo].avarias_ativas = avarias;
      
      if (!viaturas[prefixo].historico) viaturas[prefixo].historico = [];
      if (avariaResolvida) {
        viaturas[prefixo].historico.push({
          tipo: 'avaria_resolvida',
          data: new Date().toISOString(),
          avaria_descricao: avariaResolvida.descricao,
          avaria_foto: avariaResolvida.fotoUrl || '',
          observacao: 'Avaria marcada como consertada pelo supervisor'
        });
      }
      
      simulator.saveData('viaturas', viaturas);
    }
  } else {
    const docRef = db.collection('viaturas').doc(prefixo);
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (doc.exists) {
        const data = doc.data();
        const avarias = data.avarias_ativas || [];
        const avariaResolvida = avarias[avariaIndex];
        
        avarias.splice(avariaIndex, 1);
        
        const historico = data.historico || [];
        if (avariaResolvida) {
          historico.push({
            tipo: 'avaria_resolvida',
            data: new Date().toISOString(),
            avaria_descricao: avariaResolvida.descricao,
            avaria_foto: avariaResolvida.fotoUrl || '',
            observacao: 'Avaria marcada como consertada pelo supervisor'
          });
        }
        
        transaction.update(docRef, { 
          avarias_ativas: avarias,
          historico: historico
        });
      }
    });
  }
}

/**
 * Cadastra um novo agente operacional no sistema
 */
async function adicionarAgente(matricula, nome) {
  const novoAgente = {
    matricula,
    nome,
    ativo: true
  };
  
  if (isDemoMode) {
    const agentes = simulator.getData('agentes');
    if (!agentes[matricula]) {
      agentes[matricula] = novoAgente;
      simulator.saveData('agentes', agentes);
    } else {
      throw new Error("Este agente já está cadastrado!");
    }
  } else {
    const docRef = db.collection('agentes').doc(matricula);
    const doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set(novoAgente);
    } else {
      throw new Error("Este agente já está cadastrado!");
    }
  }
}

/**
 * Atualiza o estoque central central de um material específico
 */
async function atualizarPatioEstoque(materialId, quantidade) {
  if (isDemoMode) {
    const materiais = simulator.getData('materiais');
    if (materiais[materialId]) {
      materiais[materialId].quantidade_patio = quantidade;
      simulator.saveData('materiais', materiais);
    }
  } else {
    await db.collection('materiais').doc(materialId).update({
      quantidade_patio: quantidade
    });
  }
}

/**
 * Deleta uma viatura cadastrada do sistema
 */
async function deletarViatura(prefixo) {
  if (isDemoMode) {
    const viaturas = simulator.getData('viaturas');
    if (viaturas[prefixo]) {
      delete viaturas[prefixo];
      simulator.saveData('viaturas', viaturas);
    }
  } else {
    await db.collection('viaturas').doc(prefixo).delete();
  }
}

/**
 * Deleta um agente cadastrado do sistema
 */
async function deletarAgente(matricula) {
  if (isDemoMode) {
    const agentes = simulator.getData('agentes');
    if (agentes[matricula]) {
      delete agentes[matricula];
      simulator.saveData('agentes', agentes);
    }
  } else {
    await db.collection('agentes').doc(matricula).delete();
  }
}

/**
 * Deleta fisicamente um dispositivo autorizado do sistema
 */
async function deletarDispositivo(deviceUuid) {
  if (isDemoMode) {
    const dispositivos = simulator.getData('dispositivos') || {};
    if (dispositivos[deviceUuid]) {
      delete dispositivos[deviceUuid];
      simulator.saveData('dispositivos', dispositivos);
    }
  } else {
    await db.collection('dispositivos_autorizados').doc(deviceUuid).delete();
  }
}

/**
 * Realiza a baixa administrativa de um lote de rua (marca como quantidade_restante = 0 e baixa_administrativa: true)
 */
async function darBaixaLoteRua(checklistId, loteId, observacao = 'Baixa administrativa por perda/não localizado') {
  if (isDemoMode) {
    const checklists = simulator.getData('checklists');
    const checklist = checklists[checklistId];
    if (checklist && checklist.movimentacoes) {
      const idx = checklist.movimentacoes.findIndex(m => m.id === loteId);
      if (idx !== -1) {
        checklist.movimentacoes[idx].quantidade_restante = 0;
        checklist.movimentacoes[idx].baixa_administrativa = true;
        checklist.movimentacoes[idx].baixa_obs = observacao;
        checklist.movimentacoes[idx].baixa_data = new Date().toISOString();
        simulator.saveData('checklists', checklists);
      }
    }
  } else {
    const refChecklistRef = db.collection('checklists').doc(checklistId);
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(refChecklistRef);
      if (doc.exists) {
        const refData = doc.data();
        const refMovs = refData.movimentacoes || [];
        const idx = refMovs.findIndex(m => m.id === loteId);
        if (idx !== -1) {
          refMovs[idx].quantidade_restante = 0;
          refMovs[idx].baixa_administrativa = true;
          refMovs[idx].baixa_obs = observacao;
          refMovs[idx].baixa_data = new Date().toISOString();
          transaction.update(refChecklistRef, { movimentacoes: refMovs });
        }
      }
    });
  }
}

/**
 * Escuta reativamente todas as viaturas cadastradas
 */
function listenTodasViaturas(callback) {
  if (isDemoMode) {
    return simulator.subscribe('viaturas', null, (data) => {
      callback(data);
    });
  } else {
    return db.collection('viaturas').onSnapshot(snapshot => {
      const viaturas = [];
      snapshot.forEach(doc => viaturas.push(doc.data()));
      callback(viaturas);
    });
  }
}

/**
 * Escuta reativamente todos os checklists registrados
 */
function listenTodosChecklists(callback) {
  if (isDemoMode) {
    return simulator.subscribe('checklists', null, (data) => {
      // Ordenar por data de abertura decrescente
      const ordenado = [...data].sort((a, b) => new Date(b.abertura?.data) - new Date(a.abertura?.data));
      callback(ordenado);
    });
  } else {
    return db.collection('checklists').orderBy('abertura.data', 'desc').onSnapshot(snapshot => {
      const checklists = [];
      snapshot.forEach(doc => checklists.push(doc.data()));
      callback(checklists);
    });
  }
}

/**
 * Escuta em tempo real o status de autorização do dispositivo.
 * Retorna o objeto do dispositivo se cadastrado, ou null se não cadastrado.
 */
function verificarDispositivo(deviceUuid, callback) {
  if (isDemoMode) {
    return simulator.subscribe('dispositivos', deviceUuid, callback);
  } else {
    return db.collection('dispositivos_autorizados').doc(deviceUuid).onSnapshot(doc => {
      callback(doc.exists ? doc.data() : null);
    }, error => {
      console.error("Erro ao escutar dispositivo:", error);
      callback(null);
    });
  }
}

/**
 * Valida o código de ativação de 6 dígitos. Se for válido, registra o UUID
 * do dispositivo como 'autorizado' e exclui/marca o código como usado.
 */
async function registrarDispositivoPeloCodigo(deviceUuid, codigoAtivacao, nomeDispositivo) {
  if (!codigoAtivacao || codigoAtivacao.trim().length !== 6) {
    throw new Error("Código de ativação inválido. Deve possuir 6 dígitos.");
  }
  if (!nomeDispositivo || !nomeDispositivo.trim()) {
    throw new Error("Por favor, dê um nome para este aparelho.");
  }

  const cod = codigoAtivacao.trim();
  const nome = nomeDispositivo.trim();

  if (isDemoMode) {
    const codigos = simulator.getData('codigos_ativacao') || {};
    const codDoc = codigos[cod];

    if (!codDoc) {
      throw new Error("Código de ativação não encontrado.");
    }
    if (codDoc.expira_em < Date.now()) {
      // Remover expirado
      delete codigos[cod];
      simulator.saveData('codigos_ativacao', codigos);
      throw new Error("Este código de ativação já expirou!");
    }

    // Excluir código consumido
    delete codigos[cod];
    simulator.saveData('codigos_ativacao', codigos);

    // Cadastrar dispositivo
    const dispositivos = simulator.getData('dispositivos') || {};
    dispositivos[deviceUuid] = {
      uuid: deviceUuid,
      nome: nome,
      status: 'autorizado',
      data_cadastro: new Date().toISOString(),
      codigo_usado: cod
    };
    simulator.saveData('dispositivos', dispositivos);

    // Vincular UID de demonstração
    const uids = simulator.getData('uids_autorizados') || {};
    uids['demo_uid'] = {
      device_uuid: deviceUuid,
      status: 'autorizado',
      data_cadastro: new Date().toISOString()
    };
    simulator.saveData('uids_autorizados', uids);

    return true;
  } else {
    if (!auth.currentUser) {
      throw new Error("Sessão de usuário não inicializada. Tente recarregar a página.");
    }
    const codRef = db.collection('codigos_ativacao').doc(cod);
    const devRef = db.collection('dispositivos_autorizados').doc(deviceUuid);
    const uidRef = db.collection('uids_autorizados').doc(auth.currentUser.uid);

    return db.runTransaction(async (transaction) => {
      const codDoc = await transaction.get(codRef);
      if (!codDoc.exists) {
        throw new Error("Código de ativação inválido ou não encontrado.");
      }
      
      const codData = codDoc.data();
      const expira = codData.expira_em; // timestamp numérico ou do Firebase
      const expiraMs = typeof expira === 'number' ? expira : (expira.toMillis ? expira.toMillis() : Date.parse(expira));
      
      if (expiraMs < Date.now()) {
        transaction.delete(codRef);
        throw new Error("Este código de ativação já expirou!");
      }

      // Excluir código
      transaction.delete(codRef);

      // Registrar dispositivo
      transaction.set(devRef, {
        uuid: deviceUuid,
        nome: nome,
        status: 'autorizado',
        data_cadastro: new Date().toISOString(),
        codigo_usado: cod
      });

      // Vincular UID de Autenticação ao dispositivo
      transaction.set(uidRef, {
        device_uuid: deviceUuid,
        status: 'autorizado',
        data_cadastro: new Date().toISOString()
      });

      return true;
    });
  }
}

/**
 * Gera um código temporário de 6 dígitos que expira em 10 minutos
 */
async function gerarCodigoAtivacao() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiraEm = Date.now() + 10 * 60 * 1000; // 10 minutos de validade

  if (isDemoMode) {
    const codigos = simulator.getData('codigos_ativacao') || {};
    codigos[code] = {
      codigo: code,
      criado_em: Date.now(),
      expira_em: expiraEm
    };
    simulator.saveData('codigos_ativacao', codigos);
    return code;
  } else {
    await db.collection('codigos_ativacao').doc(code).set({
      codigo: code,
      criado_em: firebase.firestore.FieldValue.serverTimestamp(),
      expira_em: expiraEm
    });
    return code;
  }
}

/**
 * Escuta em tempo real todos os dispositivos cadastrados
 */
function listenDispositivos(callback) {
  if (isDemoMode) {
    return simulator.subscribe('dispositivos', null, (data) => {
      // Ordenar por data de cadastro decrescente
      const ordenado = [...data].sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro));
      callback(ordenado);
    });
  } else {
    return db.collection('dispositivos_autorizados').orderBy('data_cadastro', 'desc').onSnapshot(snapshot => {
      const lista = [];
      snapshot.forEach(doc => lista.push(doc.data()));
      callback(lista);
    }, error => {
      console.error("Erro ao escutar todos os dispositivos:", error);
    });
  }
}

/**
 * Revoga temporariamente ou permanentemente o acesso do dispositivo
 */
async function revogarDispositivo(deviceUuid) {
  if (isDemoMode) {
    const dispositivos = simulator.getData('dispositivos') || {};
    if (dispositivos[deviceUuid]) {
      dispositivos[deviceUuid].status = 'revogado';
      simulator.saveData('dispositivos', dispositivos);
    }
  } else {
    await db.collection('dispositivos_autorizados').doc(deviceUuid).update({
      status: 'revogado'
    });
  }
}

/**
 * Re-autoriza um dispositivo bloqueado
 */
async function autorizarDispositivo(deviceUuid, nome) {
  if (isDemoMode) {
    const dispositivos = simulator.getData('dispositivos') || {};
    dispositivos[deviceUuid] = {
      ...dispositivos[deviceUuid],
      uuid: deviceUuid,
      nome: nome || dispositivos[deviceUuid]?.nome || "Dispositivo Reautorizado",
      status: 'autorizado',
      data_cadastro: dispositivos[deviceUuid]?.data_cadastro || new Date().toISOString()
    };
    simulator.saveData('dispositivos', dispositivos);
  } else {
    await db.collection('dispositivos_autorizados').doc(deviceUuid).set({
      uuid: deviceUuid,
      nome: nome || "Dispositivo Reautorizado",
      status: 'autorizado',
      data_cadastro: new Date().toISOString()
    }, { merge: true });
  }
}

/**
 * Escuta reativamente os códigos de ativação pendentes do supervisor
 */
function listenCodigosAtivacaoAtivos(callback) {
  if (isDemoMode) {
    return simulator.subscribe('codigos_ativacao', null, (data) => {
      const ativos = data.filter(c => c.expira_em > Date.now());
      callback(ativos);
    });
  } else {
    return db.collection('codigos_ativacao').onSnapshot(snapshot => {
      const lista = [];
      const agora = Date.now();
      snapshot.forEach(doc => {
        const item = doc.data();
        if (item.expira_em > agora) {
          lista.push(item);
        }
      });
      callback(lista);
    });
  }
}

/**
 * Cria um backup completo do banco de dados (JSON) contendo todas as tabelas
 */
async function backupBancoDeDados() {
  if (isDemoMode) {
    return {
      backup_timestamp: new Date().toISOString(),
      modo: 'demo',
      dados: {
        materiais: simulator.getData('materiais'),
        agentes: simulator.getData('agentes'),
        viaturas: simulator.getData('viaturas'),
        checklists: simulator.getData('checklists'),
        dispositivos: simulator.getData('dispositivos'),
        codigos_ativacao: simulator.getData('codigos_ativacao'),
        supervisores: simulator.getData('supervisores'),
        uids_autorizados: simulator.getData('uids_autorizados')
      }
    };
  } else {
    const collections = [
      'materiais',
      'agentes',
      'viaturas',
      'checklists',
      'dispositivos_autorizados',
      'codigos_ativacao',
      'supervisores',
      'uids_autorizados'
    ];
    
    const dados = {};
    for (const collName of collections) {
      try {
        const snap = await db.collection(collName).get();
        const docList = {};
        snap.forEach(doc => {
          docList[doc.id] = doc.data();
        });
        dados[collName] = docList;
      } catch (err) {
        console.error(`Erro ao fazer backup da coleção ${collName}:`, err);
      }
    }
    
    return {
      backup_timestamp: new Date().toISOString(),
      modo: 'cloud',
      dados: dados
    };
  }
}

/**
 * Restaura todos os dados do banco a partir de um objeto de backup carregado
 */
async function restaurarBancoDeDados(backupObj) {
  if (!backupObj || !backupObj.dados) {
    throw new Error("Arquivo de backup inválido ou corrompido!");
  }

  const { dados } = backupObj;
  
  if (isDemoMode) {
    if (dados.materiais) simulator.saveData('materiais', dados.materiais);
    if (dados.agentes) simulator.saveData('agentes', dados.agentes);
    if (dados.viaturas) simulator.saveData('viaturas', dados.viaturas);
    if (dados.checklists) simulator.saveData('checklists', dados.checklists);
    if (dados.dispositivos) simulator.saveData('dispositivos', dados.dispositivos);
    if (dados.codigos_ativacao) simulator.saveData('codigos_ativacao', dados.codigos_ativacao);
    if (dados.supervisores) simulator.saveData('supervisores', dados.supervisores);
    if (dados.uids_autorizados) simulator.saveData('uids_autorizados', dados.uids_autorizados);
    return true;
  } else {
    const collections = [
      'materiais',
      'agentes',
      'viaturas',
      'checklists',
      'dispositivos_autorizados',
      'codigos_ativacao',
      'supervisores',
      'uids_autorizados'
    ];

    const normalizarChave = (key) => {
      if (key === 'dispositivos') return 'dispositivos_autorizados';
      return key;
    };

    // 1. Limpar dados existentes de forma segura
    for (const collName of collections) {
      try {
        const snap = await db.collection(collName).get();
        const deletePromises = [];
        snap.forEach(doc => {
          deletePromises.push(db.collection(collName).doc(doc.id).delete());
        });
        await Promise.all(deletePromises);
      } catch (err) {
        console.error(`Erro ao limpar coleção ${collName} para restauração:`, err);
      }
    }

    // 2. Gravar os novos dados restaurados
    const writePromises = [];
    for (const [key, docList] of Object.entries(dados)) {
      const collName = normalizarChave(key);
      if (!collections.includes(collName)) continue;
      
      for (const [docId, docData] of Object.entries(docList || {})) {
        writePromises.push(db.collection(collName).doc(docId).set(docData));
      }
    }
    
    await Promise.all(writePromises);
    return true;
  }
}

window.FirebaseApp = {
  listenViatura,
  listenMateriais,
  adicionarMaterialCustom,
  getAgentes,
  loginAgenteAnomino,
  abrirChecklist,
  listenChecklist,
  registrarMovimentacao,
  alterarIntegrantes,
  fecharChecklist,
  isDemoMode,
  db,
  auth,
  storage,
  loginSupervisor,
  registrarTrocaOleo,
  atualizarViaturaStatus,
  adicionarViatura,
  resolverAvaria,
  adicionarAgente,
  atualizarPatioEstoque,
  deletarViatura,
  deletarAgente,
  deletarDispositivo,
  listenTodasViaturas,
  listenTodosChecklists,
  darBaixaLoteRua,
  deletarMaterial,
  uploadFoto,
  adicionarSupervisor,
  verificarDispositivo,
  registrarDispositivoPeloCodigo,
  gerarCodigoAtivacao,
  listenDispositivos,
  revogarDispositivo,
  autorizarDispositivo,
  listenCodigosAtivacaoAtivos,
  backupBancoDeDados,
  restaurarBancoDeDados
};

})();
