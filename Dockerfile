# Used for running tests
FROM node:current-alpine
RUN apk add screen bash
WORKDIR /app
COPY package* ./
RUN npm install
COPY . .
CMD npm run test-local
