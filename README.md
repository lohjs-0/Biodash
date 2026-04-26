# BioDash

> Plataforma fullstack de monitoramento em tempo real para tanques biológicos: biorreatores, aquicultura e sistemas BFT.

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=flat&logo=dotnet)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![SignalR](https://img.shields.io/badge/SignalR-realtime-22c55e?style=flat)

---

## 📸 Preview

<img src="print.jpeg" alt="Preview do BioDash" width="100%">

---

## 🧬 Sobre o projeto

BioDash nasceu da necessidade de acompanhar parâmetros críticos de sistemas biológicos, temperatura, pH e nível de fluido, com feedback instantâneo e alertas automáticos quando os valores saem dos limites seguros.

O projeto foi construído como uma **aplicação de portfólio inspirada em produção**, priorizando arquitetura limpa, comunicação em tempo real e práticas modernas de desenvolvimento fullstack.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🧪 Gestão de tanques | CRUD completo com status online/offline |
| 📡 Tempo real | Atualizações via SignalR a cada 5 segundos |
| 🚨 Alertas automáticos | Disparo por temperatura, pH e nível fora dos limites |
| 📈 Histórico | Gráficos de séries temporais por parâmetro |
| 🤖 Simulador de sensores | BackgroundService que elimina dependência de hardware IoT |
| 🌱 Sustentabilidade | Calculadora de redução de CO₂ e economia de fertilizantes |
| 🔐 Autenticação | JWT com BCrypt, expiração curta e exclusão de conta com confirmação de senha |
| 📱 Responsivo | Interface adaptada para mobile e desktop com modo escuro |

---

## 🏗️ Arquitetura

```
BioDash/
├── BioDash.Api/          # Backend .NET 9
│   ├── Endpoints/        # Minimal API (Auth, Tanks, Alerts, Users)
│   ├── Services/         # AuthService, TokenService, BackgroundService
│   ├── Data/             # AppDbContext + Repositories
│   ├── Models/           # Entidades do domínio
│   └── DTOs/             # Contratos de entrada e saída
│
└── biodash-client/       # Frontend React + TypeScript
    ├── api/              # Clients HTTP (Axios)
    ├── components/       # Componentes reutilizáveis
    ├── pages/            # Dashboard, Tanks, Alerts, Reports, Settings
    └── store/            # Estado global (Zustand)
```

---

## 🧠 Decisões técnicas

**SignalR em vez de polling**
Comunicação bidirecional eficiente — o servidor empurra dados ao cliente sem requisições repetidas desnecessárias.

**Simulador via BackgroundService**
Elimina dependência de dispositivos IoT reais, tornando o projeto demonstrável em qualquer ambiente.

**Minimal API (.NET 9)**
Endpoints enxutos, sem overhead de controllers, organizados por domínio em arquivos de extensão.

**Cascade delete no banco**
Relações configuradas com `OnDelete(DeleteBehavior.Cascade)` — exclusão de conta remove todos os dados associados automaticamente.

**Zustand no frontend**
Gerenciamento de estado global leve, sem boilerplate, com stores isoladas por domínio.

**PostgreSQL**
Consistência robusta com suporte futuro a extensões de séries temporais (ex: TimescaleDB).

---

## 🚀 Como rodar localmente

### Pré-requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/)

### Backend

```bash
cd BioDash.Api
# Configure a connection string e JWT secret no appsettings.Development.json
dotnet ef database update
dotnet run
```

### Frontend

```bash
cd biodash-client
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🔐 Segurança

- Senhas com hash BCrypt (work factor 12)
- JWT com expiração de 60 minutos
- Exclusão de conta requer confirmação de senha
- CORS restrito à origem do cliente
- Secrets via variáveis de ambiente em produção

---

## 📄 Licença

MIT — sinta-se livre para usar como referência ou ponto de partida.
