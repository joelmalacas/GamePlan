// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.parentElement.querySelector(".toggle-password");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Password validation requirements
const passwordRequirements = {
  length: (password) => password.length >= 8,
  uppercase: (password) => /[A-Z]/.test(password),
  lowercase: (password) => /[a-z]/.test(password),
  number: (password) => /\d/.test(password),
  special: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
};

// Validate password and update UI
function validatePassword(password) {
  const requirements = document.getElementById("passwordRequirements");
  const lengthReq = document.getElementById("lengthReq");
  const uppercaseReq = document.getElementById("uppercaseReq");
  const lowercaseReq = document.getElementById("lowercaseReq");
  const numberReq = document.getElementById("numberReq");
  const specialReq = document.getElementById("specialReq");

  // Show requirements container
  if (requirements) {
    requirements.classList.add("show");
  }

  // Check each requirement
  const validations = {
    length: passwordRequirements.length(password),
    uppercase: passwordRequirements.uppercase(password),
    lowercase: passwordRequirements.lowercase(password),
    number: passwordRequirements.number(password),
    special: passwordRequirements.special(password),
  };

  // Update UI for each requirement
  if (lengthReq) updateRequirement(lengthReq, validations.length);
  if (uppercaseReq) updateRequirement(uppercaseReq, validations.uppercase);
  if (lowercaseReq) updateRequirement(lowercaseReq, validations.lowercase);
  if (numberReq) updateRequirement(numberReq, validations.number);
  if (specialReq) updateRequirement(specialReq, validations.special);

  // Return overall validation status
  return Object.values(validations).every((valid) => valid);
}

// Update individual requirement UI
function updateRequirement(element, isValid) {
  if (!element) return;

  const icon = element.querySelector("i");
  if (!icon) return;

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

  if (!matchElement) {
    // Fallback validation without UI
    return confirmPassword.length > 0 && password === confirmPassword;
  }

  const icon = matchElement.querySelector("i");
  const textSpan = matchElement.querySelector("span");

  if (confirmPassword.length > 0) {
    matchElement.classList.add("show");

    if (password === confirmPassword && password.length > 0) {
      matchElement.classList.add("valid");
      if (icon) {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-check");
      }
      if (textSpan) {
        textSpan.textContent = "Passwords match";
      }
      return true;
    } else {
      matchElement.classList.remove("valid");
      if (icon) {
        icon.classList.remove("fa-check");
        icon.classList.add("fa-times");
      }
      if (textSpan) {
        textSpan.textContent = "Passwords must match";
      }
      return false;
    }
  } else {
    matchElement.classList.remove("show");
    return false;
  }
}

// Email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Name validation
function validateName(name) {
  return name && name.trim().length >= 2;
}

// Phone validation
function validatePhone(phone) {
  if (!phone) return false;
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  // Check if it's a valid length (typically 9-15 digits)
  return cleanPhone.length >= 9 && cleanPhone.length <= 15;
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

// Country validation
function validateCountry(country) {
  return country && country.trim() !== "";
}

// Check if form is valid and enable/disable submit button
function checkFormValidity() {
  const form = document.getElementById("signinForm");
  const submitBtn = document.getElementById("signinBtn");

  if (!form || !submitBtn) return;

  const formData = new FormData(form);

  // Get all required fields
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const birthDate = formData.get("birthDate");
  const country = formData.get("country");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const phone = formData.get("phone");
  const terms = formData.get("terms");

  // Individual validations
  const validations = {
    firstName: validateName(firstName),
    lastName: validateName(lastName),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validatePasswordMatch(password, confirmPassword),
    birthDate: checkAge(birthDate),
    country: validateCountry(country),
    phone: validatePhone(phone),
    terms: !!terms,
  };

  // Check if all validations pass
  const allValid = Object.values(validations).every((valid) => valid);

  // Enable/disable submit button
  if (allValid) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
  } else {
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.6";
  }
}

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

  const signinCard = document.querySelector(".signin-card");
  const signinForm = document.querySelector(".signin-form");

  if (signinCard && signinForm) {
    signinCard.insertBefore(alert, signinForm);
  }

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

  const signinCard = document.querySelector(".signin-card");
  const signinForm = document.querySelector(".signin-form");

  if (signinCard && signinForm) {
    signinCard.insertBefore(alert, signinForm);
  }
}

// Show loading state
function showLoadingState(btn) {
  if (!btn) return;

  const btnText = btn.querySelector(".btn-text");
  const btnLoader = btn.querySelector(".btn-loader");

  btn.classList.add("loading");
  if (btnText) {
    btnText.style.opacity = "0";
    btnText.style.transform = "translateY(-10px)";
  }
  if (btnLoader) {
    btnLoader.style.display = "block";
    setTimeout(() => {
      btnLoader.classList.add("show");
    }, 100);
  }
}

// Hide loading state
function hideLoadingState(btn) {
  if (!btn) return;

  const btnText = btn.querySelector(".btn-text");
  const btnLoader = btn.querySelector(".btn-loader");

  btn.classList.remove("loading");
  if (btnText) {
    btnText.style.opacity = "1";
    btnText.style.transform = "translateY(0)";
  }
  if (btnLoader) {
    btnLoader.classList.remove("show");
    setTimeout(() => {
      btnLoader.style.display = "none";
    }, 300);
  }
}

// Format phone number (optional)
function formatPhoneNumber(phone) {
  return phone.replace(/\D/g, "");
}

// Prepare user data for submission
function prepareUserData(formData) {
  return {
    firstName: formData.get("firstName").trim(),
    lastName: formData.get("lastName").trim(),
    email: formData.get("email").trim().toLowerCase(),
    password: formData.get("password"),
    birthDate: formData.get("birthDate"),
    country: formData.get("country"),
    phone: formatPhoneNumber(formData.get("phone")),
    terms: !!formData.get("terms"),
  };
}

// Handle registration API call
async function handleRegistration(userData) {
  try {
    // Replace with your actual API endpoint
    const response = await fetch("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Form submission handler
async function handleFormSubmission(e) {
  e.preventDefault();

  const form = e.target;
  const btn = document.querySelector(".signin-btn");
  const formData = new FormData(form);

  // Prepare user data
  const userData = prepareUserData(formData);

  // Final validation before submission
  if (!validateEmail(userData.email)) {
    showError("Please enter a valid email address.");
    return;
  }

  if (!checkAge(userData.birthDate)) {
    showError("You must be at least 13 years old to create an account.");
    return;
  }

  if (!validatePassword(userData.password)) {
    showError("Password does not meet security requirements.");
    return;
  }

  if (
    !validatePasswordMatch(userData.password, formData.get("confirmPassword"))
  ) {
    showError("Passwords do not match.");
    return;
  }

  // Show loading state
  showLoadingState(btn);

  // Handle registration
  const result = await handleRegistration(userData);

  if (result.success) {
    showSuccess("Account created successfully! Redirecting...");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } else {
    hideLoadingState(btn);
    showError(result.error || "Registration failed. Please try again.");
  }
}

// Setup input handlers
function setupInputHandlers() {
  const inputs = document.querySelectorAll("input, select");

  inputs.forEach((input) => {
    // Focus and blur handlers
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
        const isValid = validatePassword(this.value);

        const confirmPassword = document.getElementById("confirmPassword");
        if (confirmPassword && confirmPassword.value) {
          validatePasswordMatch(this.value, confirmPassword.value);
        }
        checkFormValidity();
      });

      // Also add keyup listener for better responsiveness
      input.addEventListener("keyup", function () {
        validatePassword(this.value);
        checkFormValidity();
      });
    }

    if (input.id === "confirmPassword") {
      input.addEventListener("input", function () {
        const password = document.getElementById("password");
        if (password) {
          validatePasswordMatch(password.value, this.value);
        }
        checkFormValidity();
      });

      // Also add keyup listener
      input.addEventListener("keyup", function () {
        const password = document.getElementById("password");
        if (password) {
          validatePasswordMatch(password.value, this.value);
        }
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
}

// Setup country selection
function setupCountrySelection() {
  const countrySelect = document.getElementById("country");
  if (countrySelect) {
    countrySelect.addEventListener("change", function () {
      if (this.value) {
        this.parentElement.classList.add("focused");
      }
      checkFormValidity();
    });
  }
}

// Setup terms checkbox
function setupTermsCheckbox() {
  const termsCheckbox = document.getElementById("terms");
  if (termsCheckbox) {
    termsCheckbox.addEventListener("change", function () {
      if (this.checked) {
        this.parentElement.style.transform = "scale(1.02)";
        setTimeout(() => {
          this.parentElement.style.transform = "scale(1)";
        }, 200);
      }
      checkFormValidity();
    });
  }
}

// Setup form group animations
function setupFormGroupAnimations() {
  document.querySelectorAll(".form-group").forEach((group) => {
    group.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-1px)";
    });

    group.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });
}

// Add alert styles
function addAlertStyles() {
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
}

// Setup smooth scroll
function setupSmoothScroll() {
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
}

// Initialize application
function initializeApp() {
  console.log("🚀 Initializing GamePlan Registration...");

  // Setup all components
  setupInputHandlers();
  setupCountrySelection();
  setupTermsCheckbox();
  setupFormGroupAnimations();
  addAlertStyles();
  setupSmoothScroll();

  // Setup form submission
  const form = document.getElementById("signinForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmission);
  }

  // Setup birth date special handling
  const birthDateInput = document.getElementById("birthDate");
  if (birthDateInput) {
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
      checkFormValidity();
    });
  }

  // Initial form validation check
  checkFormValidity();

  console.log("✅ GamePlan Registration initialized successfully!");
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

// Handle page visibility changes (prevent timeout issues)
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    checkFormValidity();
  }
});

// Export functions for external use
window.GamePlanSignIn = {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  checkAge,
  validateCountry,
  checkFormValidity,
  showError,
  showSuccess,
};
