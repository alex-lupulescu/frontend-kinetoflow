import apiClient from './api';

const CompanyAdminServiceManagementService = {
    // --- Service Management ---
    createService(serviceData) {
        // serviceData: { name, description, durationMinutes, price, category, isActive }
        return apiClient.post('/company-admin/services', serviceData);
    },
    getServices() {
        return apiClient.get('/company-admin/services');
    },
    updateService(serviceId, serviceData) {
        // serviceData: { name, description, durationMinutes, price, category, isActive }
        return apiClient.put(`/company-admin/services/${serviceId}`, serviceData);
    },
    updateServiceStatus(serviceId, isActive) {
        return apiClient.patch(`/company-admin/services/${serviceId}/status`, { isActive });
    },

    // --- Package Management ---
    createPackage(packageData) {
        // packageData: { name, description, totalPrice, isActive, items: [{serviceId, quantity}] }
        return apiClient.post('/company-admin/packages', packageData);
    },
    getPackages() {
        return apiClient.get('/company-admin/packages');
    },
    updatePackage(packageId, packageData) {
        // packageData: { name, description, totalPrice, isActive, items: [{serviceId, quantity}] }
        return apiClient.put(`/company-admin/packages/${packageId}`, packageData);
    },
    updatePackageStatus(packageId, isActive) {
        return apiClient.patch(`/company-admin/packages/${packageId}/status`, { isActive });
    }

    // Add delete methods later if needed
};

export default CompanyAdminServiceManagementService;