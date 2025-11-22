# Estágio 1: Builder - Onde instalamos as dependências e construímos o projeto
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia o package.json e package-lock.json para o contêiner
# O '*' garante que ambos os arquivos sejam copiados
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código-fonte da aplicação
COPY . .

# Executa o script de build do Next.js para gerar a versão de produção
RUN npm run build

# Estágio 2: Runner - A imagem final, leve e pronta para produção
FROM node:18-alpine

WORKDIR /app

# Instala apenas as dependências de produção.
COPY package*.json ./
RUN npm install --omit=dev

# Copia os arquivos da build do estágio 'builder' para a imagem final
COPY --from=builder /app/.next ./.next

# Expõe a porta 3000, que é a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar a aplicação em modo de produção
CMD ["npm", "start"]