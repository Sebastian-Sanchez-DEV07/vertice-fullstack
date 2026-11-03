const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const listProjects = asyncHandler(async (req, res) => {
  const params = [];
  let query = "SELECT * FROM projects";

  if (req.query.featured !== undefined) {
    params.push(req.query.featured === "true");
    query += " WHERE featured = $1";
  }

  query += " ORDER BY featured DESC, year DESC, id DESC";

  const result = await pool.query(query, params);
  res.json({ projects: result.rows });
});

const getProject = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Id invalido" });
  }

  const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Proyecto no encontrado" });
  }

  res.json({ project: result.rows[0] });
});

const createProject = asyncHandler(async (req, res) => {
  const title = req.body.title.trim();
  const category = req.body.category.trim();
  const year = Number(req.body.year);
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const imageUrl = typeof req.body.image_url === "string" ? req.body.image_url.trim() : "";
  const featured = req.body.featured === true;

  const result = await pool.query(
    `INSERT INTO projects (title, category, year, description, image_url, featured)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, category, year, description, imageUrl, featured]
  );

  res.status(201).json({ project: result.rows[0] });
});

const updateProject = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Id invalido" });
  }

  const current = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    return res.status(404).json({ message: "Proyecto no encontrado" });
  }

  const project = current.rows[0];

  const title = req.body.title !== undefined ? req.body.title.trim() : project.title;
  const category =
    req.body.category !== undefined ? req.body.category.trim() : project.category;
  const year = req.body.year !== undefined ? Number(req.body.year) : project.year;
  const description =
    typeof req.body.description === "string"
      ? req.body.description.trim()
      : project.description;
  const imageUrl =
    typeof req.body.image_url === "string" ? req.body.image_url.trim() : project.image_url;
  const featured =
    req.body.featured !== undefined ? req.body.featured : project.featured;

  const result = await pool.query(
    `UPDATE projects
     SET title = $1, category = $2, year = $3, description = $4,
         image_url = $5, featured = $6, updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [title, category, year, description, imageUrl, featured, id]
  );

  res.json({ project: result.rows[0] });
});

const deleteProject = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Id invalido" });
  }

  const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING id", [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Proyecto no encontrado" });
  }

  res.json({ message: "Proyecto eliminado", id });
});

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
