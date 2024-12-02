// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (optional, if using a database)
mongoose.connect('mongodb://localhost:27017/uganfield', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log(`Database connection error: ${err}`));

// Set view engine to Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route files
const homeRoute = require('./routes/index');
const aboutRoute = require('./routes/about');
const communityRoute = require('./routes/community');
const contactRoute = require('./routes/contact');
const eventsRoute = require('./routes/events');
const matchesRoute = require('./routes/matches');
const mediaRoute = require('./routes/media');
const membershipRoute = require('./routes/membership');
const merchandiseRoute = require('./routes/merchandise');
const newsRoute = require('./routes/news');
const partnershipRoute = require('./routes/partnership');
const storeRoute = require('./routes/store');

// Use routes
app.use('/', homeRoute);
app.use('/about', aboutRoute);
app.use('/community', communityRoute);
app.use('/contact', contactRoute);
app.use('/events', eventsRoute);
app.use('/matches', matchesRoute);
app.use('/media', mediaRoute);
app.use('/membership', membershipRoute);
app.use('/merchandise', merchandiseRoute);
app.use('/news', newsRoute);
app.use('/partnership', partnershipRoute);
app.use('/store', storeRoute);

// 404 Error Handling
app.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
