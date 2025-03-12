       // Toggle password visibility
       document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling.previousElementSibling;
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    });

    // Form validation
    const loginFormElement = document.getElementById('loginFormElement');
    
    loginFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;
        
        // Email validation
        const email = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email.value)) {
            email.classList.add('error');
            emailError.style.display = 'block';
            isValid = false;
        } else {
            email.classList.remove('error');
            email.classList.add('success');
            emailError.style.display = 'none';
        }
        
        // Password validation
        const password = document.getElementById('password');
        const passwordError = document.getElementById('passwordError');
        
        if (password.value.length < 6) {
            password.classList.add('error');
            passwordError.style.display = 'block';
            isValid = false;
        } else {
            password.classList.remove('error');
            password.classList.add('success');
            passwordError.style.display = 'none';
        }
        
        if (isValid) {
            // Submit the form or redirect
            alert('Login successful! Redirecting...');
            // You would normally redirect or process the login here
        }
    });

    // Add animation to input fields
    const inputFields = document.querySelectorAll('.input-field');
    
    inputFields.forEach(input => {
        // Check if input has value on page load
        if (input.value !== '') {
            input.classList.add('active');
        }
        
        // Focus event
        input.addEventListener('focus', function() {
            this.classList.add('active');
        });
        
        // Blur event
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.classList.remove('active');
            }
        });
    });
