FROM --platform=$TARGETPLATFORM node:18.14.0-alpine AS webber-crm
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

COPY . .

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "--", "run", "start"]

