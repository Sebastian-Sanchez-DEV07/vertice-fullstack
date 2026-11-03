const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const createMessage = asyncHandler(async (req, res) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const message = req.body.message.trim();

  const result = await pool.query(
    `INSERT INTO messages (name, email, message)
     VALUES ($1, $2, $3)
     RETURNING id, created_at`,
    [name, email, message]
  );

  res.status(201).json({
    message: "Mensaje recibido. Te responderemos pronto.",
    id: result.rows[0].id,
  });
});

const listMessages = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM messages ORDER BY created_at DESC");
  res.json({ messages: result.rows });
});

const deleteMessage = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Id invalido" });
  }

  const result = await pool.query("DELETE FROM messages WHERE id = $1 RETURNING id", [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Mensaje no encontrado" });
  }

  res.json({ message: "Mensaje eliminado", id });
});

module.exports = { createMessage, listMessages, deleteMessage };
