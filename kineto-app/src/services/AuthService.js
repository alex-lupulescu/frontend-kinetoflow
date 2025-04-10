import apiClient from './api';

const AuthService = {
    login(credentials) {
        // credentials should be { email: '...', password: '...' }
        return apiClient.post('/auth/login', credentials);
    },

    getInvitationDetails(token) {
        return apiClient.get(`/invitations/details/${token}`);
        // Backend endpoint needs to exist (e.g., @GetMapping("/details/{token}") in InvitationController)
    },

    acceptInvitation(payload) {
        // payload should be { token: '...', name: '...', password: '...' }
        return apiClient.post('/invitations/accept', payload);
         // Backend endpoint needs to exist (e.g., @PostMapping("/accept") in InvitationController)
    },

    // Add other auth-related calls here later (e.g., register (if needed), forgotPassword, refreshToken)
};

export default AuthService;