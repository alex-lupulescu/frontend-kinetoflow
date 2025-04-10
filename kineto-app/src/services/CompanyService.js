import apiClient from './api';

const CompanyService = {
    // --- APP_ADMIN Methods ---
    getAllCompanies() {
        return apiClient.get('/companies'); // Existing
    },
    createCompany(companyData) {
        return apiClient.post('/companies', companyData); // Existing
    },

    // --- COMPANY_ADMIN Methods ---
    getMyCompany() {
        return apiClient.get('/companies/my-company'); // New
    },
    updateMyCompany(companyData) {
        // companyData should be { address: '...' } - or more if backend allows
        return apiClient.put('/companies/my-company', companyData); // New
    },

    // Add getCompanyById (for APP_ADMIN), deleteCompany etc. later
};

export default CompanyService;