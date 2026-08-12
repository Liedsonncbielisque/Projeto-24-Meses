# Arquitetura — Nosso Projeto 24 Meses

## Visão geral

SPA em JavaScript puro (ES Modules), sem framework e sem backend. Roteamento por hash (`#/inicio`, `#/saidas`, `#/meta`, `#/historia`) com views carregadas sob demanda e cacheadas em memória.

## Camadas

```
index.html                 shell: sidebar, topbar, modal, toasts
config/app.config.js       constantes globais (storage key, cores, meses)

frontend/js/
├── app.js                 bootstrap + roteador + sidebar mobile
├── data/                  dados estáticos e defaults (fonte única de verdade)
│   ├── defaults.js        estado inicial: settings, financial, months, outings, achievements, history
│   ├── outings.js         as 44 experiências (nomes imutáveis)
│   └── achievements.js    definições das 8 conquistas
├── state/
│   ├── state.js           estado central + mutações (única forma de alterar dados)
│   └── storage.js         persistência localStorage (save/load/clear/export/import)
├── calculations/          funções puras, sem DOM
│   ├── financial.js       restante, percentual, média, necessário/mês, status do mês
│   └── projections.js     projeção no ritmo atual, diferença, mês de chegada
├── features/              regras de negócio
│   ├── roulette.js        roleta canvas, sorteio sem repetição, completar experiência
│   ├── timeline.js        modelo da timeline (status, diferença, experiência do mês)
│   └── achievements.js    avaliação automática de conquistas
├── ui/                    renderização e eventos de cada página
│   ├── dashboard.js       Início
│   ├── outings.js         Nossas Saídas
│   ├── meta.js            Meta 24 Meses (timeline + registro mensal)
│   ├── history.js         Nossa História (filtros por ano)
│   ├── settings.js        modal de configurações
│   └── feedback.js        toasts e confirmações
└── charts/charts.js       Chart.js: planejado×realizado, acumulado, ritmo×meta
```

## Fluxo de dados

```
ação do usuário → state/state.js (mutação) → emit() → subscribers
                                                    ├── storage.saveState()
                                                    ├── sidebar (progresso)
                                                    └── achievements (desbloqueio)
```

As páginas leem o estado com `getState()` e se re-renderizam após cada mutação. Nenhum módulo de UI guarda dados — apenas o estado central.

## Estado

```js
{
  settings:     { theme },
  financial:    { metaTotal, valorInicial, valorMensalPlanejado, startMonth, totalMeses },
  months:       [{ number, year, month, planned, saved, note, outingId }],
  outings:      [{ id, name, category, status, month, date, notes }],
  achievements: [{ id, unlocked, unlockedAt }],
  history:      [{ outingId, name, month, date, notes, rating }]
}
```

Status de experiência: `available` → `selected` (sorteada) → `completed` (realizada). A roleta só sorteia `available`.

## Persistência e migração futura

`state/storage.js` isola o localStorage (chave `nosso-projeto-24m`). Para migrar para Supabase/PostgreSQL/Firebase/API, basta reimplementar as cinco funções (`saveState`, `loadState`, `clearState`, `exportState`, `importState`) mantendo as assinaturas.

## Decisões

- **`ui/feedback.js` e `ui/settings.js`** foram adicionados à árvore original: toasts e o modal de configurações são compartilhados por todas as páginas, e colocá-los em `app.js` criaria dependência circular com os módulos de UI.
- **Mês atual** é derivado de `financial.startMonth` + data de hoje (clamp entre 1 e `totalMeses`), não armazenado — evita dessincronia.
- **Conquistas** são avaliadas em `app.js` a cada mudança de estado, com guarda contra reentrância.
- **Views** são HTML puro carregado via `fetch` com cache, mantendo lógica fora do HTML.
- **Acessibilidade**: skip-link, `aria-live` na região de views e toasts, foco visível, `prefers-reduced-motion`, navegação por teclado na timeline (Enter/Espaço).
