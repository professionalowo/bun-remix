import type { ServerBuild } from "@remix-run/server-runtime";
import { createRequestHandler } from "@remix-run/server-runtime";
import { resolve } from "node:path";
type CreateRequestHandlerArgs = {
  build:
    | ServerBuild
    | Promise<ServerBuild>
    | (() => ServerBuild | Promise<ServerBuild>);
  mode: "production" | "development";
};

export function handler({ build: b, mode }: CreateRequestHandlerArgs) {
  return async function (request: Request) {
    const build = await resolveBuild(b);
    const { pathname } = new URL(request.url);
    const filePath = resolve(
      process.cwd(),
      build.assetsBuildDirectory,
      `.${pathname}`
    );
    const file = Bun.file(filePath);
    if (await file.exists()) return new Response(file);
    return createRequestHandler(build, mode)(request);
  };
}

async function resolveBuild(
  build: CreateRequestHandlerArgs["build"]
): Promise<ServerBuild> {
  if (typeof build === "function") return await build();
  return build;
}

export { handler as createRequestHandler, type CreateRequestHandlerArgs };
