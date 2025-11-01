# 🌎 Dashboard de Qualidade do Ar em Cidades Brasileiras

## Descrição
Este projeto apresenta um **dashboard interativo** que mostra indicadores de qualidade do ar em tempo real de cidades brasileiras. O sistema é composto por duas partes principais:

- **Backend (Python):** coleta, processa e armazena dados de APIs públicas (ex: [OpenAQ](https://openaq.org/), [IQAir](https://www.iqair.com/)).  
- **Frontend (Next.js):** exibe gráficos, indicadores e alertas de risco à saúde.

O objetivo é demonstrar o uso de **plataformas de desenvolvimento baseadas em IA** em todas as etapas do ciclo de software — desde a geração de código até testes e documentação.

---

## Estrutura do Projeto

```bash
dashboard-qualidade-ar/
│
├── backend/     → coleta e processamento de dados
├── frontend/    → dashboard interativo (Next.js)
└── docs/        → relatório, prints e documentação
````

---

## Como rodar o projeto localmente

### 1. Backend


---

### 2. Frontend

#### Pré-requisitos:

* Node.js versão 18+
* pnpm instalado

#### Passos:

```bash
cd frontend
pnpm install
pnpm dev
```

O frontend ficará disponível em:

```
http://localhost:3000
```

Ele consome automaticamente os dados fornecidos pelo backend.

---

## Testes Automatizados

### Backend



## Ferramentas de IA Utilizadas

* **GitHub Copilot:** geração de código e pair programming.
* **ChatGPT:** documentação.
* **v0.dev:** frontend.

---

## Prints e Relatório

Os prints do dashboard e o relatório final estão disponíveis na pasta:

```
docs/
```

---

## 👥 Autores

| Nome     | Função                                        |
| -------- | --------------------------------------------- |
| Eduarda Mendes | Backend – Coleta, processamento de dados e Testes    |
| Marcelo Lommez | Backend – Processamento, banco de dados e integração final |
| Mariana Assis | Frontend - Dashboard, relatórios automáticos e documentação       |

---

## Observação

O projeto foi desenvolvido utilizando **exclusivamente plataformas baseadas em Inteligência Artificial**, conforme os requisitos da disciplina *IA em Negócios* da UFMG(2025.2).

---

## Resultado Esperado

* Dashboard funcional com dados em tempo real
* Indicadores visuais de poluição e risco à saúde
* Relatórios automáticos gerados pelo sistema
* Testes automatizados e documentação completa


