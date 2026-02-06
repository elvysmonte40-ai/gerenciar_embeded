# 📁 Gerenciamento de Menus

## Visão Geral

O módulo de Menus permite criar e gerenciar a estrutura hierárquica de navegação da plataforma. Cada menu funciona como um contêiner que agrupa dashboards relacionados, facilitando a organização e localização de relatórios pelos usuários.

## Funcionalidades Principais

- **Criação de menus** - Definição de grupos para organizar dashboards
- **Personalização de ícones** - Seleção de ícones Lucide ou upload de imagens customizadas
- **Ordenação** - Configuração da ordem de exibição no menu lateral
- **Controle de visibilidade** - Ativação/desativação de menus

## Interface do Módulo

### Listagem de Menus

Tabela com todos os menus cadastrados, contendo:
- **Ícone** - Representação visual do menu
- **Título** - Nome de identificação do menu
- **Ordem** - Posição na navegação lateral
- **Status** - Toggle para ativar/desativar exibição
- **Ações** - Botões de edição e exclusão

### Formulário de Cadastro/Edição

| Campo | Descrição | Obrigatório |
|-------|-----------|-------------|
| `Título` | Nome exibido na navegação lateral | Sim |
| `Ícone Lucide` | Seleção de ícone da biblioteca Lucide | Não* |
| `Imagem Personalizada` | Upload de imagem customizada (1:1) | Não* |
| `Ordem` | Posição na listagem (crescente) | Sim |

*É necessário definir pelo menos um tipo de ícone (Lucide ou imagem customizada).

### Sistema de Ícones

**Ícones Lucide:**
Biblioteca de ícones vetoriais disponíveis: BarChart3, DollarSign, Users, ShoppingCart, Package, Settings, TrendingUp, FileText, Building, Truck.

**Imagens Personalizadas:**
- Proporção obrigatória: 1:1 (quadrada) com tolerância de 5%
- Redimensionamento automático para 64x64 pixels
- Armazenamento no bucket `menu-icons`
- Prioridade sobre ícones Lucide quando ambos definidos

## Comportamento do Sistema

- Menus sem dashboards vinculados não são exibidos na navegação
- A ordenação afeta o carregamento automático: o primeiro dashboard do primeiro menu é carregado por padrão
- Desativar um menu oculta todos os dashboards vinculados a ele
