const express = require("express");
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { requireAuth } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

const createSchema = {
  title: { required: true, type: "string", min: 2, max: 160 },
  category: { required: true, type: "string", min: 2, max: 80 },
  year: { required: true, type: "number", minValue: 1900, maxValue: 2100 },
  description: { type: "string", max: 2000 },
  image_url: { type: "string", max: 500 },
  featured: { type: "boolean" },
};

const updateSchema = {
  title: { type: "string", min: 2, max: 160 },
  category: { type: "string", min: 2, max: 80 },
  year: { type: "number", minValue: 1900, maxValue: 2100 },
  description: { type: "string", max: 2000 },
  image_url: { type: "string", max: 500 },
  featured: { type: "boolean" },
};

router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", requireAuth, validate(createSchema), createProject);
router.put("/:id", requireAuth, validate(updateSchema), updateProject);
router.delete("/:id", requireAuth, deleteProject);

module.exports = router;
