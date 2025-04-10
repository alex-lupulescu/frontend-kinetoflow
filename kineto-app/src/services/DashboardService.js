import apiClient from './api';

const DashboardService = {
    // Fetches dashboard stats for the logged-in Company Admin
    getCompanyStats() {
        return apiClient.get('/dashboard/company-stats');
    }
    // Add methods for other role dashboards later
};

export default DashboardService;