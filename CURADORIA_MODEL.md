# AliCIA — Modelo Funcional de Curadoria Médica

**Tipo:** documento de arquitetura funcional (não é ADR, não é RFC)
**Base:** v2 iniciada · RFC-E1 aprovada · ADRs 029–033 consolidados · Sprint de modelo acadêmico entregue
**Invariante desta sprint (inalterável):** *a AliCIA NÃO exibe ranking público, score ou nota comparativa entre médicos.*
**Data:** 2026-07-21

---

## Princípio estrutural

O sistema **não ordena médicos — ele compõe um conjunto**. A pergunta interna nunca é "quem é o melhor?", e sim **"quais médicos são elegíveis para este caso, e qual trio elegível oferece ao paciente três caminhos legítimos e distintos?"**. Elegibilidade é binária por critério; composição é decisão humana assistida; a apresentação final é em **ordem neutra (alfabética)**, declarada como tal ao paciente. Não existe primeiro lugar.

## 1. Fluxo completo

| Etapa | O que acontece | Quem executa |
|---|---|---|
| **Paciente** | Solicita curadoria informando o caso | Paciente |
| **História** | Captura estruturada: queixa, contexto, restrições práticas (cidade, deslocamento, modalidade), preferências declaradas. Mínimo necessário — nada de prontuário | Formulário + paciente |
| **Normalização** | Texto livre → vocabulário do Knowledge Core (specialty/condition/capability por id, nunca string solta); localização → UF/cidade canônicas | Sistema |
| **Extração de critérios** | O caso normalizado vira uma `EspecificacaoDeCaso`: lista tipada de critérios classificados nos 4 grupos (§2) | Sistema + revisão do curador |
| **Pesquisa** | Consulta ao snapshot publicado (ADR-029): candidatos da especialidade/condição na abrangência geográfica | Sistema |
| **Filtragem** | Aplicação dos **excludentes** (eliminam) e dos **obrigatórios** (exigem evidência verificada — ADR-031). Resultado: `ConjuntoElegivel`, sem ordem | Sistema |
| **Curadoria** | Curador compõe o trio a partir dos elegíveis, guiado pela `FichaDeCompatibilidade` interna (§4) e pelas regras de composição (§5) | Curador humano |
| **3 médicos** | Trio aprovado, com justificativa factual individual por médico (§6) | Curador |
| **Dossiê** | Montagem do dossiê (§7) a partir dos perfis publicados + justificativas | Sistema + revisão do curador |
| **Paciente** | Recebe o dossiê, em ordem alfabética, e **escolhe** | Paciente |

Toda transição gera evento de auditoria (mesma trilha do ADR-029).

## 2. Critérios — quatro grupos, nunca misturados

| Grupo | Definição | Efeito | Exemplo |
|---|---|---|---|
| **Obrigatórios** | O caso exige; sem eles o médico não entra | Filtro de entrada — exige evidência **verificada** | Residência na especialidade do caso; atuação na condição relatada |
| **Preferenciais** | Aumentam a adequação, mas ausência não elimina | Informam a **composição** do trio e a justificativa — jamais geram ordem | Subespecialização no procedimento; produção científica na condição |
| **Excludentes** | Incompatibilidades objetivas com o caso | Eliminam o candidato, com o motivo registrado internamente | Fora da abrangência geográfica aceita; não atende na modalidade exigida pelo paciente |
| **Desconhecidos** | O dado necessário não existe ou não está verificado no perfil | **Não pontuam nem eliminam**: marcados `indeterminado`; podem disparar pedido de verificação (E2) | Volume de procedimentos não documentado |

Regras invioláveis do grupo: um critério pertence a exatamente um grupo por caso; `desconhecido` nunca é tratado como falha (herda a decisão nº 2 — ausência de dado não vira afirmação negativa); a classificação de cada critério fica registrada na `EspecificacaoDeCaso` e é auditável.

## 3. Evidências admissíveis

Somente fatos com fonte (`SourceRecord`, ADR-031), no estado `verificada` quando sustentam critério obrigatório:

- **Formação** (graduação, mestrado, doutorado, pós-doutorado, livre-docência) — diploma/registro institucional;
- **Residência e subespecialização/fellowship** — certificado de programa credenciado;
- **Produção científica** — publicação identificável (DOI/registro), da própria autoria;
- **Experiência e procedimentos** — vínculo institucional documentado; volume apenas quando documentado pela instituição;
- **Sociedades médicas e títulos** — registro da sociedade emissora;
- **Fontes oficiais** — registro no conselho profissional (situação ativa), cadastros públicos institucionais.

**Nunca entram como evidência:** avaliações de pacientes, reputação, indicação, presença em mídia, seguidores, opinião de terceiros — de nenhuma forma, nem como desempate. O modelo acadêmico já implementado (`domain/academico`) é exatamente o repositório dessas evidências.

## 4. Compatibilidade (interna, sem nota)

A `FichaDeCompatibilidade` é uma **matriz categórica por critério**, nunca um número:

```
critério (da EspecificacaoDeCaso) → { atende | nao_atende | indeterminado }
                                     + registros/evidências que sustentam
```

- Cada célula referencia os registros acadêmicos que a sustentam (auditável, mesmo padrão de `ResultadoCriterio` já implementado).
- **Proibido por construção:** somar células, atribuir pesos, ordenar fichas, exibir a ficha ao paciente. A ficha existe para o curador ver *cobertura*, não *pontuação* — a mesma proteção anti-agregado já testada no motor acadêmico se aplica aqui.
- Dois médicos com fichas diferentes não são "maior/menor" — são **perfis diferentes**, e é essa diferença que a composição do trio aproveita.

## 5. Curadoria humana

**Onde entra:** em três pontos fixos — (a) revisão da `EspecificacaoDeCaso` (a classificação dos critérios extraídos está certa?); (b) **composição do trio** a partir do `ConjuntoElegivel`; (c) revisão final do dossiê antes da entrega.

**O que aprova:** a especificação do caso; o trio; cada justificativa individual; o dossiê final.

**O que altera:** classificação de um critério entre os 4 grupos (com justificativa registrada); a composição do trio dentro dos elegíveis — guiado pelas regras de composição: perfis complementares (ex.: hospitalar vs. ambulatorial, proximidades diferentes, abordagens distintas) para dar ao paciente **três caminhos reais**, não três cópias; pode devolver o caso à etapa anterior (pedir verificação de dado `indeterminado` a E2).

**O que NUNCA altera:** não inclui médico fora do `ConjuntoElegivel` (não fura filtro); não remove excludente para "encaixar" alguém; não marca `verificada` sem evidência (ADR-031 vale para o curador também); não cria ordem, destaque ou recomendação individual dentro do trio; não edita dados do perfil publicado (isso é fluxo editorial próprio, com snapshot); não usa opinião como critério. Toda intervenção do curador gera `AuditEvent` com justificativa.

## 6. Explicabilidade

Cada médico do trio recebe uma **Justificativa de Seleção** individual, gerada a partir da ficha e aprovada pelo curador, com gramática restrita:

- **Permitido:** "Atende aos critérios do seu caso: residência em X (verificada), fellowship em Y (verificado), atua em Z na cidade C." — somente fatos verificáveis, cada um ancorado em registro com evidência.
- **Estrutura fixa:** critérios obrigatórios atendidos → preferenciais atendidos → informações práticas (local/modalidade). Critérios `indeterminados` são declarados com neutralidade ("volume de procedimentos ainda não documentado na plataforma") — nunca omitidos para embelezar.
- **Proibido:** comparativos ("mais experiente que"), superlativos ("excelente", "referência"), qualquer menção a posição, nota ou preferência da AliCIA entre os três.

A resposta a "por que este médico?" é sempre: **"porque estes fatos verificados atendem a estes critérios do seu caso"** — e ela é igual em dignidade para os três.

## 7. Dossiê

**Estrutura (ordem fixa):**

1. **Seu caso, como entendemos** — a `EspecificacaoDeCaso` em linguagem do paciente, com os critérios usados (transparência: o paciente pode corrigir e reprocessar).
2. **Como selecionamos** — parágrafo padrão da metodologia: filtros aplicados, papel do curador, e a frase explícita: *"os três médicos são apresentados em ordem alfabética; a AliCIA não indica preferência entre eles."*
3. **Os três médicos** — em ordem alfabética, um bloco idêntico em formato para cada: identificação e especialidade; Justificativa de Seleção (§6); trajetória resumida (registros públicos verificados primeiro, mesmos componentes do perfil); informações práticas (cidade, instituição, modalidade); estado de verificação declarado registro a registro.
4. **O que não sabemos** — critérios `indeterminados` dos três, com neutralidade.
5. **Próximo passo** — a escolha é do paciente; como acessar cada perfil completo na plataforma.

**Anexos:** referência das evidências públicas citadas (nº de registro, DOI); versão da metodologia vigente; identificador do dossiê e data (auditoria). **Campos derivados de snapshot** (ADR-029): o dossiê referencia o snapshot usado — reproduzível e imutável após entrega.

## 8. Casos especiais

| Situação | Comportamento |
|---|---|
| **Menos de 3 elegíveis** | Entregar o número real (2, 1) com explicação honesta — **nunca** completar com não-elegível, nunca afrouxar obrigatórios silenciosamente. Com 0, ver abaixo |
| **Nenhum elegível / especialidade rara** | Resposta transparente: cobertura insuficiente; oferecer (a) ampliar abrangência geográfica com consentimento do paciente, ou (b) registrar interesse para quando houver cobertura. Caso vira insumo de expansão (E2) |
| **Dados conflitantes no perfil** | O registro conflitante volta a `pendente` (nunca permanece `verificada` em conflito), sai das justificativas e dispara reverificação; se era sustentação de obrigatório, o médico sai do elegível deste caso — sem qualquer marca pública negativa (ADR-032) |
| **Fonte divergente** (duas fontes discordam) | Prevalece a hierarquia: fonte oficial (conselho/instituição emissora) > declaração institucional > currículo público. Divergência registrada em auditoria; até resolução, trata-se como `indeterminado` |
| **Paciente complexo** (múltiplas condições) | O curador decompõe: qual especialidade lidera o caso? O trio é da especialidade líder; o dossiê declara o limite ("seu caso pode exigir acompanhamento multidisciplinar") — a AliCIA não faz triagem clínica nem substitui médico |
| **Critérios incompatíveis entre si** (ex.: subespecialista raro + só na minha cidade pequena) | Nunca resolver silenciosamente: devolver ao paciente a escolha explícita de qual critério flexibilizar, com o efeito de cada opção. A decisão do paciente reclassifica os critérios e reprocessa |

Regra transversal: **todo caso especial termina em comunicação honesta, nunca em degradação silenciosa da seleção.**

## 9. Critérios de aceite

1. Um caso real percorre o fluxo §1 de ponta a ponta com trilha de auditoria completa (da história ao dossiê).
2. Nenhuma representação numérica agregada de médico existe em nenhuma camada — protegido por teste (extensão do teste anti-agregado já existente).
3. Todo médico do trio tem 100% dos critérios obrigatórios sustentados por evidência `verificada`.
4. A justificativa de cada médico contém apenas fatos com registro/evidência rastreável; revisão editorial confirma a gramática do §6.
5. Dossiê apresenta os três em ordem alfabética com a declaração de neutralidade; paciente consegue escolher sem nenhum sinal de preferência do sistema.
6. Os seis casos especiais do §8 têm comportamento implementado e testado (incluindo "menos de 3").
7. Curador não consegue, pela ferramenta, violar os "nunca altera" do §5 (restrições no domínio, não em convenção).
8. LGPD: caso do paciente com base legal, minimização e retenção definidas antes do primeiro caso real.

## 10. Plano — Waves (domínio sempre antes de UX)

| Wave | Escopo | UX? |
|---|---|---|
| **C1 — Domínio do caso** | `EspecificacaoDeCaso`, 4 grupos de critérios, normalização para o Knowledge Core; validações e testes | Não |
| **C2 — Elegibilidade** | Filtros excludentes/obrigatórios sobre o snapshot; `ConjuntoElegivel`; `FichaDeCompatibilidade` categórica com proteção anti-agregado testada | Não |
| **C3 — Composição e justificativa** | Regras de composição do trio; `JustificativaDeSelecao` com gramática restrita; casos especiais §8; portas do curador com os "nunca altera" como invariantes de domínio | Não |
| **C4 — Dossiê (modelo)** | Estrutura do dossiê como projeção do snapshot + justificativas; serialização, versão, auditoria | Não |
| **C5 — Ferramenta do curador** | Primeira UX: interface interna (não pública) para revisar caso, compor trio e aprovar dossiê | Interna |
| **C6 — Experiência do paciente** | Captura da história (com páginas legais no ar — pré-requisito E7) e entrega do dossiê na plataforma | Pública |

Dependências externas: E1 (snapshot/persistência) para C2+; E2 (dados reais verificados) para qualquer caso real; E7 (privacidade/termos) antes de C6. Cada wave segue o protocolo padrão: CI verde, deploy verificado, relatório com evidências.

---

**PRODUCT SPRINT 01 CONCLUÍDA**
