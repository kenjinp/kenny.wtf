VERSION 0.6

build: 
  FROM node:18.12-alpine
  ARG PNPM_VERSION=8.6.2
  ARG LIVEBLOCKS_API_KEY
  ARG GITHUB_TOKEN

  ENV APP=${APP}
  ENV NODE_OPTIONS="--max-old-space-size=2048"
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
  RUN pnpm build
  SAVE ARTIFACT ./_dist

pulumiNode:
  FROM +build
  RUN apk update; apk add curl
  RUN curl -fsSL https://get.pulumi.com | sh
  RUN /root/.pulumi/bin/pulumi version

deploy:
  FROM pulumiNode
  ARG STACK="dev"
  COPY +build/out ./_dist
  COPY infra.ts infra.ts
  RUN --secret PULUMI_ACCESS_TOKEN pulumi stack select $STACK
  RUN --secret PULUMI_ACCESS_TOKEN --secret AWS_ACCESS_KEY_ID --secret AWS_SECRET_ACCESS_KEY pulumi up -C=./infra/pulumi -s=dev --yes --skip-preview