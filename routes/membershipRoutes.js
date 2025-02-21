const express = require("express");
const router = express.Router();

router.get("/membership", (req, res) => {
  res.render("membershipPage");
});



module.exports = router;