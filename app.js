import './style.css';
import { SYSTEM_PROMPT, FEW_SHOT } from './api/prompts.js';

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
    let dados = null;

    // 1. Tenta chamar o backend (/api/gerar-lista)
    try {
      const resposta = await fetch('/api/gerar-lista', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(dadosDaViagem)
      });

      if (resposta.ok) {
        dados = await resposta.json();
      } else if (resposta.status !== 404) {
        const errJson = await resposta.json().catch(() => ({}));
        aviso.textContent = errJson.erro || 'Erro ao processar a lista.';
        return;
      }
    } catch (e) {
      // Backend inacessivel, tentara fallback cliente
    }

    // 2. Se o backend retornou 404 (ex: GitHub Pages estatico), executa via chamada direta ao Gemini
    if (!dados) {
      dados = await gerarListaDireta(dadosDaViagem);
    }

    if (!dados || !dados.lista) {
      aviso.textContent = 'Não foi possível gerar a lista. Verifique a conexão.';
      return;
    }

    mostrarLista(dados.lista, dadosDaViagem);
    mostrarMedicao(dados.uso, dados.modelo);
  } catch (erro) {
    aviso.textContent = erro.message || 'Sem resposta do servidor. Verifique a conexao e tente de novo.';
  } finally {
    botao.disabled = false;
    botao.textContent = 'Montar a mala';
  }
}

async function gerarListaDireta(viagem) {
  // Chave do ambiente Vite ou do localStorage para deploy estatico no GitHub Pages
  let apiKey = import.meta.env?.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');

  if (!apiKey) {
    apiKey = window.prompt('Para usar a versão estática no GitHub Pages, informe sua Chave de API do Google Gemini (ela ficará salva apenas no seu navegador):');
    if (apiKey) {
      apiKey = apiKey.trim();
      localStorage.setItem('gemini_api_key', apiKey);
    } else {
      throw new Error('Chave de API do Gemini é necessária para gerar a mala no GitHub Pages.');
    }
  }

  const promptUsuario = `Destino: ${viagem.destino}. Dias: ${viagem.dias}. Motivo: ${viagem.motivo}. Clima: ${viagem.clima}.`;

  const contents = [
    ...FEW_SHOT.map(ex => ({
      role: ex.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: ex.content }]
    })),
    {
      role: 'user',
      parts: [{ text: promptUsuario }]
    }
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!res.ok) {
    const erroData = await res.json().catch(() => ({}));
    if (res.status === 400 || res.status === 403) {
      localStorage.removeItem('gemini_api_key');
      throw new Error('Chave de API inválida ou sem permissão. Tente novamente.');
    }
    throw new Error(erroData.error?.message || 'Erro ao conectar à API do Gemini.');
  }

  const resData = await res.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const lista = JSON.parse(rawText);

  const usage = resData.usageMetadata || {};
  const tokensEntrada = Number(usage.promptTokenCount || 0);
  const tokensSaida = Number(usage.candidatesTokenCount || 0);

  return {
    lista,
    modelo: 'gemini-2.5-flash',
    uso: {
      tokens_entrada: tokensEntrada,
      tokens_saida: tokensSaida,
      tokens_total: tokensEntrada + tokensSaida
    }
  };
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
