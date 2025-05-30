<template>
  <div class="approvals-page">
    <div class="page-header">
      <h1><i class="fas fa-tasks"></i> Approval Management</h1>
      <p>Review and manage vacation day and extra work day requests from your medics.</p>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        @click="activeTab = 'pending'" 
        :class="['tab-button', { active: activeTab === 'pending' }]"
      >
        <i class="fas fa-clock"></i> Pending 
        <span v-if="pendingCount > 0" class="count-badge">{{ pendingCount }}</span>
      </button>
      <button 
        @click="activeTab = 'approved'" 
        :class="['tab-button', { active: activeTab === 'approved' }]"
      >
        <i class="fas fa-check"></i> Approved
      </button>
      <button 
        @click="activeTab = 'rejected'" 
        :class="['tab-button', { active: activeTab === 'rejected' }]"
      >
        <i class="fas fa-times"></i> Rejected
      </button>
      <button 
        @click="activeTab = 'all'" 
        :class="['tab-button', { active: activeTab === 'all' }]"
      >
        <i class="fas fa-list"></i> All
      </button>
    </div>

    <!-- Request Type Toggle -->
    <div class="type-toggle">
      <button 
        @click="requestType = 'all'" 
        :class="['toggle-button', { active: requestType === 'all' }]"
      >
        <i class="fas fa-list"></i> All Types
      </button>
      <button 
        @click="requestType = 'vacation'" 
        :class="['toggle-button', { active: requestType === 'vacation' }]"
      >
        <i class="fas fa-umbrella-beach"></i> Vacation Days
      </button>
      <button 
        @click="requestType = 'extraWork'" 
        :class="['toggle-button', { active: requestType === 'extraWork' }]"
      >
        <i class="fas fa-plus-circle"></i> Extra Work Days
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading requests...
    </div>

    <!-- Content -->
    <div v-else class="requests-content">
      <!-- All Requests Combined -->
      <div v-if="requestType === 'all'" class="all-requests">
        <div v-if="!combinedRequests || combinedRequests.length === 0" class="no-data">
          <i class="fas fa-info-circle"></i> 
          No {{ activeTab === 'all' ? '' : activeTab }} requests found.
        </div>
        <div v-else class="requests-list">
          <div 
            v-for="request in combinedRequests" 
            :key="`${request.type}-${request.id}`"
            class="request-card"
            :class="[`${request.type}-request`]"
          >
            <div class="request-header">
              <div class="medic-info">
                <i class="fas fa-user-md"></i>
                <span class="medic-name">{{ getMedicName(request) }}</span>
                <span class="request-type-badge" :class="request.type">
                  <i :class="request.type === 'vacation' ? 'fas fa-umbrella-beach' : 'fas fa-plus-circle'"></i>
                  {{ request.type === 'vacation' ? 'Vacation' : 'Extra Work' }}
                </span>
              </div>
              <div class="request-status">
                <span 
                  :class="['status-badge', getStatusClass(request.approvalStatus)]"
                >
                  {{ formatStatus(request.approvalStatus) }}
                </span>
              </div>
            </div>
            
            <div class="request-details">
              <!-- Vacation Request Details -->
              <div v-if="request.type === 'vacation'" class="request-dates">
                <i class="fas fa-calendar-alt"></i>
                {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
                <span class="duration">({{ calculateVacationDuration(request) }} days)</span>
              </div>
              
              <!-- Extra Work Request Details -->
              <div v-else class="request-dates">
                <i class="fas fa-calendar-day"></i>
                {{ formatDate(request.workDate) }}
                <span class="work-time">
                  {{ formatTime(request.startTime) }} - {{ formatTime(request.endTime) }}
                </span>
                <span class="duration">({{ calculateWorkDuration(request) }} hours)</span>
              </div>
              
              <div v-if="request.type === 'extraWork'" class="work-type">
                <span class="type-badge">{{ formatWorkType(request.workType) }}</span>
              </div>
              
              <div v-if="request.reason" class="request-reason">
                <i class="fas fa-comment"></i> {{ request.reason }}
              </div>
              <div class="request-meta">
                <span class="created-date">
                  <i class="fas fa-clock"></i> Requested on {{ formatDate(request.createdAt) }}
                </span>
                <span v-if="request.approvalDate" class="approval-date">
                  <i class="fas fa-calendar-check"></i> 
                  {{ formatStatus(request.approvalStatus) }} on {{ formatDate(request.approvalDate) }}
                  by {{ request.approvedByName }}
                </span>
              </div>
              <div v-if="request.approvalStatus === 'REJECTED' && request.rejectionReason" class="rejection-reason">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Rejection Reason:</strong> {{ request.rejectionReason }}
              </div>
            </div>

            <div v-if="request.approvalStatus === 'PENDING'" class="request-actions">
              <button 
                @click="openApprovalModal(request, request.type, 'APPROVED')"
                class="btn btn-success"
                :disabled="processing"
              >
                <i class="fas fa-check"></i> Approve
              </button>
              <button 
                @click="openApprovalModal(request, request.type, 'REJECTED')"
                class="btn btn-danger"
                :disabled="processing"
              >
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vacation Requests -->
      <div v-if="requestType === 'vacation'" class="vacation-requests">
        <div v-if="!vacationRequests || vacationRequests.length === 0" class="no-data">
          <i class="fas fa-info-circle"></i> 
          No {{ activeTab === 'all' ? '' : activeTab }} vacation requests found.
        </div>
        <div v-else class="requests-list">
          <div 
            v-for="request in vacationRequests" 
            :key="request.id"
            class="request-card vacation-request"
          >
            <div class="request-header">
              <div class="medic-info">
                <i class="fas fa-user-md"></i>
                <span class="medic-name">{{ getMedicName(request) }}</span>
              </div>
              <div class="request-status">
                <span 
                  :class="['status-badge', getStatusClass(request.approvalStatus)]"
                >
                  {{ formatStatus(request.approvalStatus) }}
                </span>
              </div>
            </div>
            
            <div class="request-details">
              <div class="request-dates">
                <i class="fas fa-calendar-alt"></i>
                {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
                <span class="duration">({{ calculateVacationDuration(request) }} days)</span>
              </div>
              <div v-if="request.reason" class="request-reason">
                <i class="fas fa-comment"></i> {{ request.reason }}
              </div>
              <div class="request-meta">
                <span class="created-date">
                  <i class="fas fa-clock"></i> Requested on {{ formatDate(request.createdAt) }}
                </span>
                <span v-if="request.approvalDate" class="approval-date">
                  <i class="fas fa-calendar-check"></i> 
                  {{ formatStatus(request.approvalStatus) }} on {{ formatDate(request.approvalDate) }}
                  by {{ request.approvedByName }}
                </span>
              </div>
              <div v-if="request.approvalStatus === 'REJECTED' && request.rejectionReason" class="rejection-reason">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Rejection Reason:</strong> {{ request.rejectionReason }}
              </div>
            </div>

            <div v-if="request.approvalStatus === 'PENDING'" class="request-actions">
              <button 
                @click="openApprovalModal(request, 'vacation', 'APPROVED')"
                class="btn btn-success"
                :disabled="processing"
              >
                <i class="fas fa-check"></i> Approve
              </button>
              <button 
                @click="openApprovalModal(request, 'vacation', 'REJECTED')"
                class="btn btn-danger"
                :disabled="processing"
              >
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Extra Work Requests -->
      <div v-if="requestType === 'extraWork'" class="extra-work-requests">
        <div v-if="!extraWorkRequests || extraWorkRequests.length === 0" class="no-data">
          <i class="fas fa-info-circle"></i> 
          No {{ activeTab === 'all' ? '' : activeTab }} extra work requests found.
        </div>
        <div v-else class="requests-list">
          <div 
            v-for="request in extraWorkRequests" 
            :key="request.id"
            class="request-card extra-work-request"
          >
            <div class="request-header">
              <div class="medic-info">
                <i class="fas fa-user-md"></i>
                <span class="medic-name">{{ getMedicName(request) }}</span>
              </div>
              <div class="request-status">
                <span 
                  :class="['status-badge', getStatusClass(request.approvalStatus)]"
                >
                  {{ formatStatus(request.approvalStatus) }}
                </span>
              </div>
            </div>
            
            <div class="request-details">
              <div class="request-dates">
                <i class="fas fa-calendar-day"></i>
                {{ formatDate(request.workDate) }}
                <span class="work-time">
                  {{ formatTime(request.startTime) }} - {{ formatTime(request.endTime) }}
                </span>
                <span class="duration">({{ calculateWorkDuration(request) }} hours)</span>
              </div>
              <div class="work-type">
                <span class="type-badge">{{ formatWorkType(request.workType) }}</span>
              </div>
              <div v-if="request.reason" class="request-reason">
                <i class="fas fa-comment"></i> {{ request.reason }}
              </div>
              <div class="request-meta">
                <span class="created-date">
                  <i class="fas fa-clock"></i> Requested on {{ formatDate(request.createdAt) }}
                </span>
                <span v-if="request.approvalDate" class="approval-date">
                  <i class="fas fa-calendar-check"></i> 
                  {{ formatStatus(request.approvalStatus) }} on {{ formatDate(request.approvalDate) }}
                  by {{ request.approvedByName }}
                </span>
              </div>
              <div v-if="request.approvalStatus === 'REJECTED' && request.rejectionReason" class="rejection-reason">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Rejection Reason:</strong> {{ request.rejectionReason }}
              </div>
            </div>

            <div v-if="request.approvalStatus === 'PENDING'" class="request-actions">
              <button 
                @click="openApprovalModal(request, 'extraWork', 'APPROVED')"
                class="btn btn-success"
                :disabled="processing"
              >
                <i class="fas fa-check"></i> Approve
              </button>
              <button 
                @click="openApprovalModal(request, 'extraWork', 'REJECTED')"
                class="btn btn-danger"
                :disabled="processing"
              >
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Modal -->
    <div v-if="showApprovalModal" class="modal-overlay" @click.self="closeApprovalModal">
      <div class="modal-content approval-modal-content">
        <button @click="closeApprovalModal" class="modal-close-button" title="Close">
          ×
        </button>
        
        <h3>
          <i :class="approvalAction === 'APPROVED' ? 'fas fa-check text-success' : 'fas fa-times text-danger'"></i>
          {{ approvalAction === 'APPROVED' ? 'Approve' : 'Reject' }} Request
        </h3>
        
        <div v-if="selectedRequest" class="request-summary">
          <p><strong>Medic:</strong> {{ getMedicName(selectedRequest) }}</p>
          <p v-if="selectedRequestType === 'vacation'">
            <strong>Vacation:</strong> {{ formatDate(selectedRequest.startDate) }} - {{ formatDate(selectedRequest.endDate) }}
          </p>
          <p v-else>
            <strong>Extra Work:</strong> {{ formatDate(selectedRequest.workDate) }} 
            ({{ formatTime(selectedRequest.startTime) }} - {{ formatTime(selectedRequest.endTime) }})
          </p>
        </div>

        <form @submit.prevent="processApproval" class="approval-form">
          <div v-if="approvalAction === 'REJECTED'" class="form-group">
            <label for="rejectionReason" class="form-label">Rejection Reason *</label>
            <textarea
              id="rejectionReason"
              v-model="rejectionReason"
              class="form-control"
              rows="3"
              placeholder="Please provide a reason for rejection..."
              required
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeApprovalModal" class="btn btn-secondary" :disabled="processing">
              Cancel
            </button>
            <button 
              type="submit" 
              :class="['btn', approvalAction === 'APPROVED' ? 'btn-success' : 'btn-danger']"
              :disabled="processing || (approvalAction === 'REJECTED' && !rejectionReason?.trim())"
            >
              <span v-if="processing">
                <i class="fas fa-spinner fa-spin"></i> Processing...
              </span>
              <span v-else>
                <i :class="approvalAction === 'APPROVED' ? 'fas fa-check' : 'fas fa-times'"></i>
                {{ approvalAction === 'APPROVED' ? 'Approve' : 'Reject' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import CompanyAdminService from '@/services/CompanyAdminService';
import { useToast } from 'vue-toastification';

const toast = useToast();

// State
const loading = ref(true);
const processing = ref(false);
const activeTab = ref('pending');
const requestType = ref('all');
const vacationRequests = ref([]);
const extraWorkRequests = ref([]);

// Approval Modal State
const showApprovalModal = ref(false);
const selectedRequest = ref(null);
const selectedRequestType = ref(null);
const approvalAction = ref(null);
const rejectionReason = ref('');

// Computed
const pendingCount = computed(() => {
  const vacationPending = vacationRequests.value.filter(r => r.approvalStatus === 'PENDING').length;
  const extraWorkPending = extraWorkRequests.value.filter(r => r.approvalStatus === 'PENDING').length;
  return vacationPending + extraWorkPending;
});

const combinedRequests = computed(() => {
  const vacation = vacationRequests.value.map(req => ({ ...req, type: 'vacation' }));
  const extraWork = extraWorkRequests.value.map(req => ({ ...req, type: 'extraWork' }));
  
  // Combine and sort by creation date (newest first)
  return [...vacation, ...extraWork].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
});

// Watchers
watch([activeTab, requestType], () => {
  loadRequests();
});

// Methods
async function loadRequests() {
  try {
    loading.value = true;
    
    if (requestType.value === 'all') {
      // Load both vacation and extra work requests
      const vacationPromise = activeTab.value === 'pending' 
        ? CompanyAdminService.getPendingVacationRequests()
        : activeTab.value === 'all'
        ? CompanyAdminService.getVacationRequestsByStatus()
        : CompanyAdminService.getVacationRequestsByStatus(activeTab.value.toUpperCase());
        
      const extraWorkPromise = activeTab.value === 'pending'
        ? CompanyAdminService.getPendingExtraWorkRequests()
        : activeTab.value === 'all'
        ? CompanyAdminService.getExtraWorkRequestsByStatus()
        : CompanyAdminService.getExtraWorkRequestsByStatus(activeTab.value.toUpperCase());
        
      const [vacationData, extraWorkData] = await Promise.all([vacationPromise, extraWorkPromise]);
      vacationRequests.value = vacationData;
      extraWorkRequests.value = extraWorkData;
      
    } else if (requestType.value === 'vacation') {
      if (activeTab.value === 'pending') {
        vacationRequests.value = await CompanyAdminService.getPendingVacationRequests();
      } else if (activeTab.value === 'all') {
        vacationRequests.value = await CompanyAdminService.getVacationRequestsByStatus();
      } else {
        vacationRequests.value = await CompanyAdminService.getVacationRequestsByStatus(activeTab.value.toUpperCase());
      }
      extraWorkRequests.value = []; // Clear extra work when showing only vacation
    } else {
      if (activeTab.value === 'pending') {
        extraWorkRequests.value = await CompanyAdminService.getPendingExtraWorkRequests();
      } else if (activeTab.value === 'all') {
        extraWorkRequests.value = await CompanyAdminService.getExtraWorkRequestsByStatus();
      } else {
        extraWorkRequests.value = await CompanyAdminService.getExtraWorkRequestsByStatus(activeTab.value.toUpperCase());
      }
      vacationRequests.value = []; // Clear vacation when showing only extra work
    }
  } catch (error) {
    console.error('Error loading requests:', error);
    toast.error('Failed to load requests');
  } finally {
    loading.value = false;
  }
}

function openApprovalModal(request, type, action) {
  selectedRequest.value = request;
  selectedRequestType.value = type;
  approvalAction.value = action;
  rejectionReason.value = '';
  showApprovalModal.value = true;
}

function closeApprovalModal() {
  showApprovalModal.value = false;
  selectedRequest.value = null;
  selectedRequestType.value = null;
  approvalAction.value = null;
  rejectionReason.value = '';
}

async function processApproval() {
  try {
    processing.value = true;
    
    const approvalData = {
      approvalStatus: approvalAction.value,
      rejectionReason: approvalAction.value === 'REJECTED' ? rejectionReason.value.trim() : null
    };

    if (selectedRequestType.value === 'vacation') {
      await CompanyAdminService.processVacationApproval(selectedRequest.value.id, approvalData);
    } else {
      await CompanyAdminService.processExtraWorkApproval(selectedRequest.value.id, approvalData);
    }

    toast.success(`Request ${approvalAction.value.toLowerCase()} successfully`);
    closeApprovalModal();
    await loadRequests();
    
  } catch (error) {
    console.error('Error processing approval:', error);
    toast.error(error.response?.data?.message || 'Failed to process approval');
  } finally {
    processing.value = false;
  }
}

// Utility Functions
function getMedicName(request) {
  // Use the medicName field from the DTO
  return request.medicName || 'Unknown Medic';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Europe/Bucharest'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
  if (!timeString) return '';
  return timeString.substring(0, 5); // HH:MM
}

function formatStatus(status) {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getStatusClass(status) {
  switch (status) {
    case 'PENDING': return 'pending';
    case 'APPROVED': return 'approved';
    case 'REJECTED': return 'rejected';
    default: return '';
  }
}

function formatWorkType(workType) {
  if (!workType) return '';
  return workType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function calculateVacationDuration(request) {
  if (!request.startDate || !request.endDate) return 0;
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function calculateWorkDuration(request) {
  if (!request.startTime || !request.endTime) return 0;
  const start = new Date(`2000-01-01T${request.startTime}`);
  const end = new Date(`2000-01-01T${request.endTime}`);
  const diffMs = end - start;
  return (diffMs / (1000 * 60 * 60)).toFixed(1);
}

// Lifecycle
onMounted(() => {
  loadRequests();
});
</script>

<style scoped>
.approvals-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.tab-button:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.tab-button.active {
  background-color: #007bff;
  color: white;
}

.count-badge {
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 1.5rem;
  text-align: center;
}

.type-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.toggle-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #dee2e6;
  background: white;
  color: #6c757d;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-button:hover {
  border-color: #007bff;
  color: #007bff;
}

.toggle-button.active {
  border-color: #007bff;
  background-color: #007bff;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
}

.request-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.medic-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.medic-name {
  font-weight: 600;
  color: #2c3e50;
}

.request-type-badge {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.request-type-badge.vacation {
  background-color: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

.request-type-badge.extraWork {
  background-color: #e8f5e8;
  border-color: #4caf50;
  color: #388e3c;
}

.request-status .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: #ffc107;
  color: white;
}

.status-badge.approved {
  background-color: #28a745;
  color: white;
}

.status-badge.rejected {
  background-color: #dc3545;
  color: white;
}

.request-details {
  margin-bottom: 1rem;
}

.request-dates {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.duration, .work-time {
  color: #6c757d;
  font-weight: normal;
}

.type-badge {
  background-color: #17a2b8;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.request-reason {
  color: #6c757d;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.request-meta {
  font-size: 0.9rem;
  color: #6c757d;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rejection-reason {
  color: #dc3545;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  position: relative;
  width: 90%;
  max-width: 500px;
}

.modal-close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.8rem;
  font-size: 2rem;
  font-weight: bold;
  color: #aaa;
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  padding: 0.2rem 0.5rem;
}

.modal-close-button:hover {
  color: #777;
}

.request-summary {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.approval-form .form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #1e7e34;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #bd2130;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

@media (max-width: 768px) {
  .approvals-page {
    padding: 1rem;
  }
  
  .filter-tabs, .type-toggle {
    flex-direction: column;
  }
  
  .request-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .request-actions {
    justify-content: stretch;
  }
  
  .request-actions .btn {
    flex: 1;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style> 