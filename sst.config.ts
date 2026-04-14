/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "elt",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: { region: "us-east-1" },
      },
    };
  },
  async run() {
    // Secret for Anthropic API key
    // Set via: npx sst secret set AnthropicApiKey sk-ant-... --stage <stage>
    const anthropicKey = new sst.Secret("AnthropicApiKey");

    // Backend API Lambda — Hono on Lambda with streaming + Function URL
    const api = new sst.aws.Function("EltApi", {
      handler: "packages/api/src/index.handler",
      runtime: "nodejs22.x",
      url: {
        cors: true,
        streaming: true,
      },
      timeout: "120 seconds",
      memory: "512 MB",
      link: [anthropicKey],
    });

    // Frontend static site — React + Vite, deployed to S3 + CloudFront
    const web = new sst.aws.StaticSite("EltWeb", {
      path: "packages/web",
      build: {
        command: "pnpm run build",
        output: "dist",
      },
      environment: {
        VITE_API_URL: api.url,
      },
    });

    return {
      apiUrl: api.url,
      webUrl: web.url,
    };
  },
});
