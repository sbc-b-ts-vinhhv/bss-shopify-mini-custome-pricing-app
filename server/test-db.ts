import { sequelize } from "./config/database.js";

async function testDatabase() {
  try {
    await sequelize.authenticate();

    console.log("✅ MySQL connection successful");
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
