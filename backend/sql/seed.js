const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("../src/config/db");
const env = require("../src/config/env");

const sampleProjects = [
  {
    title: "Casa Límite",
    category: "Residential",
    year: 2026,
    description: "A geometric concrete residence built around light and privacy.",
    imageUrl: "/images/project-casa-limite.jpg",
    featured: true,
  },
  {
    title: "North Courtyard",
    category: "Hospitality",
    year: 2025,
    description: "A warm timber and brick courtyard building made to gather people.",
    imageUrl: "/images/project-north-courtyard.jpg",
    featured: false,
  },
  {
    title: "Atelier 04",
    category: "Workplace",
    year: 2024,
    description: "An open-plan concrete and glass workplace for focused teams.",
    imageUrl: "/images/project-atelier-04.jpg",
    featured: false,
  },
];

async function seed() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);

  const admin = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [env.adminName, env.adminEmail.toLowerCase(), passwordHash]
  );

  if (admin.rowCount > 0) {
    console.log(`Administrador creado: ${env.adminEmail}`);
  } else {
    console.log(`El administrador ${env.adminEmail} ya existia, no se modifico.`);
  }

  const count = await pool.query("SELECT COUNT(*)::int AS total FROM projects");

  if (count.rows[0].total === 0) {
    for (const project of sampleProjects) {
      await pool.query(
        `INSERT INTO projects (title, category, year, description, image_url, featured)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          project.title,
          project.category,
          project.year,
          project.description,
          project.imageUrl,
          project.featured,
        ]
      );
    }
    console.log("Proyectos de ejemplo insertados.");
  } else {
    console.log("Ya existen proyectos, no se insertaron ejemplos.");
  }

  console.log("Listo. Ahora puedes iniciar el servidor con: npm run dev");
}

seed()
  .catch((error) => {
    console.error("Error al preparar la base de datos:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
