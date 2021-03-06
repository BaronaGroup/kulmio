# Used for running tests
FROM node:current
WORKDIR /app
RUN apt-get update && \
  apt-get install -y screen && \
  apt-get clean autoclean && \
  apt-get autoremove --yes && \
  rm -rf /var/lib/{apt,dpkg,cache,log}/
COPY package* ./
RUN npm install
COPY . .
CMD npm run test-local
