// public/js/news.js
document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Function to load news
    async function loadNews() {
      try {
        loadingSpinner.style.display = 'block';
        newsContainer.innerHTML = '';
        
        const response = await fetch('/news/api');
        const news = await response.json();
        
        if (news.length === 0) {
          newsContainer.innerHTML = '<div class="col-12 text-center"><p>No news available at the moment.</p></div>';
          return;
        }
        
        news.forEach(article => {
          const newsCard = document.createElement('div');
          newsCard.className = 'col-md-4 mb-4';
          newsCard.innerHTML = `
            <div class="card h-100">
              <img class="card-img-top" src="${article.imageUrl}" alt="${article.title}">
              <div class="card-body">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.description}</p>
                <a href="${article.url}" class="btn btn-danger" target="_blank">Read More</a>
              </div>
              <div class="card-footer">
                <small class="text-muted">${article.date}</small>
              </div>
            </div>
          `;
          newsContainer.appendChild(newsCard);
        });
      } catch (error) {
        console.error('Error loading news:', error);
        newsContainer.innerHTML = '<div class="col-12 text-center"><p>Failed to load news. Please try again later.</p></div>';
      } finally {
        loadingSpinner.style.display = 'none';
      }
    }
    
    // Initial load
    loadNews();
    
    // Auto-refresh every 30 minutes
    setInterval(loadNews, 30 * 60 * 1000);
    
    // Scroll to top button functionality
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'block';
      } else {
        scrollToTopBtn.style.display = 'none';
      }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });