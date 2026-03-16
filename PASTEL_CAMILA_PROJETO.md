# 🥟 Pastel da Camila — App Operacional
## Documentação do Projeto v1.0
**Data:** 15/03/2026 | **Responsável:** Camila + Claude

---

## 📋 O QUE EXISTE HOJE (HTML v3.5 — 22.855 linhas)

### Módulos identificados no HTML atual:
| # | Módulo | Descrição |
|---|--------|-----------|
| 1 | **Login / Auth** | Tela de login com animação, dark mode, senhas por usuário |
| 2 | **Dashboard CEO** | KPIs, alertas, projeção 7 dias, metas, anotações |
| 3 | **Central de Comando** | Operações em tempo real, checklist, BPMN de fluxo |
| 4 | **RH** | Funcionários, escalas, fichas, faltas, histórico |
| 5 | **Financeiro BI** | Receita, despesas, fluxo de caixa, gráficos Chart.js |
| 6 | **Importador de Vendas** | Upload CSV/Excel, parser universal |
| 7 | **Suporte/Tickets** | Abertura e acompanhamento de chamados internos |
| 8 | **Configurações** | Tema, usuários, permissões |
| 9 | **Ocorrências** | Registro de ocorrências operacionais |
| 10 | **Negócios** | Visão consolidada multi-unidade |

### Tecnologias já no HTML:
- IndexedDB (IDB) para armazenamento offline local
- Chart.js 4.4.0 para gráficos
- EventBus interno (pub/sub)
- AppState (gerenciamento de estado)
- Sistema de roteamento SPA (Single Page App)
- PWA-ready (viewport, safe areas iOS)
- Dark mode com `[data-dark]`
- Print CSS (impressão/PDF)

---

## 🏗️ ARQUITETURA COMPLETA DO APP

```
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE APRESENTAÇÃO                 │
│  PWA (HTML + manifest.json + sw.js)                     │
│  Netlify CDN — pastelcamila.netlify.app                 │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────────────┐
│               CAMADA DE BACKEND (GRATUITO)               │
│                                                          │
│  Firebase (Plano Gratuito Spark)                        │
│  ├── Firestore — banco de dados em tempo real           │
│  ├── Auth — autenticação segura                         │
│  ├── Cloud Messaging (FCM) — notificações push          │
│  └── Hosting — alternativa ao Netlify                   │
│                                                          │
│  EmailJS — envio de emails gratuito (200/mês)           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              CAMADA DE DADOS LOCAL                       │
│  IndexedDB (já existe no HTML)                          │
│  ├── vendas_importadas                                  │
│  ├── ceo_annotations                                    │
│  ├── checklists                                         │
│  └── sync_queue (fila de sincronização offline)         │
└─────────────────────────────────────────────────────────┘
```

### Fluxo Tempo Real:
```
Celular A (funcionário)
    └─ faz ação (ex: abre pedido)
         └─ grava no IndexedDB local
              └─ envia para Firestore
                   ├─ Dashboard CEO atualiza em < 1 segundo
                   ├─ notificação push para gerente (FCM)
                   └─ email automático se for alerta (EmailJS)
```

### Funcionamento Offline:
```
Sem internet? 
  → Salva em IndexedDB + sync_queue
  → Quando voltar internet: sincroniza automaticamente
  → Service Worker garante app disponível offline
```

---

## 📁 ESTRUTURA DE ARQUIVOS DO PROJETO

```
pastel-camila-app/
├── index.html          ← SEU HTML (100% preservado + melhorias)
├── manifest.json       ← PWA: nome, ícone, cor, standalone
├── sw.js               ← Service Worker: cache offline + push
├── firebase-config.js  ← Configuração Firebase (suas chaves)
├── sync.js             ← Engine de sincronização offline→online
├── notifications.js    ← Notificações push (FCM)
├── email.js            ← Emails automáticos (EmailJS)
├── icons/
│   ├── icon-192.png    ← Ícone Android
│   └── icon-512.png    ← Ícone splash screen
└── CHANGELOG.md        ← Histórico de mudanças (preservar versões)
```

---

## ✅ FUNCIONALIDADES NOVAS A ADICIONAR

### 🔴 PRIORIDADE ALTA
- [ ] **manifest.json** — transforma em PWA instalável
- [ ] **sw.js** — Service Worker, cache offline, notificações push
- [ ] **Firebase Firestore** — sync em tempo real entre dispositivos
- [ ] **Firebase Auth** — login seguro substituindo o sistema local

### 🟡 PRIORIDADE MÉDIA
- [ ] **Notificações Push (FCM)** — alerta de pedidos, alertas CEO
- [ ] **Emails automáticos (EmailJS)** — resumo diário, alertas críticos
- [ ] **Dashboard tempo real** — Firestore onSnapshot (atualiza live)

### 🟢 PRIORIDADE BAIXA
- [ ] **Ícone e splash screen** personalizados
- [ ] **Relatório PDF** melhorado (html2pdf.js)
- [ ] **Backup automático** para Firestore

---

## 📅 CRONOGRAMA

### SPRINT 1 — Base PWA (Semana 1)
```
Dia 1-2: manifest.json + ícones + sw.js (cache básico)
Dia 3:   Testar instalação Android e iPhone
Dia 4:   Deploy Netlify (arrastar e soltar)
Dia 5:   Testes com funcionários reais
```
**Entrega:** App instalável offline no celular ✅

### SPRINT 2 — Banco de Dados em Nuvem (Semana 2)
```
Dia 1:   Criar projeto Firebase (gratuito)
Dia 2-3: Integrar Firestore no HTML (sync_queue)
Dia 4:   Firebase Auth substituindo login local
Dia 5:   Testes de sincronização multi-dispositivo
```
**Entrega:** Dados sincronizados entre celulares ✅

### SPRINT 3 — Tempo Real + Notificações (Semana 3)
```
Dia 1-2: Dashboard CEO com onSnapshot (live update)
Dia 3:   Firebase Cloud Messaging (FCM) — push notifications
Dia 4:   EmailJS — emails de alerta e resumo diário
Dia 5:   Testes completos
```
**Entrega:** Notificações push + emails automáticos ✅

### SPRINT 4 — Polimento (Semana 4)
```
Dia 1:   PDF melhorado (html2pdf.js)
Dia 2:   Ícone e splash screen customizados
Dia 3:   Otimizações de performance
Dia 4-5: Documentação de uso para funcionários
```
**Entrega:** App completo, documentado ✅

---

## 🔄 PROTOCOLO DE ATUALIZAÇÃO DO HTML

**Quando você mandar um HTML novo, Claude vai:**

1. Comparar com a versão anterior (diff)
2. Identificar SOMENTE o que mudou
3. Aplicar as mudanças sem tocar no que já funciona
4. Registrar no CHANGELOG.md

**Para isso funcionar, sempre:**
- Mande o HTML com comentário `<!-- v3.6 — mudei X -->` no topo
- Ou me diga "mudei o módulo RH e o Dashboard"
- Nunca perco nada da versão anterior

---

## 💾 VERSÕES DO HTML

| Versão | Data | O que mudou |
|--------|------|-------------|
| v3.5 | 15/03/2026 | Versão inicial recebida — 22.855 linhas |

---

## 🆓 CUSTOS — 100% GRATUITO

| Serviço | Plano | Limite Gratuito |
|---------|-------|-----------------|
| Netlify | Free | 100GB banda/mês, HTTPS, domínio |
| Firebase Firestore | Spark (Free) | 1GB storage, 50k leituras/dia |
| Firebase Auth | Spark (Free) | 10k usuários/mês |
| Firebase FCM | Free | Notificações push ilimitadas |
| EmailJS | Free | 200 emails/mês |
| GitHub | Free | Versionamento do código |

**Total mensal: R$ 0,00** 🎉

---

## 📱 COMO INSTALAR O APP (instrução para funcionários)

### Android:
1. Abrir Chrome e acessar `pastelcamila.netlify.app`
2. Menu (3 pontinhos) → "Adicionar à tela inicial"
3. Confirmar → ícone aparece na tela

### iPhone:
1. Abrir Safari e acessar `pastelcamila.netlify.app`
2. Botão compartilhar (quadrado com seta) → "Adicionar à Tela de Início"
3. Confirmar → ícone aparece na tela

---

## 📞 CONTATOS DO PROJETO
- Sistema criado por: Camila + Claude (Anthropic)
- Versão do Claude: Sonnet 4.6
- Repositório: a definir no GitHub
