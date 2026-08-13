import Router from "@koa/router";
import { appUninstalledController } from "server/controllers/webhook.controller.js";

const router = new Router({
  prefix: "/api/webhooks",
});

router.post(
  "/app-uninstalled",
  appUninstalledController,
);

export default router;