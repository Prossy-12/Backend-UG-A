// dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();

// instantiations
const app = express();
const server = http.createServer(app);
const port = process.env.PORT;

// import models

// importing routes
const pageRoutes = require("./routes/pageRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const newsRoutes = require("./routes/newsRoutes");


// configurations
mongoose.connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection
  .once("open", () => {
    console.log("Mongoose connection open");
  })
  .on("error", (err) => {
    console.error(`Connection error: ${err.message}`);
  });

// set view engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// use imported routes
app.use("/", pageRoutes);
app.use("/", membershipRoutes);
app.use("/", newsRoutes);

// handle 404 errors
app.get("*", (req, res) => {
  res.status(404).render("notFoundPage");
});

// start the server
server.listen(port, () => console.log(`Listening on port ${port}`));