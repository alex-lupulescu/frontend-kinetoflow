<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="notification-type-badge" :style="{ backgroundColor: getTypeBackgroundColor(notification.type) }">
            <i :class="getTypeIcon(notification.type)" :style="{ color: getTypeColor(notification.type) }"></i>
            <span>{{ formatType(notification.type) }}</span>
          </div>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <h2 class="modal-title">{{ notification.title }}</h2>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Status Section -->
        <div class="info-section">
          <h3 class="section-title">Status</h3>
          <div class="status-info">
            <div class="status-item">
              <span class="status-label">Read Status:</span>
              <span class="status-badge" :class="{ 'read': notification.read, 'unread': !notification.read }">
                <i :class="notification.read ? 'fas fa-check-circle' : 'fas fa-circle'"></i>
                {{ notification.read ? 'Read' : 'Unread' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Created:</span>
              <span class="status-value">{{ formatFullDate(notification.createdAt) }}</span>
            </div>
            <div v-if="notification.updatedAt && notification.updatedAt !== notification.createdAt" class="status-item">
              <span class="status-label">Updated:</span>
              <span class="status-value">{{ formatFullDate(notification.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Message Section -->
        <div class="info-section">
          <h3 class="section-title">Message</h3>
          <div class="message-content">
            <p>{{ notification.message }}</p>
          </div>
        </div>

        <!-- Details Section -->
        <div v-if="supportsEventDetails(notification.type) && notification.relatedEntityId" class="info-section">
          <h3 class="section-title">Details</h3>
          
          <!-- Loading State -->
          <div v-if="isLoadingEventDetails" class="event-details-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading details...</span>
          </div>
          
          <!-- Error State -->
          <div v-else-if="eventDetailsError" class="event-details-error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ eventDetailsError }}</span>
            <button @click="fetchEventDetails" class="retry-btn">
              <i class="fas fa-redo"></i>
              Retry
            </button>
          </div>
          
          <!-- Details Content -->
          <div v-else-if="eventDetails" class="event-details-content">
            <div v-for="(value, key) in formatEventDetails(eventDetails)" :key="key" class="event-detail-item">
              <span class="event-detail-label">{{ key }}:</span>
              <span class="event-detail-value">{{ value }}</span>
            </div>
          </div>
          
          <!-- No Details Available -->
          <div v-else class="event-details-empty">
            <i class="fas fa-info-circle"></i>
            <span>No additional details available</span>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-actions">
          <button v-if="!notification.read" @click="markAsRead" class="action-btn primary-btn">
            <i class="fas fa-check"></i>
            Mark as Read
          </button>
          <button @click="deleteNotification" class="action-btn danger-btn">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import EventDetailsService from '@/services/EventDetailsService';

const props = defineProps({
  notification: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'mark-read', 'delete']);

// Reactive state for event details
const isLoadingEventDetails = ref(false);
const eventDetailsError = ref(null);
const eventDetails = ref(null);

// Watch for modal visibility changes to fetch event details
watch(() => props.isVisible, (newValue) => {
  if (newValue && supportsEventDetails(props.notification.type) && props.notification.relatedEntityId) {
    fetchEventDetails();
  } else {
    // Reset state when modal is closed
    eventDetails.value = null;
    eventDetailsError.value = null;
  }
});

// Methods
const closeModal = () => {
  emit('close');
};

const markAsRead = () => {
  emit('mark-read', props.notification.id);
};

const deleteNotification = () => {
  if (confirm('Are you sure you want to delete this notification?')) {
    emit('delete', props.notification.id);
    closeModal();
  }
};

// Utility functions
const getTypeIcon = (type) => {
  const iconMap = {
    'APPOINTMENT': 'fas fa-calendar-check',
    'PAYMENT': 'fas fa-credit-card',
    'PLAN_UPDATE': 'fas fa-file-medical',
    'SYSTEM': 'fas fa-cog',
    'INVITATION': 'fas fa-user-plus',
    'COMPANY': 'fas fa-building',
    'MEDIC_ASSIGNMENT': 'fas fa-user-md',
    'GENERAL': 'fas fa-info-circle'
  };
  return iconMap[type] || 'fas fa-bell';
};

const getTypeColor = (type) => {
  const colorMap = {
    'APPOINTMENT': '#0891f2',
    'PAYMENT': '#22c55e',
    'PLAN_UPDATE': '#3b82f6',
    'SYSTEM': '#737373',
    'INVITATION': '#f97316',
    'COMPANY': '#8b5cf6',
    'MEDIC_ASSIGNMENT': '#10b981',
    'GENERAL': '#0891f2'
  };
  return colorMap[type] || '#0891f2';
};

const getTypeBackgroundColor = (type) => {
  const colorMap = {
    'APPOINTMENT': '#f0f7ff',
    'PAYMENT': '#f0fdf4',
    'PLAN_UPDATE': '#eff6ff',
    'SYSTEM': '#f9fafb',
    'INVITATION': '#fff7ed',
    'COMPANY': '#faf5ff',
    'MEDIC_ASSIGNMENT': '#ecfdf5',
    'GENERAL': '#f0f7ff'
  };
  return colorMap[type] || '#f0f7ff';
};

const formatType = (type) => {
  const typeMap = {
    'APPOINTMENT': 'Appointment',
    'PAYMENT': 'Payment',
    'PLAN_UPDATE': 'Plan Update',
    'SYSTEM': 'System',
    'INVITATION': 'Invitation',
    'COMPANY': 'Company',
    'MEDIC_ASSIGNMENT': 'Medic Assignment',
    'GENERAL': 'General'
  };
  return typeMap[type] || type;
};

const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const supportsEventDetails = (type) => {
  return EventDetailsService.supportsEventDetails(type);
};

const fetchEventDetails = async () => {
  if (!props.notification.relatedEntityId) return;
  
  isLoadingEventDetails.value = true;
  eventDetailsError.value = null;
  eventDetails.value = null;

  try {
    const response = await EventDetailsService.getEventDetails(
      props.notification.type, 
      props.notification.relatedEntityId
    );
    eventDetails.value = response.data;
  } catch (error) {
    eventDetailsError.value = error.message || 'Failed to load event details';
  } finally {
    isLoadingEventDetails.value = false;
  }
};

const formatEventDetails = (details) => {
  if (!details) return {};
  
  const formatted = {};
  
  // Format based on notification type
  switch (props.notification.type) {
    case 'APPOINTMENT':
      if (details.scheduledStartTime) {
        const startDate = new Date(details.scheduledStartTime);
        formatted['Date'] = startDate.toLocaleDateString();
        formatted['Time'] = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (details.scheduledEndTime) {
        const endDate = new Date(details.scheduledEndTime);
        formatted['End Time'] = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (details.medicName) formatted['Doctor'] = details.medicName;
      if (details.serviceName) formatted['Service'] = details.serviceName;
      if (details.status) formatted['Status'] = details.status;
      if (details.notes) formatted['Notes'] = details.notes;
      break;
      
    case 'PAYMENT':
      if (details.amount) formatted['Amount'] = `$${details.amount}`;
      if (details.paymentDate) formatted['Date'] = new Date(details.paymentDate).toLocaleDateString();
      if (details.paymentMethod) formatted['Method'] = details.paymentMethod;
      if (details.status) formatted['Status'] = details.status;
      if (details.recordedByUserName) formatted['Recorded By'] = details.recordedByUserName;
      if (details.transactionId) formatted['Transaction ID'] = details.transactionId;
      if (details.notes) formatted['Notes'] = details.notes;
      break;
      
    case 'PLAN_UPDATE':
      if (details.planName) formatted['Plan Name'] = details.planName;
      if (details.planType) formatted['Plan Type'] = details.planType;
      if (details.assignmentDate) formatted['Assigned'] = new Date(details.assignmentDate).toLocaleDateString();
      if (details.expiryDate) formatted['Expires'] = new Date(details.expiryDate).toLocaleDateString();
      if (details.isActive !== undefined) formatted['Status'] = details.isActive ? 'Active' : 'Inactive';
      if (details.totalPlanCost) formatted['Total Cost'] = `$${details.totalPlanCost}`;
      if (details.paidAmount) formatted['Paid Amount'] = `$${details.paidAmount}`;
      if (details.dueAmount) formatted['Due Amount'] = `$${details.dueAmount}`;
      if (details.planPaymentStatus) formatted['Payment Status'] = details.planPaymentStatus.replace('_', ' ');
      if (details.notes) formatted['Notes'] = details.notes;
      break;
      
    case 'COMPANY':
      if (details.name) formatted['Company Name'] = details.name;
      if (details.address) formatted['Address'] = details.address;
      if (details.createdAt) formatted['Created'] = new Date(details.createdAt).toLocaleDateString();
      break;
      
    case 'MEDIC_ASSIGNMENT':
    case 'INVITATION':
      if (details.name) formatted['Name'] = details.name;
      if (details.email) formatted['Email'] = details.email;
      if (details.phoneNumber) formatted['Phone'] = details.phoneNumber;
      if (details.role) formatted['Role'] = details.role.replace('_', ' ');
      if (details.isActive !== undefined) formatted['Status'] = details.isActive ? 'Active' : 'Pending';
      if (details.assignedMedicName) formatted['Assigned Medic'] = details.assignedMedicName;
      break;
      
    default:
      // For other types, show all available fields
      Object.keys(details).forEach(key => {
        if (details[key] !== null && details[key] !== undefined) {
          // Format the key to be more readable
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          let value = details[key];
          
          // Format dates
          if (key.includes('Date') || key.includes('Time') || key.includes('At')) {
            try {
              value = new Date(value).toLocaleString();
            } catch (e) {
              // Keep original value if not a valid date
            }
          }
          
          // Format amounts
          if (key.includes('amount') || key.includes('Amount') || key.includes('cost') || key.includes('Cost')) {
            if (typeof value === 'number') {
              value = `$${value}`;
            }
          }
          
          formatted[formattedKey] = value;
        }
      });
  }
  
  return formatted;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal-container {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.notification-type-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border: 1px solid var(--border-light);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.modal-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

.info-section {
  margin-bottom: var(--space-6);
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary-500);
  padding-bottom: var(--space-2);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.status-label {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.status-badge.read {
  background: var(--secondary-50);
  color: var(--secondary-700);
}

.status-badge.unread {
  background: var(--primary-50);
  color: var(--primary-700);
}

.status-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.message-content {
  background: var(--bg-secondary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--primary-500);
}

.message-content p {
  margin: 0;
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

.related-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.related-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.related-label {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.related-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.detail-label {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.detail-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.priority-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority-badge.priority-high {
  background: var(--error);
  color: white;
}

.priority-badge.priority-medium {
  background: var(--warning);
  color: white;
}

.priority-badge.priority-low {
  background: var(--neutral-300);
  color: var(--neutral-700);
}

.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.footer-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.primary-btn {
  background: var(--primary-500);
  color: white;
}

.primary-btn:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.secondary-btn {
  background: var(--secondary-500);
  color: white;
}

.secondary-btn:hover {
  background: var(--secondary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.danger-btn {
  background: var(--error);
  color: white;
}

.danger-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Event Details Styles */
.event-details-loading,
.event-details-error,
.event-details-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
}

.event-details-loading i {
  color: var(--primary-500);
}

.event-details-error {
  color: var(--error);
  flex-direction: column;
  gap: var(--space-3);
}

.event-details-error i {
  color: var(--error);
}

.retry-btn {
  background: var(--error);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.retry-btn:hover {
  background: #dc2626;
}

.event-details-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.event-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--primary-500);
}

.event-detail-label {
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  min-width: 100px;
}

.event-detail-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  text-align: right;
  flex: 1;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-4);
  }

  .header-content {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
  }

  .notification-type-badge {
    justify-content: center;
  }

  .close-btn {
    align-self: flex-end;
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
  }

  .modal-title {
    font-size: var(--text-lg);
  }

  .status-item,
  .event-detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .event-detail-label {
    min-width: auto;
  }

  .event-detail-value {
    text-align: left;
  }

  .footer-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}

/* Focus states for accessibility */
.close-btn:focus,
.action-btn:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
</style> 