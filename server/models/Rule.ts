import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database.js";

export type RuleStatus = "enabled" | "disabled";
export type ProductConditionType = "ALL" | "TAGS";
export type DiscountType =
  "FIXED_PRICE" | "DECREASE_FIXED" | "DECREASE_PERCENTAGE";

export class Rule extends Model<
  InferAttributes<Rule>,
  InferCreationAttributes<Rule>
> {
  declare id: CreationOptional<number>;

  declare shopId: number;

  declare name: string;
  declare status: CreationOptional<RuleStatus>;
  declare priority: CreationOptional<number>;

  declare productConditionType: ProductConditionType;
  declare productTags: CreationOptional<string[]>;

  declare discountType: DiscountType;
  declare discountValue: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Rule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("enabled", "disabled"),
      allowNull: false,
      defaultValue: "enabled",
    },

    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    productConditionType: {
      type: DataTypes.ENUM("ALL", "TAGS"),
      allowNull: false,
      defaultValue: "ALL",
    },

    productTags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      // MariaDB lưu JSON dưới dạng LONGTEXT nên Sequelize trả về chuỗi thô khi đọc.
      get(): string[] {
        const raw = this.getDataValue("productTags") as unknown;

        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);

            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }

        return Array.isArray(raw) ? raw : [];
      },
    },

    discountType: {
      type: DataTypes.ENUM(
        "FIXED_PRICE",
        "DECREASE_FIXED",
        "DECREASE_PERCENTAGE",
      ),
      allowNull: false,
    },

    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "rules",
    timestamps: true,
  },
);
