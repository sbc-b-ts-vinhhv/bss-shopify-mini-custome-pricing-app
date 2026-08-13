import Router from "@koa/router";

import {
  createShopController,
  getShopController,
  updateShopController,
} from "../controllers/shop.controller.js";

const router = new Router({
  prefix: "/api/shops",
});

router.post("/", createShopController);
router.get("/:id", getShopController);
router.put("/:id", updateShopController);

export default router;