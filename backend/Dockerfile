FROM node:20-slim AS base

# WORKDIR define onde o código vai morar DENTRO do container. 
# Não tem relação com as pastas do seu Ubuntu.
WORKDIR /app

# Instalamos o pnpm globalmente no container
RUN npm install -g pnpm

# Copiamos apenas os arquivos de dependências primeiro (otimiza o build)
COPY package.json pnpm-lock.yaml* ./

# Instalamos as dependências dentro do ambiente isolado do Docker
FROM base AS development
RUN pnpm install

# Copiamos o resto do código, excluindo node_modules e dist
COPY --exclude=node_modules --exclude=dist . .

# Comando para iniciar (ajuste conforme o seu package.json: 'dev' ou 'start')
CMD ["pnpm", "dev", "--host"]

FROM base AS build
RUN pnpm install --frozen-lockfile
COPY --exclude=node_modules --exclude=dist . .
RUN pnpm build

# Estágio 4: Servir os arquivos (Final)
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]