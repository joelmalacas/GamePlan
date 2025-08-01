// Password visibility toggle function
function togglePassword(fieldId) {
  const passwordInput = document.getElementById(fieldId);
  const toggleIcon =
    passwordInput.parentElement.querySelector(".toggle-password");

  // Add smooth transition effect
  toggleIcon.style.transform = "translateY(-50%) scale(0.8)";

  setTimeout(() => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    }
    toggleIcon.style.transform = "translateY(-50%) scale(1)";
  }, 150);
}

// Password validation requirements
const passwordRequirements = {
  length: (password) => password.length >= 8,
  uppercase: (password) => /[A-Z]/.test(password),
  number: (password) => /\d/.test(password),
  special: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
};

// Validate password and update UI
function validatePassword(password) {
  const requirements = document.getElementById("passwordRequirements");
  const lengthReq = document.getElementById("lengthReq");
  const uppercaseReq = document.getElementById("uppercaseReq");
  const numberReq = document.getElementById("numberReq");
  const specialReq = document.getElementById("specialReq");

  // Show requirements container
  requirements.classList.add("show");

  // Check each requirement
  const validations = {
    length: passwordRequirements.length(password),
    uppercase: passwordRequirements.uppercase(password),
    number: passwordRequirements.number(password),
    special: passwordRequirements.special(password),
  };

  // Update UI for each requirement
  updateRequirement(lengthReq, validations.length);
  updateRequirement(uppercaseReq, validations.uppercase);
  updateRequirement(numberReq, validations.number);
  updateRequirement(specialReq, validations.special);

  // Return overall validation status
  return Object.values(validations).every((valid) => valid);
}

// Update individual requirement UI
function updateRequirement(element, isValid) {
  const icon = element.querySelector("i");

  if (isValid) {
    element.classList.add("valid");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-check");
  } else {
    element.classList.remove("valid");
    icon.classList.remove("fa-check");
    icon.classList.add("fa-times");
  }
}

// Validate password match
function validatePasswordMatch(password, confirmPassword) {
  const matchElement = document.getElementById("passwordMatch");
  const icon = matchElement.querySelector("i");

  if (confirmPassword.length > 0) {
    matchElement.classList.add("show");

    if (password === confirmPassword && password.length > 0) {
      matchElement.classList.add("valid");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-check");
      matchElement.querySelector("span").textContent = "Passwords match";
      return true;
    } else {
      matchElement.classList.remove("valid");
      icon.classList.remove("fa-check");
      icon.classList.add("fa-times");
      matchElement.querySelector("span").textContent = "Passwords must match";
      return false;
    }
  } else {
    matchElement.classList.remove("show");
    return false;
  }
}

// Check if form is valid and enable/disable submit button
function checkFormValidity() {
  const form = document.getElementById("signinForm");
  const submitBtn = document.getElementById("signinBtn");
  const formData = new FormData(form);

  // Get all required fields
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const birthDate = formData.get("birthDate");
  const country = formData.get("country");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const terms = formData.get("terms");

  // Check if all fields are filled
  const allFieldsFilled =
    firstName &&
    lastName &&
    birthDate &&
    country &&
    email &&
    password &&
    confirmPassword &&
    terms;

  // Check password requirements
  const passwordValid = validatePassword(password);
  const passwordsMatch = validatePasswordMatch(password, confirmPassword);

  // Check age requirement (minimum 13 years old)
  const ageValid = checkAge(birthDate);

  // Enable/disable submit button
  if (allFieldsFilled && passwordValid && passwordsMatch && ageValid) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
  } else {
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.6";
  }
}

// Check if user is at least 13 years old
function checkAge(birthDate) {
  if (!birthDate) return false;

  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 13;
  }
  return age >= 13;
}

// Email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Form submission handler
document.getElementById("signinForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const btn = document.querySelector(".signin-btn");
  const btnText = document.querySelector(".btn-text");
  const btnLoader = document.querySelector(".btn-loader");
  const formData = new FormData(this);

  // Final validation before submission
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const birthDate = formData.get("birthDate");

  // Validate email
  if (!validateEmail(email)) {
    showError("Please enter a valid email address.");
    return;
  }

  // Validate age
  if (!checkAge(birthDate)) {
    showError("You must be at least 13 years old to create an account.");
    return;
  }

  // Validate password
  if (!validatePassword(password)) {
    showError("Password does not meet security requirements.");
    return;
  }

  // Validate password match
  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  // Show loading state
  btn.classList.add("loading");
  btnText.style.opacity = "0";
  btnText.style.transform = "translateY(-10px)";
  btnLoader.style.display = "block";

  setTimeout(() => {
    btnLoader.classList.add("show");
  }, 100);

  // Simulate API call (replace with actual registration logic)
  setTimeout(() => {
    // Success feedback
    showSuccess("Account created successfully! Redirecting...");

    setTimeout(() => {
      // Redirect to login page
      window.location.href = "login.html";
    }, 2000);
  }, 3000);
});

// Show error message
function showError(message) {
  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  const alert = document.createElement("div");
  alert.className = "alert alert-error";
  alert.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

  document
    .querySelector(".signin-card")
    .insertBefore(alert, document.querySelector(".signin-form"));

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove();
    }
  }, 5000);
}

// Show success message
function showSuccess(message) {
  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  const alert = document.createElement("div");
  alert.className = "alert alert-success";
  alert.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

  document
    .querySelector(".signin-card")
    .insertBefore(alert, document.querySelector(".signin-form"));
}

// Input focus animations and validation
document.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement.classList.add("focused");
    this.style.transform = "translateY(-2px)";
  });

  input.addEventListener("blur", function () {
    this.style.transform = "translateY(0)";
    if (this.value === "" && this.type !== "date") {
      this.parentElement.classList.remove("focused");
    }
  });

  // Real-time validation for password fields
  if (input.id === "password") {
    input.addEventListener("input", function () {
      validatePassword(this.value);
      checkFormValidity();
    });
  }

  if (input.id === "confirmPassword") {
    input.addEventListener("input", function () {
      const password = document.getElementById("password").value;
      validatePasswordMatch(password, this.value);
      checkFormValidity();
    });
  }

  // General form validation check
  input.addEventListener("input", checkFormValidity);
  input.addEventListener("change", checkFormValidity);

  // Smooth hover effect for inputs
  input.addEventListener("mouseenter", function () {
    if (!this.matches(":focus")) {
      this.style.transform = "translateY(-1px)";
    }
  });

  input.addEventListener("mouseleave", function () {
    if (!this.matches(":focus")) {
      this.style.transform = "translateY(0)";
    }
  });

  // Check if input has value on page load
  if (input.value !== "" || input.type === "date") {
    input.parentElement.classList.add("focused");
  }
});

// Initialize form validation on page load
document.addEventListener("DOMContentLoaded", function () {
  checkFormValidity();

  // Add alert styles if not present
  if (!document.querySelector("style[data-alert-styles]")) {
    const alertStyles = document.createElement("style");
    alertStyles.setAttribute("data-alert-styles", "true");
    alertStyles.textContent = `
            .alert {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px 20px;
                margin-bottom: 20px;
                border-radius: 8px;
                font-size: 0.9rem;
                animation: slideInDown 0.3s ease-out;
                position: relative;
            }

            .alert-error {
                background: rgba(231, 76, 60, 0.1);
                border: 1px solid rgba(231, 76, 60, 0.3);
                color: #e74c3c;
            }

            .alert-success {
                background: rgba(39, 174, 96, 0.1);
                border: 1px solid rgba(39, 174, 96, 0.3);
                color: #27ae60;
            }

            .alert-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 2px;
                margin-left: auto;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }

            .alert-close:hover {
                opacity: 1;
            }

            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
    document.head.appendChild(alertStyles);
  }
});

// Smooth scroll behavior for links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Country selection enhancement
const countrySelect = document.getElementById("country");
countrySelect.addEventListener("change", function () {
  if (this.value) {
    this.parentElement.classList.add("focused");
  }
});

// Auto-format birth date (optional enhancement)
const birthDateInput = document.getElementById("birthDate");
birthDateInput.addEventListener("change", function () {
  if (this.value) {
    this.parentElement.classList.add("focused");
    const age = calculateAge(this.value);
    if (age < 13) {
      showError("You must be at least 13 years old to create an account.");
      this.value = "";
      this.parentElement.classList.remove("focused");
    }
  }
});

// Calculate age helper function
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Enhanced form interactions
document.querySelectorAll(".form-group").forEach((group) => {
  group.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-1px)";
  });

  group.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0)";
  });
});

// Terms and conditions checkbox enhancement
const termsCheckbox = document.getElementById("terms");
termsCheckbox.addEventListener("change", function () {
  if (this.checked) {
    this.parentElement.style.transform = "scale(1.02)";
    setTimeout(() => {
      this.parentElement.style.transform = "scale(1)";
    }, 200);
  }
  checkFormValidity();
});
