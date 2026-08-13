import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database.js";

export class Rule extends Model<
  InferAttributes<Rule>,
  InferCreationAttributes<Rule>
> {
  declare id: CreationOptional<number>;

  declare shopId: number;

  declare name: string;
  declare description: string | null;

  declare type: string;
  declare value: number;

  declare status: "active" | "inactive";

  declare startAt: Date | null;
  declare endAt: Date | null;

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

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },

    startAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    endAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
