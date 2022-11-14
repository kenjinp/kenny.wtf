VERSION 0.6

build:
  FROM denoland/deno:1.10.3
  WORKDIR /app
  USER deno
  COPY . .
  RUN ls
  CMD task build
  SAVE ARTIFACT _site

deploy:
  ARG STACK="dev"
  FROM pulumi/pulumi-nodejs
  COPY +build/_site ./_site
  COPY infra ./infra
  WORKDIR infra
  RUN npm install
  RUN --secret PULUMI_ACCESS_TOKEN --secret AWS_ACCESS_KEY_ID --secret AWS_SECRET_ACCESS_KEY pulumi stack select $STACK
  RUN --secret PULUMI_ACCESS_TOKEN --secret AWS_ACCESS_KEY_ID --secret AWS_SECRET_ACCESS_KEY pulumi up -y --skip-preview