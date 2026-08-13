import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database.js";

export class Shop extends Model<
  InferAttributes<Shop>,
  InferCreationAttributes<Shop>
> {
  declare id: CreationOptional<number>;

  declare shopifyShopId: string;
  declare shopifyDomain: string;

  declare name: string;
  declare email: string | null;
  declare firstName: string | null;
  declare currency: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Shop.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    shopifyShopId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    shopifyDomain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    currency: {
      type: DataTypes.STRING,
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
    tableName: "shops",
    timestamps: true,
  },
);
