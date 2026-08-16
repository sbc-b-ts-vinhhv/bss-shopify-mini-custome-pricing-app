import Router from "@koa/router";

import {
  createShopController,
  getCurrentShopController,
  getShopController,
  installShopController,
  syncCurrentShopController,
  updateShopController,
} from "../controllers/shop.controller.js";

const router = new Router({
  prefix: "/api/shops",
});

router.get("/current", getCurrentShopController);
router.post("/current/sync", syncCurrentShopController);
router.post("/", createShopController);
router.get("/:id", getShopController);
router.patch("/:id", updateShopController);
router.post("/install", installShopController);


export default router;
