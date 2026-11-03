const { Pool } = require("pg");
const env = require("./env");

const config = env.databaseUrl
  ? {
      connectionString: env.databaseUrl,
      ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
    }
  : {};

const pool = new Pool(config);

pool.on("error", (error) => {
  console.error("Error inesperado en PostgreSQL:", error.message);
});

module.exports = pool;
