// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Handle scroll to top functionality
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    // Show button when user scrolls down 300px from the top
    window.addEventListener('scroll', function() {
      if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollToTopBtn.style.display = 'block';
      } else {
        scrollToTopBtn.style.display = 'none';
      }
    });
  
    // Form validation and submission handling
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic form validation
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        const recipient = document.getElementById('recipient').value;
        
        if (!name || !email || !subject || !message || !recipient) {
          showFormStatus('Please fill in all required fields', 'error');
          return;
        }
        
        // Email validation
        if (!isValidEmail(email)) {
          showFormStatus('Please enter a valid email address', 'error');
          return;
        }
        
        // Prepare form data for submission
        const formData = new FormData(contactForm);
        
        // Send form data to server
        fetch('/submit-contact', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            showFormStatus('Thank you! Your message has been sent successfully. We will get back to you soon.', 'success');
            contactForm.reset();
          } else {
            showFormStatus('Sorry, there was an error sending your message. Please try again later.', 'error');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showFormStatus('Sorry, there was an error submitting the form. Please try again later.', 'error');
        });
      });
    }
    
    // Function to display form status messages
    function showFormStatus(message, type) {
      formStatus.textContent = message;
      formStatus.className = type; // 'success' or 'error'
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = '';
      }, 5000);
    }
    
    // Email validation function
    function isValidEmail(email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    }
    
    // Date picker setup - set minimum date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const currentDate = `${yyyy}-${mm}-${dd}`;
      dateInput.setAttribute('min', currentDate);
    }
  });
  
  // Function to scroll to top
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  // Server communication for database storage
  async function saveMessageToDatabase(formData) {
    try {
      const response = await fetch('/api/save-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database error:', error);
      return { success: false, message: 'Database connection error' };
    }
  }
  
  // Notification system for admin
  function notifyAdmin(messageData) {
    // This function would connect to your backend notification system
    fetch('/api/notify-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Notification sent:', data);
    })
    .catch(error => {
      console.error('Notification error:', error);
    });
  }
  
  // Track form analytics
  function trackFormSubmission(formData) {
    // This would connect to your analytics system
    const analyticsData = {
      formType: 'contact',
      department: formData.get('recipient'),
      timestamp: new Date().toISOString(),
      preferredContact: formData.get('preferredContact'),
      urgency: formData.get('urgency')
    };
    
    fetch('/api/track-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyticsData)
    })
    .catch(error => console.error('Analytics error:', error));
  }