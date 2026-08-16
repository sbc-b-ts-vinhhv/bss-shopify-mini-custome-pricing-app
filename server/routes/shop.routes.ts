import Router from "@koa/router";

import {
  createOrReactivateShopController,
  createShopController,
  getCurrentShopController,
  getShopController,
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
router.post(
  "/install",
  createOrReactivateShopController,
);


export default router;
