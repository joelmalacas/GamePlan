// Authentication and Page Management for Index
class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    // Check authentication status immediately
    this.checkAuthentication();

    // Setup logout functionality
    this.setupLogout();

    // Setup navigation
    this.setupNavigation();
  }

  // Check if user is authenticated
  checkAuthentication() {
    const loadingScreen = document.getElementById("loadingScreen");
    const dashboard = document.getElementById("dashboard");

    // Simulate authentication check (replace with actual API call)
    setTimeout(() => {
      const isAuthenticated = this.isUserAuthenticated();

      if (isAuthenticated) {
        // User is authenticated, show dashboard
        this.showDashboard(loadingScreen, dashboard);
      } else {
        // User is not authenticated, redirect to login
        this.redirectToLogin();
      }
    }, 1500); // Simulate loading time
  }

  // Check authentication status (placeholder - replace with actual logic)
  isUserAuthenticated() {
    // Check for authentication token in localStorage, sessionStorage, or cookies
    const authToken = localStorage.getItem("auth_token");
    const userSession = sessionStorage.getItem("user_session");

    // For demo purposes, you can set this to true to test the dashboard
    // return true;

    // Check if token exists and is valid
    if (authToken && this.isTokenValid(authToken)) {
      return true;
    }

    if (userSession && this.isSessionValid(userSession)) {
      return true;
    }

    return false;
  }

  // Validate authentication token (placeholder)
  isTokenValid(token) {
    try {
      // In a real implementation, you would:
      // 1. Check token expiration
      // 2. Validate token signature
      // 3. Check with server if needed

      const tokenData = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const currentTime = Math.floor(Date.now() / 1000);

      return tokenData.exp > currentTime;
    } catch (error) {
      console.error("Invalid token format:", error);
      return false;
    }
  }

  // Validate user session (placeholder)
  isSessionValid(session) {
    try {
      const sessionData = JSON.parse(session);
      const expirationTime = new Date(sessionData.expires);
      const currentTime = new Date();

      return expirationTime > currentTime;
    } catch (error) {
      console.error("Invalid session format:", error);
      return false;
    }
  }

  // Show dashboard after successful authentication
  showDashboard(loadingScreen, dashboard) {
    // Fade out loading screen
    loadingScreen.classList.add("fade-out");

    setTimeout(() => {
      loadingScreen.style.display = "none";
      dashboard.style.display = "block";

      // Load user data and initialize dashboard
      this.loadUserData();
      this.initializeDashboard();
    }, 500);
  }

  // Redirect to login page
  redirectToLogin() {
    const loadingText = document.querySelector(".loading-text");
    loadingText.textContent = "Redirecting to login...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }

  // Load user data (placeholder)
  loadUserData() {
    // In a real implementation, fetch user data from API
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Head Coach",
      club: "FC Example",
    };

    // Store user data for use in dashboard
    this.currentUser = userData;

    // Update welcome message
    this.updateWelcomeMessage();
  }

  // Update welcome message with user data
  updateWelcomeMessage() {
    const welcomeSection = document.querySelector(".welcome-section h2");
    if (this.currentUser && welcomeSection) {
      welcomeSection.textContent = `Welcome back, ${this.currentUser.name}!`;
    }
  }

  // Initialize dashboard functionality
  initializeDashboard() {
    // Add click handlers to dashboard cards
    this.setupDashboardCards();

    // Setup real-time updates (if needed)
    this.setupRealTimeUpdates();

    // Load dashboard data
    this.loadDashboardData();
  }

  // Setup dashboard card click handlers
  setupDashboardCards() {
    const cards = document.querySelectorAll(".dashboard-card");

    cards.forEach((card, index) => {
      card.addEventListener("click", () => {
        this.handleCardClick(index);
      });

      // Add keyboard accessibility
      card.setAttribute("tabindex", "0");
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleCardClick(index);
        }
      });
    });
  }

  // Handle dashboard card clicks
  handleCardClick(cardIndex) {
    const cardActions = [
      () => this.navigateToTraining(),
      () => this.navigateToMatches(),
      () => this.navigateToTeam(),
      () => this.navigateToStatistics(),
      () => this.navigateToFinances(),
      () => this.navigateToCommunications(),
    ];

    if (cardActions[cardIndex]) {
      cardActions[cardIndex]();
    }
  }

  // Navigation methods (placeholders)
  navigateToTraining() {
    console.log("Navigating to Training...");
    // window.location.href = 'training.html';
    this.showComingSoon("Training Management");
  }

  navigateToMatches() {
    console.log("Navigating to Matches...");
    // window.location.href = 'matches.html';
    this.showComingSoon("Match Management");
  }

  navigateToTeam() {
    console.log("Navigating to Team...");
    // window.location.href = 'team.html';
    this.showComingSoon("Team Management");
  }

  navigateToStatistics() {
    console.log("Navigating to Statistics...");
    // window.location.href = 'statistics.html';
    this.showComingSoon("Statistics & Analytics");
  }

  navigateToFinances() {
    console.log("Navigating to Finances...");
    // window.location.href = 'finances.html';
    this.showComingSoon("Financial Management");
  }

  navigateToCommunications() {
    console.log("Navigating to Communications...");
    // window.location.href = 'communications.html';
    this.showComingSoon("Communications");
  }

  // Show coming soon modal (temporary)
  showComingSoon(featureName) {
    const modal = document.createElement("div");
    modal.className = "coming-soon-modal";
    modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h3>Coming Soon!</h3>
                    <p>${featureName} is under development and will be available soon.</p>
                    <button class="modal-close-btn" onclick="this.closest('.coming-soon-modal').remove()">
                        Got it!
                    </button>
                </div>
            </div>
        `;

    // Add modal styles
    const modalStyles = `
            <style>
                .coming-soon-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                }
                .modal-overlay {
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 0.3s ease;
                }
                .modal-content {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 400px;
                    margin: 20px;
                    animation: slideInUp 0.3s ease;
                }
                .modal-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #4a90e2, #7b68ee);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
                .modal-icon i {
                    font-size: 2rem;
                    color: white;
                }
                .modal-content h3 {
                    font-size: 1.5rem;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .modal-content p {
                    color: #666;
                    margin-bottom: 25px;
                    line-height: 1.6;
                }
                .modal-close-btn {
                    background: linear-gradient(135deg, #4a90e2, #7b68ee);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .modal-close-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(74, 144, 226, 0.3);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;

    if (!document.querySelector(".modal-styles")) {
      const styleElement = document.createElement("style");
      styleElement.className = "modal-styles";
      styleElement.textContent = modalStyles.replace(/<style>|<\/style>/g, "");
      document.head.appendChild(styleElement);
    }

    document.body.appendChild(modal);
  }

  // Setup navigation functionality
  setupNavigation() {
    const navLinks = document.querySelectorAll(".main-nav a");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        // Remove active class from all links
        navLinks.forEach((l) => l.classList.remove("active"));

        // Add active class to clicked link
        link.classList.add("active");

        // Handle navigation (placeholder)
        const section = link.getAttribute("href").substring(1);
        console.log(`Navigating to: ${section}`);
      });
    });
  }

  // Setup logout functionality
  setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }
  }

  // Logout user
  logout() {
    // Show confirmation dialog
    if (confirm("Are you sure you want to logout?")) {
      // Clear authentication data
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("user_session");

      // Clear any other user data
      this.clearUserData();

      // Redirect to login
      window.location.href = "login.html";
    }
  }

  // Clear user data
  clearUserData() {
    // Clear any cached user data
    this.currentUser = null;

    // Clear any other application state
    localStorage.removeItem("user_preferences");
    sessionStorage.clear();
  }

  // Setup real-time updates (placeholder)
  setupRealTimeUpdates() {
    // In a real implementation, you might setup:
    // - WebSocket connections
    // - Periodic API polling
    // - Push notifications

    console.log("Real-time updates initialized");
  }

  // Load dashboard data (placeholder)
  loadDashboardData() {
    // In a real implementation, fetch dashboard data from API
    console.log("Loading dashboard data...");

    // Simulate loading different dashboard sections
    setTimeout(() => {
      console.log("Dashboard data loaded");
    }, 1000);
  }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AuthManager();
});

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    // Page became visible, check if user is still authenticated
    const authManager = new AuthManager();
    // Only check auth if we're showing the dashboard
    if (document.getElementById("dashboard").style.display !== "none") {
      authManager.checkAuthentication();
    }
  }
});

// Handle browser back/forward navigation
window.addEventListener("popstate", (event) => {
  // Handle navigation state if needed
  console.log("Navigation state changed:", event.state);
});

// Utility functions
const Utils = {
  // Format date
  formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  },

  // Format currency
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  // Show notification
  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
      notification.remove();
    }, 3000);
  },
};

// Export for use in other modules
window.AuthManager = AuthManager;
window.Utils = Utils;
