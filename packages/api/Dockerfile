FROM node:15.8.0-slim AS base

# An empty file that we can "copy" around to create dependencies between build stages
RUN echo -n > /noop

ARG port
WORKDIR /opt/app

# Set CI to turn off scripts that should not run during CI (i.e. husky)
ENV CI=1

# Copy over package.json (and package-lock.json) first and do an npm install
# It allows us to use Docker image caching on subsequent builds (unless we update package.json)
COPY package*.json ./
RUN npm ci

# Add files needed to run server
COPY src/ ./src/
COPY .env ./

FROM base AS testfiles
COPY test/ ./test/

FROM testfiles AS audit
RUN echo '\nNode version:' \
 && node --version \
 && echo '\nnpm version:' \
 && npm --version \
 && echo '\nOutdated Packages:' \
 && npm outdated || true \
 && echo '' \
 && npm audit --audit-level critical

FROM testfiles AS lint
RUN npm run lint

FROM testfiles AS unittest
RUN npm test

FROM testfiles AS build
COPY tsconfig.json ./
RUN npm run build

FROM base as test
COPY --from=audit /noop /
COPY --from=lint /noop /
COPY --from=unittest /noop /
COPY --from=build dist ./dist/

FROM test AS release
RUN npm prune --production
ENV NODE_ENV="production"
EXPOSE $port
USER node

CMD ["npm", "start"]
