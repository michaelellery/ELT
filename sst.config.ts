/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "elt",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const api = new sst.aws.Function("EltHelloApi", {
      handler: "packages/api/src/index.handler",
      runtime: "nodejs22.x",
      url: true,
    });

    return {
      apiUrl: api.url,
    };
  },
});
