# Used for running tests
FROM node:current
WORKDIR /app
RUN apt-get update && \
  apt-get install -y screen && \
  apt-get clean autoclean && \
  apt-get autoremove --yes && \
  rm -rf /var/lib/{apt,dpkg,cache,log}/
COPY package* ./
COPY .npmrc .
RUN npm install --ignore-scripts
COPY . .
RUN npm run prepare
CMD npm run test-local
