###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:22-alpine AS development

# Create app directory
WORKDIR /usr/src/app

# Enable pnpm via corepack
RUN corepack enable

# Copy dependency manifests first for better Docker layer caching
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies without running lifecycle scripts yet
RUN pnpm install --frozen-lockfile --ignore-scripts

# Bundle app source
COPY --chown=node:node . .

# Run lifecycle scripts after full project files are present
RUN pnpm install --frozen-lockfile

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:22-alpine AS build

WORKDIR /usr/src/app

RUN corepack enable

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN pnpm build

# Set NODE_ENV environment variable
ENV NODE_ENV=production

# Remove devDependencies from node_modules for runtime image
RUN pnpm prune --prod --ignore-scripts

USER node

###################
# PRODUCTION
###################

FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
RUN npm install -g @quasar/cli

# Start the server using the production build
CMD ["quasar", "serve", "dist/spa", "--history", "--port", "3001" ]
# quasar serve dist/spa -p 9000 --history
