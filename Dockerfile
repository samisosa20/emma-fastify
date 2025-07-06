# Use an official Node.js runtime based on Debian "bookworm" as a parent image.
FROM node:23-slim-bookworm

# Add user that will be used in the container.
RUN useradd node

# Port used by this container to serve HTTP.
EXPOSE 8010

# Set environment variables.
# 1. Set NODE_ENV to production for optimized Node.js performance.
# 2. Set PORT variable. This should match "EXPOSE" command.
ENV NODE_ENV=production \
    PORT=8010

# No longer need Python-specific system packages or Gunicorn.
# If your Fastify app has native dependencies, you might need build-essential
# or other libraries here. For a typical Fastify app, these are often not needed.
# RUN apt-get update --yes --quiet && apt-get install --yes --quiet --no-install-recommends \
#     build-essential \
#  && rm -rf /var/lib/apt/lists/*
#  && rm -rf /var/lib/apt/lists/*

# Use /app folder as a directory where the source code is stored.
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first to leverage Docker cache.
# This allows Docker to reuse the npm install layer if package.json doesn't change.
COPY package*.json ./

# Install Node.js dependencies.
RUN npm install --production

# Set this directory to be owned by the "node" user.
RUN chown node:node /app

# Copy the source code of the project into the container.
# Ensure your Fastify application's source code is copied.
COPY --chown=node:node . .

# Use user "wagtail" to run the build commands below and the server itself.
# Use user "node" to run the application.
USER node

# If your Fastify application is written in TypeScript or requires a build step,
# uncomment the following line. Make sure your package.json has a "build" script.
RUN npm run build

# Runtime command that executes when "docker run" is called.
# This assumes your package.json has a "start" script (e.g., "node dist/server.js").
CMD ["npm", "start"]