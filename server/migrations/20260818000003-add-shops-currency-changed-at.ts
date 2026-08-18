import { DataTypes, QueryInterface } from "sequelize";

/**
 * Đánh dấu thời điểm shop.currencyCode đổi so với lần sync trước, để admin UI
 * cảnh báo merchant rà lại discountValue của các rule (chúng được nhập theo
 * base currency CŨ, Shopify không tự quy đổi khi merchant đổi currency).
 */
export async function up({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.addColumn("shops", "currencyChangedAt", {
    type: DataTypes.DATE,
    allowNull: true,
  });
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.removeColumn("shops", "currencyChangedAt");
}
