---
name: mobile-design
description: Design thinking mobile-first e tomada de decisão para apps iOS e Android. Interação por toque, padrões de performance, convenções de plataforma. Ensina princípios, não valores fixos. Use ao construir React Native, Flutter ou apps nativos.
allowed-tools: Read, Glob, Grep, Bash
---

# Sistema de Design Mobile (Mobile Design System)

> **Filosofia:** Toque primeiro (Touch-first). Consciente da bateria. Respeitoso com a plataforma. Capaz de operar offline.
> **Princípio Central:** Mobile NÃO é um desktop pequeno. PENSE nas restrições mobile, PERGUNTE a escolha da plataforma.

---

## 🔧 Scripts de Runtime
| Script | Propósito | Uso |
|--------|---------|-------|
| `scripts/mobile_audit.py` | Auditoria de UX Mobile & Toque | `python scripts/mobile_audit.py <caminho_do_projeto>` |

---

## ⚠️ CRÍTICO: PERGUNTE ANTES DE PRESUMIR (OBRIGATÓRIO)

**Se a solicitação for aberta, NÃO use seus padrões favoritos por padrão.**

- **Plataforma**: "iOS, Android ou ambos?" (Afeta cada decisão de design).
- **Framework**: "React Native, Flutter ou nativo?" (Determina ferramentas e padrões).
- **Navegação**: "Barra de abas (tabs), gaveta (drawer) ou baseado em pilha (stack)?"
- **Offline**: "Precisa funcionar offline?"
- **Dispositivos**: "Apenas celular ou suporte para tablet?"

---

## ⛔ ANTI-PADRÕES MOBILE A EVITAR (Pecados da IA)

### Pecados de Performance
- ❌ **ScrollView para listas longas**: Renderiza TUDO, explode a memória. ✅ Use `FlatList` / `FlashList`.
- ❌ **Função renderItem inline**: Nova função a cada render. ✅ Use `useCallback` + `React.memo`.
- ❌ **Pular keyExtractor**: IDs instáveis geram bugs. ✅ Use IDs únicos e estáveis.
- ❌ **Animations em JS thread**: Animações travadas. ✅ Sempre use `useNativeDriver: true`.

### Pecados de Toque/UX
- ❌ **Alvo de toque < 44px**: Impossível de clicar com precisão. ✅ Mínimo 44pt (iOS) / 48dp (Android).
- ❌ **Sem estado de carregamento**: O usuário acha que travou. ✅ SEMPRE mostre feedback visual.
- ❌ **Ignorar convenções de plataforma**: Usuário fica confuso. ✅ iOS deve parecer iOS, Android deve parecer Android.

---

## 🧠 Psicologia UX Mobile

- **Lei de Fitts para Toque**: O dedo é impreciso (~7mm). Alvos DEVEM ser de 44-48px no mínimo.
- **Zona do Polegar (Thumb Zone)**: Ações importantes devem estar na parte inferior da tela (alcance fácil). Ações destrutivas devem ficar longe do alcance fácil.
- **Carga Cognitiva**: Mobile é para UMA tarefa de cada vez. Sem estados de "hover", apenas toque ou nada.

---

## 📝 CHECKPOINT (OBRIGATÓRIO antes de qualquer trabalho Mobile)

Antes de escrever qualquer código mobile, você deve definir:
1. **Plataforma**: iOS / Android / Ambos.
2. **Framework**: React Native / Flutter / Nativo.
3. **Princípios a aplicar**: (ex: FlatList otimizada, alvos de 48px).

---

## 📋 Checklist Pré-Desenvolvimento

- [ ] Plataforma confirmada?
- [ ] Navegação decidida (Abas/Pilha)?
- [ ] Alvos de toque ≥ 44-48px?
- [ ] CTA principal na zona do polegar?
- [ ] Estado de erro com opção de "tentar novamente" existe?
- [ ] Permissões e segurança considerados (SecureStore para tokens)?

---

> **Lembre-se:** Usuários mobile são impacientes, interrompidos e usam dedos imprecisos em telas pequenas. Projete para as PIORES condições: rede ruim, uma mão, sol forte, bateria baixa. Se funcionar lá, funciona em qualquer lugar.
