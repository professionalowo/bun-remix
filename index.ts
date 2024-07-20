import { type ServerBuild, createRequestHandler } from "@remix-run/node";
import { resolve } from "node:path";
type CreateRequestHandlerArgs = {
  build:
    | ServerBuild
    | Promise<ServerBuild>
    | (() => ServerBuild | Promise<ServerBuild>);
  mode: "production" | "development";
};

/**
 * @param {CreateRequestHandlerArgs} the {@link CreateRequestHandlerArgs} object
 * @returns a funtion that delegates the request to the remix server build
 * @author Professionalowo
 * @since 1.0.0
 */
export async function handler({ build: b, mode }: CreateRequestHandlerArgs) {
  const build = await resolveBuild(b);
  const remix = createRequestHandler(build, mode);
  return async function (request: Request) {
    // Try to get the file from the assets build directory
    const { pathname } = new URL(request.url);
    const filePath = resolve(
      process.cwd(),
      build.assetsBuildDirectory,
      `.${pathname}`
    );
    const file = Bun.file(filePath);
    // If the file exists, return it
    if (await file.exists()) return new Response(file);

    // Otherwise, delegate the request to the remix server build
    return remix(request);
  };
}

/**
 * @param build - A promise of a remix server build, a function that returns a remix server build or a remix server build
 * @returns A promise that resolves to the remix build
 */
async function resolveBuild(
  build: CreateRequestHandlerArgs["build"]
): Promise<ServerBuild> {
  if (typeof build === "function") return await build();
  return build;
}

export { handler as createRequestHandler, type CreateRequestHandlerArgs };
