import { DataTypes, QueryInterface } from "sequelize";

/**
 * Bỏ tính năng sender email → gỡ cột khỏi bảng shops.
 *
 * Không sửa trực tiếp 20260813000001-create-shops.ts vì migration đó đã chạy
 * trên DB hiện tại; sửa file cũ sẽ làm schema thật lệch với code.
 */
export async function up({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.removeColumn("shops", "senderEmail");
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.addColumn("shops", "senderEmail", {
    type: DataTypes.STRING,
    allowNull: true,
  });
}
