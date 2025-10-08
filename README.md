# Sistema de Locação de Veículos

Este é um projeto front-end simples para um sistema de locação de veículos, construído com HTML, CSS e JavaScript puros.

## Como Executar

Nenhuma instalação é necessária. Basta abrir o arquivo `index.html` em seu navegador de preferência.

## Funcionalidades

O sistema permite o gerenciamento completo de veículos, clientes e locações, armazenando os dados no `localStorage` do navegador.

### Gerenciamento de Veículos
- Cadastro de novos veículos (marca, modelo, ano, placa, disponibilidade).
- Edição e exclusão de veículos existentes.
- Busca por marca e modelo.

### Gerenciamento de Clientes
- Cadastro de novos clientes (nome, e-mail, telefone).
- Edição e exclusão de clientes.
- Visualização do histórico de locações de cada cliente.

### Gerenciamento de Locações
- Criação de novas locações.
- Edição e cancelamento de locações existentes.

## Estrutura de Arquivos

- `index.html`: Arquivo principal da aplicação.
- `css/style.css`: Folha de estilos.
- `js/`: Contém os scripts da aplicação.
  - `app.js`: Lógica principal e de navegação.
  - `db.js`: Simulação de banco de dados com `localStorage`.
  - `vehicles.js`: Funções para o gerenciamento de veículos.
  - `clients.js`: Funções para o gerenciamento de clientes.
  - `rentals.js`: Funções para o gerenciamento de locações.
- `db-config/azure-mysql-connection.js`: Arquivo de exemplo para futura conexão com banco de dados.
