import Router from "@koa/router";

import { appUninstalledController } from "../controllers/webhook.controller.js";

const router = new Router({
  prefix: "/api/webhooks",
});

router.post("/app-uninstalled", appUninstalledController);
// Task 3 thêm: router.post("/shop-update", shopUpdateController);

export default router;