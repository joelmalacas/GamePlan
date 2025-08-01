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

// Global variables
let currentStep = 1;
let userEmail = "";
let verificationCode = "";
let countdownTimer = null;
let resendTimeout = 60; // seconds

// Step management
function showStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll(".step-container").forEach((step) => {
    step.classList.add("hidden");
  });

  // Show current step
  const stepToShow = document.getElementById(getStepId(stepNumber));
  if (stepToShow) {
    stepToShow.classList.remove("hidden");
    currentStep = stepNumber;
  }
}

function getStepId(stepNumber) {
  const stepIds = ["", "emailStep", "codeStep", "passwordStep", "successStep"];
  return stepIds[stepNumber];
}

// Email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

// Generate random verification code (for demo purposes)
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code (simulated)
function sendVerificationCode(email) {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      if (validateEmail(email)) {
        verificationCode = generateVerificationCode();
        console.log("Verification code (for demo):", verificationCode); // Remove in production
        resolve({
          success: true,
          message: "Verification code sent successfully",
        });
      } else {
        reject({
          success: false,
          message: "Invalid email address",
        });
      }
    }, 2000);
  });
}

// Verify code
function verifyCode(inputCode) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (inputCode === verificationCode) {
        resolve({
          success: true,
          message: "Code verified successfully",
        });
      } else {
        reject({
          success: false,
          message: "Invalid verification code",
        });
      }
    }, 1500);
  });
}

// Reset password (simulated)
function resetPassword(email, newPassword) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Password reset successfully",
      });
    }, 2000);
  });
}

// Code input management
function setupCodeInputs() {
  const codeInputs = document.querySelectorAll(".code-input");

  codeInputs.forEach((input, index) => {
    input.addEventListener("input", function (e) {
      const value = e.target.value;

      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        e.target.value = "";
        return;
      }

      // Move to next input if current is filled
      if (value && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }

      // Update input styles
      if (value) {
        e.target.classList.add("filled");
        e.target.classList.remove("error");
      } else {
        e.target.classList.remove("filled");
      }

      // Check if all inputs are filled
      checkCodeComplete();
    });

    input.addEventListener("keydown", function (e) {
      // Handle backspace
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        codeInputs[index - 1].focus();
        codeInputs[index - 1].value = "";
        codeInputs[index - 1].classList.remove("filled");
      }

      // Handle paste
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        navigator.clipboard.readText().then((text) => {
          const numbers = text.replace(/\D/g, "").slice(0, 6);
          codeInputs.forEach((input, i) => {
            input.value = numbers[i] || "";
            if (numbers[i]) {
              input.classList.add("filled");
            }
          });
          checkCodeComplete();
        });
      }
    });

    input.addEventListener("focus", function () {
      e.target.classList.remove("error");
    });
  });
}

// Check if code is complete
function checkCodeComplete() {
  const codeInputs = document.querySelectorAll(".code-input");
  const verifyBtn = document.getElementById("verifyCodeBtn");
  let allFilled = true;

  codeInputs.forEach((input) => {
    if (!input.value) {
      allFilled = false;
    }
  });

  verifyBtn.disabled = !allFilled;
}

// Get entered code
function getEnteredCode() {
  const codeInputs = document.querySelectorAll(".code-input");
  return Array.from(codeInputs)
    .map((input) => input.value)
    .join("");
}

// Clear code inputs
function clearCodeInputs() {
  const codeInputs = document.querySelectorAll(".code-input");
  codeInputs.forEach((input) => {
    input.value = "";
    input.classList.remove("filled", "error");
  });
  checkCodeComplete();
}

// Show error on code inputs
function showCodeError() {
  const codeInputs = document.querySelectorAll(".code-input");
  codeInputs.forEach((input) => {
    input.classList.add("error");
  });
}

// Countdown timer for resend
function startResendCountdown() {
  const resendBtn = document.getElementById("resendBtn");
  const countdown = document.getElementById("countdown");
  let timeLeft = resendTimeout;

  resendBtn.disabled = true;
  countdown.style.display = "inline";

  countdownTimer = setInterval(() => {
    timeLeft--;
    countdown.textContent = `(${timeLeft}s)`;

    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      resendBtn.disabled = false;
      countdown.style.display = "none";
    }
  }, 1000);
}

// Show loading state for button
function showButtonLoading(buttonId, show = true) {
  const btn = document.getElementById(buttonId);
  const btnText = btn.querySelector(".btn-text");
  const btnLoader = btn.querySelector(".btn-loader");

  if (show) {
    btn.classList.add("loading");
    btnText.style.opacity = "0";
    btnText.style.transform = "translateY(-10px)";
    btnLoader.style.display = "block";
    setTimeout(() => btnLoader.classList.add("show"), 100);
  } else {
    btnLoader.classList.remove("show");
    setTimeout(() => {
      btn.classList.remove("loading");
      btnText.style.opacity = "1";
      btnText.style.transform = "translateY(0)";
      btnLoader.style.display = "none";
    }, 300);
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

  document
    .querySelector(".forgot-card")
    .insertBefore(
      alert,
      document.querySelector(".step-container:not(.hidden)"),
    );

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
    .querySelector(".forgot-card")
    .insertBefore(
      alert,
      document.querySelector(".step-container:not(.hidden)"),
    );
}

// Check password form validity
function checkPasswordFormValidity() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const resetBtn = document.getElementById("resetPasswordBtn");

  const passwordValid = validatePassword(newPassword);
  const passwordsMatch = validatePasswordMatch(newPassword, confirmPassword);

  resetBtn.disabled = !(passwordValid && passwordsMatch);
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Setup code inputs
  setupCodeInputs();

  // Email form submission
  document
    .getElementById("emailForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;

      if (!validateEmail(email)) {
        showError("Please enter a valid email address.");
        return;
      }

      showButtonLoading("sendCodeBtn", true);

      try {
        await sendVerificationCode(email);
        userEmail = email;
        document.getElementById("emailDisplay").textContent = email;
        showStep(2);
        startResendCountdown();
        showSuccess("Verification code sent to your email!");
      } catch (error) {
        showError(
          error.message ||
            "Failed to send verification code. Please try again.",
        );
      } finally {
        showButtonLoading("sendCodeBtn", false);
      }
    });

  // Code form submission
  document
    .getElementById("codeForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const enteredCode = getEnteredCode();

      showButtonLoading("verifyCodeBtn", true);

      try {
        await verifyCode(enteredCode);
        showStep(3);
        showSuccess("Code verified successfully!");
      } catch (error) {
        showCodeError();
        showError(
          error.message || "Invalid verification code. Please try again.",
        );
      } finally {
        showButtonLoading("verifyCodeBtn", false);
      }
    });

  // Password form submission
  document
    .getElementById("passwordForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!validatePassword(newPassword)) {
        showError("Password does not meet security requirements.");
        return;
      }

      if (newPassword !== confirmPassword) {
        showError("Passwords do not match.");
        return;
      }

      showButtonLoading("resetPasswordBtn", true);

      try {
        await resetPassword(userEmail, newPassword);
        showStep(4);
      } catch (error) {
        showError(
          error.message || "Failed to reset password. Please try again.",
        );
      } finally {
        showButtonLoading("resetPasswordBtn", false);
      }
    });

  // Resend code button
  document
    .getElementById("resendBtn")
    .addEventListener("click", async function () {
      clearCodeInputs();

      try {
        await sendVerificationCode(userEmail);
        startResendCountdown();
        showSuccess("New verification code sent!");
      } catch (error) {
        showError("Failed to resend code. Please try again.");
      }
    });

  // Back to email button
  document
    .getElementById("backToEmailBtn")
    .addEventListener("click", function () {
      clearCodeInputs();
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
      showStep(1);
    });

  // Password input validation
  document.getElementById("newPassword").addEventListener("input", function () {
    validatePassword(this.value);
    checkPasswordFormValidity();
  });

  document
    .getElementById("confirmPassword")
    .addEventListener("input", function () {
      const newPassword = document.getElementById("newPassword").value;
      validatePasswordMatch(newPassword, this.value);
      checkPasswordFormValidity();
    });

  // Input focus animations
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
      this.style.transform = "translateY(-2px)";
    });

    input.addEventListener("blur", function () {
      this.style.transform = "translateY(0)";
      if (this.value === "" && !this.classList.contains("code-input")) {
        this.parentElement.classList.remove("focused");
      }
    });

    // Check if input has value on page load
    if (input.value !== "" && !input.classList.contains("code-input")) {
      input.parentElement.classList.add("focused");
    }
  });

  // Add alert styles
  const alertStyles = document.createElement("style");
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
});
