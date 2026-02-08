---
name: red-team-tactics
description: Princípios de táticas de Red Team baseados no MITRE ATT&CK. Fases de ataque, evasão de detecção e relatórios.
allowed-tools: Read, Glob, Grep
---

# Táticas de Red Team (Red Team Tactics)

> Princípios de simulação de adversários baseados no framework MITRE ATT&CK.

---

## 1. Fases do MITRE ATT&CK

O ciclo de vida do ataque segue:
**Reconhecimento → Acesso Inicial → Execução → Persistência → Escalada de Privilégio → Evasão de Defesa → Acesso a Credenciais → Descoberta → Movimentação Lateral → Coleta → C2 (Comando e Controle) → Exfiltração → Impacto.**

---

## 2. Princípios de Reconhecimento

- **Passivo**: Sem contato direto com o alvo, limitando informações mas reduzindo o risco de detecção.
- **Ativo**: Contato direto, obtendo mais informações com maior risco de ser descoberto.
- **Alvos**: Stack tecnológica, informações de funcionários (social engineering), faixas de rede e terceiros (supply chain).

---

## 3. Vetores de Acesso Inicial

Escolha entre Phishing (alvo humano), exploits públicos (serviços vulneráveis expostos), credenciais válidas (vazadas ou quebradas) ou acesso via cadeia de suprimentos (terceiros).

---

## 4. Escalada de Privilégio

Identifique caminhos para obter privilégios de administrador ou root, como caminhos de serviço não entre aspas (unquoted service paths) no Windows ou binários SUID e configurações incorretas de Sudo no Linux.

---

## 5. Evasão de Defesa

- Use ferramentas legítimas do sistema (**LOLBins**) para evitar suspeitas.
- Ofusque código malicioso e oculte modificações de arquivos (**Timestomping**).
- Mimetize padrões de tráfego legítimo e trabalhe em horário comercial.

---

## 6. Movimentação Lateral

Use credenciais capturadas (senhas, hashes, tickets) para se espalhar por outros sistemas via RDP, SSH, WinRM ou compartilhamentos administrativos.

---

## 7. Ataques de Active Directory

Foque em categorias como Kerberoasting (senhas de contas de serviço), AS-REP Roasting, DCSync e Golden Tickets para persistência no domínio.

---

## 8. Princípios de Relatórios

Documente a narrativa do ataque (fluxo completo), as técnicas utilizadas e as falhas de detecção encontradas, sugerindo como melhorar as defesas.

---

## 9. Limites Éticos

- **SEMPRE**: Fique dentro do escopo, minimize o impacto, documente tudo e reporte ameaças reais encontradas imediatamente.
- **NUNCA**: Destrua dados de produção, cause negação de serviço (DoS), retenha dados sensíveis ou vá além da prova de conceito (PoC).

---

> **Lembre-se:** O Red Team simula atacantes para melhorar as defesas, não para causar danos.
