import "dotenv/config";
import { createRequire } from "node:module";
import bodyParser from "koa-bodyparser";
import Router, { type RouterContext } from "@koa/router";
import cors from "@koa/cors";

import shopRoutes from "./routes/shop.routes.js";
import ruleRoutes from "./routes/rule.routes.js";
import webhookRoutes from "./routes/webhook.routes.js"
import { errorHandler } from "./middleware/errorHandler.js";

const require = createRequire(import.meta.url);

type KoaApp = {
  use: (middleware: unknown) => KoaApp;
  listen: (port: number, listeningListener?: () => void) => void;
};

const Koa = require("koa") as unknown as { new (): KoaApp };

const app = new Koa();
const router = new Router();

app.use(cors());

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

app.use(webhookRoutes.routes());
app.use(webhookRoutes.allowedMethods());

// Cổng riêng của Koa. Không dùng PORT vì Vite/Shopify CLI cũng đọc biến đó.
const API_PORT = Number(process.env.API_PORT) || 8080;

app.listen(API_PORT, () => {
  console.log(`🚀 API server running at http://localhost:${API_PORT}`);
});
