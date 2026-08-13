// `@types/node` in this repo does not yet declare `module.registerHooks`
// (added to Node in v22.15.0 / v23.5.0, ahead of the installed @types/node
// version). This augments the existing "node:module" ambient module with
// just the shape mcp/server.ts actually uses, instead of silencing the
// error with a blanket @ts-expect-error.
declare module "node:module" {
  interface ModuleResolveHookContext {
    conditions: string[];
    importAttributes: Record<string, string>;
    parentURL: string | undefined;
  }

  interface ModuleResolveHookResult {
    url: string;
    format?: string | null;
    importAttributes?: Record<string, string>;
    shortCircuit?: boolean;
  }

  type ModuleNextResolve = (
    specifier: string,
    context?: Partial<ModuleResolveHookContext>,
  ) => ModuleResolveHookResult;

  interface ModuleRegisterHooks {
    resolve?: (
      specifier: string,
      context: ModuleResolveHookContext,
      nextResolve: ModuleNextResolve,
    ) => ModuleResolveHookResult;
  }

  function registerHooks(hooks: ModuleRegisterHooks): void;
}
