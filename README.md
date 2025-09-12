# 🎓 DevSamurai - Plataforma de Cursos Gratuitos

Uma plataforma web moderna e elegante para assistir aos cursos da Dev Samurai de forma gratuita e organizada.

## 📖 Sobre o Projeto

Este projeto foi criado com o objetivo de preservar e disponibilizar gratuitamente todo o conteúdo educacional da **Dev Samurai**, uma das principais plataformas de ensino de programação do Brasil.

### 🎯 Objetivo

A [Dev Samurai](https://class.devsamurai.com.br/) encerrou suas atividades em 2024, mas disponibilizou todo seu conteúdo (aproximadamente 100GB) para download gratuito até dezembro de 2025. Este projeto visa:

- ✅ Organizar todo o conteúdo de forma acessível
- ✅ Criar uma interface moderna e intuitiva
- ✅ Permitir que todos tenham acesso vitalício aos cursos
- ✅ Preservar o legado educacional da Dev Samurai

## 🚀 Funcionalidades

### 🎥 Player Avançado
- **Controles de velocidade**: 0.5x a 2x
- **Barra de progresso interativa**: Navegação por clique e drag
- **Controles customizados**: Interface elegante e responsiva
- **Tempo em tempo real**: Display de progresso atual/total

### 📚 Sistema de Cursos
- **Lista organizada**: Grid responsivo com todos os cursos
- **Progresso individual**: Acompanhamento por curso
- **Navegação intuitiva**: Sidebar com lista de aulas
- **Sistema de rotas**: URLs compartilháveis para cursos específicos

### 💾 Memória Local
- **Progresso salvo**: localStorage para persistência
- **Aulas assistidas**: Marcação automática ao dar play
- **Reset de progresso**: Opção para reiniciar cursos
- **Sincronização**: Atualização em tempo real

### 🎨 Interface Moderna
- **Design dark**: Tema elegante e profissional
- **Responsivo**: Funciona em desktop e mobile
- **Animações suaves**: Transições e efeitos elegantes
- **Navegação por teclado**: Atalhos para melhor experiência

## 📋 Cursos Disponíveis

- **Backend - Dominando o NodeJS** (50 aulas)
- **Backend - Dominando o Postgres** (42 aulas)
- **Carreira de Programador** (50 aulas)
- **Frontend - Criando seu currículo** (3 aulas)
- **Frontend - Criando seu portfólio** (10 aulas)
- **Frontend - CSS Grid** (10 aulas)
- **Frontend - Curriculum HTML** (2 aulas)
- **Frontend - Entendo o HTML com o CSS** (26 aulas)
- **Frontend - Flexbox** (12 aulas)
- **Frontend - Formulário de Cadastro** (3 aulas)

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: Google Cloud Storage
- **Backend**: Node.js (para upload de vídeos)
- **Banco de dados**: JSON local
- **Deploy**: GitHub Pages

## 🌐 Acesso

A plataforma está disponível gratuitamente no GitHub Pages:

**🔗 [Acessar Plataforma](https://seu-usuario.github.io/cursos-devsamurai/)**

### Estrutura do Projeto

```
cursos-devsamurai/
├── raw/                          # Pasta com vídeos dos cursos
│   ├── Frontend - Flexbox/       # Exemplo de curso
│   └── ...
├── gcp-credentials.json          # Credenciais do Google Cloud
├── db.json                       # Banco de dados dos cursos
├── job-upload.js                 # Script para upload dos vídeos
├── index.html                    # Interface principal
├── package.json                  # Dependências do projeto
└── README.md                     # Este arquivo
```

## 🎯 Como Funciona

### 1. Interface Web
- Carrega os cursos do `db.json`
- Exibe lista organizada com progresso
- Player customizado com controles avançados
- Sistema de rotas para URLs compartilháveis

### 2. Persistência
- Progresso salvo no localStorage
- Aulas marcadas como assistidas automaticamente
- Sincronização em tempo real

### 3. Hospedagem
- Deploy automático no GitHub Pages
- Acesso gratuito e global
- Sem necessidade de instalação

## 🤝 Contribuindo

Este projeto é open source e aceita contribuições! Algumas formas de ajudar:

- 🐛 **Reportar bugs**: Abra uma issue descrevendo o problema
- ✨ **Sugerir melhorias**: Proponha novas funcionalidades
- 📝 **Melhorar documentação**: Ajude a tornar o README mais claro
- 🎨 **Melhorar design**: Sugira melhorias na interface
- 📚 **Adicionar cursos**: Contribua com novos conteúdos

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Créditos

### Dev Samurai
Todo o conteúdo educacional é de propriedade da **Dev Samurai** e está sendo disponibilizado gratuitamente conforme autorização da plataforma original.

- **Website original**: [class.devsamurai.com.br](https://class.devsamurai.com.br/)
- **Conteúdo**: Aproximadamente 100GB de cursos de programação
- **Disponibilidade**: Download gratuito até dezembro de 2025

### Agradecimentos
- À equipe da Dev Samurai por disponibilizar todo o conteúdo gratuitamente
- Aos milhares de estudantes que se beneficiaram da plataforma
- À comunidade de desenvolvedores que continua aprendendo e ensinando

## 📞 Contato

Para dúvidas, sugestões ou problemas:

- **GitHub Issues**: [Abrir uma issue](https://github.com/seu-usuario/cursos-devsamurai/issues)
- **Email**: [seu-email@exemplo.com]

---

**⚠️ Importante**: Este projeto é uma iniciativa independente para preservar o conteúdo educacional da Dev Samurai. Todo o crédito pelo conteúdo original pertence à equipe da Dev Samurai.

**🎓 Que o aprendizado continue!** 🚀