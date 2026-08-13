import "dotenv/config";

import { sequelize } from "./config/database.js";
import "./models/index.js";

async function syncDatabase() {
  try {
    await sequelize.authenticate();

    console.log("✅ MySQL connection successful");

    await sequelize.sync({ alter: true });

    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();