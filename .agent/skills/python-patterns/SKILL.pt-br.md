---
name: python-patterns
description: Princípios de desenvolvimento Python e tomada de decisão. Seleção de framework, padrões assíncronos, type hints, estrutura de projeto. Ensina a pensar, não a copiar.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Padrões Python (Python Patterns)

> Princípios de desenvolvimento Python e tomada de decisão para 2025.
> **Aprenda a PENSAR, não a decorar padrões.**

---

## ⚠️ Como Usar Esta Skill

Esta skill ensina **princípios de tomada de decisão**, não códigos fixos para copiar.

- PERGUNTE a preferência de framework ao usuário quando não estiver claro
- Escolha entre async vs sync com base no CONTEXTO
- Não use o mesmo framework para tudo por padrão

---

## 1. Seleção de Framework (2025)

### Árvore de Decisão

```
O que você está construindo?
│
├── API-first / Microsserviços
│   └── FastAPI (async, moderno, rápido)
│
├── Web Full-stack / CMS / Admin
│   └── Django (batteries-included / completo)
│
├── Simples / Script / Aprendizado
│   └── Flask (mínimo, flexível)
│
├── Servir API de AI/ML
│   └── FastAPI (Pydantic, async, uvicorn)
│
└── Workers de Segundo Plano (Background)
    └── Celery + qualquer framework
```

### Princípios de Comparação

| Fator | FastAPI | Django | Flask |
|--------|---------|--------|-------|
| **Melhor para** | APIs, microsserviços | Full-stack, CMS | Simples, aprendizado |
| **Async** | Nativo | Django 5.0+ | Via extensões |
| **Admin** | Manual | Embutido | Via extensões |
| **ORM** | Escolha o seu | Django ORM | Escolha o seu |
| **Curva de aprendizado** | Baixa | Média | Baixa |

### Perguntas de Seleção para Fazer:
1. Este projeto é apenas API ou full-stack?
2. Precisa de interface administrativa (admin)?
3. A equipe está familiarizada com async?
4. Existe infraestrutura já estabelecida?

---

## 2. Decisão Async vs Sync

### Quando Usar Async

```
async def é melhor quando:
├── Operações I/O-bound (banco de dados, HTTP, arquivos)
├── Muitas conexões simultâneas
├── Recursos em tempo real (real-time)
├── Comunicação de microsserviços
└── FastAPI/Starlette/Django ASGI
```

### Quando Usar Sync (def)

```
def (sync) é melhor quando:
├── Operações CPU-bound
├── Scripts simples
├── Base de código legada
├── Equipe não familiarizada com async
└── Bibliotecas bloqueantes (sem versão async)
```

### A Regra de Ouro

```
I/O-bound → async (esperando por algo externo)
CPU-bound → sync + multiprocessing (computação)

NÃO FAÇA:
├── Misturar sync e async de forma descuidada
├── Usar bibliotecas sync em código async
└── Forçar async para trabalho de CPU
```

---

## 3. Estratégia de Type Hints

### Quando Tipar

```
Sempre tipar:
├── Parâmetros de função
├── Tipos de retorno
├── Atributos de classe
├── APIs públicas

Pode pular:
├── Variáveis locais (deixe a inferência trabalhar)
├── Scripts de uso único
├── Testes (geralmente)
```

### Padrões Comuns de Tipagem

```python
# Optional → pode ser None
from typing import Optional
def find_user(id: int) -> Optional[User]: ...

# Union → um de múltiplos tipos
def process(data: str | dict) -> None: ...

# Coleções genéricas
def get_items() -> list[Item]: ...
def get_mapping() -> dict[str, int]: ...
```

### Pydantic para Validação

- Use para modelos de request/response de API, configurações/settings e validação/serialização de dados.
- Benefícios: Validação em tempo de execução, schema JSON gerado automaticamente, integração nativa com FastAPI e mensagens de erro claras.

---

## 4. Princípios de Estrutura de Projeto

### Seleção de Estrutura

- **Pequeno/Script**: `main.py`, `utils.py`, `requirements.txt`.
- **Médio (API)**: Pasta `app/` contendo `main.py`, `models/`, `routes/`, `services/`, `schemas/`.
- **Grande**: Pasta `src/` com pacote do app, testes separados e `pyproject.toml`.

---

## 5. Princípios de Django (2025)

- **Django Async (5.0+)**: Suporta views, middleware e ORM (limitado) assíncronos. Use para chamadas de API externa, WebSockets ou alta concorrência.
- **Melhores Práticas**: Models gordos e views magras, use managers para queries comuns, `select_related` para chaves estrangeiras (FKs) e `prefetch_related` para muitos-para-muitos (M2M) para evitar N+1 queries.

---

## 6. Princípios de FastAPI

- **async def vs def**: Use `async def` para drivers de banco ou chamadas HTTP assíncronas. Use `def` para operações bloqueantes, pois o FastAPI lida automaticamente com o pool de threads.
- **Injeção de Dependência**: Use para sessões de banco, autenticação de usuário e recursos compartilhados. Facilita a testabilidade através de mocks.

---

## 7. Tarefas em Segundo Plano (Background Tasks)

- **FastAPI BackgroundTasks**: Para operações rápidas e simples no mesmo processo.
- **Celery/ARQ**: Para tarefas de longa duração, necessidade de retentativa (retry), workers distribuídos e filas persistentes.

---

## 8. Princípios de Tratamento de Erros

- Crie classes de exceção customizadas, registre handlers de exceção e retorne um formato de erro consistente para o cliente (incluindo código de erro e mensagem amigável, mas NUNCA stack traces internos).

---

## 9. Princípios de Teste

- **Estratégia**: Use `pytest` para testes unitários, de integração e E2E.
- **Async Testing**: Use `pytest-asyncio` e `httpx.AsyncClient` para testar endpoints assíncronos.

---

## 10. Checklist de Decisão

Antes de implementar:
- [ ] Perguntou a preferência de framework?
- [ ] Escolheu o framework para ESTE contexto?
- [ ] Decidiu entre async vs sync?
- [ ] Planejou a estratégia de type hints?
- [ ] Definiu a estrutura do projeto?
- [ ] Planejou o tratamento de erros?
- [ ] Considerou tarefas em segundo plano?

---

## 11. Anti-Padrões a Evitar

### ❌ NÃO FAÇA:
- Usar Django por padrão para APIs simples.
- Usar bibliotecas sync em código async.
- Pular type hints em APIs públicas.
- Colocar lógica de negócio em rotas/views.
- Ignorar N+1 queries.
- Misturar async e sync sem cuidado.

---

> **Lembre-se**: Os padrões Python tratam de tomada de decisão para o SEU contexto específico. Não copie código — pense no que atende melhor à sua aplicação.
