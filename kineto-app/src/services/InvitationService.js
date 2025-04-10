import apiClient from './api';

const InvitationService = {
    // Sends an invitation (requires ADMIN role on backend)
    sendInvitation(invitationData) {
        // invitationData: { email: '...', role: '...', companyId: ?, inviterName: ? }
        return apiClient.post('/invitations/send', invitationData);
    },

    // getInvitationDetails and acceptInvitation remain the same as before
    // (They are used on public pages)
};

export default InvitationService;