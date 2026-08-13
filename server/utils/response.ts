import type { RouterContext } from "@koa/router";

export function ok<T>(ctx: RouterContext, data: T, status = 200) {
  ctx.status = status;
  ctx.body = {
    success: true,
    data,
  };
}

export function noContent(ctx: RouterContext) {
  ctx.status = 204;
  ctx.body = null;
}
