import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_PROMPT, FEW_SHOT } from './prompts.js';

const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.7-flash'];

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function chamarGeminiComFallback(contents, schemaConfig) {
  let lastError = null;

  for (const modelo of CANDIDATE_MODELS) {
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      try {
        const response = await ai.models.generateContent({
          model: modelo,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: schemaConfig,
            temperature: 0.2,
          }
        });

        return { response, modeloUsado: modelo };
      } catch (err) {
        lastError = err;
        const msg = String(err?.message || '');
        const isTransient = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('RESOURCE_EXHAUSTED');
        
        console.warn(`Falha na tentativa ${tentativa} com modelo ${modelo}:`, msg);

        if (isTransient && tentativa === 1) {
          await sleep(1000);
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Use POST.' });
  }

  const { destino, dias, motivo, clima } = req.body || {};
  if (!destino || !dias || !motivo || !clima) {
    return res.status(400).json({ erro: 'Preencha destino, dias, motivo e clima.' });
  }

  const pergunta = `Destino: ${destino}. Dias: ${dias}. Motivo: ${motivo}. Clima: ${clima}.`;

  try {
    const contents = [
      ...FEW_SHOT.map((s) => ({
        role: s.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: s.content }]
      })),
      {
        role: 'user',
        parts: [{ text: pergunta }]
      }
    ];

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        resumo: {
          type: Type.STRING,
          description: 'Resumo curto da viagem em até 2 frases'
        },
        categorias: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nome: { type: Type.STRING },
              itens: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    quantidade: { type: Type.STRING }
                  },
                  required: ['item', 'quantidade']
                }
              }
            },
            required: ['nome', 'itens']
          }
        },
        lembretes: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['resumo', 'categorias', 'lembretes']
    };

    const { response, modeloUsado } = await chamarGeminiComFallback(contents, responseSchema);

    const texto = response.text || '{}';
    const lista = JSON.parse(texto);

    // Extração segura de tokens reais registrados na chamada
    const usage = response.usageMetadata || {};
    const tokensEntrada = Number(usage.promptTokenCount || 0);
    const tokensSaida = Number(usage.candidatesTokenCount || 0);

    return res.status(200).json({
      lista,
      modelo: modeloUsado,
      uso: {
        tokens_entrada: tokensEntrada,
        tokens_saida: tokensSaida,
        tokens_total: tokensEntrada + tokensSaida
      }
    });
  } catch (erro) {
    console.error('Erro na chamada Gemini:', erro);
    return res.status(502).json({
      erro: erro?.message || 'Nao foi possivel gerar a lista. Tente de novo.'
    });
  }
}
