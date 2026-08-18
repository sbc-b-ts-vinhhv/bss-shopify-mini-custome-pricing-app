import { DataTypes, QueryInterface } from "sequelize";

/**
 * Bỏ tính năng ngày hết hạn rule → gỡ cột khỏi bảng rules.
 *
 * Không sửa trực tiếp 20260813000002-create-rules.ts vì migration đó đã chạy
 * trên DB hiện tại; sửa file cũ sẽ làm schema thật lệch với code.
 */
export async function up({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.removeColumn("rules", "endAt");
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.addColumn("rules", "endAt", {
    type: DataTypes.DATE,
    allowNull: true,
  });
}
