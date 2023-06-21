# Kenny.wtf

A friendly internet space about procedural generation and critical worldbuilding by [Kenny Pirman](https://twitter.com/KennyPirman)

## Development

## ./apps/web

Contains the website / webapp

## ./infra

> **Info**
> This is way over-engineered, but I kind of like it?

Contains the infrastructure code, which will deploy the assets to AWS via an s3 bucket, assign a cloudfront CDN, and configure a domain via [pulumi](pulumi.com/)
