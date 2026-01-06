VERSION 0.6

build: 
  FROM node:24-alpine
  ARG PNPM_VERSION=10.14.0
  ARG LIVEBLOCKS_API_KEY

  ENV APP=${APP}
  ENV NODE_OPTIONS="--max-old-space-size=8192"
  ENV NEXT_PUBLIC_LIVEBLOCKS_API_KEY=${NEXT_PUBLIC_LIVEBLOCKS_API_KEY}
  ENV NODE_ENV="development"

  RUN npm --global install pnpm@${PNPM_VERSION}
  WORKDIR /root/monorepo
  RUN apk add --no-cache git
  COPY ./.npmrc .
  COPY ./pnpm-lock.yaml .
  RUN pnpm fetch
  COPY . .
  RUN pnpm install  --frozen-lockfile --unsafe-perm --offline
  RUN pnpm test --if-present
  ENV NODE_ENV="production"
  RUN --secret GITHUB_TOKEN pnpm build
  SAVE ARTIFACT ./_dist

pulumi-node:
  FROM +build
  RUN apk update; apk add curl
  RUN curl -fsSL https://get.pulumi.com | sh
  RUN /root/.pulumi/bin/pulumi version

deploy:
  FROM +pulumi-node
  ARG STACK="kenny.wtf/dev"
  COPY +build/_dist ./_dist
  RUN --secret PULUMI_ACCESS_TOKEN --secret AWS_ACCESS_KEY_ID --secret AWS_SECRET_ACCESS_KEY /root/.pulumi/bin/pulumi up -C=./infra/pulumi -s=dev --yes --skip-preview
