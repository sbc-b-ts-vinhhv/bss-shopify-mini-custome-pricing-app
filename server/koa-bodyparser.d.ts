declare module "koa-bodyparser" {
  import type { Middleware } from "koa";

  export interface BodyParserOptions {
    enableTypes?: Array<"json" | "form" | "text" | "xml">;
    detectJSON?: (ctx: unknown) => boolean;
    extendTypes?: {
      json?: string[];
      form?: string[];
      text?: string[];
      xml?: string[];
    };
    onerror?: (err: Error, ctx: unknown) => void;
    parsedMethods?: string[];
    strict?: boolean;
    jsonLimit?: string | number;
    formLimit?: string | number;
    textLimit?: string | number;
    xmlLimit?: string | number;
    encoding?: string;
    returnRawBody?: boolean;
    queryString?: unknown;
  }

  const bodyParser: (options?: BodyParserOptions) => Middleware;

  export default bodyParser;
}

declare module "koa" {
  interface Request {
    body?: unknown;
    rawBody?: string;
  }
}
