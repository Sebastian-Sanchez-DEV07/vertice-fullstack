const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const required = ["JWT_SECRET"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno obligatorias: ${missing.join(", ")}`);
}

if (process.env.JWT_SECRET.length < 16) {
  throw new Error("JWT_SECRET debe tener al menos 16 caracteres");
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || "",
  dbSsl: process.env.DB_SSL === "true",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  adminName: process.env.ADMIN_NAME || "Admin Vertice",
  adminEmail: process.env.ADMIN_EMAIL || "admin@vertice.local",
  adminPassword: process.env.ADMIN_PASSWORD || "Vertice123!",
};

module.exports = env;
