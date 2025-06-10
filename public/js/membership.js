document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const form = document.getElementById('membershipForm');
    const formStatus = document.getElementById('formStatus');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    // Add submit event listener to the form
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            membershipType: document.getElementById('membershipType').value
        };
        
        // Send data to server
        fetch('/membership', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                form.reset(); // Clear the form
                successModal.show(); // Show the success modal
            } else {
                // Show error message
                formStatus.className = 'alert alert-danger';
                formStatus.textContent = data.message || 'Error submitting form. Please try again.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            formStatus.className = 'alert alert-danger';
            formStatus.textContent = 'Error submitting form. Please try again.';
        });
    });
});
