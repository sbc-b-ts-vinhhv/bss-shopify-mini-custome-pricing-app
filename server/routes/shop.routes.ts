import Router from "@koa/router";
import {
  createShopController,
  getCurrentShopController,
  getShopController,
  installShopController,
  syncCurrentShopController,
  updateShopController,
  acknowledgeCurrencyChangeController,
} from "../controllers/shop.controller.js";

const router = new Router({
  prefix: "/api/shops",
});

router.get("/current", getCurrentShopController);
router.post("/current/sync", syncCurrentShopController);
router.post(
  "/current/acknowledge-currency-change",
  acknowledgeCurrencyChangeController,
);
router.post("/", createShopController);
router.get("/:id", getShopController);
router.patch("/:id", updateShopController);
router.post("/install", installShopController);

export default router;
