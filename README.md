# 🌉 PonteEscola

> **A ponte digital entre a escola e a família.**

O **PonteEscola** é um aplicativo que centraliza e facilita a comunicação entre professores, coordenação pedagógica e pais de alunos da Educação Infantil. O objetivo é substituir o uso informal do WhatsApp por um canal oficial, organizado, seguro e com confirmação de leitura.

Projeto desenvolvido como parte da disciplina **Startup Project: One** do curso de **Análise e Desenvolvimento de Sistemas** do **Centro Universitário Facens**, sob orientação do professor **Bruno Aguilar da Cunha**.

---

## 🎯 O Problema

Atualmente, muitos professores e coordenadores utilizam o **WhatsApp pessoal** para comunicar pais sobre provas, eventos, ocorrências e atividades. Isso gera:

- ❌ Sobrecarga de mensagens
- ❌ Mistura entre vida pessoal e profissional
- ❌ Falta de registro organizado
- ❌ Dificuldade em confirmar quem leu cada aviso
- ❌ Perda de informações importantes

---

## 💡 A Solução

O PonteEscola oferece um **canal oficial** entre escola e família, com:

- 📢 **Avisos e comunicados** com confirmação de leitura por aluno
- ⚠️ **Registro de ocorrências** com tipo, gravidade, providências e acompanhamento, visíveis para o responsável
- ✅ **Autorização digital de passeios**, com prazo e resposta do responsável (autorizar ou recusar)
- 🖼️ **Mural da Turma** com fotos, curtidas e comentários
- 📚 **Atividades** com prazo e confirmação de leitura
- 📅 **Calendário escolar** (provas, reuniões, eventos e feriados) por turma
- 🍽️ **Cardápio semanal** (café, almoço e lanche)
- 💬 **Caixa de mensagens** entre responsáveis e coordenação, com arquivamento e exclusão
- ❓ **Central de dúvidas** com tópicos de perguntas frequentes
- 🔔 **Notificações** no sino do topo (mensagens não lidas, ocorrências recentes, prazos próximos)

---

## 👥 Público-Alvo

- **Professores** da Educação Infantil (rede pública e privada)
- **Coordenação pedagógica e cargos administrativos**
- **Pais e responsáveis** de alunos

---

## 🧭 Perfis e telas

O sistema tem três perfis, cada um com seu próprio conjunto de telas:

| Perfil | O que faz | Telas principais |
|---|---|---|
| **Professor** | Comunica a turma e registra o dia a dia | Início, Avisos, Ocorrências, Atividades, Autorizações, Mural da Turma, Perfil |
| **Coordenação** | Gestão completa da escola | Início, Turmas e Alunos, Avisos, Ocorrências, Autorizações (passeios), Calendário, Cardápio, Mensagens, Dúvidas, Perfil |
| **Responsável** | Acompanha o(s) filho(s) | Início, Comunicados, Ocorrências, Passeios, Calendário, Cardápio, Mural, Dúvidas |

Um responsável com mais de um filho troca de aluno pelo seletor no topo da página.

---

## 🛠️ Tecnologias

### Versão atual (MVP)
- **Front-end:** HTML, CSS e JavaScript puro (sem etapa de build)
- **Banco de dados:** PostgreSQL em nuvem, acessado por API a partir do navegador
- **Sessão simulada:** `localStorage` guarda apenas quem está "logado" (ver [Limitações](#-limitações-do-mvp))
- **Ícones:** [Lucide](https://lucide.dev/icons/)
- **Organização:** Trello, GitHub

### Evolução prevista (projeto final)
- **Front-end:** Angular
- **Back-end:** Java com Spring Boot
- **Banco de Dados:** PostgreSQL
- **Autenticação:** Keycloak (JWT)
- **Ferramentas:** Insomnia, DBeaver, Docker, GitHub

---

## ▶️ Como executar

Não há nada para instalar ou compilar.

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd ponte-escola
   ```
2. Sirva a pasta com qualquer servidor estático. Exemplos:
   - extensão **Live Server** do VS Code (clique direito em `index.html` → *Open with Live Server*); ou
   - `python3 -m http.server 8000` e acesse `http://localhost:8000`.
3. Na tela inicial, escolha o perfil: **Professor**, **Coordenador** ou **Responsável**.

O projeto já vem configurado com o banco de dados da equipe (conexão na pasta `services/`). Para usar o seu próprio banco, veja a seção abaixo.

### Usando seu próprio banco

1. Crie um banco PostgreSQL em nuvem com acesso por API.
2. Crie as tabelas do sistema, seguindo o diagrama do banco em `docs/diagrama-banco.png` e o agrupamento da seção [Banco de dados](#️-banco-de-dados).
3. Ajuste a URL e a chave **pública** de acesso no arquivo de conexão da pasta `services/`. Nunca use uma chave de administrador no front-end.
4. Ative e configure o **RLS** (políticas de acesso por linha) das tabelas. Sem políticas, as consultas retornam vazio; com políticas abertas, qualquer pessoa com a URL lê e altera os dados.

---

## 🗄️ Banco de dados

Principais tabelas (PostgreSQL):

| Grupo | Tabelas |
|---|---|
| Pessoas e turmas | `administrador` (professores e coordenação, campo `tipo`), `responsavel`, `aluno`, `turma`, `professores_turmas` |
| Comunicação | `avisos`, `avisos_lidos`, `conversas`, `mensagens` |
| Ocorrências | `ocorrencias`, `ocorrencias_lidas` |
| Atividades | `atividades`, `atividades_lidas`, `notificacoes_atividades` |
| Passeios | `autorizacoes`, `autorizacoes_turmas`, `autorizacoes_respostas` |
| Mural | `mural_posts`, `mural_comentarios` |
| Calendário, cardápio e dúvidas | `eventos`, `eventos_turmas`, `cardapio`, `duvidas_topicos`, `duvidas_config` |

---

## 📁 Documentação

| Documento | Link |
|---|---|
| 📄 Documentação do Projeto | [Abrir documento (PDF)](https://github.com/Gabriel-da-Silva-Puente/StartUp-ABICAP/blob/main/ponte-escola/docs/PonteEscola_Documentacao_AC2_Revisada_v2.pdf) |
| 🧪 Planilha de Teste de Usabilidade | [Google Sheets](https://docs.google.com/spreadsheets/d/19xOnLLK_7is7UFR0Kb8XYMJ54Sn2aR47nqkAI8BORKk/edit?gid=1392540101#gid=1392540101) |
| 🎨 Protótipo Navegável (Figma Make) | [Figma Make](https://www.figma.com/make/9deQojtbyI4S7AXxzjgW4g/Criar-conte%25C3%25BAdo-do-markdown?p=f&fullscreen=1&preview-route=%2Flanding) |
| 🗃️ Diagrama do banco de dados | [Abrir diagrama](https://github.com/Gabriel-da-Silva-Puente/StartUp-ABICAP/blob/main/ponte-escola/docs/supabase-schema-ngwvwvjmkhitiikjovtz%282%29.png) |

---

## 📂 Estrutura do Projeto

```
ponte-escola/
├── index.html          # Tela de login (escolha de perfil)
├── pages/              # Telas HTML de cada perfil
│   ├── administrador-*.html   # Coordenação
│   ├── responsavel-*.html     # Responsável
│   └── inicio, avisos, ocorrencias, atividades,
│       autorizacoes, muralDaTurma, perfil   # Professor
├── components/         # Peças reutilizáveis
│   ├── topbar.js, sidebar.js                      # Professor
│   ├── administrador-topbar.js / -sidebar.js      # Coordenação
│   ├── responsavel-topbar.js                      # Responsável
│   ├── notificacoes.js                            # Sino de notificações
│   ├── utilitarios.js                             # escaparHtml, datas, avisos
│   └── *.css                                      # global, layout, componentes
├── services/           # Acesso ao banco de dados (uma classe por assunto)
│   └── supabase.js     # Conexão com o banco (cria o cliente `banco`)
├── scripts/            # Lógica de cada página
├── styles/             # CSS de cada página
├── assets/             # Logo e ícones (Lucide)
└── docs/               # Documentação e diagrama do banco
```

**Padrão adotado:** cada página `.html` carrega a biblioteca de acesso ao banco (CDN), a conexão em `services/`, os *services* de que precisa, os *components* (barra do topo) e, por fim, o seu *script*. Os *services* concentram as consultas; os *scripts* cuidam de tela e eventos.

---

## ⚠️ Limitações do MVP

Este é um MVP acadêmico para demonstração. Pontos conhecidos:

- **Login simulado:** os três botões da tela inicial gravam um usuário fixo no `localStorage` (professor, coordenador e responsável de exemplo). Não há senha nem autenticação real.
- **Segurança depende do RLS:** o front-end acessa o banco diretamente com a chave pública de acesso. A proteção real dos dados exige políticas de RLS configuradas no banco.
- **Notificações simples:** o sino mostra o estado atual do banco (mensagens não lidas, ocorrências das últimas 48h, prazos próximos). Não há envio automático nem notificação fora do app.
- **Exclusão de turma:** só é permitida para turmas sem alunos e apaga também avisos, ocorrências, atividades e mural vinculados a ela.

---

## 🚀 Próximos passos

- Autenticação real (Keycloak no projeto final)
- Políticas de RLS por perfil
- Migração para a arquitetura final (Angular + Spring Boot + PostgreSQL)
- Notificações automáticas e por e-mail/push
- Testes automatizados

---

## 🧑‍💻 Equipe

| Integrante | RA | Função |
|---|---|---|
| Gabriel da Silva Puente | RA252098 | Gestão e Documentação |
| Guilherme Ferreira Agostinho | RA251982 | Organização e Qualidade |
| Enrico Pimentel Gotti Encarnação | RA250779 | Back-end e Banco de Dados |
| Levi da Silva Vitorio | RA252190 | Front-end e Interface |
| João Vítor Vieira Skierzynski | RA250964 | UX/UI e Testes |
| Isabelly | RA987654 | Organização e Qualidade |
