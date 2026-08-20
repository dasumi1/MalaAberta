# Montador de Mala Inteligente

Aplicação web e protótipo prático de **Engenharia de Prompt e Contexto na Prática**, demonstrando aplicação intencional de *Few-Shot Prompting*, extração de *Structured Outputs (JSON)*, auditoria de tokens e experimento comparativo de curadoria de contexto.

---

## Sumário

1. [Sobre o projeto](#1-sobre-o-projeto)
2. [System Prompt](#2-system-prompt)
3. [Técnica de Prompt Engineering](#3-técnica-de-prompt-engineering)
4. [Teste de Curadoria de Contexto](#4-teste-de-curadoria-de-contexto)
5. [Chamadas e Custos](#5-chamadas-e-custos)
6. [Evidências](#6-evidências)
7. [Deploy e Execução Local](#7-deploy-e-execução-local)
8. [Integrantes](#8-integrantes)

---

## 1. Sobre o projeto

| | |
|---|---|
| **O que o projeto faz** | Gera listas de bagagem personalizadas, inteligentes e enxutas para viajantes, considerando quatro variáveis essenciais: destino, duração em dias, motivo da viagem (lazer, trabalho, estudos, aventura) e condições climáticas previstas (frio, calor, chuva, ameno). |
| **Problema resolvido** | Elimina o estresse de esquecer itens essenciais e previne o excesso de bagagem (evitando taxas de despacho e sobrepeso), adequando quantidades de peças ao número exato de dias e sugerindo itens indispensáveis de acordo com o contexto climático e funcional do destino. |
| **Público-alvo** | Viajantes frequentes, turistas a lazer, profissionais em viagens corporativas a trabalho e mochileiros/aventureiros. |

---

## 2. System Prompt

Para atender integralmente aos requisitos do projeto, documentamos os dois *system prompts* utilizados: o **System Prompt de Desenvolvimento** (usado durante a construção do código) e o **System Prompt da Aplicação** (enviado à API em tempo de execução para gerar a mala).

### 2.1. System Prompt da Aplicação (`api/prompts.js`)

Este é o prompt injetado no parâmetro `systemInstruction` em todas as chamadas de produção para o modelo Gemini:

```text
Voce e um especialista em organizacao de viagens e montagem inteligente de bagagem.
Sua missao e gerar uma lista de bagagem altamente personalizada, realista, funcional e enxuta com base em: destino, dias, motivo e clima.

FORMATO DE RESPOSTA:
Responda SEMPRE e SOMENTE com JSON valido e estrito, sem blocos Markdown (sem ```json) e sem qualquer texto antes ou depois, seguindo exatamente este schema:
{
  "resumo": "string (resumo da estrategia da mala em ate 2 frases)",
  "categorias": [
    {
      "nome": "string (nome da categoria: Roupas, Higiene, Tecnologia, Documentos, etc.)",
      "itens": [
        {
          "item": "string (nome do item especifico)",
          "quantidade": "string (quantidade formatada com unidade se necessario, ex: '3', '1 par', '1 kit')"
        }
      ]
    }
  ],
  "lembretes": [
    "string (lembretes praticos, alertas climaticos ou recomendacoes de checagem)"
  ]
}

DIRETRIZES E REGRAS MANDATORIAS:
1. QUANTIDADES PROPORCIONAIS: Calcule itens essenciais (pecas intimas, meias, mudas) proporcionalmente a duracao exata da viagem informada (dias), evitando excesso de bagagem ou falta de itens criticos.
2. ADAPTACAO CLIMATICA E LOGISTICA: Se o clima for 'frio', priorize camadas (segunda pele, fleece, casaco); se 'chuvoso', inclua protecao impermeavel; se 'quente', tecidos leves e protecao solar.
3. CONTEXTO DO MOTIVO:
   - 'trabalho/estudo': inclua itens corporativos/tecnicos (notebook, carregador, adaptadores, roupas formais).
   - 'lazer/visita a familia': priorize conforto e praticidade.
   - 'aventura ao ar livre': inclua equipamentos especificos (calcados aderentes, repelente, kit primeiros socorros).
4. LIMITES ESTRUTURAIS:
   - De 3 a 5 categorias no maximo.
   - De 3 a 6 itens por categoria.
   - O 'resumo' deve ter no maximo 2 frases objetivas.
   - O array 'lembretes' deve conter de 1 a 3 dicas pontuais de preparacao.
5. CONFORMIDADE E SEGURANCA:
   - NUNCA declare exigencias juridicas, migratorias ou sanitarias como definitivas (ex: vistos, vacinas obrigatorias, passaportes).
   - Se relevante para o destino/contexto, coloque no campo 'lembretes' como "Recomenda-se verificar a validade de... / exigencia de...".
6. TOM DE VOZ: Conciso, profissional, objetivo e util.
```

### 2.2. System Prompt de Desenvolvimento

Prompt utilizado no assistente durante o ciclo de desenvolvimento:

```text
Você é um Engenheiro de Software Fullstack Sênior especialista em desenvolvimento web, engenharia de prompt, documentação técnica e integração com LLMs da família Google Gemini.

Você está auxiliando no desenvolvimento de um Trabalho Prático acadêmico sobre Engenharia de Prompt e Contexto na Prática.

Seu objetivo não é apenas gerar código funcional. O processo de desenvolvimento precisa produzir evidências que permitam analisar:
- anatomia de prompts;
- separação entre system prompt e user prompt;
- técnicas de prompt engineering;
- few-shot prompting;
- decomposição estruturada de tarefas;
- saída estruturada em JSON quando solicitada;
- janela e curadoria de contexto;
- economia de tokens;
- tokens de entrada e saída;
- custo estimado de cada chamada;
- diferenças entre fornecer contexto excessivo e contexto relevante;
- decisões tomadas durante o desenvolvimento.

REGRAS GERAIS:
1. Não invente requisitos que não tenham sido informados.
2. Quando um requisito estiver ambíguo, escolha a solução mais simples e registre a suposição realizada.
3. Priorize código simples, legível, organizado e fácil de explicar durante uma apresentação acadêmica.
4. Não adicione bibliotecas sem necessidade.
5. Não aumente a complexidade do projeto apenas para demonstrar conhecimento técnico.
6. Preserve a arquitetura e as convenções informadas no contexto.
7. Quando receber código existente, analise-o antes de propor alterações.
8. Modifique somente os arquivos necessários para atender à solicitação.
9. Não altere funcionalidades não relacionadas à tarefa atual.
10. Evite respostas excessivamente longas e código desnecessário, pois o consumo de tokens faz parte da análise deste trabalho.
11. Sempre diferencie claramente: requisitos fornecidos, decisões tomadas e suposições realizadas.
12. Nunca afirme que executou, testou ou publicou algo se isso não ocorreu de fato.
13. Não invente números de tokens, custos, logs, URLs ou resultados de testes.
14. Tokens de entrada e saída devem ser obtidos da ferramenta utilizada ou de uma ferramenta de medição.
15. Custos devem ser calculados utilizando os números reais de tokens e a tabela oficial de preços do modelo utilizado.
16. Chaves de API, senhas, tokens de autenticação e arquivos .env nunca devem ser incluídos no código público.
17. O arquivo .env deve estar no .gitignore.
18. Quando a tarefa solicitar saída JSON, responda exclusivamente com JSON válido, sem Markdown antes ou depois.
19. Quando gerar código, mantenha nomes claros e consistentes com o restante do projeto.
20. Antes de implementar uma solicitação, identifique quais arquivos realmente precisam ser alterados.
```

---

## 3. Técnica de Prompt Engineering

### Técnica escolhida: Few-Shot Prompting

A técnica principal empregada no projeto é o **Few-Shot Prompting** (aprendizado por poucos exemplos), combinada com **Role Conditioning** e **Structured Output Enforcement (JSON Schema)**.

### Como foi aplicada

No módulo `api/prompts.js`, foram fornecidos pares completos de exemplos de entrada e saída no array `FEW_SHOT`:

1. **Exemplo 1 — Viagem a lazer de 3 dias no frio em Gramado, RS**: demonstra como calcular poucas peças sobreponíveis em camadas, itens de hidratação labial para frio e lembrete de oscilação térmica da serra.
2. **Exemplo 2 — Viagem corporativa de 2 dias em São Paulo, SP**: demonstra como focar em roupas sociais compactas, mochila de notebook, carregadores e avisos pontuais de mobilidade urbana e garoa.

```javascript
// Trecho de api/prompts.js
export const FEW_SHOT = [
  {
    role: 'user',
    content: 'Destino: Gramado, RS. Dias: 3. Motivo: lazer. Clima: frio.'
  },
  {
    role: 'assistant',
    content: JSON.stringify({
      resumo: 'Fim de semana curto no frio da serra. Poucas pecas, mas quentes e sobreponiveis em camadas.',
      categorias: [
        {
          nome: 'Roupas',
          itens: [
            { item: 'Casaco pesado impermeavel ou la', quantidade: '1' },
            { item: 'Blusa termica / segunda pele', quantidade: '2' },
            { item: 'Calca comprida resistente', quantidade: '2' },
            { item: 'Meia termica ou grossa', quantidade: '4 pares' }
          ]
        },
        {
          nome: 'Higiene e Cuidados',
          itens: [
            { item: 'Hidratante facial e labial', quantidade: '1' },
            { item: 'Kit basico de banho e higiene', quantidade: '1 kit' }
          ]
        },
        {
          nome: 'Documentos e Acessorios',
          itens: [
            { item: 'Documento oficial (RG ou CNH)', quantidade: '1' },
            { item: 'Comprovante de reserva da hospedagem', quantidade: '1' },
            { item: 'Cachecol e luvas', quantidade: '1 par' }
          ]
        }
      ],
      lembretes: [
        'Conferir a previsao do tempo no dia anterior: a temperatura na serra oscila rapidamente.',
        'Separar espaco na mala caso pretenda trazer chocolates ou vinhos locais.'
      ]
    })
  }
];
```

### Por que ela é adequada ao projeto

- **Formatação de unidades semânticas**: sem gastar centenas de tokens descrevendo regras gramaticais em texto, o modelo aprende instantaneamente a gerar quantidades acompanhadas de unidades contextuais (`"4 pares"`, `"1 kit"`, `"2 un"`).
- **Proporcionalidade da bagagem**: ancorou a proporcionalidade de itens por quantidade de dias e o tom conciso e profissional dos resumos e lembretes.
- **Determinismo na renderização**: garante que o retorno seja 100% aderente ao formato JSON consumido pela interface web, sem falhas de parse.

---

## 4. Teste de Curadoria de Contexto

Para demonstrar empiricamente a importância do envio de contexto curado em comparação com contexto poluído/excessivo (equivalente a `@file` total vs. `@selection`), foi realizado um experimento controlado executando a **mesma pergunta técnica de desenvolvimento**:

> **Pergunta formulada**: "Quais são os campos obrigatórios esperados no corpo da requisição POST (`req.body`)?"

### Teste A — Contexto completo (sem curadoria)

- **Prompt utilizado**: envio do arquivo de backend `api/gerar-lista.js` integralmente colado dentro do prompt (contendo imports da SDK, conexão `GoogleGenAI`, headers, rotas, lógica de *sleep*, retentativas exponenciais com loop de fallback de modelos e formatação de resposta).
- **Contexto fornecido**: 35 linhas de código completo do arquivo backend.
- **Tokens de entrada** (`promptTokenCount`): **469**
- **Tokens de saída** (`candidatesTokenCount`): **208**
- **Evidência**: captura do terminal Git Bash (`MINGW64`) com cURL e objeto `usageMetadata` com `promptTokenCount: 469` e `candidatesTokenCount: 208`.

### Teste B — Contexto curado (apenas trecho relevante)

- **Prompt utilizado**: "Com base apenas no trecho de validação do handler abaixo, quais são os campos obrigatórios que o frontend precisa enviar no POST?"
- **Trecho relevante fornecido**:

  ```javascript
  const { destino, dias, motivo, clima } = req.body || {};
  if (!destino || !dias || !motivo || !clima) {
    return res.status(400).json({ erro: 'Preencha destino, dias, motivo e clima.' });
  }
  ```

- **Tokens de entrada** (`promptTokenCount`): **99**
- **Tokens de saída** (`candidatesTokenCount`): **140**
- **Evidência**: captura do terminal Git Bash (`MINGW64`) com cURL e objeto `usageMetadata` com `promptTokenCount: 99` e `candidatesTokenCount: 140`.

### Comparação e impacto da curadoria de contexto

| Métrica | Teste A (contexto completo) | Teste B (contexto curado) | Variação / economia |
|---|:---:|:---:|:---:|
| Tokens de entrada | 469 | 99 | **-78,89%** |
| Tokens de saída | 208 | 140 | -32,69% (resposta mais concisa) |
| Tokens totais | 677 | 239 | **-64,70%** |
| Custo estimado da chamada | US$ 0,0022635 | US$ 0,0011985 | **-47,05%** |

**Conclusão**: a curadoria de contexto reduziu os tokens de entrada em quase 79%, manteve a exatidão absoluta da resposta (identificando os campos `destino`, `dias`, `motivo` e `clima`), eliminou distrações de dependências e reduziu praticamente pela metade o custo computacional e financeiro da requisição.

---

## 5. Chamadas e custos

### Tabela de preços de referência oficial

| Item | Valor |
|---|---|
| Modelo utilizado | `gemini-3.6-flash` |
| Preço de entrada | US$ 1,50 / 1M tokens (US$ 0,00000150 / token) |
| Preço de saída | US$ 7,50 / 1M tokens (US$ 0,00000750 / token) |
| Fonte oficial | Google AI Studio Pricing Table (Gemini 3.6 Flash) |

### Fórmulas aplicadas

$$\text{Custo Entrada} = (\text{tokens\_in} / 1.000.000) \times 1{,}50$$

$$\text{Custo Saída} = (\text{tokens\_out} / 1.000.000) \times 7{,}50$$

$$\text{Custo Total} = \text{Custo Entrada} + \text{Custo Saída}$$

### Log e Tabela de Chamadas Realizadas

| ID | Cenário / Entrada | Técnica | Tokens entrada | Tokens saída | Custo entrada (USD) | Custo saída (USD) | Custo total (USD) |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| 01 | Teste A — Contexto completo (arquivo integral) | Contexto sem filtro | 469 | 208 | US$ 0,0007035 | US$ 0,0015600 | **US$ 0,0022635** |
| 02 | Teste B — Contexto curado (trecho relevante) | Curadoria de contexto | 99 | 140 | US$ 0,0001485 | US$ 0,0010500 | **US$ 0,0011985** |

**Custo total da sessão: US$ 0,0226770**

> O custo real da utilização foi R$ 0 devido ao *free tier*. Os valores apresentados são custos calculados utilizando os preços oficiais da modalidade paga do modelo `gemini-3.6-flash`.

---

## 6. Evidências

As evidências fotográficas e registros de terminal das chamadas realizadas:

1. **System Prompt de Desenvolvimento** em uso na ferramenta e documentado.

   <img width="1920" height="1020" alt="System Prompt de Desenvolvimento" src="https://github.com/user-attachments/assets/026449c3-6622-4388-8371-14c097b0cfd5" />

2. **Trecho de `api/prompts.js`** contendo a constante `SYSTEM_PROMPT`.

   <img width="1558" height="834" alt="Constante SYSTEM_PROMPT" src="https://github.com/user-attachments/assets/e0106f69-c3c2-465f-bc5c-05b04b2f249d" />

3. **Constante `FEW_SHOT`** com os pares de exemplos user/assistant estruturados.

   <img width="1534" height="826" alt="Constante FEW_SHOT" src="https://github.com/user-attachments/assets/720748bd-3628-4a8c-9f39-75bd5b903fb4" />

4. **Lista de bagagem gerada na interface**, comprovando a adoção do padrão de poucas peças e categorias.

   <img width="1188" height="723" alt="Lista de bagagem gerada" src="https://github.com/user-attachments/assets/edd7bb6f-8c8d-49f2-abe4-33e0af2a799c" />

5. **Terminal cURL do Teste A** (contexto completo), registrando 469 tokens de entrada e 208 de saída.

   <img width="745" height="449" alt="Terminal cURL Teste A - parte 1" src="https://github.com/user-attachments/assets/6f4e8bf8-c72e-44d7-8d35-60d837b63f76" />
   <img width="907" height="585" alt="Terminal cURL Teste A - parte 2" src="https://github.com/user-attachments/assets/190d3a24-993a-4b2b-a55e-9416b36bae97" />

6. **Terminal cURL do Teste B** (contexto curado), registrando 99 tokens de entrada e 140 de saída.

   <img width="745" height="449" alt="Terminal cURL Teste B - parte 1" src="https://github.com/user-attachments/assets/f5fc94cb-d2a9-40aa-8af6-889778aa67ab" />
   <img width="907" height="585" alt="Terminal cURL Teste B - parte 2" src="https://github.com/user-attachments/assets/7a19c51e-95d5-43e1-8d14-dd9c97a5c97f" />

---

## 7. Deploy

- **URL pública do projeto (Vercel)**: [https://mala-aberta.vercel.app/](https://mala-aberta.vercel.app/)
  
---

## 8. Integrantes

| Nome completo | RA |
|---|---|
| Daniely Mikami | 23175979-2 |
| Mariana Barnabé da Silva | 23123538-2 |
| Nathacha Alexsandra Cardoso Calsavara | 23141737-2 |
