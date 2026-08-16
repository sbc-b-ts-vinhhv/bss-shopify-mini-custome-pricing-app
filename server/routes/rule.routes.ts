import Router from "@koa/router";
import {
  createRuleController,
  listRulesController,
  getRuleController,
  updateRuleController,
  duplicateRuleController,
  deleteRuleController,
  syncMetafieldController,
} from "../controllers/rule.controller.js";

const router = new Router({
  prefix: "/api/rules",
});

router.post("/sync-metafield", syncMetafieldController);

router.post("/", createRuleController);
router.get("/", listRulesController);
router.post("/:id/duplicate", duplicateRuleController);
router.get("/:id", getRuleController);
router.patch("/:id", updateRuleController);
router.delete("/:id", deleteRuleController);

export default router;
