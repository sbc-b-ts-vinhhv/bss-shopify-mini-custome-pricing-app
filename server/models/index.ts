import { Shop } from "./Shop.js";
import { Rule } from "./Rule.js";

Shop.hasMany(Rule, {
  foreignKey: "shopId",
  as: "rules",
});

Rule.belongsTo(Shop, {
  foreignKey: "shopId",
  as: "shop",
});

export { Shop, Rule };
