import Router from "@koa/router";

import {
  appUninstalledController,
  shopUpdateController,
} from "../controllers/webhook.controller.js";

const router = new Router({
  prefix: "/api/webhooks",
});

router.post("/app-uninstalled", appUninstalledController);
router.post("/shop-update", shopUpdateController);

export default router;