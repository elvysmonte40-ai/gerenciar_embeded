---
name: bash-linux
description: Padrões de terminal Bash/Linux. Comandos críticos, piping, tratamento de erros, scripting. Use ao trabalhar em sistemas macOS ou Linux.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Padrões Bash Linux (Bash Linux Patterns)

> Padrões essenciais para Bash no Linux/macOS.

---

## 1. Sintaxe de Operadores

- `;` : Executa sequencialmente (`cmd1; cmd2`).
- `&&` : Executa se o anterior tiver sucesso (`npm install && npm run dev`).
- `||` : Executa se o anterior falhar.
- `|` : Canaliza (pipe) a saída (`ls | grep ".js"`).

---

## 2. Operações de Arquivo e Processos

- **Arquivos**: `ls -la` (listar), `find . -name "*.js"` (buscar), `cat file.txt` (conteúdo), `grep -r "padrao"` (pesquisa no texto), `du -sh *` (tamanho).
- **Processos**: `ps aux` (listar processos), `kill -9 <PID>` (encerrar), `lsof -i :3000` (quem usa a porta 3000).

---

## 3. Processamento de Texto

- `grep`: Busca.
- `sed`: Substituição (`sed -i 's/velho/novo/g' arquivo`).
- `awk`: Extração de colunas.
- `wc -l`: Contagem de linhas.

---

## 4. Variáveis de Ambiente e Rede

- `env`: Ver todas.
- `export VAR="valor"`: Definir temporária.
- `curl`: Downloads e requisições de API (`curl -X GET URL`).
- `nc -zv localhost 3000`: Checar porta.

---

## 5. Scripting e Tratamento de Erros

Sempre comece scripts com:
```bash
#!/bin/bash
set -euo pipefail  # Sai em caso de erro, variável indefinida ou falha no pipe
```
- Use `trap cleanup EXIT` para limpeza automática.
- Verifique se um comando existe com `command -v cmd`.
- Proteja suas variáveis com aspas (`"$VAR"`).

---

## 6. Diferenças de PowerShell para Bash

| Tarefa | PowerShell | Bash |
|------|------------|------|
| Listar arquivos | `Get-ChildItem` | `ls -la` |
| Ambiente | `$env:VAR` | `$VAR` |
| Pipeline | Baseado em Objeto | Baseado em Texto |

---

> **Lembre-se:** Bash é baseado em texto. Use `&&` para cadeias de sucesso, `set -e` para segurança e sempre use aspas em suas variáveis!
