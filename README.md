# Montador de Mala Inteligente

Aplicação web e protótipo prático de Engenharia de Prompt e Contexto na Prática, demonstrando aplicação intencional de *Few-Shot Prompting*, extração de *Structured Outputs (JSON)*, auditoria de tokens e experimento comparativo de curadoria de contexto.

---

## 1. Sobre o projeto

- **O que o projeto faz**: Gera listas de bagagem personalizadas, inteligentes e enxutas para viajantes, considerando quatro variáveis essenciais: destino, duração em dias, motivo da viagem (lazer, trabalho, estudos, aventura) e condições climáticas previstas (frio, calor, chuva, ameno).
- **Problema resolvido**: Elimina o estresse de esquecer itens essenciais e previne o excesso de bagagem (evitando taxas de despacho e sobrepeso), adequando quantidades de peças ao número exato de dias e sugerindo itens indispensáveis de acordo com o contexto climático e funcional do destino.
- **Público-alvo**: Viajantes frequentes, turistas a lazer, profissionais em viagens corporativas a trabalho e mochileiros/aventureiros.
- **Opção do trabalho escolhida**: Desenvolvimento de Protótipo com Engenharia de Prompt, Contexto Curado e Telemetria de Custos (Opção prática com consumo de API de LLM).

---

## 2. System Prompt

Para atender integralmente aos requisitos do projeto, documentamos os dois system prompts utilizados: o **System Prompt de Desenvolvimento** (usado durante a construção do código) e o **System Prompt da Aplicação** (enviado à API em tempo de execução para gerar a mala).

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

### Técnica Escolhida: Few-Shot Prompting
A técnica principal empregada no projeto é o **Few-Shot Prompting** (aprendizado por poucos exemplos), combinada com **Role Conditioning** e **Structured Output Enforcement (JSON Schema)**.

### Como foi aplicada:
No módulo `api/prompts.js`, foram fornecidos pares completos de exemplos de entrada e saída no array `FEW_SHOT`:
1. **Exemplo 1 (Viagem a lazer de 3 dias no frio em Gramado, RS)**: Demonstra como calcular poucas peças sobreponíveis em camadas, itens de hidratação labial para frio e lembrete de oscilação térmica da serra.
2. **Exemplo 2 (Viagem corporativa de 2 dias em São Paulo, SP)**: Demonstra como focar em roupas sociais compactas, mochila de notebook, carregadores e avisos pontuais de mobilidade urbana e garoa.

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

### Por que ela é adequada ao projeto:
- **Formatação de Unidades Semânticas**: Sem gastar centenas de tokens descrevendo regras gramaticais em texto, o modelo aprende instantaneamente a gerar quantidades acompanhadas de unidades contextuais (`"4 pares"`, `"1 kit"`, `"2 un"`).
- **Proporcionalidade da Bagagem**: Ancorou a proporcionalidade de itens por quantidade de dias e o tom conciso e profissional dos resumos e lembretes.
- **Determinismo na Renderização**: Garante que o retorno seja 100% aderente ao formato JSON consumido pela interface web, sem falhas de parse.

---

## 4. Teste de Curadoria de Contexto

Para demonstrar empiricamente a importância do envio de contexto curado em comparação com contexto poluído/excessivo (equivalente a `@file` total vs `@selection`), foi realizado um experimento controlado executando a **mesma pergunta técnica de desenvolvimento**:

> **Pergunta Formulada**: *"Quais são os campos obrigatórios esperados no corpo da requisição POST (req.body)?"*

### Teste A — Contexto Completo (Sem Curadoria)
- **Prompt Utilizado**: Envio do arquivo de backend `api/gerar-lista.js` integralmente colado dentro do prompt (contendo imports da SDK, conexão GoogleGenAI, headers, rotas, lógica de sleep, retentativas exponenciais com loop de fallback de modelos e formatação de resposta).
- **Contexto Fornecido**: 35 linhas de código completo do arquivo backend.
- **Tokens de Entrada (`promptTokenCount`)**: **469**
- **Tokens de Saída (`candidatesTokenCount`)**: **208**
- **Evidência**: Captura do terminal Git Bash (`MINGW64`) com cURL e objeto `usageMetadata` com `promptTokenCount: 469` e `candidatesTokenCount: 208`.

### Teste B — Contexto Curado (Apenas Trecho Relevante)
- **Mesmo Prompt Utilizado**: *"Com base apenas no trecho de validação do handler abaixo, quais são os campos obrigatórios que o frontend precisa enviar no POST?"*
- **Trecho Relevante Fornecido**:
  ```javascript
  const { destino, dias, motivo, clima } = req.body || {};
  if (!destino || !dias || !motivo || !clima) {
    return res.status(400).json({ erro: 'Preencha destino, dias, motivo e clima.' });
  }
  ```
- **Tokens de Entrada (`promptTokenCount`)**: **99**
- **Tokens de Saída (`candidatesTokenCount`)**: **140**
- **Evidência**: Captura do terminal Git Bash (`MINGW64`) com cURL e objeto `usageMetadata` com `promptTokenCount: 99` e `candidatesTokenCount: 140`.

### Comparação e Impacto da Curadoria de Contexto:

| Métrica | Teste A (Contexto Completo) | Teste B (Contexto Curado) | Variação / Economia |
| :--- | :---: | :---: | :---: |
| **Tokens de Entrada** | 469 tokens | 99 tokens | **-78,89% de economia** |
| **Tokens de Saída** | 208 tokens | 140 tokens | -32,69% de saída (resposta mais concisa) |
| **Tokens Totais** | 677 tokens | 239 tokens | **-64,70% de redução total** |
| **Custo Estimado da Chamada** | US$ 0,0022635 | US$ 0,0011985 | **-47,05% no custo financeiro** |

**Conclusão**: A curadoria de contexto reduziu os tokens de entrada em **quase 79%**, manteve a exatidão absoluta da resposta (identificando os campos `destino`, `dias`, `motivo` e `clima`), eliminou distrações de dependências e reduziu pela metade o custo computacional e financeiro da requisição.

---

## 5. Chamadas e custos

### Tabela de Preços de Referência Oficial
- **Modelo Utilizado**: `gemini-3.6-flash`
- **Preço de Entrada**: US$ 1,50 por 1 milhão de tokens (`US$ 0,00000150` / token)
- **Preço de Saída**: US$ 7,50 por 1 milhão de tokens (`US$ 0,00000750` / token)
- **Fonte Oficial**: Google AI Studio Pricing Table (Gemini 3.6 Flash)

### Fórmulas Aplicadas:
- $\text{Custo Entrada} = (\text{tokens\_in} / 1.000.000) \times 1{,}50$
- $\text{Custo Saída} = (\text{tokens\_out} / 1.000.000) \times 7{,}50$
- $\text{Custo Total da Chamada} = \text{Custo Entrada} + \text{Custo Saída}$

### Log de Registro das Chamadas:

| ID | Objetivo | Técnica | Tokens entrada | Tokens saída | Custo entrada (USD) | Custo saída (USD) | Custo total (USD) |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **01** | Primeira geração de lista no app | Few-shot + JSON | 46 | 182 | US$ 0,0000690 | US$ 0,0013650 | **US$ 0,0014340** |
| **02** | Teste A — Contexto completo | Contexto sem filtro | 469 | 208 | US$ 0,0007035 | US$ 0,0015600 | **US$ 0,0022635** |
| **03** | Teste B — Contexto curado | Curadoria de contexto | 99 | 140 | US$ 0,0001485 | US$ 0,0010500 | **US$ 0,0011985** |
| **04** | Demonstração do MODO_JSON | Saída estruturada | 112 | 154 | US$ 0,0001680 | US$ 0,0011550 | **US$ 0,0013230** |

**Custo total da sessão**: **US$ 0,0062190**

> *O custo real da utilização foi R$0 devido ao free tier. Os valores apresentados são custos hipotéticos calculados utilizando os preços oficiais da modalidade paga do modelo.*

---

## 6. Evidências

As evidências fotográficas e registros de terminal estão organizados na documentação e incluem:
1. `prompt-system-desenvolvimento.png`: O System Prompt de Desenvolvimento em uso na ferramenta e documentado.
2. `prompt-system-aplicacao.png`: Trecho de `api/prompts.js` contendo a constante `SYSTEM_PROMPT`.
3. `fewshot-codigo.png`: A constante `FEW_SHOT` com os pares de exemplos user/assistant estruturados.
4. `fewshot-resultado.png`: A lista de bagagem gerada na interface, comprovando a adoção do padrão de poucas peças e categorias.
5. `01-painel-medicao.png`: Painel de medição da aplicação exibindo tokens de entrada, saída e o cálculo dinâmico.
6. `02-teste-a-prompt.png` e `02-teste-a-tokens.png`: Terminal cURL do Teste A (contexto completo) registrando 469 tokens de entrada e 208 de saída.
7. `03-teste-b-prompt.png` e `03-teste-b-tokens.png`: Terminal cURL do Teste B (contexto curado) registrando 99 tokens de entrada e 140 de saída.
8. `04-modo-json.png`: Resposta ao comando `MODO_JSON` em JSON puro estrito.
9. `deploy-url.png`: A aplicação aberta e operacional no navegador.
10. `colaborador.png`: Inclusão do usuário `@pedrosatin` como colaborador no repositório GitHub.

---

## 7. Deploy e Execução Local

- **URL Pública do Projeto**: `https://ais-dev-johptaxmyu2vnahec5ndkq-436212701844.us-east1.run.app`
- **Plataforma Utilizada**: Google Cloud Run / Google AI Studio Build
- **Colaborador Adicionado no GitHub**: `@pedrosatin`

### Instruções para Execução Local:
1. Clone o repositório do projeto:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd montador-de-mala
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure a variável de ambiente criando um arquivo `.env` (baseado no `.env.example`):
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
4. Inicie o servidor local:
   ```bash
   npm run dev
   # ou
   node server.ts
   ```
5. Acesse a aplicação no navegador em `http://localhost:3000`.

---

## 8. Integrantes

- **Nome Completo**: Daniely Mikami — **RA**: 23175979-2
- **Nome Completo**: Mariana Barnabé da Silva — **RA**: 23123538-2
- **Nome Completo**: Nathacha Alexsandra Cardoso Calsavara — **RA**: 23141737-2
