import { DataTypes, QueryInterface } from "sequelize";

/**
 * Thêm tên chủ shop (Shopify `shop.shopOwnerName`).
 *
 * Đề bài Bài 3 mục 3 yêu cầu lấy về shop(email, first name). Shopify chỉ trả
 * họ tên đầy đủ nên lưu nguyên, first name tách ở mapper.
 */
export async function up({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.addColumn("shops", "ownerName", {
    type: DataTypes.STRING,
    allowNull: true,
  });
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.removeColumn("shops", "ownerName");
}