// src/views/medic/MedicMyPatients.vue (Complete File)

<template>
  <div class="page-container">
    <div class="page-header">
        <h1>My Patients</h1>
        <!-- Invite Patient Button -->
        <button @click="openInvitePatientModal" class="btn btn-primary">
            <i class="fas fa-user-plus"></i> Invite New Patient
        </button>
    </div>
    <!-- Removed redundant <p> tag here -->

    <!-- Active Patients List -->
    <section class="card list-section">
        <h2>My Patients</h2>
        <p>List of all patients (active and inactive) currently assigned to you.</p>

        <!-- Search Bar for Assigned Patients -->
        <div class="list-controls">
            <input type="text" v-model="assignedPatientsSearchTerm" placeholder="Search by name, email, phone..." class="form-control search-input">
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoadingAssignedPatients" class="loading-indicator">
             <i class="fas fa-spinner fa-spin"></i> Loading patients...
        </div>
        <!-- Loading Error Message -->
        <div v-if="loadAssignedPatientsError" class="error-message table-error">
            <i class="fas fa-exclamation-triangle"></i> {{ loadAssignedPatientsError }}
        </div>

        <!-- Patient List Table: Show only if NOT loading AND there ARE patients -->
        <table v-if="!isLoadingAssignedPatients && filteredAndPaginatedAssignedPatients.length > 0" class="data-table patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredAndPaginatedAssignedPatients" :key="'assigned-'+patient.id" :class="{ 'inactive-row': !patient.isActive }">
                <td>{{ patient.id }}</td>
                <td>{{ patient.name }}</td>
                <td>{{ patient.email || 'N/A' }}</td>
                <td>{{ patient.phoneNumber || 'N/A' }}</td>
                <td>
                    <span :class="patient.isActive ? 'status-active' : 'status-inactive'">
                        {{ patient.isActive ? 'Active' : 'Inactive' }}
                    </span>
                </td>
                <td>
                   <!-- View Plan Button -->
                   <button @click="viewPatientPlan(patient.id)" class="btn btn-info btn-sm" title="View Plan Details">
                      <i class="fas fa-eye"></i> Plan
                   </button>
                   <!-- Payments Button -->
                   <button @click="viewPatientPayments(patient.id)" class="btn btn-success btn-sm" title="View Payments & Plan Financials">
                      <i class="fas fa-credit-card"></i> Payments
                   </button>
                   <!-- Assign Plan Button -->
                   <button @click="openAssignPlanModal(patient)" class="btn btn-primary btn-sm" title="Assign New Plan/Package">
                      <i class="fas fa-plus-circle"></i> Assign Plan
                   </button>
                   <!-- History Button -->
                   <button @click="openPatientHistoryModal(patient)" class="btn btn-info btn-sm" title="View Appointment History & Remaining Sessions">
                      <i class="fas fa-history"></i> History
                   </button>
                   <!-- Edit Patient Button -->
                   <button @click="openEditPatientModal(patient)" class="btn btn-warning btn-sm" title="Edit Patient Details">
                       <i class="fas fa-edit"></i> Edit
                   </button>
                  <!-- Schedule Button (Future) -->
                  <button @click="scheduleAppointment(patient.id)" class="btn btn-secondary btn-sm" title="Schedule Appointment">
                     <i class="fas fa-calendar-plus"></i> Schedule
                  </button>
                </td>
              </tr>
            </tbody>
        </table>

        <!-- Pagination for Assigned Patients -->
        <div v-if="!isLoadingAssignedPatients && allAssignedPatients.length > 0 && totalAssignedPatientPages > 1" class="pagination-controls">
            <button @click="goToAssignedPatientsPage(assignedPatientsCurrentPage - 1)" :disabled="assignedPatientsCurrentPage === 1" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-chevron-left"></i> Prev
            </button>
            <span>Page {{ assignedPatientsCurrentPage }} of {{ totalAssignedPatientPages }}</span>
            <button @click="goToAssignedPatientsPage(assignedPatientsCurrentPage + 1)" :disabled="assignedPatientsCurrentPage === totalAssignedPatientPages" class="btn btn-sm btn-outline-secondary">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>

        <!-- No Data Message: Show only if NOT loading, NO error, AND NO patients after filtering/initial load -->
        <p v-if="!isLoadingAssignedPatients && !loadAssignedPatientsError && allAssignedPatients.length === 0" class="no-data-message">
             You currently have no patients assigned.
        </p>
        <p v-if="!isLoadingAssignedPatients && !loadAssignedPatientsError && allAssignedPatients.length > 0 && filteredAndPaginatedAssignedPatients.length === 0" class="no-data-message">
            No patients found matching your search criteria.
        </p>
    </section>

    <!-- Pending Invitations List -->
     <section class="card list-section">
        <h2>Pending Invitations</h2>
        <p>Patients you have invited who haven't activated their account yet.</p>

        <!-- Search Bar for Pending Invites -->
        <div class="list-controls">
            <input type="text" v-model="pendingInvitesSearchTerm" placeholder="Search by name, email, phone..." class="form-control search-input">
        </div>

         <!-- Loading Indicator -->
         <div v-if="isLoadingPending" class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Loading pending invites...
         </div>
          <!-- Loading Error Message -->
         <div v-if="loadPendingError" class="error-message table-error">
            <i class="fas fa-exclamation-triangle"></i> {{ loadPendingError }}
         </div>
         <!-- Pending Invites Table: Show if not loading AND there are invites -->
         <table v-if="!isLoadingPending && filteredAndPaginatedPendingInvites.length > 0" class="data-table pending-table">
             <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Invited On (Approx)</th>
                    <th>Actions</th>
                </tr>
             </thead>
             <tbody>
               <tr v-for="invitee in filteredAndPaginatedPendingInvites" :key="'pending-'+invitee.id">
                 <td>{{ invitee.name }}</td>
                 <td>{{ invitee.email || 'N/A' }}</td>
                 <td>{{ invitee.phoneNumber || 'N/A' }}</td>
                 <td>{{ formatDate(invitee.updatedAt) }}</td>
                 <td>
                   <!-- Resend Button -->
                   <button @click="handleResendInvite(invitee)" class="btn btn-success btn-sm" title="Resend Invitation" :disabled="isResending[invitee.id] || isCancelling[invitee.id]">
                      <span v-if="isResending[invitee.id]"><i class="fas fa-spinner fa-spin"></i></span>
                      <span v-else><i class="fas fa-paper-plane"></i> Resend</span>
                   </button>
                    <!-- Cancel Button -->
                   <button @click="handleCancelInvite(invitee)" class="btn btn-danger btn-sm" title="Cancel Invitation" :disabled="isResending[invitee.id] || isCancelling[invitee.id]">
                       <span v-if="isCancelling[invitee.id]"><i class="fas fa-spinner fa-spin"></i></span>
                       <span v-else><i class="fas fa-user-times"></i> Cancel</span>
                   </button>
                 </td>
               </tr>
             </tbody>
           </table>

            <!-- Pagination for Pending Invites -->
            <div v-if="!isLoadingPending && allPendingInvites.length > 0 && totalPendingInvitePages > 1" class="pagination-controls">
                <button @click="goToPendingInvitesPage(pendingInvitesCurrentPage - 1)" :disabled="pendingInvitesCurrentPage === 1" class="btn btn-sm btn-outline-secondary">
                    <i class="fas fa-chevron-left"></i> Prev
                </button>
                <span>Page {{ pendingInvitesCurrentPage }} of {{ totalPendingInvitePages }}</span>
                <button @click="goToPendingInvitesPage(pendingInvitesCurrentPage + 1)" :disabled="pendingInvitesCurrentPage === totalPendingInvitePages" class="btn btn-sm btn-outline-secondary">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>

            <!-- No Pending Message: Show if not loading, no error, AND NO pending invites after filtering/initial load -->
            <p v-if="!isLoadingPending && !loadPendingError && allPendingInvites.length === 0" class="no-data-message">
                No pending patient invitations found.
            </p>
            <p v-if="!isLoadingPending && !loadPendingError && allPendingInvites.length > 0 && filteredAndPaginatedPendingInvites.length === 0" class="no-data-message">
                No pending invitations found matching your search criteria.
            </p>
      </section>


    <!-- Edit Patient Modal -->
    <div v-if="showEditPatientModal" class="modal-overlay" @click.self="closeEditPatientModal">
        <div class="modal-content edit-patient-modal-content">
            <button @click="closeEditPatientModal" class="modal-close-button" title="Close">×</button>
            <h2>Edit Patient Details</h2>
            <p v-if="patientToEditData">Editing details for: <strong>{{ patientToEditData.name }}</strong></p>
            
            <form @submit.prevent="handleEditPatientSave" class="modal-form">
                <div class="form-group">
                    <label for="editPatientName" class="form-label">Name *</label>
                    <input type="text" id="editPatientName" v-model="editPatientForm.name" required class="form-control" :disabled="isUpdatingPatient">
                </div>
                <div class="form-group">
                    <label for="editPatientEmail" class="form-label">Email</label>
                    <input type="email" id="editPatientEmail" v-model="editPatientForm.email" class="form-control" :disabled="isUpdatingPatient">
                </div>
                <div class="form-group">
                    <label for="editPatientPhone" class="form-label">Phone</label>
                    <input type="tel" id="editPatientPhone" v-model="editPatientForm.phone" class="form-control" :disabled="isUpdatingPatient">
                </div>
                
                <div v-if="editPatientError" class="error-message modal-error">{{ editPatientError }}</div>
                
                <div class="modal-actions">
                    <button type="button" @click="closeEditPatientModal" class="btn btn-cancel" :disabled="isUpdatingPatient">Cancel</button>
                    <button type="submit" class="btn btn-primary" :disabled="isUpdatingPatient">
                        <span v-if="isUpdatingPatient"><i class="fas fa-spinner fa-spin"></i> Updating...</span>
                        <span v-else>Update Patient</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Patient History Modal -->
    <div v-if="showPatientHistoryModal" class="modal-overlay" @click.self="closePatientHistoryModal">
        <div class="modal-content patient-history-modal-content">
            <button @click="closePatientHistoryModal" class="modal-close-button" title="Close">×</button>
            <h2>
                <i class="fas fa-history"></i> 
                Appointment History
            </h2>
            <p v-if="selectedPatientForHistory">
                Patient: <strong>{{ selectedPatientForHistory.name }}</strong>
                <span v-if="selectedPatientForHistory.email"> ({{ selectedPatientForHistory.email }})</span>
            </p>
            
            <!-- Loading State -->
            <div v-if="isLoadingPatientHistory" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i> Loading appointment history...
            </div>
            
            <!-- Error State -->
            <div v-if="patientHistoryError && !isLoadingPatientHistory" class="error-message">
                <i class="fas fa-exclamation-triangle"></i> {{ patientHistoryError }}
                <button @click="fetchPatientHistory(selectedPatientForHistory.id)" class="btn btn-sm btn-secondary retry-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
            
            <!-- History Content -->
            <div v-if="patientHistoryData && !isLoadingPatientHistory" class="history-content">
                <!-- Statistics Summary -->
                <div class="history-stats">
                    <h3><i class="fas fa-chart-bar"></i> Summary</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-number">{{ patientHistoryData.totalAppointments || 0 }}</span>
                            <span class="stat-label">Total Appointments</span>
                        </div>
                        <div class="stat-item completed">
                            <span class="stat-number">{{ patientHistoryData.completedAppointments || 0 }}</span>
                            <span class="stat-label">Completed</span>
                        </div>
                        <div class="stat-item scheduled">
                            <span class="stat-number">{{ patientHistoryData.scheduledAppointments || 0 }}</span>
                            <span class="stat-label">Scheduled</span>
                        </div>
                        <div class="stat-item cancelled">
                            <span class="stat-number">{{ patientHistoryData.cancelledAppointments || 0 }}</span>
                            <span class="stat-label">Cancelled</span>
                        </div>
                    </div>
                </div>
                
                <!-- Service Sessions Summary -->
                <div v-if="patientHistoryData.serviceSummaries && patientHistoryData.serviceSummaries.length > 0" class="service-summaries">
                    <h3><i class="fas fa-chart-line"></i> Sessions by Service</h3>
                    <div class="service-cards-grid">
                        <div v-for="service in patientHistoryData.serviceSummaries" :key="service.serviceId" class="service-card">
                            <!-- Service Card Header -->
                            <div class="service-card-header">
                                <div class="service-title-section">
                                    <h4 class="service-title">{{ service.serviceName }}</h4>
                                    <div class="progress-indicator">
                                        <div class="progress-bar" :style="{ width: getProgressPercentage(service) + '%' }"></div>
                                    </div>
                                </div>
                                <div class="remaining-counter" :class="{ 'zero-remaining': service.remainingSessions === 0 }">
                                    <span class="remaining-number">{{ service.remainingSessions || 0 }}</span>
                                    <span class="remaining-text">left</span>
                                </div>
                            </div>

                            <!-- Service Statistics Grid -->
                            <div class="service-stats-grid">
                                <div class="stat-card total">
                                    <div class="stat-icon">
                                        <i class="fas fa-clipboard-list"></i>
                                    </div>
                                    <div class="stat-content">
                                        <span class="stat-number">{{ service.totalSessionsFromPlans || 0 }}</span>
                                        <span class="stat-label">Total Planned</span>
                                    </div>
                                </div>

                                <div class="stat-card completed">
                                    <div class="stat-icon">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <div class="stat-content">
                                        <span class="stat-number">{{ service.completedSessions || 0 }}</span>
                                        <span class="stat-label">Completed</span>
                                    </div>
                                </div>

                                <div class="stat-card scheduled">
                                    <div class="stat-icon">
                                        <i class="fas fa-calendar-check"></i>
                                    </div>
                                    <div class="stat-content">
                                        <span class="stat-number">{{ service.scheduledSessions || 0 }}</span>
                                        <span class="stat-label">Scheduled</span>
                                    </div>
                                </div>

                                <div class="stat-card cancelled">
                                    <div class="stat-icon">
                                        <i class="fas fa-times-circle"></i>
                                    </div>
                                    <div class="stat-content">
                                        <span class="stat-number">{{ service.cancelledSessions || 0 }}</span>
                                        <span class="stat-label">Cancelled</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Service Timeline -->
                            <div v-if="service.lastAppointmentDate || service.nextAppointmentDate" class="service-timeline">
                                <div v-if="service.lastAppointmentDate" class="timeline-item past">
                                    <i class="fas fa-history"></i>
                                    <div class="timeline-content">
                                        <span class="timeline-label">Last Session</span>
                                        <span class="timeline-date">{{ formatDate(service.lastAppointmentDate) }}</span>
                                    </div>
                                </div>
                                <div v-if="service.nextAppointmentDate" class="timeline-item future">
                                    <i class="fas fa-arrow-right"></i>
                                    <div class="timeline-content">
                                        <span class="timeline-label">Next Session</span>
                                        <span class="timeline-date">{{ formatDate(service.nextAppointmentDate) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Appointments -->
                <div v-if="patientHistoryData.recentAppointments && patientHistoryData.recentAppointments.length > 0" class="recent-appointments">
                    <h3><i class="fas fa-clock"></i> Recent Appointments</h3>
                    <div class="appointments-list">
                        <div v-for="appointment in patientHistoryData.recentAppointments" :key="appointment.appointmentId" class="appointment-item">
                            <div class="appointment-header">
                                <span class="appointment-service">{{ appointment.serviceName }}</span>
                                <span class="appointment-status" :class="appointment.status.toLowerCase()">
                                    {{ formatStatus(appointment.status) }}
                                </span>
                            </div>
                            <div class="appointment-details">
                                <div class="appointment-time">
                                    <i class="fas fa-calendar"></i>
                                    {{ formatDateTime(appointment.scheduledStartTime) }}
                                </div>
                                <div class="appointment-plan">
                                    <i class="fas fa-file-medical"></i>
                                    {{ appointment.planName }}
                                    <span v-if="!appointment.isFromPlan" class="auto-created">(Auto-created)</span>
                                </div>
                                <div v-if="appointment.notes" class="appointment-notes">
                                    <i class="fas fa-sticky-note"></i>
                                    {{ appointment.notes }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Empty State -->
                <div v-if="patientHistoryData.totalAppointments === 0" class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Appointments Yet</h3>
                    <p>This patient hasn't had any appointments scheduled.</p>
                </div>
            </div>
            
            <div class="modal-actions">
                <button @click="closePatientHistoryModal" class="btn btn-secondary">Close</button>
            </div>
        </div>
    </div>

    <!-- Assign Plan Modal -->
    <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
        <div class="modal-content assign-modal-content">
            <button @click="closeAssignModal" class="modal-close-button" title="Close">×</button>
            <div class="modal-header">
                <h2><i class="fas fa-user-plus"></i> Assign Plan to {{ patientToAssign?.name }}</h2>
                <p class="modal-subtitle">Create a personalized treatment plan with services and packages</p>
            </div>
            <form @submit.prevent="handleAssignPlan" class="modal-form">

                 <!-- Assignment Type Selection -->
                 <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-layer-group"></i> Assignment Type
                    </label>
                    <div class="assignment-buttons">
                        <button 
                            type="button" 
                            class="assignment-btn" 
                            :class="{ active: assignmentType === 'package' }"
                            @click="assignmentType = 'package'"
                            :disabled="isAssigning"
                        >
                            <i class="fas fa-box-open"></i>
                            Assign Package
                        </button>
                        <button 
                            type="button" 
                            class="assignment-btn" 
                            :class="{ active: assignmentType === 'custom' }"
                            @click="assignmentType = 'custom'"
                            :disabled="isAssigning"
                        >
                            <i class="fas fa-bars"></i>
                            Custom Services
                        </button>
                    </div>
                 </div>

                 <!-- Package Selection -->
                <div v-if="assignmentType === 'package'" class="form-group">
                    <label class="form-label">
                        <i class="fas fa-box-open"></i> Select Package *
                    </label>
                     <div v-if="isLoadingPackages" class="loading-inline small">
                         <i class="fas fa-spinner fa-spin"></i> Loading packages...
                     </div>
                     <div v-if="loadPackagesError" class="error-message small">{{ loadPackagesError }}</div>
                    
                    <SearchableDropdown
                      v-model="selectedPackageId"
                      :options="formattedPackageOptions"
                      :disabled="isAssigning || isLoadingPackages"
                      :loading="isLoadingPackages"
                      placeholder="Select an active package..."
                      search-placeholder="Search packages by name..."
                      loading-text="Loading available packages..."
                      no-options-text="No active packages found"
                      icon="fas fa-box-open"
                      label-key="name"
                      value-key="id"
                      subtext-key="description" 
                      meta-key="price"
                      :required="assignmentType === 'package'"
                      :error-message="assignmentType === 'package' && !selectedPackageId ? 'Please select a package' : ''"
                    />
                    
                    <!-- Package Details Preview -->
                    <div v-if="selectedPackageId && !isLoadingPackages && selectedPackageDetails" class="package-preview">
                        <div class="preview-header">
                            <i class="fas fa-info-circle"></i>
                            <span>Package Details</span>
                        </div>
                        <div class="preview-content">
                            <div class="package-basic-info">
                                <div class="package-title">
                                    <strong>{{ selectedPackageDetails.name }}</strong>
                                    <span class="preview-price">{{ formatCurrency(selectedPackageDetails.totalPrice) }}</span>
                                </div>
                                <p class="preview-description">{{ selectedPackageDetails.description }}</p>
                            </div>
                            
                            <!-- Included Services -->
                            <div v-if="selectedPackageDetails.items && selectedPackageDetails.items.length > 0" class="package-services">
                                <div class="services-header">
                                    <i class="fas fa-list"></i>
                                    <span>Included Services</span>
                                </div>
                                <div class="services-list">
                                    <div v-for="item in selectedPackageDetails.items" :key="item.itemId || item.serviceId" class="service-item">
                                        <div class="service-info">
                                            <span class="service-name">{{ item.serviceName }}</span>
                                            <span class="service-quantity">× {{ item.quantity }}</span>
                                        </div>
                                        <div v-if="item.serviceDurationMinutes" class="service-meta">
                                            {{ item.serviceDurationMinutes }} min
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Custom Service Selection -->
                <div v-if="assignmentType === 'custom'" class="form-group service-items-group">
                   <label class="form-label">
                       <i class="fas fa-tools"></i> Select Services & Quantities *
                   </label>
                    <div v-if="isLoadingServices" class="loading-inline small">
                        <i class="fas fa-spinner fa-spin"></i> Loading services...
                    </div>
                    <div v-if="loadServicesError" class="error-message small">{{ loadServicesError }}</div>
                    <div v-if="!isLoadingServices && availableServices.length === 0" class="text-muted small mt-1">
                        <i class="fas fa-exclamation-triangle"></i> No active services available.
                    </div>
                    <div v-if="!isLoadingServices && availableServices.length > 0">
                        <!-- Service Items Header -->
                        <div class="service-items-header">
                            <span class="header-service">Service</span>
                            <span class="header-quantity">Quantity</span>
                            <span class="header-actions"></span>
                        </div>
                        
                        <div v-for="(item, index) in customServiceItems" :key="item.formKey" class="service-item-row">
                           
                           <SearchableDropdown
                             v-model="item.serviceId"
                             :options="formattedServiceOptions"
                             :disabled="isAssigning"
                             placeholder="Select Service..."
                             search-placeholder="Search services by name..."
                             no-options-text="No services available"
                             icon="fas fa-tools"
                             label-key="name"
                             value-key="id"
                             subtext-key="description"
                             meta-key="duration"
                             class="service-dropdown"
                             :required="true"
                           />
                           
                           <div class="quantity-input-group">
                               <input type="number" v-model.number="item.quantity" min="1" required placeholder="1" class="item-quantity form-control" :disabled="isAssigning">
                           </div>
                           <button type="button" @click="removeCustomItem(index)" class="btn btn-danger btn-sm btn-remove" title="Remove Item" :disabled="isAssigning"> 
                               <i class="fas fa-trash"></i> 
                           </button>
                        </div>
                        
                        <!-- Service Total Preview -->
                        <div v-if="customServiceItems.length > 0" class="services-total-preview">
                            <div class="total-header">
                                <i class="fas fa-calculator"></i>
                                <span>Services Summary</span>
                            </div>
                            <div class="total-content">
                                <div v-for="(item, index) in customServiceItems" :key="`preview-${index}`" class="service-summary-item">
                                    <div v-if="item.serviceId">
                                        <span class="service-name">
                                            {{ getServiceName(item.serviceId) }}
                                        </span>
                                        <span class="service-quantity">× {{ item.quantity }}</span>
                                        <span class="service-total">
                                            {{ getServiceTotalPrice(item.serviceId, item.quantity) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="services-grand-total">
                                    <strong>Total: {{ getGrandTotalPrice() }}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <button type="button" @click="addCustomItem" class="btn btn-secondary btn-sm add-item-btn" :disabled="isAssigning || availableServices.length === 0"> 
                            <i class="fas fa-plus"></i> Add Another Service 
                        </button>
                        <div v-if="customItemsError" class="error-message form-error small">{{ customItemsError }}</div>
                    </div>
                </div>

                 <!-- Common Fields -->
                 <div class="form-group">
                     <label for="assignNotes" class="form-label">
                         <i class="fas fa-sticky-note"></i> Notes (Optional)
                     </label>
                     <textarea id="assignNotes" v-model="planNotes" rows="3" placeholder="Any specific notes, special instructions, or treatment goals for this plan..." :disabled="isAssigning" class="form-control"></textarea>
                 </div>

                 <!-- Errors and Actions -->
                <div v-if="assignError" class="error-message modal-error">{{ assignError }}</div>
                <div class="modal-actions">
                    <button type="button" @click="closeAssignModal" class="btn btn-cancel" :disabled="isAssigning">Cancel</button>
                    <button type="submit" class="btn btn-primary" :disabled="isAssigning || isLoadingPackages || isLoadingServices || !isAssignmentValid">
                        <span v-if="isAssigning"><i class="fas fa-spinner fa-spin"></i> Assigning...</span> 
                        <span v-else><i class="fas fa-check"></i> Assign Plan</span>
                    </button>
                </div>
            </form>
        </div>
     </div>

     <!-- Invite Patient Modal -->
      <div v-if="showInviteModal" class="modal-overlay" @click.self="closeInvitePatientModal">
            <div class="modal-content">
                 <button @click="closeInvitePatientModal" class="modal-close-button" title="Close">×</button>
                 <h2>Invite New Patient</h2>
                 <p>An email invitation will be sent to the patient to set up their account. If no email is provided, the patient will be added as an offline account.</p>
                 <form @submit.prevent="handleSendPatientInvitation" class="modal-form">
                      <div class="form-group">
                         <label for="invitePatientName" class="form-label">Patient Name *</label>
                         <input type="text" id="invitePatientName" v-model="invitePatientName" required placeholder="Enter patient's full name" :disabled="isInvitingPatient" class="form-control">
                     </div>
                     <div class="form-group">
                        <label for="invitePatientPhone" class="form-label">Patient Phone *</label>
                        <input type="tel" id="invitePatientPhone" v-model="invitePatientPhone" required placeholder="Enter patient's phone number" :disabled="isInvitingPatient" class="form-control">
                    </div>
                    <div class="form-group">
                         <label for="invitePatientEmail" class="form-label">Patient Email (Optional)</label>
                         <input type="email" id="invitePatientEmail" v-model="invitePatientEmail" placeholder="Enter patient's email address" :disabled="isInvitingPatient" class="form-control">
                     </div>
                      <div v-if="invitePatientError" class="error-message modal-error">{{ invitePatientError }}</div>
                      <div class="modal-actions">
                          <button type="button" @click="closeInvitePatientModal" class="btn btn-cancel" :disabled="isInvitingPatient">Cancel</button>
                          <button type="submit" class="btn btn-primary" :disabled="isInvitingPatient || !invitePatientName || !invitePatientPhone">
                              <span v-if="isInvitingPatient"><i class="fas fa-spinner fa-spin"></i> Sending...</span> <span v-else>Send Invitation / Add Patient</span>
                          </button>
                      </div>
                 </form>
            </div>
       </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import UserService from '@/services/UserService';
import MedicService from '@/services/MedicService';
import PatientPlanService from '@/services/PatientPlanService';
import InvitationService from '@/services/InvitationService';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import SearchableDropdown from '@/components/SearchableDropdown.vue';

const toast = useToast();
const router = useRouter();

// Original State for data fetched directly from API
const allAssignedPatients = ref([]); // Stores the full list from API
const allPendingInvites = ref([]); // Stores the full list from API

// State for "My Patients" (now derived or directly used for full list)
// const assignedPatients = ref([]); // This will be replaced by a computed property
const isLoadingAssignedPatients = ref(true);
const loadAssignedPatientsError = ref('');

// State for "Pending Invitations" (now derived or directly used for full list)
// const pendingInvites = ref([]); // This will be replaced by a computed property
const isLoadingPending = ref(true);
const loadPendingError = ref('');
const isResending = reactive({});
const isCancelling = reactive({});

// Search and Pagination State for "My Patients"
const assignedPatientsSearchTerm = ref('');
const assignedPatientsCurrentPage = ref(1);
const assignedPatientsPerPage = ref(10); // Or any default value you prefer

// Search and Pagination State for "Pending Invitations"
const pendingInvitesSearchTerm = ref('');
const pendingInvitesCurrentPage = ref(1);
const pendingInvitesPerPage = ref(10); // Or any default value

// State for Modals (remains the same)
const showAssignModal = ref(false); const patientToAssign = ref(null); const assignmentType = ref('package'); const availablePackages = ref([]); const availableServices = ref([]); const selectedPackageId = ref(null); const customServiceItems = ref([]); const planNotes = ref(''); const isAssigning = ref(false); const assignError = ref(''); const isLoadingPackages = ref(false); const loadPackagesError = ref(''); const isLoadingServices = ref(false); const loadServicesError = ref(''); const customItemsError = ref('');
const showInviteModal = ref(false); const invitePatientEmail = ref(''); const isInvitingPatient = ref(false); const invitePatientError = ref('');
const invitePatientName = ref('');
const invitePatientPhone = ref('');

// Edit Patient Modal State
const showEditPatientModal = ref(false);
const patientToEditData = ref(null); // Stores the original patient data for the modal title and logic
const editPatientForm = reactive({
    id: null,
    name: '',
    email: '',
    phone: ''
});
const isUpdatingPatient = ref(false);
const editPatientError = ref('');

// Patient History Modal State
const showPatientHistoryModal = ref(false);
const patientHistoryData = ref(null);
const isLoadingPatientHistory = ref(false);
const patientHistoryError = ref('');
const selectedPatientForHistory = ref(null);

// Computed properties for "My Patients" list (Search and Pagination)
const filteredAndPaginatedAssignedPatients = computed(() => {
    let patients = allAssignedPatients.value;
    if (assignedPatientsSearchTerm.value.trim() !== '') {
        const searchTerm = assignedPatientsSearchTerm.value.toLowerCase();
        patients = patients.filter(p =>
            (p.name?.toLowerCase().includes(searchTerm)) ||
            (p.email?.toLowerCase().includes(searchTerm)) ||
            (p.phoneNumber?.toLowerCase().includes(searchTerm))
        );
    }
    const start = (assignedPatientsCurrentPage.value - 1) * assignedPatientsPerPage.value;
    const end = start + assignedPatientsPerPage.value;
    return patients.slice(start, end);
});

const totalAssignedPatientPages = computed(() => {
    let totalPatients = allAssignedPatients.value;
    if (assignedPatientsSearchTerm.value.trim() !== '') {
        const searchTerm = assignedPatientsSearchTerm.value.toLowerCase();
        totalPatients = totalPatients.filter(p =>
            (p.name?.toLowerCase().includes(searchTerm)) ||
            (p.email?.toLowerCase().includes(searchTerm)) ||
            (p.phoneNumber?.toLowerCase().includes(searchTerm))
        );
    }
    return Math.ceil(totalPatients.length / assignedPatientsPerPage.value);
});

// Computed properties for "Pending Invitations" list (Search and Pagination)
const filteredAndPaginatedPendingInvites = computed(() => {
    let invites = allPendingInvites.value;
    if (pendingInvitesSearchTerm.value.trim() !== '') {
        const searchTerm = pendingInvitesSearchTerm.value.toLowerCase();
        invites = invites.filter(i =>
            (i.name?.toLowerCase().includes(searchTerm)) ||
            (i.email?.toLowerCase().includes(searchTerm)) ||
            (i.phoneNumber?.toLowerCase().includes(searchTerm))
        );
    }
    const start = (pendingInvitesCurrentPage.value - 1) * pendingInvitesPerPage.value;
    const end = start + pendingInvitesPerPage.value;
    return invites.slice(start, end);
});

const totalPendingInvitePages = computed(() => {
    let totalInvites = allPendingInvites.value;
    if (pendingInvitesSearchTerm.value.trim() !== '') {
        const searchTerm = pendingInvitesSearchTerm.value.toLowerCase();
        totalInvites = totalInvites.filter(i =>
            (i.name?.toLowerCase().includes(searchTerm)) ||
            (i.email?.toLowerCase().includes(searchTerm)) ||
            (i.phoneNumber?.toLowerCase().includes(searchTerm))
        );
    }
    return Math.ceil(totalInvites.length / pendingInvitesPerPage.value);
});

// Computed properties for SearchableDropdown options
const formattedPackageOptions = computed(() => {
    return availablePackages.value.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description || 'No description available',
        price: pkg.totalPrice ? formatCurrency(pkg.totalPrice) : '',
        icon: 'fas fa-box-open'
    }));
});

const formattedServiceOptions = computed(() => {
    return availableServices.value.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || 'No description available',
        duration: `${service.durationMinutes || 0} min${service.price ? ' • ' + formatCurrency(service.price) : ''}`,
        price: service.price ? formatCurrency(service.price) : '',
        icon: 'fas fa-tools',
        // Additional details for better display
        durationMinutes: service.durationMinutes,
        priceAmount: service.price
    }));
});

// Get selected package details for preview
const selectedPackageDetails = computed(() => {
    if (!selectedPackageId.value) return null;
    return availablePackages.value.find(pkg => pkg.id === selectedPackageId.value);
});

// Helper functions
const formatCurrency = (amount) => {
    if (amount == null || amount === '') return '';
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
        minimumFractionDigits: 2
    }).format(amount);
};

// Helper methods for service calculations
const getServiceName = (serviceId) => {
    const service = availableServices.value.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
};

const getServicePrice = (serviceId) => {
    const service = availableServices.value.find(s => s.id === serviceId);
    return service ? service.price || 0 : 0;
};

const getServiceTotalPrice = (serviceId, quantity) => {
    const price = getServicePrice(serviceId);
    const total = price * quantity;
    return total > 0 ? formatCurrency(total) : 'Free';
};

const getGrandTotalPrice = () => {
    let total = 0;
    customServiceItems.value.forEach(item => {
        if (item.serviceId && item.quantity > 0) {
            total += getServicePrice(item.serviceId) * item.quantity;
        }
    });
    return total > 0 ? formatCurrency(total) : 'Free';
};

// Generic computed for assignment modal (remains the same)
const isAssignmentValid = computed(() => { if (assignmentType.value === 'package') { return !!selectedPackageId.value; } else if (assignmentType.value === 'custom') { if (customServiceItems.value.length === 0) return false; const allItemsValid = customServiceItems.value.every(item => item.serviceId && item.quantity >= 1); const noDuplicates = new Set(customServiceItems.value.map(i => i.serviceId)).size === customServiceItems.value.length; return allItemsValid && noDuplicates; } return false; });

// Methods...
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

const formatStatus = (status) => {
    const statusMap = {
        'SCHEDULED': 'Scheduled',
        'COMPLETED': 'Completed',
        'CANCELLED_BY_MEDIC': 'Cancelled by Medic',
        'CANCELLED_BY_PATIENT': 'Cancelled by Patient',
        'NO_SHOW': 'No Show'
    };
    return statusMap[status] || status;
};

// Helper function for service progress calculation
const getProgressPercentage = (service) => {
    const total = service.totalSessionsFromPlans || 0;
    const completed = service.completedSessions || 0;
    
    if (total === 0) return 0;
    return Math.min((completed / total) * 100, 100);
};

const fetchAllAssignedPatients = async () => {
    isLoadingAssignedPatients.value = true;
    loadAssignedPatientsError.value = '';
    // assignedPatients.value = []; // Clear derived list indirectly by clearing source
    allAssignedPatients.value = []; // Clear the source list
    assignedPatientsCurrentPage.value = 1; // Reset to first page
    try {
        const response = await UserService.getAssignedPatients();
        allAssignedPatients.value = response.data; // Store full list
    } catch (error) {
        console.error("Error fetching assigned patients:", error);
        const message = error.response?.data?.message || 'Failed to load patients.';
        loadAssignedPatientsError.value = message;
        toast.error(message);
    } finally {
        isLoadingAssignedPatients.value = false;
    }
};
const fetchAssignedPendingInvites = async () => {
    isLoadingPending.value = true;
    loadPendingError.value = '';
    // pendingInvites.value = []; // Clear derived list indirectly by clearing source
    allPendingInvites.value = []; // Clear the source list
    pendingInvitesCurrentPage.value = 1; // Reset to first page
    isResending.clear?.(); // Assuming isResending is a Map or similar; if not, adjust
    isCancelling.clear?.(); // Assuming isCancelling is a Map or similar; if not, adjust
    try {
        const response = await MedicService.getPendingPatientInvites();
        allPendingInvites.value = response.data; // Store full list
    } catch (error) {
        console.error("Error fetching pending invites:", error);
        const message = error.response?.data?.message || 'Failed to load pending invitations.';
        loadPendingError.value = message;
        toast.error(message);
    } finally {
        isLoadingPending.value = false;
    }
};
const fetchPackagesForModal = async () => { isLoadingPackages.value = true; loadPackagesError.value = ''; availablePackages.value = []; try { const response = await MedicService.getActiveCompanyPackages(); availablePackages.value = response.data; } catch (error) { console.error("Error fetching packages:", error); loadPackagesError.value = "Could not load packages."; toast.error(loadPackagesError.value); } finally { isLoadingPackages.value = false; } };
const fetchServicesForModal = async () => { isLoadingServices.value = true; loadServicesError.value = ''; availableServices.value = []; try { const response = await MedicService.getActiveCompanyServices(); availableServices.value = response.data; } catch (error) { console.error("Error fetching services:", error); loadServicesError.value = "Could not load services."; toast.error(loadServicesError.value); } finally { isLoadingServices.value = false; } };
const openAssignPlanModal = async (patient) => { patientToAssign.value = patient; assignmentType.value = 'package'; selectedPackageId.value = null; customServiceItems.value = []; planNotes.value = ''; assignError.value = ''; customItemsError.value = ''; isAssigning.value = false; showAssignModal.value = true; await Promise.all([fetchPackagesForModal(), fetchServicesForModal()]); };
const closeAssignModal = () => { showAssignModal.value = false; patientToAssign.value = null; };
const addCustomItem = () => { customServiceItems.value.push({ formKey: `new-${Date.now()}-${Math.random()}`, serviceId: null, quantity: 1 }); validateCustomItems(); };
const removeCustomItem = (index) => { customServiceItems.value.splice(index, 1); validateCustomItems(); };
const validateCustomItems = () => { customItemsError.value = ''; if (assignmentType.value !== 'custom') return; const selectedIds = new Set(); let hasInvalidItem = false; if(customServiceItems.value.length === 0) { customItemsError.value = "Add at least one service."; hasInvalidItem = true; } else { for (const item of customServiceItems.value) { if (!item.serviceId || item.quantity < 1) { hasInvalidItem = true; } if (item.serviceId) { if (selectedIds.has(item.serviceId)) { customItemsError.value = "Each service only once."; hasInvalidItem = true; break; } selectedIds.add(item.serviceId); } } if(hasInvalidItem && !customItemsError.value) { customItemsError.value = "Select service & quantity >= 1."; } } };
watch(customServiceItems, validateCustomItems, { deep: true });
watch(assignmentType, (newValue) => { selectedPackageId.value = null; customServiceItems.value = []; customItemsError.value = ''; assignError.value = ''; if(newValue === 'custom') { addCustomItem(); } });
const handleAssignPlan = async () => { assignError.value = ''; validateCustomItems(); if (!isAssignmentValid.value || customItemsError.value) { assignError.value = "Please correct errors."; toast.error(assignError.value); return; } isAssigning.value = true; try { let planData = { notes: planNotes.value }; if (assignmentType.value === 'package') { planData.packageId = selectedPackageId.value; } else { planData.serviceItems = customServiceItems.value.map(item => ({ serviceId: item.serviceId, quantity: item.quantity })); } await PatientPlanService.assignPlanToPatient(patientToAssign.value.id, planData); toast.success(`Plan assigned to ${patientToAssign.value.name}!`); closeAssignModal(); } catch (error) { console.error("Error assigning plan:", error); const message = error.response?.data?.message || 'Failed to assign plan.'; assignError.value = message; toast.error(message); } finally { isAssigning.value = false; } };
const viewPatientPlan = (patientId) => {
    router.push({ name: 'medic-patient-plan-detail', params: { patientId: patientId } });
};
const viewPatientPayments = (patientId) => {
    router.push({ name: 'medic-patient-payments', params: { patientId: patientId } });
};
const scheduleAppointment = (patientId) => {
    // toast.info(`Scheduling ${patientId} NYI.`);
    router.push({ name: 'medic-calendar' }); // Navigate to the medic's calendar page
    // Optionally, you could pass patientId as a query or param if the calendar page can use it:
    // router.push({ name: 'medic-calendar', query: { patientId: patientId } });
};
const openInvitePatientModal = () => {
    invitePatientName.value = ''; // Reset new field
    invitePatientPhone.value = ''; // Reset new field
    invitePatientEmail.value = '';
    invitePatientError.value = '';
    isInvitingPatient.value = false;
    showInviteModal.value = true;
};
const closeInvitePatientModal = () => { showInviteModal.value = false; };
const handleSendPatientInvitation = async () => {
    isInvitingPatient.value = true;
    invitePatientError.value = '';

    if (!invitePatientName.value || !invitePatientPhone.value) {
        invitePatientError.value = 'Patient name and phone number are required.';
        toast.error(invitePatientError.value);
        isInvitingPatient.value = false;
        return;
    }

    // Validate email if provided
    if (invitePatientEmail.value && !/.+@.+\..+/.test(invitePatientEmail.value)) {
        invitePatientError.value = 'Please enter a valid email address or leave it blank.';
        toast.error(invitePatientError.value);
        isInvitingPatient.value = false;
        return;
    }

    try {
        const invitationPayload = {
            name: invitePatientName.value,
            phone: invitePatientPhone.value,
            role: 'USER', // Assuming role is always 'USER' for patients
        };
        if (invitePatientEmail.value) {
            invitationPayload.email = invitePatientEmail.value;
        }

        await InvitationService.sendInvitation(invitationPayload);

        if (invitePatientEmail.value) {
            toast.success(`Invitation sent to ${invitePatientEmail.value}!`);
        } else {
            toast.success(`${invitePatientName.value} added as an offline patient.`);
        }
        closeInvitePatientModal();
        // Refresh relevant lists
        await fetchAssignedPendingInvites(); // Refreshes allPendingInvites and resets its pagination
        await fetchAllAssignedPatients(); // Refreshes allAssignedPatients and resets its pagination

    } catch (error) {
        const message = error.response?.data?.message || 'Failed to add patient or send invitation.';
        invitePatientError.value = message;
        toast.error(message);
    } finally {
        isInvitingPatient.value = false;
    }
};
const handleResendInvite = async (invitee) => {
    if (!invitee.email) { // Check if email exists for the invitee
        toast.info("This patient does not have an email address to resend the invitation to. Please add an email first.");
        return;
    }
    if (isResending[invitee.id]) return;
    isResending[invitee.id] = true;
    try {
        // The payload for resend should ideally just be the identifier (email or id)
        // Assuming InvitationService.sendInvitation can handle a resend if email exists
        // Or a dedicated resend endpoint might be better.
        // For now, we reuse sendInvitation with email and role.
        await InvitationService.sendInvitation({
            name: invitee.name,
            phone: invitee.phoneNumber,
            email: invitee.email,
            role: 'USER'
        });
        toast.success(`Invitation resent to ${invitee.email}.`);
        // Potentially refresh pending invites if status/token might change on backend after resend
        await fetchAssignedPendingInvites();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to resend invitation.');
    } finally {
        delete isResending[invitee.id];
    }
};
const handleCancelInvite = async (invitee) => {
    if (isCancelling[invitee.id] || !confirm(`Cancel invitation for ${invitee.name || invitee.email}?`)) return;
    isCancelling[invitee.id] = true;
    try {
        await UserService.cancelPatientInvitation(invitee.id);
        toast.success(`Invitation for ${invitee.name || invitee.email} cancelled.`);
        // Instead of filtering pendingInvites.value directly, re-fetch the full list.
        // pendingInvites.value = pendingInvites.value.filter(p => p.id !== invitee.id);
        await fetchAssignedPendingInvites(); // This will update allPendingInvites and reset pagination.
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel.');
    } finally {
        delete isCancelling[invitee.id];
    }
};

// --- Edit Patient Modal Methods ---
const openEditPatientModal = (patient) => {
    patientToEditData.value = { ...patient }; // Clone patient data
    editPatientForm.id = patient.id;
    editPatientForm.name = patient.name;
    editPatientForm.email = patient.email || ''; // Handle null email
    editPatientForm.phone = patient.phoneNumber || ''; // Handle null phone
    editPatientError.value = '';
    isUpdatingPatient.value = false;
    showEditPatientModal.value = true;
};

const closeEditPatientModal = () => {
    showEditPatientModal.value = false;
    patientToEditData.value = null;
    // Reset form if needed, though openEditPatientModal re-initializes it
    editPatientForm.id = null;
    editPatientForm.name = '';
    editPatientForm.email = '';
    editPatientForm.phone = '';
};

const handleEditPatientSave = async () => {
    if (!editPatientForm.name || !editPatientForm.phone) {
        editPatientError.value = 'Patient name and phone number are required.';
        return;
    }

    isUpdatingPatient.value = true;
    editPatientError.value = '';

    try {
        const updateData = {
            name: editPatientForm.name.trim(),
            email: editPatientForm.email?.trim() || null,
            phoneNumber: editPatientForm.phone.trim()
        };

        const response = await MedicService.updatePatientDetails(editPatientForm.id, updateData);
        
        // Update the patient in the local list
        const patientIndex = allAssignedPatients.value.findIndex(p => p.id === editPatientForm.id);
        if (patientIndex !== -1) {
            allAssignedPatients.value[patientIndex] = response.data;
        }

        toast.success('Patient details updated successfully');
        closeEditPatientModal();
    } catch (error) {
        console.error('Error updating patient details:', error);
        const message = error.response?.data?.message || 'Failed to update patient details.';
        editPatientError.value = message;
        toast.error(message);
    } finally {
        isUpdatingPatient.value = false;
    }
};

// Pagination methods for "My Patients"
const goToAssignedPatientsPage = (page) => {
    if (page >= 1 && page <= totalAssignedPatientPages.value) {
        assignedPatientsCurrentPage.value = page;
    }
};

// Pagination methods for "Pending Invitations"
const goToPendingInvitesPage = (page) => {
    if (page >= 1 && page <= totalPendingInvitePages.value) {
        pendingInvitesCurrentPage.value = page;
    }
};

// --- Patient History Modal Methods ---
const openPatientHistoryModal = async (patient) => {
    console.log('Opening patient history modal for:', patient);
    selectedPatientForHistory.value = patient;
    patientHistoryData.value = null;
    patientHistoryError.value = '';
    showPatientHistoryModal.value = true;
    await fetchPatientHistory(patient.id);
};

const closePatientHistoryModal = () => {
    showPatientHistoryModal.value = false;
    selectedPatientForHistory.value = null;
    patientHistoryData.value = null;
    patientHistoryError.value = '';
    isLoadingPatientHistory.value = false;
};

const fetchPatientHistory = async (patientId) => {
    console.log('Fetching patient history for ID:', patientId);
    isLoadingPatientHistory.value = true;
    patientHistoryError.value = '';
    
    try {
        const response = await MedicService.getPatientAppointmentHistory(patientId);
        console.log('Patient history response:', response.data);
        patientHistoryData.value = response.data;
    } catch (error) {
        console.error('Error fetching patient history:', error);
        const message = error.response?.data?.message || 'Failed to load patient history.';
        patientHistoryError.value = message;
        toast.error(message);
    } finally {
        isLoadingPatientHistory.value = false;
    }
};

onMounted(async () => {
    await Promise.all([
        fetchAllAssignedPatients(), // Renamed call
        fetchAssignedPendingInvites()
    ]);
});

</script>

<style scoped>
    /* --- Styles To Keep (Layout & Unique Elements) --- */

    /* General Page & Card Layout */
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem; }
    .page-header h1 { margin-bottom: 0; }
    h1 { color: var(--dark-color); }
    h1 + p { color: var(--text-color); margin-bottom: 1.5rem; font-size: 1.1rem; margin-top: 0;}
    .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); margin-bottom: 2rem; }
    .card h2 { color: var(--dark-color); margin-bottom: 0.5rem; font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
    .card h2 + p { margin-top: 0.8rem; margin-bottom: 1.5rem; font-size: 1rem; color: #6c757d; }
    .list-section { overflow-x: auto; }

    /* Search and List Controls */
    .list-controls {
        margin-bottom: 1rem;
        display: flex;
        justify-content: flex-end; /* Aligns search bar to the right */
    }
    .search-input {
        max-width: 300px; /* Or any width you prefer */
    }

    /* Table Layout */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
    .data-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .data-table tbody tr:hover { background-color: #f1f3f5; }
    .data-table td:last-child { text-align: right; white-space: nowrap; }
    .data-table td:last-child .btn + .btn { margin-left: 0.5rem; }

    /* Modal Layout Styles */
    .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; padding: 1rem; }
    .modal-content { background-color: #fff; padding: 2rem 2.5rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-dark); position: relative; width: 90%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; }
    .assign-modal-content { max-width: 650px; }
    .modal-close-button { position: absolute; top: 0.5rem; right: 0.8rem; font-size: 2rem; font-weight: bold; color: #aaa; background: none; border: none; cursor: pointer; line-height: 1; padding: 0.2rem 0.5rem; }
    .modal-close-button:hover { color: #777; }
    .modal-content h2 { color: var(--dark-color); margin-top: 0; margin-bottom: 1rem; font-size: 1.5rem; text-align: center; flex-shrink: 0; }
    .modal-content > p { text-align: center; color: var(--text-color); margin-bottom: 1.5rem; font-size: 1rem; flex-shrink: 0; }
    .modal-form { overflow-y: auto; padding-right: 5px; flex-grow: 1; }
    .modal-form .form-group { margin-bottom: 1.5rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; flex-shrink: 0; }
    .modal-error { margin-top: 1rem; margin-bottom: 0; } /* Keep layout style */

    /* Form Elements within Modal (Layout & Unique Styles) */
    .modal-form .form-label { display: block; margin-bottom: 0.6rem; font-weight: 600; color: var(--dark-color); font-size: 0.95rem; }
    /* Let global .form-control define appearance */
    .modal-form .form-control:disabled { /* Keep disabled appearance override if needed */ }
    .modal-form textarea.form-control { min-height: 80px; }

    /* --- Assignment Type Selection --- */
    .assignment-buttons {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0;
    }
    
    .assignment-btn {
        flex: 1;
        padding: 1rem;
        border: 1px solid #dee2e6;
        background: white;
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: var(--border-radius);
        font-weight: 500;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
    }
    
    .assignment-btn i {
        font-size: 1.1rem;
    }
    
    .assignment-btn.active {
        background-image: var(--gradient-main);
        color: white;
        font-weight: 600;
        border-color: var(--primary-color-start);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .assignment-btn:not(.active):hover {
        background-color: #f8f9fa;
        border-color: #adb5bd;
    }
    
    .assignment-btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .assignment-buttons {
            flex-direction: column;
            gap: 0.75rem;
        }
    }
    
    @media (max-width: 480px) {
        .assignment-btn {
            padding: 0.75rem;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        
        .assignment-btn i {
            font-size: 1rem;
        }
    }

    /* Enhanced Package Preview */
    .package-preview {
        margin-top: 1rem;
        padding: 1.25rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: var(--border-radius);
    }
    .preview-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
        color: var(--dark-color);
        font-size: 0.95rem;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 0.5rem;
    }
    .preview-header i {
        color: #3b82f6;
    }
    
    /* Package Basic Info */
    .package-basic-info {
        margin-bottom: 1rem;
    }
    .package-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    .package-title strong {
        font-size: 1.05rem;
        color: var(--dark-color);
    }
    .preview-price {
        font-weight: 600;
        color: var(--success-color);
        font-size: 1rem;
    }
    .preview-description {
        margin: 0;
        font-size: 0.9rem;
        color: #6c757d;
        line-height: 1.4;
    }
    
    /* Package Services Section */
    .package-services {
        border-top: 1px solid #e2e8f0;
        padding-top: 1rem;
    }
    .services-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
        color: var(--dark-color);
        font-size: 0.9rem;
    }
    .services-header i {
        color: #10b981;
    }
    .services-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .service-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 6px;
        border-left: 3px solid #10b981;
    }
    .service-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    .service-name {
        font-weight: 500;
        color: var(--dark-color);
        font-size: 0.9rem;
    }
    .service-quantity {
        color: #6c757d;
        font-size: 0.85rem;
        font-weight: 600;
        background: #f1f5f9;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
    }
    .service-meta {
        color: #6c757d;
        font-size: 0.8rem;
        font-weight: 500;
    }

    /* Loading/Error/NoData Styles (Layout/Positioning) */
    .loading-indicator { text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
    .loading-indicator i { font-size: 1.5rem; }
    .error-message { margin-bottom: 1rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; /* Rely on global for colors/bg */ }
    .error-message.table-error { justify-content: center; margin-top: 1rem; }
    .error-message.modal-error { /* Position adjustment if needed */ }
    .error-message.form-error { /* Position adjustment if needed */ }
    .no-data-message { text-align: center; padding: 2rem; color: #6c757d; font-style: italic; margin-top: 1rem; }
    /* Assume spinner animation and global button styles are defined elsewhere */

    .inactive-row {
        background-color: #f8f9fa; /* Light grey for inactive rows */
        opacity: 0.7;
    }
    .inactive-row:hover {
        opacity: 1;
    }
    .status-active {
        color: var(--success-color);
        font-weight: bold;
    }
    .status-inactive {
        color: var(--muted-color); /* Ensure --muted-color is defined in your global styles */
        font-style: italic;
    }

    /* Pagination Controls */
    .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.8rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
    .pagination-controls span {
        font-size: 0.9rem;
        color: var(--text-color);
    }

    /* --- Enhanced Modal Styles --- */
    .modal-header {
        text-align: center;
        margin-bottom: 2rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 1.5rem;
    }
    .modal-header h2 {
        margin-bottom: 0.5rem;
        color: var(--dark-color);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    .modal-subtitle {
        color: #6c757d;
        font-size: 0.95rem;
        margin: 0;
    }

    /* Enhanced Radio Toggle Styles */
    .radio-toggle-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    .radio-toggle-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }
    .radio-title {
        font-weight: 600;
        font-size: 0.95rem;
    }
    .radio-description {
        font-size: 0.8rem;
        opacity: 0.8;
        font-weight: 400;
        margin-top: 0.1rem;
    }

    /* Enhanced Form Labels */
    .modal-form .form-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.8rem;
        font-weight: 600;
        color: var(--dark-color);
        font-size: 0.95rem;
    }
    .modal-form .form-label i {
        color: #6c757d;
        font-size: 0.9rem;
    }

    /* Services Total Preview */
    .services-total-preview {
        margin: 1rem 0;
        padding: 1rem;
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: var(--border-radius);
    }
    .total-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
        color: var(--dark-color);
        font-size: 0.9rem;
    }
    .total-header i {
        color: #3b82f6;
    }
    .total-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .service-summary-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 6px;
        font-size: 0.85rem;
    }
    .service-summary-item > div {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        justify-content: space-between;
    }
    .service-name {
        font-weight: 500;
        color: var(--dark-color);
    }
    .service-quantity {
        color: #6c757d;
        font-size: 0.8rem;
    }
    .service-total {
        font-weight: 600;
        color: var(--success-color);
    }
    .services-grand-total {
        border-top: 1px solid #bae6fd;
        padding-top: 0.75rem;
        margin-top: 0.5rem;
        text-align: right;
        font-size: 1rem;
        color: var(--dark-color);
    }

    /* Enhanced Loading */
    .loading-inline {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-style: italic;
        color: #6c757d;
        padding: 0.75rem;
        background: #f8fafc;
        border-radius: var(--border-radius);
        margin-bottom: 0.5rem;
    }
    .loading-inline i {
        color: #3b82f6;
    }

    /* Custom Service Item Row Layout */
    .service-items-group > .form-label { 
        margin-bottom: 1rem; 
        display: block; 
    }
    
    /* Service Items Header */
    .service-items-header {
        display: grid;
        grid-template-columns: 1fr auto auto;
        grid-gap: 1rem;
        align-items: center;
        margin-bottom: 0.5rem;
        padding: 0 1rem;
    }
    
    .header-service,
    .header-quantity,
    .header-actions {
        font-size: 0.8rem;
        font-weight: 600;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: center;
    }
    
    .header-service {
        text-align: left;
    }
    
    .header-quantity {
        width: 80px;
    }
    
    .header-actions {
        width: 40px;
    }
    
    .service-item-row {
        display: grid;
        grid-template-columns: 1fr auto auto;
        grid-gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: var(--border-radius);
        border: 1px solid #e2e8f0;
    }
    
    .service-dropdown {
        /* Takes up remaining space */
        width: 100%;
    }
    
    .quantity-input-group {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
    }
    
    .item-quantity {
        width: 80px;
        height: 40px;
        text-align: center;
        padding: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        border-radius: var(--border-radius);
        border: 1px solid #dee2e6;
        background: white;
    }
    
    .btn-remove {
        width: 40px;
        height: 40px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius);
        flex-shrink: 0;
    }
    
    .add-item-btn { 
        margin-top: 1rem; 
    }

    /* Responsive service items */
    @media (max-width: 768px) {
        .service-items-header {
            display: none; /* Hide header on mobile for cleaner look */
        }
        
        .service-item-row {
            grid-template-columns: 1fr;
            grid-gap: 1rem;
            text-align: center;
        }
        
        .quantity-input-group {
            justify-self: center;
            width: 120px;
        }
        
        .btn-remove {
            justify-self: center;
            width: auto;
            height: auto;
            padding: 0.5rem 1rem;
        }
    }

    /* Patient History Modal Styles */
    .patient-history-modal-content {
        max-width: 900px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .loading-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-color);
    }

    .loading-state i {
        font-size: 1.5rem;
        margin-right: 0.5rem;
        color: var(--primary-color-start);
    }

    .retry-btn {
        margin-left: 1rem;
    }

    .history-content {
        margin-bottom: 1rem;
    }

    /* Statistics Grid */
    .history-stats {
        margin-bottom: 2rem;
    }

    .history-stats h3 {
        color: var(--dark-color);
        margin-bottom: 1rem;
        font-size: 1.1rem;
        border-bottom: 2px solid var(--primary-color-start);
        padding-bottom: 0.5rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .stat-item {
        background: #f8fafc;
        border-radius: var(--border-radius);
        padding: 1rem;
        text-align: center;
        border: 2px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .stat-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-light);
    }

    .stat-item.completed {
        border-color: var(--success-color);
        background: #f0f9ff;
    }

    .stat-item.scheduled {
        border-color: var(--primary-color-start);
        background: #eff6ff;
    }

    .stat-item.cancelled {
        border-color: var(--danger-color);
        background: #fef2f2;
    }

    .stat-number {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: var(--dark-color);
        line-height: 1;
    }

    .stat-label {
        display: block;
        font-size: 0.85rem;
        color: var(--text-color);
        margin-top: 0.25rem;
        font-weight: 500;
    }

    /* Service Summaries - New Modern Design */
    .service-summaries {
        margin-bottom: 2rem;
    }

    .service-summaries h3 {
        color: var(--dark-color);
        margin-bottom: 1.5rem;
        font-size: 1.2rem;
        border-bottom: 2px solid var(--success-color);
        padding-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .service-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
    }

    .service-card {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .service-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border-color: var(--primary-color-start);
    }

    .service-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-color-start), var(--success-color));
    }

    /* Service Card Header */
    .service-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        gap: 1rem;
    }

    .service-title-section {
        flex: 1;
        min-width: 0;
    }

    .service-title {
        margin: 0 0 0.75rem 0;
        color: var(--dark-color);
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.3;
    }

    .progress-indicator {
        width: 100%;
        height: 8px;
        background-color: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--success-color) 0%, #10b981 100%);
        border-radius: 4px;
        transition: width 0.6s ease;
        position: relative;
    }

    .progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }

    .remaining-counter {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: linear-gradient(135deg, var(--success-color), #10b981);
        color: white;
        padding: 0.75rem;
        border-radius: 12px;
        min-width: 70px;
        box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3);
        transition: all 0.3s ease;
    }

    .remaining-counter.zero-remaining {
        background: linear-gradient(135deg, var(--danger-color), #dc2626);
        box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    .remaining-number {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 0.25rem;
    }

    .remaining-text {
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
    }

    /* Service Statistics Grid */
    .service-stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .stat-card {
        background: rgba(248, 250, 252, 0.7);
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid rgba(226, 232, 240, 0.8);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
    }

    .stat-card:hover {
        background: rgba(248, 250, 252, 1);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
    }

    .stat-card.total .stat-icon {
        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        color: #374151;
    }

    .stat-card.completed .stat-icon {
        background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        color: var(--success-color);
    }

    .stat-card.scheduled .stat-icon {
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        color: var(--primary-color-start);
    }

    .stat-card.cancelled .stat-icon {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        color: var(--danger-color);
    }

    .stat-content {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
    }

    .stat-number {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--dark-color);
        line-height: 1.2;
    }

    .stat-label {
        font-size: 0.8rem;
        color: var(--text-color);
        font-weight: 500;
        margin-top: 0.125rem;
    }

    /* Service Timeline */
    .service-timeline {
        display: flex;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
    }

    .timeline-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        padding: 0.5rem;
        border-radius: 8px;
        background: rgba(248, 250, 252, 0.5);
        transition: all 0.2s ease;
    }

    .timeline-item:hover {
        background: rgba(248, 250, 252, 1);
    }

    .timeline-item.past {
        border-left: 3px solid #6b7280;
    }

    .timeline-item.future {
        border-left: 3px solid var(--primary-color-start);
    }

    .timeline-item i {
        font-size: 0.9rem;
        color: var(--text-color);
        width: 16px;
        text-align: center;
        flex-shrink: 0;
    }

    .timeline-item.future i {
        color: var(--primary-color-start);
    }

    .timeline-content {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
    }

    .timeline-label {
        font-size: 0.75rem;
        color: var(--text-color);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.125rem;
    }

    .timeline-date {
        font-size: 0.85rem;
        color: var(--dark-color);
        font-weight: 600;
    }

    /* Responsive Design for Service Cards */
    @media (max-width: 768px) {
        .service-cards-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .service-card {
            padding: 1rem;
        }

        .service-card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }

        .remaining-counter {
            align-self: flex-end;
            min-width: 60px;
        }

        .service-stats-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }

        .timeline-item {
            flex-direction: column;
            text-align: center;
            gap: 0.25rem;
        }

        .timeline-content {
            align-items: center;
        }
    }

    /* Recent Appointments */
    .recent-appointments {
        margin-bottom: 2rem;
    }

    .recent-appointments h3 {
        color: var(--dark-color);
        margin-bottom: 1rem;
        font-size: 1.1rem;
        border-bottom: 2px solid var(--info-color);
        padding-bottom: 0.5rem;
    }

    .appointments-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .appointment-item {
        background: #f8fafc;
        border-radius: var(--border-radius);
        padding: 1rem;
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .appointment-item:hover {
        box-shadow: var(--shadow-light);
        border-color: var(--primary-color-start);
    }

    .appointment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .appointment-service {
        font-weight: 600;
        color: var(--dark-color);
        font-size: 1rem;
    }

    .appointment-status {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .appointment-status.scheduled {
        background: #dbeafe;
        color: #1e40af;
    }

    .appointment-status.completed {
        background: #dcfce7;
        color: #166534;
    }

    .appointment-status.cancelled_by_medic,
    .appointment-status.cancelled_by_patient {
        background: #fee2e2;
        color: #dc2626;
    }

    .appointment-status.no_show {
        background: #fef3c7;
        color: #d97706;
    }

    .appointment-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .appointment-time,
    .appointment-plan,
    .appointment-notes {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-color);
    }

    .appointment-time i,
    .appointment-plan i,
    .appointment-notes i {
        width: 16px;
        color: var(--primary-color-start);
    }

    .auto-created {
        font-style: italic;
        color: var(--warning-color);
        font-size: 0.8rem;
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-color);
    }

    .empty-state i {
        font-size: 3rem;
        color: #cbd5e1;
        margin-bottom: 1rem;
    }

    .empty-state h3 {
        color: var(--dark-color);
        margin-bottom: 0.5rem;
    }

    .empty-state p {
        color: var(--text-color);
        margin: 0;
    }

    /* Responsive Design for History Modal */
    @media (max-width: 768px) {
        .patient-history-modal-content {
            max-width: 95vw;
            margin: 1rem;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .appointment-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
    }
</style>