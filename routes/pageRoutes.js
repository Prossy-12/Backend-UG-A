const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("homePage");
});

router.get("/about", (req, res) => {
  res.render("aboutPage");
});

router.get("/contact", (req, res) => {
  res.render("contactPage"); // pug file to be displayed
});



router.get("/media", (req, res) => {
  res.render("mediaPage"); // pug file to be displayed
});

router.get("/matches", (req, res) => {
  res.render("matchesPage"); // pug file to be displayed
});


router.get("/partnership", (req, res) => {
  res.render("partnershipPage"); // pug file to be displayed
});

router.get("/events", (req, res) => {
  res.render("eventsPage"); // pug file to be displayed
});

router.get("/news", (req ,res) =>{
  res.render("newsPage");
})
router.get("/thankyou", (req ,res) =>{
  res.render("thankyoupage");
})

module.exports = router;