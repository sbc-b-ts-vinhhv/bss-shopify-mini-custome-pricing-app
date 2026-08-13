import Router from "@koa/router";

import {
  createOrReactivateShopController,
  createShopController,
  getCurrentShopController,
  getShopByShopifyIdController,
  getShopController,
  updateShopController,
} from "../controllers/shop.controller.js";

const router = new Router({
  prefix: "/api/shops",
});

router.get("/current", getCurrentShopController);
router.get("/by-shopify-id", getShopByShopifyIdController);
router.post("/", createShopController);
router.get("/:id", getShopController);
router.patch("/:id", updateShopController);
router.post(
  "/install",
  createOrReactivateShopController,
);


export default router;
