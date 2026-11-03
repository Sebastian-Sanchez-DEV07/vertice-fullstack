const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { signToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

const login = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  const result = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  const token = signToken(user);

  res.json({ token, user: publicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = $1",
    [req.user.sub]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ message: "Usuario no encontrado" });
  }

  res.json({ user: result.rows[0] });
});

const register = asyncHandler(async (req, res) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(req.body.password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING
     RETURNING id, name, email, role`,
    [name, email, passwordHash]
  );

  if (result.rowCount === 0) {
    return res.status(409).json({ message: "Ya existe un usuario con ese correo" });
  }

  res.status(201).json({ user: result.rows[0] });
});

module.exports = { login, me, register };
