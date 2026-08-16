import Router from "@koa/router";

const router = new Router({
  prefix: "/api/webhooks",
});

router.post("/app-uninstalled");

export default router;
