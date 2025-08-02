/**
 * GamePlan Login Page JavaScript
 * Handles user authentication and form interactions
 */

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberCheckbox = document.getElementById("remember");
  const loginBtn = document.querySelector(".login-btn");
  const btnText = document.querySelector(".btn-text");
  const btnLoader = document.querySelector(".btn-loader");
  const inputContainers = document.querySelectorAll(".input-container");

  // Initialize form
  initializeForm();

  /**
   * Initialize form interactions
   */
  function initializeForm() {
    // Add input focus/blur handlers
    inputContainers.forEach((container) => {
      const input = container.querySelector("input");
      if (input) {
        input.addEventListener("focus", handleInputFocus);
        input.addEventListener("blur", handleInputBlur);
        input.addEventListener("input", handleInputChange);
      }
    });

    // Add form submit handler
    loginForm.addEventListener("submit", handleFormSubmit);

    // Check if user is already logged in
    if (api.isAuthenticated()) {
      redirectToDashboard();
    }

    // Auto-fill email if stored
    const storedEmail = localStorage.getItem("gameplan_last_email");
    if (storedEmail) {
      emailInput.value = storedEmail;
      emailInput.parentElement.classList.add("focused");
    }
  }

  /**
   * Handle input focus
   */
  function handleInputFocus(event) {
    const container = event.target.closest(".input-container");
    container.classList.add("focused");
  }

  /**
   * Handle input blur
   */
  function handleInputBlur(event) {
    const container = event.target.closest(".input-container");
    const input = event.target;

    if (!input.value.trim()) {
      container.classList.remove("focused");
    }
  }

  /**
   * Handle input change
   */
  function handleInputChange(event) {
    const input = event.target;
    const container = input.closest(".input-container");

    // Clear previous error states
    container.classList.remove("error");
    hideError(container);

    // Real-time validation
    validateInput(input);
  }

  /**
   * Validate individual input
   */
  function validateInput(input) {
    const container = input.closest(".input-container");
    let isValid = true;
    let errorMessage = "";

    switch (input.type) {
      case "email":
        if (!input.value.trim()) {
          errorMessage = ERROR_MESSAGES.REQUIRED_FIELD;
          isValid = false;
        } else if (!APP_SETTINGS.VALIDATION.EMAIL.test(input.value)) {
          errorMessage = ERROR_MESSAGES.INVALID_EMAIL;
          isValid = false;
        }
        break;

      case "password":
        if (!input.value.trim()) {
          errorMessage = ERROR_MESSAGES.REQUIRED_FIELD;
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      showError(container, errorMessage);
      container.classList.add("error");
    } else {
      hideError(container);
      container.classList.remove("error");
    }

    return isValid;
  }

  /**
   * Validate entire form
   */
  function validateForm() {
    let isValid = true;

    // Validate all inputs
    const inputs = loginForm.querySelectorAll("input[required]");
    inputs.forEach((input) => {
      if (!validateInput(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Show error message
   */
  function showError(container, message) {
    // Remove existing error message
    hideError(container);

    // Create error element
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    // Insert error message
    container.appendChild(errorElement);
  }

  /**
   * Hide error message
   */
  function hideError(container) {
    const errorElement = container.querySelector(".error-message");
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
      showNotification("Please fix the errors above.", "error");
      return;
    }

    // Get form data
    const formData = new FormData(loginForm);
    const email = formData.get("email").trim();
    const password = formData.get("password");
    const rememberMe = formData.get("remember") === "on";

    // Show loading state
    setLoadingState(true);

    try {
      // Store email for next time
      localStorage.setItem("gameplan_last_email", email);

      // Attempt login
      const response = await api.login(email, password, rememberMe);

      if (response.success) {
        showNotification(SUCCESS_MESSAGES.LOGIN_SUCCESS, "success");

        // Small delay to show success message
        setTimeout(() => {
          redirectToDashboard();
        }, 1000);
      } else {
        throw new Error(response.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = error.message;

      // Handle specific error cases
      if (
        error.message.includes("Invalid credentials") ||
        error.message.includes("INVALID_CREDENTIALS")
      ) {
        errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
      } else if (
        error.message.includes("Account is deactivated") ||
        error.message.includes("ACCOUNT_DEACTIVATED")
      ) {
        errorMessage =
          "Your account has been deactivated. Please contact support.";
      }

      showNotification(errorMessage, "error");

      // Clear password field on error
      passwordInput.value = "";
      passwordInput.focus();
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Set loading state
   */
  function setLoadingState(isLoading) {
    if (isLoading) {
      loginBtn.disabled = true;
      loginBtn.classList.add("loading");
      btnText.textContent = LOADING_MESSAGES.SIGNING_IN;
      btnLoader.classList.add("show");

      // Disable form inputs
      const inputs = loginForm.querySelectorAll("input");
      inputs.forEach((input) => (input.disabled = true));
    } else {
      loginBtn.disabled = false;
      loginBtn.classList.remove("loading");
      btnText.textContent = "Login";
      btnLoader.classList.remove("show");

      // Enable form inputs
      const inputs = loginForm.querySelectorAll("input");
      inputs.forEach((input) => (input.disabled = false));
    }
  }

  /**
   * Show notification
   */
  function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    const icon =
      type === "success"
        ? "check-circle"
        : type === "error"
          ? "exclamation-circle"
          : "info-circle";

    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add("show");
    });
  }

  /**
   * Redirect to dashboard
   */
  function redirectToDashboard() {
    // Check if there's a redirect URL in session storage
    const redirectUrl = sessionStorage.getItem("gameplan_redirect_url");
    if (redirectUrl) {
      sessionStorage.removeItem("gameplan_redirect_url");
      window.location.href = redirectUrl;
    } else {
      window.location.href = "index.html";
    }
  }

  /**
   * Toggle password visibility
   */
  window.togglePassword = function () {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.querySelector(".toggle-password");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  document.addEventListener("keydown", function (event) {
    // Enter key to submit form
    if (event.key === "Enter" && !loginBtn.disabled) {
      loginForm.dispatchEvent(new Event("submit"));
    }

    // Escape key to clear form
    if (event.key === "Escape") {
      loginForm.reset();
      inputContainers.forEach((container) => {
        container.classList.remove("focused", "error");
        hideError(container);
      });
    }
  });

  /**
   * Handle browser back/forward navigation
   */
  window.addEventListener("pageshow", function (event) {
    // If page is loaded from cache and user is authenticated, redirect
    if (event.persisted && api.isAuthenticated()) {
      redirectToDashboard();
    }
  });

  /**
   * Check server connectivity on page load
   */
  async function checkServerConnectivity() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
      if (!response.ok) {
        throw new Error("Server health check failed");
      }
    } catch (error) {
      console.warn("Server connectivity issue:", error);
      showNotification(
        "Connection to server is unstable. Please check your internet connection.",
        "warning",
      );
    }
  }

  // Check server connectivity after a short delay
  setTimeout(checkServerConnectivity, 1000);
});

/**
 * Add custom CSS for notifications and errors
 */
const customCSS = `
    .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #e74c3c;
        font-size: 0.85rem;
        margin-top: 8px;
        animation: slideInError 0.3s ease-out;
    }

    .error-message i {
        font-size: 0.8rem;
    }

    .input-container.error input {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
    }

    .input-container.error .input-icon {
        color: #e74c3c !important;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #3498db;
        max-width: 400px;
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
    }

    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }

    .notification-success {
        border-left-color: #27ae60;
    }

    .notification-error {
        border-left-color: #e74c3c;
    }

    .notification-warning {
        border-left-color: #f39c12;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .notification-content i {
        font-size: 1.2rem;
    }

    .notification-success .notification-content i {
        color: #27ae60;
    }

    .notification-error .notification-content i {
        color: #e74c3c;
    }

    .notification-warning .notification-content i {
        color: #f39c12;
    }

    .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .notification-close:hover {
        background: #f5f5f5;
        color: #666;
    }

    @keyframes slideInError {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .login-btn.loading {
        pointer-events: none;
        opacity: 0.8;
    }

    .btn-loader {
        display: none;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }

    .btn-loader.show {
        display: block;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Inject custom CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = customCSS;
document.head.appendChild(styleSheet);
