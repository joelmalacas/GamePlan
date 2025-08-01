// Toggle password visibility with smooth animation
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".toggle-password");

  // Add a smooth transition effect
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

// Form animation on submit
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const btn = document.querySelector(".login-btn");
  const btnText = document.querySelector(".btn-text");
  const btnLoader = document.querySelector(".btn-loader");

  btn.classList.add("loading");
  btnText.style.opacity = "0";
  btnText.style.transform = "translateY(-10px)";
  btnLoader.style.display = "block";

  // Smooth transition for loader
  setTimeout(() => {
    btnLoader.classList.add("show");
  }, 100);

  // Simulate loading (remove this in production)
  setTimeout(() => {
    btnLoader.classList.remove("show");
    setTimeout(() => {
      btn.classList.remove("loading");
      btnText.style.opacity = "1";
      btnText.style.transform = "translateY(0)";
      btnLoader.style.display = "none";
      // Add your login logic here
    }, 300);
  }, 2000);
});

// Input focus animations with smooth transitions
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement.classList.add("focused");
    this.style.transform = "translateY(-2px)";
  });

  input.addEventListener("blur", function () {
    this.style.transform = "translateY(0)";
    if (this.value === "") {
      this.parentElement.classList.remove("focused");
    }
  });

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
  if (input.value !== "") {
    input.parentElement.classList.add("focused");
  }
});

// Add smooth transitions to social buttons
document.querySelectorAll(".social-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    this.style.transform = "translateY(-2px) scale(0.98)";

    setTimeout(() => {
      this.style.transform = "translateY(-2px) scale(1.02)";
    }, 100);
  });
});

// Add smooth scroll behavior to links
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
