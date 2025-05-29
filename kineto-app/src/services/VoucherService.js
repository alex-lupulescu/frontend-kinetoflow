import api from './api.js';

class VoucherService {
  // Company Admin endpoints
  
  /**
   * Create a new voucher
   */
  async createVoucher(voucherData) {
    try {
      const response = await api.post('/admin/vouchers', voucherData);
      return response.data;
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
  }

  /**
   * Get all vouchers for the company with pagination
   */
  async getVouchers(page = 0, size = 20) {
    try {
      const response = await api.get('/admin/vouchers', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  }

  /**
   * Get available vouchers (active and usable)
   */
  async getAvailableVouchers() {
    try {
      const response = await api.get('/admin/vouchers/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available vouchers:', error);
      throw error;
    }
  }

  /**
   * Get a specific voucher by ID
   */
  async getVoucherById(voucherId) {
    try {
      const response = await api.get(`/admin/vouchers/${voucherId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching voucher:', error);
      throw error;
    }
  }

  /**
   * Update voucher status
   */
  async updateVoucherStatus(voucherId, status) {
    try {
      const response = await api.patch(`/admin/vouchers/${voucherId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating voucher status:', error);
      throw error;
    }
  }

  /**
   * Get voucher usage history for the company
   */
  async getVoucherUsageHistory(page = 0, size = 20) {
    try {
      const response = await api.get('/admin/vouchers/usage-history', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching voucher usage history:', error);
      throw error;
    }
  }

  /**
   * Get usage history for a specific voucher
   */
  async getVoucherUsageHistoryById(voucherId, page = 0, size = 20) {
    try {
      const response = await api.get(`/admin/vouchers/${voucherId}/usage-history`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching voucher usage history:', error);
      throw error;
    }
  }

  /**
   * Validate a voucher code for a specific amount (preview)
   */
  async validateVoucherAdmin(voucherCode, amount, patientId) {
    try {
      const response = await api.post('/admin/vouchers/validate', null, {
        params: { voucherCode, amount, patientId }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating voucher:', error);
      throw error;
    }
  }

  // Medic endpoints

  /**
   * Apply a voucher to a payment (for medics)
   */
  async applyVoucher(voucherData) {
    try {
      const response = await api.post('/medic/vouchers/apply', voucherData);
      return response.data;
    } catch (error) {
      console.error('Error applying voucher:', error);
      throw error;
    }
  }

  /**
   * Get available vouchers for medics
   */
  async getAvailableVouchersForMedic() {
    try {
      const response = await api.get('/medic/vouchers/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available vouchers for medic:', error);
      throw error;
    }
  }

  /**
   * Validate a voucher code for medics
   */
  async validateVoucherForMedic(voucherCode, amount, patientId) {
    try {
      const response = await api.post('/medic/vouchers/validate', null, {
        params: { voucherCode, amount, patientId }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating voucher for medic:', error);
      throw error;
    }
  }

  // Utility methods

  /**
   * Format discount value for display
   */
  formatDiscountValue(voucher) {
    if (!voucher || !voucher.discountValue) return '';
    
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`;
    } else {
      return `${voucher.discountValue} RON`;
    }
  }

  /**
   * Calculate discount amount for preview
   */
  calculateDiscountAmount(voucher, orderAmount) {
    if (!voucher || !voucher.discountValue || !orderAmount) return 0;
    
    if (voucher.discountType === 'PERCENTAGE') {
      return (orderAmount * voucher.discountValue) / 100;
    } else {
      return Math.min(voucher.discountValue, orderAmount);
    }
  }

  /**
   * Check if voucher is valid for use
   */
  isVoucherValid(voucher) {
    if (!voucher) return false;
    
    const today = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    
    return voucher.status === 'ACTIVE' 
           && startDate <= today 
           && endDate >= today
           && (voucher.maxTotalUses === null || voucher.currentUses < voucher.maxTotalUses);
  }

  // Utility methods for UI
  getVoucherStatusColor(status) {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'EXPIRED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getVoucherStatusText(status) {
    switch (status) {
      case 'ACTIVE':
        return 'Activ';
      case 'INACTIVE':
        return 'Inactiv';
      case 'EXPIRED':
        return 'Expirat';
      default:
        return 'Necunoscut';
    }
  }

  getDiscountTypeText(discountType) {
    switch (discountType) {
      case 'PERCENTAGE':
        return 'Procent';
      case 'FIXED_AMOUNT':
        return 'Sumă fixă';
      default:
        return 'Necunoscut';
    }
  }
}

export default new VoucherService(); 