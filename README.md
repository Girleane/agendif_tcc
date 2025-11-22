# AgendIF - Sistema de Agendamento de Salas

Este é um projeto Next.js criado com o Firebase Studio para gerenciar o agendamento de salas e espaços.

## Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar a aplicação em seu ambiente de desenvolvimento local.

### 1. Pré-requisitos

- **Node.js**: Certifique-se de ter o Node.js (versão 18 ou superior) instalado. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).
- **npm** (ou Yarn/pnpm): O gerenciador de pacotes do Node.js, que já vem incluído.

### 2. Baixe o Código

Faça o download do código-fonte do projeto (geralmente como um arquivo `.zip`) e extraia-o para uma pasta de sua preferência no seu computador.

### 3. Instale as Dependências

Abra um terminal, navegue até a pasta raiz do projeto e execute o seguinte comando para instalar todas as bibliotecas necessárias:

```bash
npm install
```

### 4. Configure as Variáveis de Ambiente

O projeto se conecta a um backend do Firebase. A configuração já está incluída no código (`src/lib/firebase.ts`) para facilitar.

Se você quiser apontar para um **outro projeto Firebase**, siga estes passos:
1. Crie um arquivo chamado `.env.local` na raiz do projeto.
2. Copie o conteúdo do arquivo `.env.local.example` para dentro do seu novo `.env.local`.
3. Substitua os valores `NEXT_PUBLIC_...` pelas credenciais do seu próprio projeto Firebase.

### 5. Execute a Aplicação

Com tudo configurado, inicie o servidor de desenvolvimento com o comando:

```bash
npm run dev
```

Isso iniciará a aplicação em modo de desenvolvimento com o Turbopack para melhor performance.

### 6. Acesse no Navegador

Abra seu navegador e acesse o seguinte endereço:

[http://localhost:9002](http://localhost:9002)

Você deverá ver a tela de login da aplicação.

## Estrutura do Banco de Dados (Firestore)

A aplicação utiliza o Firestore como banco de dados. Para que funcione corretamente, seu projeto Firebase precisa ter as seguintes coleções:

- **`users`**: Armazena os dados dos usuários (nome, e-mail, perfil).
- **`spaces`**: Armazena os espaços (blocos) e as salas contidas neles.
- **`bookings`**: Armazena todas as solicitações de reserva feitas pelos usuários.

> **Nota:** A aplicação atual está configurada para usar o projeto Firebase com ID `agendif`. Os dados são lidos e gravados diretamente neste projeto.
