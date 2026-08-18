import { DataTypes, QueryInterface } from "sequelize";

/**
 * Lưu currencyCode (Shopify `shop.currencyCode`) để format tiền theo đúng
 * currency của từng shop thay vì hardcode USD.
 */
export async function up({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.addColumn("shops", "currencyCode", {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "USD",
  });
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.removeColumn("shops", "currencyCode");
}
