// const express = require('express');
// const axios = require('axios');

// const router = express.Router();

// // RapidAPI credentials
// // const RAPIDAPI_KEY = 'ab6ba91ad4mshd036cbb2cf8f81ep1104ddjsn4576f6b234dd';
// // const RAPIDAPI_HOST = 'liverpool-latest-articles.p.rapidapi.com';
// // const API_ENDPOINT = 'https://liverpool-latest-articles.p.rapidapi.com/football/thegaurdian'
// // // // Function to fetch news from RapidAPI
// // async function fetchNews() {
  

// //   const options = {
// //     method: 'GET',
// //     url: 'https://liverpool-latest-articles.p.rapidapi.com/football/thegaurdian',
// //     headers: {
// //       'x-rapidapi-key': 'ab6ba91ad4mshd036cbb2cf8f81ep1104ddjsn4576f6b234dd',
// //       'x-rapidapi-host': 'liverpool-latest-articles.p.rapidapi.com'
// //     }
// //   };
  
//   // try {
//   //   const response = await axios.request(options);
//   //   console.log(response.data);
//   // } catch (error) {
//   //   console.error(error);
//   // }


// // Route to fetch news and render the Pug template
// router.get('/news', async (req, res) => {
//     const articles = await fetchNews();

//     if (!articles) {
//         return res.status(500).send('Failed to fetch news');
//     }

//     res.render('newsPage', { articles });
// });

// module.exports = router;


// routes/news.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// News cache
let newsCache = [];
let lastUpdated = null;

// Fetch news from various sources
async function fetchNews() {
  try {
    // Example: Fetch from NewsAPI (replace with your actual sources)
    const newsApiResponse = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Liverpool FC',
        apiKey: process.env.NEWSAPI_KEY,
        pageSize: 6,
        sortBy: 'publishedAt'
      }
    });
    

    // Example: Fetch from RSS feed (you'll need an RSS parser package)
    // const rssResponse = await axios.get('https://www.liverpoolfc.com/news/rss');
    
    // Combine and format news
    newsCache = newsApiResponse.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      imageUrl: article.urlToImage || '/images/default-news.jpg',
      url: article.url,
      date: new Date(article.publishedAt).toLocaleDateString()
    }));

    // Add your static club news (optional)
    newsCache.push({
      title: "Ugandan Reds in Action",
      description: "A spotlight on Ugandan Liverpool fans and their passionate support for the team.",
      imageUrl: "/images/15.jpg",
      url: "/ugandan-reds",
      date: new Date().toLocaleDateString()
    });

    lastUpdated = new Date();
    return newsCache;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

// GET news page
router.get('/', async (req, res) => {
  // Refresh cache if empty or stale (older than 30 minutes)
  if (newsCache.length === 0 || (lastUpdated && (new Date() - lastUpdated) > 30 * 60 * 1000)) {
    await fetchNews();
  }
  
  res.render('news', { 
    title: 'UG Anfield - News',
    news: newsCache 
  });
});

// API endpoint for AJAX requests
router.get('/api', async (req, res) => {
  if (newsCache.length === 0 || (lastUpdated && (new Date() - lastUpdated) > 30 * 60 * 1000)) {
    await fetchNews();
  }
  res.json(newsCache);
});

module.exports = router;



















