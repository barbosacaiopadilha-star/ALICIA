# Experiência Pública de Mapa V1 (BLOCO-MAPA-V1)

## 1. Contexto

Com a descoberta pública (busca, cidade, ordenação, URL
compartilhável) concluída (BLOCO-CATÁLOGO-D, BLOCO-RANKING-V1), esta
tarefa adiciona o contexto geográfico faltante: uma alternância
Lista/Mapa, usando exclusivamente os dados reais já existentes no
projeto — sem inventar coordenadas, geocodificação ou APIs externas.

## 2. Dados geográficos disponíveis

Auditoria confirmada por leitura direta:
- **Existe latitude?** Não nos dados reais. O campo `latitude?` existe
  como propriedade opcional em `PracticeLocation` (domínio) e em
  `ProfessionalCatalogProjection.primaryLocation`, mas **nunca é
  populado** por `LegacyProfessionalMapper.mapPracticeLocations()` nem
  aparece em nenhum registro de `mocks/alicia/medicos.ts`.
- **Existe longitude?** Mesma situação — campo existe na entidade,
  nunca populado.
- **Existe endereço completo?** Não — `addressLine?` existe na
  entidade, nunca populado.
- **Existe CEP?** Não — `postalCode?` existe na entidade, nunca
  populado.
- **Existe apenas cidade e estado?** **Sim** — exatamente isso é o que
  o legado e o mapper realmente fornecem:
  `Medico.cidade`/`estadoSigla` → `PracticeLocation.city`/`state` →
  `ProfessionalCatalogProjection.primaryLocation.city`/`state`.

## 3. Dados indisponíveis

Latitude, longitude, endereço completo, CEP, geocodificação, qualquer
posicionamento preciso. Nenhum desses foi criado, aproximado ou
inferido nesta tarefa.

## 4. Modelo adotado

Como não existem coordenadas reais, o "Mapa" desta versão **não é um
mapa geográfico literal com marcadores posicionados** — é uma
**representação hierárquica por cidade**, a única granularidade real
disponível. Ao selecionar "Mapa", a mesma lista já filtrada e
ordenada (`medicos: MedicoView[]`, recebida do servidor) é reagrupada
por `cidade` (função pura `agruparPorCidade`, puramente de
apresentação, sem regra de domínio ou aplicação), cada grupo exibido
como uma seção com cabeçalho "Cidade · N profissionais" seguida
exatamente pelos mesmos `MedicoCard` já usados na "Lista" — nenhum
componente de cartão foi alterado, apenas reorganizado.

## 5. Fluxo lista ↔ mapa

O modo de exibição (`view`) não afeta busca, filtro ou ordenação —
opera inteiramente sobre o mesmo `medicos: MedicoView[]` já entregue
pelo servidor. Sincronização entre seleção de item e destaque:
**limitação documentada explicitamente**, conforme a ressalva prevista
na própria tarefa. Como o "mapa" e a "lista" são, na prática, os
mesmos cartões apenas reagrupados (não há um painel de mapa
independente com pinos individuais), não existe uma superfície
separada para "destacar" de forma bidirecional entre mapa e lista —
selecionar um profissional na visão "Mapa" já o mostra dentro do seu
grupo de cidade, no mesmo cartão; não há um pino separado para
sincronizar. Esta é a melhor representação possível usando apenas
cidade/estado, sem fabricar uma noção de posicionamento que os dados
não sustentam.

## 6. Persistência em URL

Parâmetro `view`, com `list` como padrão implícito (omitido da URL):

```
/alicia/es/ortopedia            (view=list implícito)
/alicia/es/ortopedia?view=map
```

Qualquer valor diferente de `map` cai em `list` com segurança. Busca
(`q`), cidade (`city`) e ordenação (`sort`) continuam funcionando
normalmente e de forma independente — `view` é gerido inteiramente no
componente client (`useSearchParams`/`router.push`), sem afetar a
única leitura do catálogo já feita no servidor.

## 7. Limitações

Não implementado, conforme escopo: Google Maps, Mapbox, Leaflet,
geocodificação, cálculo de distância, GPS, clustering, heatmap,
rotas, IA, ranking geográfico. O "Mapa" é uma reorganização por
cidade, não uma projeção espacial real. Se dois profissionais estão
na mesma cidade mas em bairros/endereços diferentes, isso não é
distinguível com os dados atuais — outra consequência honesta da
ausência de coordenadas/endereço.

## 8. Próxima frente

Um mapa geográfico literal só se justifica quando existirem
coordenadas reais (latitude/longitude) para os profissionais —
population de dado real, não uma tarefa técnica adicional deste
bloco. Até lá, a representação por cidade permanece a alternativa
mais honesta disponível.

## Resposta obrigatória

**O mapa representa localização precisa?**

**NÃO.** Não existe nenhuma coordenada real (latitude/longitude) em
nenhum profissional dos dados atuais — os campos existem na entidade
de domínio, mas nunca foram populados pelo mapper nem pelos mocks.
A visão "Mapa" desta versão é uma reorganização por cidade/estado
(a única granularidade geográfica real disponível), não um
posicionamento espacial. Nenhuma coordenada foi inventada, aproximada
ou obtida por geocodificação para simular precisão que os dados não
sustentam.
