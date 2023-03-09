FROM node:18

WORKDIR /app

# Install chromium for puppeteer
RUN apt update && apt install -y chromium

# Install `pnpm` package manager and `serve` for serving the scraped site
RUN npm i -g pnpm serve


# Install packages
COPY package.json pnpm-lock.yaml ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

RUN pnpm i


# Build
COPY . .
RUN pnpm build

# Create alias so that we can use it like `scrape ...`
RUN echo 'alias scrape="node /app/dist/index.js $@"' >> ~/.bashrc

# Expose port for serving scraped site
EXPOSE 3000

CMD [ "/bin/bash" ]