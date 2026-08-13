import type { RouterContext } from "@koa/router";

import { AppError } from "../utils/AppError.js";

type Next = () => Promise<unknown>;

export async function errorHandler(ctx: RouterContext, next: Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      ctx.status = err.statusCode;
      ctx.body = {
        success: false,
        error: { message: err.message },
      };

      return;
    }

    console.error(err);

    ctx.status = 500;
    ctx.body = {
      success: false,
      error: { message: "Internal Server Error" },
    };
  }
}
