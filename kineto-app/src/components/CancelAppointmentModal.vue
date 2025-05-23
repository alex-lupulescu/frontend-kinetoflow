<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-content cancel-appointment-modal-content">
        <button @click="closeModal" class="modal-close-button" title="Close">
          ×
        </button>
        <h2>Cancel Appointment</h2>
        <p v-if="isCancelled">
          This appointment is already canceled.<br>
          You can delete it permanently if you wish.
        </p>
        <p v-else>
          Are you sure you want to cancel the appointment: <br />
          <strong>"{{ appointmentTitle }}"</strong>?
        </p>
  
        <form @submit.prevent="handleConfirmCancel" class="modal-form">
          <div class="form-group">
            <label for="cancellationReason" class="form-label"
              >Reason for Cancellation (Optional):</label
            >
            <textarea
              id="cancellationReason"
              v-model="reason"
              rows="3"
              class="form-control"
              placeholder="Enter reason here..."
              :disabled="isSubmitting"
            ></textarea>
          </div>
  
          <div class="modal-actions">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-cancel"
              :disabled="isSubmitting"
            >
              Keep Appointment
            </button>
            <button type="submit" class="btn btn-danger" :disabled="isSubmitting">
              <span v-if="isSubmitting"
                ><i class="fas fa-spinner fa-spin"></i> Cancelling...</span
              >
              <span v-else>Yes, Cancel Appointment</span>
            </button>
            <button
              type="button"
              class="btn btn-outline-danger"
              @click="onDelete"
              :disabled="isDeleting || isSubmitting"
              style="margin-left: 1rem;"
            >
              <span v-if="isDeleting"><i class="fas fa-spinner fa-spin"></i> Deleting...</span>
              <span v-else><i class="fas fa-trash"></i> Delete Appointment</span>
            </button>
          </div>
          <div v-if="errorMessage" class="error-message modal-error">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed } from "vue";
  import { useToast } from "vue-toastification";
  import MedicService from "@/services/MedicService"; // Make sure this path is correct
  
  const props = defineProps({
    appointmentId: { type: [Number, String], required: true },
    appointmentTitle: { type: String, default: "Selected Appointment" },
    isDeleting: { type: Boolean, default: false },
    status: { type: String, default: '' }
  });
  
  const emit = defineEmits(["close", "cancelled", "delete"]);
  const toast = useToast();
  
  const reason = ref("");
  const isSubmitting = ref(false);
  const errorMessage = ref("");
  const isDeletingAppointment = ref(false);
  
  const isCancelled = computed(() => props.status && props.status.startsWith('CANCELLED'));
  
  const closeModal = () => {
    if (isSubmitting.value) return;
    emit("close");
  };
  
  const handleConfirmCancel = async () => {
    isSubmitting.value = true;
    errorMessage.value = "";
    try {
      const cancellationData = {
        newStatus: "CANCELLED_BY_MEDIC", // Assuming medic is cancelling
        cancellationReason: reason.value.trim(),
      };
      // Ensure props.appointmentId is the numeric ID
      const numericAppointmentId = parseInt(props.appointmentId, 10);
      if (isNaN(numericAppointmentId)) {
        throw new Error("Invalid appointment ID provided to modal.");
      }
  
      await MedicService.cancelAppointment(numericAppointmentId, cancellationData);
      toast.success(
        `Appointment "${props.appointmentTitle}" cancelled successfully.`
      );
      emit("cancelled"); // Notify parent to refresh
      closeModal();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      errorMessage.value =
        error.response?.data?.message || "Failed to cancel appointment.";
      toast.error(errorMessage.value);
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const onDelete = (e) => {
    if (e) e.preventDefault();
    emit('delete');
  };
  </script>
  
  <style scoped>
  /* Modal Styles (can be shared or specific) */
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
    background-color: #fff;
    padding: 2rem 2.5rem;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-dark);
    position: relative;
    width: 90%;
    max-width: 500px; /* Suitable size for confirmation */
    max-height: 90vh;
    display: flex;
    flex-direction: column;
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
  .modal-content h2 {
    color: var(--dark-color);
    margin-top: 0;
    margin-bottom: 1rem; /* More space after title */
    font-size: 1.4rem;
    text-align: center;
    flex-shrink: 0;
  }
  .modal-content > p {
    text-align: left; /* Align paragraph text to left for readability */
    margin-bottom: 1.5rem;
    font-size: 1rem;
    color: var(--text-color);
    line-height: 1.6; /* Improved line height */
  }
  .modal-content > p strong {
    font-weight: 600;
    color: var(--primary-color-start); /* Highlight appointment title */
  }
  .modal-form .form-group {
    margin-bottom: 1.5rem;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
    flex-shrink: 0;
  }
  .modal-error {
    margin-top: 1rem;
    margin-bottom: 0;
    font-size: 0.9em;
    color: #dc3545; /* Rely on global .error-message for appearance if preferred */
    text-align: left;
  }
  
  .form-label {
    display: block;
    margin-bottom: 0.6rem;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--dark-color);
  }
  /* Rely on global .form-control for input/textarea appearance */
  .form-control {
    display: block;
    width: 100%;
    padding: 0.7rem 1rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-color);
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    appearance: none;
    border-radius: var(--border-radius);
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  .form-control:focus {
    border-color: var(--primary-color-start);
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-start-rgb), 0.25);
  }
  .form-control:disabled {
    background-color: #e9ecef;
    opacity: 1;
    cursor: not-allowed;
  }
  textarea.form-control {
    resize: vertical;
    min-height: 70px;
  }
  
  .fa-spinner {
    animation: fa-spin 1.5s linear infinite;
  }
  @keyframes fa-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  /* Rely on global button styles for .btn, .btn-cancel, .btn-danger */
  </style>