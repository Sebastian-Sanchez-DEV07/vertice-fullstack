const express = require("express");
const {
  createMessage,
  listMessages,
  deleteMessage,
} = require("../controllers/messageController");
const { requireAuth } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

const messageSchema = {
  name: { required: true, type: "string", min: 2, max: 120 },
  email: { required: true, type: "string", email: true, max: 160 },
  message: { required: true, type: "string", min: 5, max: 2000 },
};

router.post("/", validate(messageSchema), createMessage);
router.get("/", requireAuth, listMessages);
router.delete("/:id", requireAuth, deleteMessage);

module.exports = router;
