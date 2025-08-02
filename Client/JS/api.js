/**
 * GamePlan API Utility Functions
 * Handles HTTP requests, authentication, and error handling
 */

class GamePlanAPI {
  constructor() {
    this.baseURL = API_CONFIG.API_BASE;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * Get stored authentication token
   */
  getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get stored session ID
   */
  getSessionId() {
    return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  }

  /**
   * Store authentication data
   */
  storeAuthData(token, sessionId, userData, rememberMe = false) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }

  /**
   * Get stored user data
   */
  getUserData() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  /**
   * Build request headers
   */
  buildHeaders(customHeaders = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const sessionId = this.getSessionId();
    if (sessionId) {
      headers["X-Session-ID"] = sessionId;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async makeRequest(method, endpoint, data = null, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options.headers);

    console.log("🚀 API makeRequest called:", {
      method: method.toUpperCase(),
      endpoint: endpoint,
      baseURL: this.baseURL,
      fullURL: url,
      hasData: !!data,
    });

    const config = {
      method: method.toUpperCase(),
      headers,
      ...options,
    };

    // Add body for POST, PUT, PATCH requests
    if (data && ["POST", "PUT", "PATCH"].includes(config.method)) {
      if (data instanceof FormData) {
        // Remove Content-Type header for FormData (let browser set it)
        delete config.headers["Content-Type"];
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    try {
      // Apply request interceptors
      for (const interceptor of this.requestInterceptors) {
        await interceptor(config);
      }

      const controller = new AbortController();
      config.signal = controller.signal;

      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, APP_SETTINGS.REQUEST_TIMEOUT);

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        await interceptor(response);
      }

      const responseData = await this.handleResponse(response);
      return responseData;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Handle HTTP response
   */
  async handleResponse(response) {
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      console.error("❌ API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data: data,
      });

      throw {
        status: response.status,
        statusText: response.statusText,
        data: data,
        response: response,
      };
    }

    return data;
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error("API Error:", error);

    if (error.status) {
      let errorMessage = "";

      // Try to extract detailed error message
      if (error.data) {
        if (typeof error.data === "string") {
          errorMessage = error.data;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.error) {
          if (typeof error.data.error === "string") {
            errorMessage = error.data.error;
          } else if (error.data.error.message) {
            errorMessage = error.data.error.message;
          }

          // Include validation details if available
          if (
            error.data.error.details &&
            Array.isArray(error.data.error.details)
          ) {
            const validationErrors = error.data.error.details
              .map((detail) => `${detail.field}: ${detail.message}`)
              .join(", ");
            errorMessage += ` (${validationErrors})`;
          }
        }
      }

      switch (error.status) {
        case HTTP_STATUS.BAD_REQUEST:
          return new Error(errorMessage || ERROR_MESSAGES.VALIDATION_ERROR);
        case HTTP_STATUS.UNAUTHORIZED:
          this.clearAuthData();
          return new Error(errorMessage || ERROR_MESSAGES.UNAUTHORIZED);
        case HTTP_STATUS.FORBIDDEN:
          return new Error(errorMessage || ERROR_MESSAGES.FORBIDDEN);
        case HTTP_STATUS.NOT_FOUND:
          return new Error(errorMessage || ERROR_MESSAGES.NOT_FOUND);
        case HTTP_STATUS.CONFLICT:
          return new Error(errorMessage || ERROR_MESSAGES.CONFLICT);
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          return new Error(errorMessage || ERROR_MESSAGES.VALIDATION_ERROR);
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          return new Error(errorMessage || ERROR_MESSAGES.TOO_MANY_REQUESTS);
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          return new Error(errorMessage || ERROR_MESSAGES.INTERNAL_ERROR);
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          return new Error(errorMessage || ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        default:
          return new Error(errorMessage || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    }

    if (error.message) {
      return error;
    }

    return new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.makeRequest("GET", endpoint, null, options);
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.makeRequest("POST", endpoint, data, options);
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.makeRequest("PUT", endpoint, data, options);
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data, options = {}) {
    return this.makeRequest("PATCH", endpoint, data, options);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.makeRequest("DELETE", endpoint, null, options);
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append("file", file);

    // Add additional form data
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    return this.post(endpoint, formData);
  }

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  /**
   * Register new user
   */
  async register(userData) {
    console.log("🎯 API.register() called with data:", {
      ...userData,
      password: "***",
    });
    console.log("🔧 Register endpoint:", API_CONFIG.ENDPOINTS.AUTH.REGISTER);
    console.log("🔧 Base URL:", this.baseURL);
    console.log(
      "🔧 Full URL will be:",
      `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
    );

    try {
      console.log("📤 Calling this.post...");
      const response = await this.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData,
      );

      console.log("📥 Got response from this.post:", response);

      if (response.success && response.data) {
        console.log("✅ Registration successful, storing auth data...");
        const { user, token, sessionId } = response.data;
        this.storeAuthData(token, sessionId, user, false);
      } else {
        console.log("❌ Registration failed or no data in response");
      }

      return response;
    } catch (error) {
      console.error("❌ Error in API.register():", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
        rememberMe,
      });

      if (response.success && response.data) {
        const { user, token, sessionId } = response.data;
        this.storeAuthData(token, sessionId, user, rememberMe);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);

      if (response.success && response.data) {
        const currentUserData = this.getUserData();
        const rememberMe =
          localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true";
        const sessionId = this.getSessionId();

        this.storeAuthData(
          response.data.token,
          sessionId,
          currentUserData,
          rememberMe,
        );
      }

      return response;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await this.get(API_CONFIG.ENDPOINTS.AUTH.ME);

      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.user),
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await this.put(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE,
        profileData,
      );

      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.user),
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await this.post(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // =============================================================================
  // INTERCEPTORS
  // =============================================================================

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Remove request interceptor
   */
  removeRequestInterceptor(interceptor) {
    const index = this.requestInterceptors.indexOf(interceptor);
    if (index > -1) {
      this.requestInterceptors.splice(index, 1);
    }
  }

  /**
   * Remove response interceptor
   */
  removeResponseInterceptor(interceptor) {
    const index = this.responseInterceptors.indexOf(interceptor);
    if (index > -1) {
      this.responseInterceptors.splice(index, 1);
    }
  }
}

// Create global API instance
const api = new GamePlanAPI();

// Initialize debug mode after DOM is loaded
function initializeAPIDebug() {
  if (typeof APP_SETTINGS !== "undefined" && APP_SETTINGS.DEBUG) {
    api.addRequestInterceptor(async (config) => {
      console.log("🚀 API Request:", {
        method: config.method,
        headers: config.headers,
        body: config.body,
      });

      // Also log parsed body for debugging
      if (config.body && typeof config.body === "string") {
        try {
          const parsedBody = JSON.parse(config.body);
          console.log("📄 Request Body (parsed):", parsedBody);
        } catch (e) {
          console.log("📄 Request Body (raw):", config.body);
        }
      }
    });

    api.addResponseInterceptor(async (response) => {
      console.log("📥 API Response:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    });
  }
}

// Initialize token refresh interval
function initializeTokenRefresh() {
  if (
    typeof APP_SETTINGS !== "undefined" &&
    typeof STORAGE_KEYS !== "undefined"
  ) {
    // Auto-refresh token when it's about to expire
    setInterval(async () => {
      if (!api.isAuthenticated()) return;

      try {
        // Check if token is about to expire and refresh it
        // This would require JWT decoding to check expiration
        // For now, we'll just refresh periodically
        const rememberMe =
          localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true";
        if (rememberMe) {
          await api.refreshToken();
        }
      } catch (error) {
        console.warn("Token refresh failed:", error);
      }
    }, APP_SETTINGS.TOKEN_REFRESH_THRESHOLD);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeAPIDebug();
    initializeTokenRefresh();
  });
} else {
  // DOM is already loaded
  initializeAPIDebug();
  initializeTokenRefresh();
}

// Export API instance
window.GamePlanAPI = api;
