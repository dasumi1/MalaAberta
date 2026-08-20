import './style.css';

// Precos oficiais do Gemini 3.7 Flash, em dolares por milhao de tokens.
const PRECO_ENTRADA = 0.10;
const PRECO_SAIDA = 0.40;

let custoDaSessao = 0;

const botao = document.getElementById('gerar');
const aviso = document.getElementById('aviso');

botao.addEventListener('click', montarMala);

async function montarMala() {
 const dadosDaViagem = {
 destino: document.getElementById('destino').value.trim(),
 dias: document.getElementById('dias').value,
 motivo: document.getElementById('motivo').value,
 clima: document.getElementById('clima').value
 };

 if (!dadosDaViagem.destino) {
 aviso.textContent = 'Informe o destino para continuar.';
 return;
 }

 botao.disabled = true;
 botao.textContent = 'Montando...';
 aviso.textContent = '';

 try {
 const resposta = await fetch('/api/gerar-lista', {
 method: 'POST',
 headers: { 'content-type': 'application/json' },
 body: JSON.stringify(dadosDaViagem)
 });

 const dados = await resposta.json();

 if (!resposta.ok) {
 aviso.textContent = dados.erro;
 return;
 }

 mostrarLista(dados.lista, dadosDaViagem);
 mostrarMedicao(dados.uso, dados.modelo);
 } catch (erro) {
 aviso.textContent = 'Sem resposta do servidor. Verifique a conexao e tente de novo.';
 } finally {
 botao.disabled = false;
 botao.textContent = 'Montar a mala';
 }
}

function mostrarLista(lista, viagem) {
 document.getElementById('carimbo').textContent = `${viagem.destino} · ${viagem.dias}d`;
 document.getElementById('resumo').textContent = lista.resumo;

 const areaCategorias = document.getElementById('categorias');
 areaCategorias.innerHTML = '';

 lista.categorias.forEach((categoria) => {
 const bloco = document.createElement('div');
 bloco.className = 'categoria';

 const titulo = document.createElement('h3');
 titulo.textContent = categoria.nome;
 bloco.appendChild(titulo);

 const itens = document.createElement('ul');
 categoria.itens.forEach((entrada) => {
 const linha = document.createElement('li');
 linha.innerHTML = `<span></span><span class="qtd"></span>`;
 linha.children[0].textContent = entrada.item;
 linha.children[1].textContent = entrada.quantidade;
 itens.appendChild(linha);
 });

 bloco.appendChild(itens);
 areaCategorias.appendChild(bloco);
 });

 const areaLembretes = document.getElementById('lembretes');
 areaLembretes.innerHTML = '';

 (lista.lembretes || []).forEach((texto) => {
 const item = document.createElement('li');
 item.textContent = texto;
 areaLembretes.appendChild(item);
 });

 document.getElementById('resultado').hidden = false;
}

function mostrarMedicao(uso, modelo) {
 if (!uso) return;
 const tokensEntrada = Number(uso.tokens_entrada || 0);
 const tokensSaida = Number(uso.tokens_saida || 0);

 const custoEntrada = (tokensEntrada / 1000000) * PRECO_ENTRADA;
 const custoSaida = (tokensSaida / 1000000) * PRECO_SAIDA;
 const custoDaChamada = custoEntrada + custoSaida;
 custoDaSessao += custoDaChamada;

 document.getElementById('m-modelo').textContent = modelo || 'gemini-3.6-flash';
 document.getElementById('m-entrada').textContent = tokensEntrada;
 document.getElementById('m-saida').textContent = tokensSaida;
 document.getElementById('m-custo-entrada').textContent = emDolar(custoEntrada);
 document.getElementById('m-custo-saida').textContent = emDolar(custoSaida);
 document.getElementById('m-custo-total').textContent = emDolar(custoDaChamada);
 document.getElementById('m-sessao').textContent = emDolar(custoDaSessao);
 document.getElementById('medicao').hidden = false;
}

function emDolar(valor) {
 return `US$ ${valor.toFixed(6)}`;
}
