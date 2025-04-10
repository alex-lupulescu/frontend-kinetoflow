import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import AuthService from '@/services/AuthService'; // Import the service
import router from '@/router'; // Import router for redirection

export const useAuthStore = defineStore('auth', () => {
    // --- State ---
    // Attempt to load user data from localStorage on initialization
    const user = ref(JSON.parse(localStorage.getItem('kinetoflow_user') || 'null'));
    const returnUrl = ref(null); // Store the URL to redirect to after login

    // --- Getters ---
    // Computed property determining if the user is authenticated based on the presence of a token
    const isAuthenticated = computed(() => !!user.value?.token);
    // Computed property for the user's role, returns null if no user
    const userRole = computed(() => user.value?.role || null);
    // Computed property for the user's display name
    const userName = computed(() => user.value?.name || 'Guest');
    // Computed property for the user's email
    const userEmail = computed(() => user.value?.email || null);
    // Computed property for the user's ID
    const userId = computed(() => user.value?.userId || null); // Matches AuthResponse DTO
    // Computed property for the user's company ID (if applicable)
    const companyId = computed(() => user.value?.companyId || null);
    // Computed property for the raw JWT token
    const token = computed(() => user.value?.token || null);


    // --- Actions ---

    /**
     * Attempts to log in the user via API.
     * @param {object} credentials - { email, password }
     * @returns {Promise<object>} - The user data from the API response body (AuthResponse)
     * @throws {Error} If login fails.
     */
    async function login(credentials) {
        console.log("AuthStore: Attempting login via API", credentials.email);
        try {
            // Call the AuthService login method which uses Axios
            const response = await AuthService.login(credentials);
            const userData = response.data; // Expected structure: { token, userId, name, email, role, companyId }

            // Basic validation of the response data
            if (!userData || !userData.token) {
                 throw new Error("Login failed: No token received from server.");
            }

            // Update the reactive user state
            user.value = userData;

            // Persist the entire user data object (including token) in localStorage
            localStorage.setItem('kinetoflow_user', JSON.stringify(userData));

            console.log("AuthStore: Login successful via API. Role:", userData.role);

            // Redirect after successful login
            // Use the stored returnUrl if available, otherwise get default dashboard
            const redirectPath = returnUrl.value || getDefaultDashboardRoute(userData.role);
            returnUrl.value = null; // Clear the return URL after using it
            await router.push(redirectPath); // Use await if needed, router.push returns a promise

            return userData; // Return user data for potential use in component

        } catch (error) {
            console.error("AuthStore: Login API call failed", error.response?.data || error.message);
            logout(); // Ensure user state is cleared on failure
            // Re-throw a more specific error message for the component to display
            throw new Error(error.response?.data?.message || 'Login failed. Please check credentials.');
        }
    }

    /**
     * Logs out the user by clearing state and localStorage, then redirects to login.
     */
    function logout() {
        console.log("AuthStore: Logging out");
        user.value = null; // Clear the reactive user state
        localStorage.removeItem('kinetoflow_user'); // Remove user data from storage
        // Redirect to login page after logout
        router.push({ name: 'login' }); // Use named route for clarity
    }

     /**
      * Fetches details for an invitation token via API.
      * @param {string} token - The invitation token
      * @returns {Promise<object>} - Invitation details { email, companyName, role, inviterName }
      * @throws {Error} If fetching details fails.
      */
    async function getInvitationDetails(token) {
        console.log("AuthStore: Fetching details for token via API", token);
        try {
             const response = await AuthService.getInvitationDetails(token);
             // Backend should return the details object { email, companyName, role, inviterName }
             return response.data;
        } catch(error) {
            console.error("AuthStore: Failed to fetch invitation details via API", error.response?.data || error.message);
            // Throw a user-friendly error message
            throw new Error(error.response?.data?.message || 'Failed to load invitation details. The link might be invalid or expired.');
        }
    }

    /**
     * Accepts an invitation and activates the account via API.
     * @param {object} payload - { token, name, password }
     * @returns {Promise<void>}
     * @throws {Error} If accepting the invitation fails.
     */
    async function acceptInvitation(payload) {
         console.log("AuthStore: Accepting invitation via API", payload.token);
         try {
             // Call the service; assumes backend returns 200 OK on success
             await AuthService.acceptInvitation(payload);
             console.log("AuthStore: Invitation accepted successfully via API");
             // Note: User is NOT logged in automatically after accepting. They must log in separately.
         } catch (error) {
            console.error("AuthStore: Failed to accept invitation via API", error.response?.data || error.message);
            // Throw a user-friendly error message
            throw new Error(error.response?.data?.message || 'Failed to activate account. Please try again.');
         }
    }

    /**
     * Sets the URL to redirect to after successful login.
     * Typically called from the navigation guard when an unauthenticated user tries to access a protected route.
     * @param {string | null} url - The path to redirect to, or null to clear.
     */
    function setReturnUrl(url) {
        console.log("AuthStore: Setting return URL to:", url);
        returnUrl.value = url;
    }

    /**
     * Helper function to determine the default dashboard route path based on the user's role.
     * Matches the nested route structure defined in router/index.js.
     * @param {string | null} role - The user's role (e.g., 'APP_ADMIN', 'MEDIC').
     * @returns {string} The default route path for the role.
     */
    function getDefaultDashboardRoute(role) {
        switch (role) {
            // Ensure these paths match the NAMED routes or literal paths in your router config
            case 'APP_ADMIN':       return '/app/admin/dashboard';
            case 'COMPANY_ADMIN':   return '/app/company/dashboard'; // Update with actual Company Admin dashboard route later
            case 'MEDIC':           return '/app/medic/dashboard';   // Update with actual Medic dashboard route later
            case 'USER':            return '/app/user/my-plan';      // Update with actual User dashboard route later
            default:                return '/app/dashboard'; // Fallback generic dashboard inside layout
        }
    }

    // --- Return state, getters, and actions ---
    return {
        // State refs (consider making them readonly if direct mutation isn't needed outside store)
        user,
        returnUrl, // Expose if needed externally, though setReturnUrl is preferred interface

        // Getters (computed properties) - Preferred way to access state outside store
        isAuthenticated,
        userRole,
        userName,
        userEmail,
        userId,
        companyId,
        token, // Expose token primarily for Axios interceptor

        // Actions (functions) - Methods to modify state or perform async operations
        login,
        logout,
        getInvitationDetails,
        acceptInvitation,
        setReturnUrl,
        getDefaultDashboardRoute // Expose helper if needed by components/guards directly
    };
});