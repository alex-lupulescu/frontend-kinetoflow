<template>
  <div class="financial-report">
    <div class="financial-header">
      <h2><i class="fas fa-chart-line"></i> Financial Performance Dashboard</h2>
      <p>Comprehensive revenue analytics and payment insights</p>
    </div>

    <div v-if="reportData.totalRevenue !== undefined" class="financial-container">
      <!-- Revenue Overview -->
      <div class="revenue-section">
        <h3><i class="fas fa-money-bill-wave"></i> Revenue Overview</h3>
        <div class="revenue-grid">
          <div class="revenue-card primary">
            <div class="revenue-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="revenue-content">
              <h4>{{ formatCurrency(reportData.totalRevenue) }}</h4>
              <p>Total Revenue</p>
              <div class="revenue-trend">
                <i class="fas fa-trending-up"></i>
                <span>Primary Income</span>
              </div>
            </div>
          </div>

          <div class="revenue-card payments">
            <div class="revenue-icon">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="revenue-content">
              <h4>{{ reportData.totalPayments || 0 }}</h4>
              <p>Total Payments</p>
              <div class="revenue-trend">
                <i class="fas fa-credit-card"></i>
                <span>Payment Count</span>
              </div>
            </div>
          </div>

          <div class="revenue-card average">
            <div class="revenue-icon">
              <i class="fas fa-calculator"></i>
            </div>
            <div class="revenue-content">
              <h4>{{ formatCurrency(reportData.averagePayment) }}</h4>
              <p>Average Payment</p>
              <div class="revenue-trend">
                <i class="fas fa-chart-bar"></i>
                <span>Per Transaction</span>
              </div>
            </div>
          </div>

          <div class="revenue-card discounts">
            <div class="revenue-icon">
              <i class="fas fa-tags"></i>
            </div>
            <div class="revenue-content">
              <h4>{{ formatCurrency(reportData.totalDiscounts) }}</h4>
              <p>Total Discounts</p>
              <div class="discount-indicator" :class="getDiscountSeverity()">
                <i class="fas fa-percentage"></i>
                <span>{{ getDiscountPercentage() }}% of Revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods Analysis -->
      <div class="methods-section" v-if="reportData.paymentMethodBreakdown && Object.keys(reportData.paymentMethodBreakdown).length > 0">
        <h3><i class="fas fa-credit-card"></i> Payment Methods Breakdown</h3>
        <div class="methods-grid">
          <div 
            v-for="(amount, method) in reportData.paymentMethodBreakdown" 
            :key="method || 'unknown'"
            class="method-card"
            :class="getMethodClass(method)"
          >
            <div class="method-header">
              <div class="method-icon">
                <i :class="getMethodIcon(method)"></i>
              </div>
              <h4>{{ formatMethodName(method) }}</h4>
            </div>
            <div class="method-stats">
              <div class="method-amount">
                <span class="amount-value">{{ formatCurrency(amount) }}</span>
                <span class="amount-label">Revenue</span>
              </div>
              <div class="method-percentage">
                <div class="percentage-bar">
                  <div 
                    class="percentage-fill" 
                    :style="{ width: getMethodPercentage(amount) + '%' }"
                  ></div>
                </div>
                <span class="percentage-text">{{ getMethodPercentage(amount) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue by Status -->
      <div class="status-section" v-if="reportData.revenueByStatus && Object.keys(reportData.revenueByStatus).length > 0">
        <h3><i class="fas fa-chart-pie"></i> Revenue by Payment Status</h3>
        <div class="status-overview">
          <div class="status-chart">
            <div class="chart-container">
              <div class="donut-chart" :style="getDonutChartStyle()">
                <div class="chart-center">
                  <span class="total-label">Total</span>
                  <span class="total-value">{{ formatCurrency(reportData.totalRevenue) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="status-legend">
            <div 
              v-for="(amount, status) in reportData.revenueByStatus" 
              :key="status || 'unknown'"
              class="legend-item"
              :class="getStatusClass(status)"
            >
              <div class="legend-indicator"></div>
              <div class="legend-content">
                <span class="legend-label">{{ formatStatusName(status) }}</span>
                <span class="legend-value">{{ formatCurrency(amount) }}</span>
                <span class="legend-percentage">{{ getStatusPercentage(amount) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Insights -->
      <div class="insights-section">
        <h3><i class="fas fa-lightbulb"></i> Financial Insights</h3>
        <div class="insights-grid">
          <div class="insight-card revenue-health">
            <div class="insight-icon">
              <i class="fas fa-heartbeat"></i>
            </div>
            <div class="insight-content">
              <h4>Revenue Health</h4>
              <p class="insight-value">{{ getRevenueHealthStatus() }}</p>
              <p class="insight-description">{{ getRevenueHealthDescription() }}</p>
            </div>
          </div>

          <div class="insight-card payment-efficiency">
            <div class="insight-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="insight-content">
              <h4>Payment Efficiency</h4>
              <p class="insight-value">{{ getPaymentEfficiency() }}%</p>
              <p class="insight-description">{{ getEfficiencyDescription() }}</p>
            </div>
          </div>

          <div class="insight-card discount-impact">
            <div class="insight-icon">
              <i class="fas fa-percent"></i>
            </div>
            <div class="insight-content">
              <h4>Discount Impact</h4>
              <p class="insight-value">{{ getDiscountPercentage() }}%</p>
              <p class="insight-description">{{ getDiscountImpactDescription() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Metrics Summary -->
      <div class="summary-section">
        <h3><i class="fas fa-chart-area"></i> Key Financial Metrics</h3>
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-metric">
              <span class="metric-label">Revenue Growth Potential</span>
              <span class="metric-value success">{{ getGrowthPotential() }}</span>
            </div>
            <div class="summary-description">
              Based on payment completion rates and average transaction values
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-metric">
              <span class="metric-label">Payment Conversion</span>
              <span class="metric-value info">{{ getPaymentConversion() }}%</span>
            </div>
            <div class="summary-description">
              Percentage of scheduled services resulting in completed payments
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-metric">
              <span class="metric-label">Average Transaction Size</span>
              <span class="metric-value primary">{{ formatCurrency(reportData.averagePayment) }}</span>
            </div>
            <div class="summary-description">
              Mean value per payment transaction in the reporting period
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-financial-data">
      <div class="no-data-content">
        <i class="fas fa-chart-line-down"></i>
        <h3>No Financial Data Available</h3>
        <p>No financial transactions have been recorded during the selected period. Financial metrics will appear here once payments are processed.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  reportData: {
    type: Object,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '' || isNaN(value)) return '0.00 RON';
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '0.00 RON';
  return `${numValue.toFixed(2)} RON`;
};

const getDiscountSeverity = () => {
  const percentage = getDiscountPercentage();
  if (percentage > 20) return 'high';
  if (percentage > 10) return 'medium';
  return 'low';
};

const getDiscountPercentage = () => {
  if (!props.reportData.totalRevenue || !props.reportData.totalDiscounts) return 0;
  return Math.round((props.reportData.totalDiscounts / (props.reportData.totalRevenue + props.reportData.totalDiscounts)) * 100);
};

const getMethodClass = (method) => {
  if (!method || typeof method !== 'string') return 'method-other';
  const methodName = method.toLowerCase();
  if (methodName.includes('card') || methodName.includes('credit')) return 'method-card-payment';
  if (methodName.includes('cash')) return 'method-cash';
  if (methodName.includes('transfer') || methodName.includes('bank')) return 'method-transfer';
  return 'method-other';
};

const getMethodIcon = (method) => {
  if (!method || typeof method !== 'string') return 'fas fa-coins';
  const methodName = method.toLowerCase();
  if (methodName.includes('card') || methodName.includes('credit')) return 'fas fa-credit-card';
  if (methodName.includes('cash')) return 'fas fa-money-bill-alt';
  if (methodName.includes('transfer') || methodName.includes('bank')) return 'fas fa-university';
  return 'fas fa-coins';
};

const formatMethodName = (method) => {
  if (!method || method === 'null' || method === 'undefined') return 'Unknown';
  if (typeof method !== 'string') return String(method);
  return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
};

const getMethodPercentage = (amount) => {
  if (!props.reportData.totalRevenue) return 0;
  return Math.round((amount / props.reportData.totalRevenue) * 100);
};

const getStatusClass = (status) => {
  if (!status || typeof status !== 'string') return 'status-other';
  const statusName = status.toLowerCase();
  if (statusName.includes('completed') || statusName.includes('paid')) return 'status-completed';
  if (statusName.includes('pending')) return 'status-pending';
  if (statusName.includes('failed') || statusName.includes('cancelled')) return 'status-failed';
  return 'status-other';
};

const formatStatusName = (status) => {
  if (!status || typeof status !== 'string') return 'Unknown';
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const getStatusPercentage = (amount) => {
  if (!props.reportData.totalRevenue) return 0;
  return Math.round((amount / props.reportData.totalRevenue) * 100);
};

const getDonutChartStyle = () => {
  if (!props.reportData.revenueByStatus) return {};
  
  const total = props.reportData.totalRevenue;
  const statuses = Object.entries(props.reportData.revenueByStatus);
  let currentPercentage = 0;
  
  const gradients = statuses.map(([status, amount]) => {
    const percentage = (amount / total) * 100;
    const color = getStatusColor(status);
    const start = currentPercentage;
    const end = currentPercentage + percentage;
    currentPercentage = end;
    return `${color} ${start}% ${end}%`;
  }).join(', ');
  
  return {
    background: `conic-gradient(${gradients})`
  };
};

const getStatusColor = (status) => {
  if (!status || typeof status !== 'string') return '#667eea';
  const statusName = status.toLowerCase();
  if (statusName.includes('completed') || statusName.includes('paid')) return '#38a169';
  if (statusName.includes('pending')) return '#ed8936';
  if (statusName.includes('failed') || statusName.includes('cancelled')) return '#e53e3e';
  return '#667eea';
};

const getRevenueHealthStatus = () => {
  const revenue = props.reportData.totalRevenue || 0;
  const payments = props.reportData.totalPayments || 0;
  
  if (revenue > 10000 && payments > 50) return 'Excellent';
  if (revenue > 5000 && payments > 20) return 'Good';
  if (revenue > 1000 && payments > 5) return 'Average';
  return 'Needs Improvement';
};

const getRevenueHealthDescription = () => {
  const status = getRevenueHealthStatus();
  if (status === 'Excellent') return 'Strong revenue performance with healthy transaction volume';
  if (status === 'Good') return 'Solid revenue generation with room for growth';
  if (status === 'Average') return 'Moderate performance, consider optimization strategies';
  return 'Focus on increasing transaction volume and value';
};

const getPaymentEfficiency = () => {
  if (!props.reportData.revenueByStatus || typeof props.reportData.revenueByStatus !== 'object') return 0;
  const completed = props.reportData.revenueByStatus.COMPLETED || props.reportData.revenueByStatus.completed || 0;
  const total = props.reportData.totalRevenue || 0;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

const getEfficiencyDescription = () => {
  const efficiency = getPaymentEfficiency();
  if (efficiency >= 90) return 'Excellent payment completion rate';
  if (efficiency >= 75) return 'Good payment processing efficiency';
  if (efficiency >= 50) return 'Moderate efficiency, room for improvement';
  return 'Low completion rate, review payment processes';
};

const getDiscountImpactDescription = () => {
  const percentage = getDiscountPercentage();
  if (percentage > 20) return 'High discount rate may impact profitability';
  if (percentage > 10) return 'Moderate discount usage, monitor impact';
  return 'Conservative discount strategy maintains margins';
};

const getGrowthPotential = () => {
  const efficiency = getPaymentEfficiency();
  const avgPayment = props.reportData.averagePayment || 0;
  
  if (efficiency >= 80 && avgPayment > 100) return 'High';
  if (efficiency >= 60 && avgPayment > 50) return 'Medium';
  return 'Limited';
};

const getPaymentConversion = () => {
  return getPaymentEfficiency(); // Same calculation for this context
};
</script>

<style scoped>
/* Financial Overview Report - Modern Design */
.financial-report {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Header Section */
.financial-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.financial-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
  opacity: 0.3;
}

.financial-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.financial-header i {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.financial-header p {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

/* Financial Container */
.financial-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Revenue Section */
.revenue-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.revenue-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.revenue-section i {
  color: #667eea;
  font-size: 1.6rem;
}

.revenue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.revenue-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.revenue-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.revenue-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.revenue-card.primary::before {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.revenue-card.payments::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.revenue-card.average::before {
  background: linear-gradient(90deg, #3182ce 0%, #4299e1 100%);
}

.revenue-card.discounts::before {
  background: linear-gradient(90deg, #ed8936 0%, #fbb040 100%);
}

.revenue-icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

.revenue-icon i {
  font-size: 3rem;
  padding: 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.primary .revenue-icon i {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
}

.payments .revenue-icon i {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.average .revenue-icon i {
  background: linear-gradient(135deg, #3182ce 0%, #4299e1 100%);
}

.discounts .revenue-icon i {
  background: linear-gradient(135deg, #ed8936 0%, #fbb040 100%);
}

.revenue-content {
  text-align: center;
}

.revenue-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.revenue-content p {
  margin: 0 0 1rem 0;
  color: #718096;
  font-size: 1rem;
  font-weight: 500;
}

.revenue-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #718096;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 1rem;
}

.discount-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 1rem;
}

.discount-indicator.low {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
}

.discount-indicator.medium {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.discount-indicator.high {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

/* Methods Section */
.methods-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.methods-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.methods-section i {
  color: #667eea;
  font-size: 1.6rem;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.method-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
}

.method-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.method-card.method-card-payment {
  border-left: 6px solid #667eea;
}

.method-card.method-cash {
  border-left: 6px solid #38a169;
}

.method-card.method-transfer {
  border-left: 6px solid #3182ce;
}

.method-card.method-other {
  border-left: 6px solid #ed8936;
}

.method-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.method-icon i {
  font-size: 2rem;
  color: #667eea;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-header h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.method-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.method-amount {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.amount-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.amount-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

.method-percentage {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.percentage-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 1s ease;
}

.percentage-text {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
}

/* Status Section */
.status-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.status-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.status-section i {
  color: #667eea;
  font-size: 1.6rem;
}

.status-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.status-chart {
  display: flex;
  justify-content: center;
}

.chart-container {
  position: relative;
  width: 250px;
  height: 250px;
}

.donut-chart {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-center {
  position: absolute;
  background: white;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.total-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.total-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  line-height: 1.2;
}

.status-legend {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.legend-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.legend-item.status-completed {
  border-left-color: #38a169;
}

.legend-item.status-pending {
  border-left-color: #ed8936;
}

.legend-item.status-failed {
  border-left-color: #e53e3e;
}

.legend-item.status-other {
  border-left-color: #667eea;
}

.legend-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-completed .legend-indicator {
  background: #38a169;
}

.status-pending .legend-indicator {
  background: #ed8936;
}

.status-failed .legend-indicator {
  background: #e53e3e;
}

.status-other .legend-indicator {
  background: #667eea;
}

.legend-content {
  flex: 1;
}

.legend-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.legend-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #38a169;
  margin-bottom: 0.25rem;
}

.legend-percentage {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

/* Insights Section */
.insights-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.insights-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.insights-section i {
  color: #667eea;
  font-size: 1.6rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.insight-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  text-align: center;
}

.insight-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.insight-card.revenue-health {
  border-left: 6px solid #38a169;
}

.insight-card.payment-efficiency {
  border-left: 6px solid #3182ce;
}

.insight-card.discount-impact {
  border-left: 6px solid #ed8936;
}

.insight-icon {
  margin-bottom: 1.5rem;
}

.insight-icon i {
  font-size: 3rem;
  padding: 1rem;
  border-radius: 50%;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.revenue-health .insight-icon i {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
}

.payment-efficiency .insight-icon i {
  background: linear-gradient(135deg, #3182ce 0%, #4299e1 100%);
}

.discount-impact .insight-icon i {
  background: linear-gradient(135deg, #ed8936 0%, #fbb040 100%);
}

.insight-content h4 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
}

.insight-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #38a169;
  margin-bottom: 0.5rem;
}

.insight-description {
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.5;
}

/* Summary Section */
.summary-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.summary-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.summary-section i {
  color: #667eea;
  font-size: 1.6rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.summary-card.success {
  border-left: 6px solid #38a169;
}

.summary-card.info {
  border-left: 6px solid #3182ce;
}

.summary-card.primary {
  border-left: 6px solid #667eea;
}

.summary-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.metric-label {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.metric-value.success {
  color: #38a169;
}

.metric-value.info {
  color: #3182ce;
}

.metric-value.primary {
  color: #667eea;
}

.summary-description {
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.5;
}

/* No Financial Data */
.no-financial-data {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-data-content {
  text-align: center;
  max-width: 500px;
}

.no-data-content i {
  font-size: 5rem;
  color: #e2e8f0;
  margin-bottom: 2rem;
}

.no-data-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #4a5568;
}

.no-data-content p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .financial-report {
    padding: 0.5rem;
    gap: 1.5rem;
  }

  .financial-header h2 {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .revenue-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .methods-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .status-overview {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .insights-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .revenue-icon i {
    font-size: 2rem;
    padding: 0.75rem;
  }

  .revenue-content h4 {
    font-size: 2rem;
  }

  .chart-container {
    width: 200px;
    height: 200px;
  }

  .chart-center {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .revenue-grid {
    grid-template-columns: 1fr;
  }

  .revenue-section, .methods-section, .status-section, .insights-section, .summary-section {
    padding: 1.5rem;
  }

  .revenue-content h4 {
    font-size: 1.8rem;
  }

  .insight-value {
    font-size: 1.5rem;
  }

  .metric-value {
    font-size: 1.2rem;
  }

  .chart-container {
    width: 180px;
    height: 180px;
  }

  .chart-center {
    width: 90px;
    height: 90px;
  }

  .total-value {
    font-size: 1rem;
  }
}
</style> 