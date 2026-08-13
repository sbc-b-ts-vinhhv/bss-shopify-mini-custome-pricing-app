import "dotenv/config";
import { createRequire } from "node:module";
import bodyParser from "koa-bodyparser";
import Router, { type RouterContext } from "@koa/router";

import shopRoutes from "./routes/shop.routes.js";
import ruleRoutes from "./routes/rule.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const require = createRequire(import.meta.url);

type KoaApp = {
  use: (middleware: unknown) => KoaApp;
  listen: (port: number, listeningListener?: () => void) => void;
};

const Koa = require("koa") as unknown as { new (): KoaApp };

const app = new Koa();
const router = new Router();

app.use(errorHandler);
app.use(bodyParser());

router.get("/health", (ctx: RouterContext) => {
  ctx.status = 200;
  ctx.body = {
    success: true,
    message: "API is running",
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(shopRoutes.routes());
app.use(shopRoutes.allowedMethods());

app.use(ruleRoutes.routes());
app.use(ruleRoutes.allowedMethods());

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
});
