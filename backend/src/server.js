const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");

async function start() {
  try {
    await pool.query("SELECT 1");

    const server = app.listen(env.port, () => {
      console.log(`API de Vertice escuchando en http://localhost:${env.port}`);
    });

    const shutdown = () => {
      server.close(() => {
        pool.end().finally(() => process.exit(0));
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("No se pudo conectar a PostgreSQL:", error.message);
    process.exit(1);
  }
}

start();
