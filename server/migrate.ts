import "dotenv/config";
import { Umzug, SequelizeStorage } from "umzug";

import { sequelize } from "./config/database.js";

const umzug = new Umzug({
  migrations: {
    glob: "server/migrations/*.ts",
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const command = process.argv[2] ?? "up";

async function run() {
  if (command === "up") {
    await umzug.up();
  } else if (command === "down") {
    await umzug.down();
  } else {
    throw new Error(`Unknown command: ${command}. Use "up" or "down".`);
  }

  await sequelize.close();
}

run();
