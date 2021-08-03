// APP MODAL
const AppModal = {
   bt_abrir: document.querySelector('#abrir-modal'),
   bt_fechar: document.querySelector('#fechar-modal'),
   modal: document.querySelector('.modal-overlay'),

   iniciar() {
      AppModal.bt_abrir.addEventListener('click', () => {
         AppModal.modal.classList.add('ativo');
      });
      AppModal.bt_fechar.addEventListener('click', () => {
         AppModal.modal.classList.remove('ativo');
      });
   },

   abrir() {
      AppModal.modal.classList.add('ativo');
   },
   fechar() {
      AppModal.modal.classList.remove('ativo');
   },
}
AppModal.iniciar();




// APP TRANSACOES
const Storage = {
   pega() {
      return JSON.parse(localStorage.getItem('dev.financas:transacoes')) || [];
   },

   envia(transacoes) {
      localStorage.setItem('dev.financas:transacoes', JSON.stringify(transacoes));
   }
}

const Transacao = {
   all: Storage.pega(),

   add(transacao) {
      Transacao.all.push(transacao);
      Aplicacao.recarrega();
   },

   remove(index) {
      Transacao.all.splice(index, 1);
      Aplicacao.recarrega();
   },

   entradas() {
      let entrada = 0;
      // pegar todas as transações
      // para cada transacao, 
      Transacao.all.forEach(transacao => {
         // se for maior que zero
         if( transacao.quantia > 0 ) {
            // somar a uma variavel e retornar variavel
            entrada += transacao.quantia;
         }
      });
      return entrada;
   },

   saidas() {
      let saida = 0;
      // pegar todas as transações
      // para cada transacao, 
      Transacao.all.forEach(transacao => {
         // se for maior que zero
         if( transacao.quantia < 0 ) {
            // somar a uma variavel e retornar variavel
            saida += transacao.quantia;
         }
      });
      return saida;
   },

   total() {
      return Transacao.entradas() + Transacao.saidas();
   }
}

// DOM
const DOM = {
   transacaoContainer: document.querySelector('#data-tabela tbody'),

   // função para adicionaro html da transação
   addTransacao(transacao, index) {
      const tr = document.createElement('tr');
      tr.innerHTML = DOM.htmlTransacao(transacao, index);
      tr.setAttribute('data-index', index);
      tr.setAttribute('id', 'teste');

      DOM.transacaoContainer.appendChild(tr);
   },

   // função com html da transação
   htmlTransacao(transacao, index) {
      const CSSClasse = transacao.quantia > 0 ? 'entrada' : 'saida';
      const quantia = Utilidade.formatoMoeda(transacao.quantia);

      const html = `
         <td class="descricao">${transacao.descricao}</td>
         <td class="${CSSClasse}">${quantia}</td>
         <td class="data">${transacao.data}</td>
         <td>
            <img onclick="Transacao.remove(${index})" src="img/minus.svg" alt="Remover item" data-index="${index}">
         </td>
      `;
      return html;
   },

   // atualiza balanço
   atualizaBalanco() {
      document.querySelector('#mostraEntrada').innerHTML = Utilidade.formatoMoeda(Transacao.entradas());
      document.querySelector('#mostraSaida').innerHTML = Utilidade.formatoMoeda(Transacao.saidas());
      document.querySelector('#mostraTotal').innerHTML = Utilidade.formatoMoeda(Transacao.total());
   },

   limpaTransacoes() {
      DOM.transacaoContainer.innerHTML = '';
   },
}

//UTILIDADES
const Utilidade = {
   formatoMoeda(valor) {
      const sinal = Number(valor) < 0 ? '-' : '';
      valor = String(valor).replace(/\D/g, '');
      valor = Number(valor) / 100;
      valor = valor.toLocaleString('pt-BR', {
         style: 'currency',
         currency: 'BRL'
      })
      return sinal + valor;
   },

   formatoQuantia(valor) {
      valor = Number(valor) * 100;
      return Math.round(valor);
   },

   formatoData(data) {
      const separaData = data.split('-');
      return `${separaData[2]}/${separaData[1]}/${separaData[0]}`;
   },
}

// FORMULARIO
const Form = {
   formTransacao: document.querySelector('#form-transacao'),
   inputDescricao: document.querySelector('input#descricao'),
   inputQuantia: document.querySelector('input#valor'),
   inputData: document.querySelector('input#data'),

   pegaValores() {
      return {
         descricao: Form.inputDescricao.value,
         quantia: Form.inputQuantia.value,
         data: Form.inputData.value,
      }
   },

   validarCampos() {
      const {descricao, quantia, data} = Form.pegaValores();
      if( descricao.trim() === '' || quantia.trim() === '' || data.trim() === '' ) {
         throw new Error('Preencha todos os campos');
      }
   },

   formatarDados() {
      let {descricao, quantia, data} = Form.pegaValores();

      quantia = Utilidade.formatoQuantia(quantia);
      data = Utilidade.formatoData(data);

      return {
         descricao,
         quantia,
         data,
      }
   },

   limpaCampos() {
      Form.inputDescricao.value = ''
      Form.inputQuantia.value = ''
      Form.inputData.value = ''
   },

   enviar() {
      Form.formTransacao.addEventListener('submit', (evento) => {
         evento.preventDefault();

         try {
            // validar os campos
            Form.validarCampos();
            // formatar os dados para salvar
            const transacao = Form.formatarDados();
            // salvar
            Transacao.add(transacao);
            // apagar os dados do formulario
            Form.limpaCampos();
            // modal fechar
            AppModal.fechar();
            // atualizar a aplicação
         } catch (error) {
            alert(error.message);
         }
      });
   },
}

// APLICAÇÃO
const Aplicacao = {
   inicia() {
      Form.enviar(),
      // LOOP
      Transacao.all.forEach(DOM.addTransacao);
      DOM.atualizaBalanco();
      Storage.envia(Transacao.all);

   },

   recarrega() {
      DOM.limpaTransacoes();
      Aplicacao.inicia();
   },
}
Aplicacao.inicia();