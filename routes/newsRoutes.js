const express = require('express');
const axios = require('axios');

const router = express.Router();

// RapidAPI credentials
const RAPIDAPI_KEY = 'ab6ba91ad4mshd036cbb2cf8f81ep1104ddjsn4576f6b234dd';
const RAPIDAPI_HOST = 'liverpool-latest-articles.p.rapidapi.com';
const API_ENDPOINT = 'https://liverpool-latest-articles.p.rapidapi.com/football/thegaurdian'
// Function to fetch news from RapidAPI
async function fetchNews() {
  

  const options = {
    method: 'GET',
    url: 'https://liverpool-latest-articles.p.rapidapi.com/football/thegaurdian',
    headers: {
      'x-rapidapi-key': 'ab6ba91ad4mshd036cbb2cf8f81ep1104ddjsn4576f6b234dd',
      'x-rapidapi-host': 'liverpool-latest-articles.p.rapidapi.com'
    }
  };
  
  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Route to fetch news and render the Pug template
router.get('/news', async (req, res) => {
    const articles = await fetchNews();

    if (!articles) {
        return res.status(500).send('Failed to fetch news');
    }

    res.render('newsPage', { articles });
});

module.exports = router;
