// src/views/medic/MedicCalendar.vue (Complete File - Formatted)

<template>
  <div class="page-container calendar-page-container">
    <!-- Header -->
    <div class="page-header">
      <h1>My Schedule</h1>
      <!-- Add filters or other controls later if needed -->
    </div>

    <!-- Loading/Error State Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-indicator">
        <i class="fas fa-spinner fa-spin"></i> Loading Schedule...
      </div>
    </div>
    <div v-if="loadError && !isLoading" class="error-message full-page-error">
      <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
      <button
        type="button"
        @click="handleRetryFetch"
        class="btn btn-sm btn-secondary retry-button"
      >
        Retry
      </button>
    </div>

    <!-- Action Menu (Contextual based on selection) -->
    <div v-if="selectedInfo" class="context-menu" :style="contextMenuStyle">
      <div class="context-menu-header">
        <!-- Display time range OR event title -->
        <span v-if="selectedInfo.event">Event: {{ selectedInfo.event.title }}</span>
        <span v-else>Selected: {{ formatSelectionTime(selectedInfo) }}</span>
      </div>

      <!-- Actions for EMPTY SLOT selection -->
      <template v-if="!selectedInfo.event">
        <button
          type="button"
          class="btn btn-sm btn-primary"
          @click.stop="actionCreateAppointment"
          :disabled="isProcessingAction"
        >
          <i class="fas fa-calendar-plus"></i> Create Appointment
        </button>
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click.stop="actionBlockTime"
          :disabled="isProcessingAction"
        >
          <span v-if="isProcessingAction === 'block'"
            ><i class="fas fa-spinner fa-spin"></i
          ></span>
          <span v-else><i class="fas fa-ban"></i> Block Time</span>
        </button>
      </template>

      <!-- Actions for EXISTING EVENT selection -->
      <template v-if="selectedInfo.event">
        <!-- Edit Appointment (Placeholder) -->
        <button
          type="button"
          v-if="selectedInfo.event.extendedProps?.type === 'appointment'"
          class="btn btn-sm btn-info"
          @click.stop="actionEditAppointment"
          :disabled="isProcessingAction"
        >
          <i class="fas fa-edit"></i> Edit Appointment
        </button>
        <!-- Delete Block (Mark Available) -->
        <button
          type="button"
          v-if="selectedInfo.event.extendedProps?.type === 'block'"
          class="btn btn-sm btn-success"
          @click.stop="actionMarkAvailable"
          :disabled="isProcessingAction"
        >
          <span v-if="isProcessingAction === 'deleteBlock'"
            ><i class="fas fa-spinner fa-spin"></i
          ></span>
          <span v-else><i class="fas fa-check-circle"></i> Mark Available</span>
        </button>
        <!-- Cancel/Delete Appointment (Placeholder) -->
        <button
          type="button"
          v-if="selectedInfo.event.extendedProps?.type === 'appointment'"
          class="btn btn-sm btn-danger"
          @click.stop="actionCancelAppointment"
          :disabled="isProcessingAction"
        >
          <i class="fas fa-calendar-times"></i> Cancel Appointment
        </button>
        <!-- Delete Block (Alternative Button) -->
        <button
          type="button"
          v-if="selectedInfo.event.extendedProps?.type === 'block'"
          class="btn btn-sm btn-danger"
          @click.stop="actionDeleteBlockAlternative"
          :disabled="isProcessingAction"
        >
          <span v-if="isProcessingAction === 'deleteBlockAlt'"
            ><i class="fas fa-spinner fa-spin"></i
          ></span>
          <span v-else><i class="fas fa-trash"></i> Delete Block</span>
        </button>
      </template>

      <!-- Always show Clear Selection -->
      <button
        type="button"
        class="btn btn-sm btn-cancel"
        @click.stop="clearSelection"
        :disabled="isProcessingAction"
      >
        <i class="fas fa-times"></i> Clear Selection
      </button>
    </div>

    <!-- FullCalendar Component -->
    <FullCalendar
      ref="fullCalendar"
      :options="calendarOptions"
      class="calendar-component"
      :class="{ 'load-error': loadError }"
    />

    <!-- Block Time Modal -->
    <div v-if="showBlockModal" class="modal-overlay" @click.self="closeBlockModal">
      <div class="modal-content block-modal-content">
        <button @click="closeBlockModal" class="modal-close-button" title="Close">
          ×
        </button>
        <h2>Block Time Slot</h2>
        <p v-if="blockTimeData">
          Block from {{ formatModalTime(blockTimeData.startTime) }} to
          {{ formatModalTime(blockTimeData.endTime) }}
        </p>
        <form @submit.prevent="handleBlockTimeSave" class="modal-form">
          <div class="form-group">
            <label for="blockReason" class="form-label">Reason (Optional)</label>
            <input
              type="text"
              id="blockReason"
              v-model="blockReason"
              placeholder="e.g., Lunch, Admin Work"
              class="form-control"
              :disabled="isProcessingAction === 'block'"
            />
          </div>
          <div class="modal-actions">
            <button
              type="button"
              @click="closeBlockModal"
              class="btn btn-cancel"
              :disabled="isProcessingAction === 'block'"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isProcessingAction === 'block'"
            >
              <span v-if="isProcessingAction === 'block'"
                ><i class="fas fa-spinner fa-spin"></i> Blocking...</span
              >
              <span v-else>Confirm Block</span>
            </button>
          </div>
          <!-- Optional: Add error display area for modal-specific errors -->
          <!-- <div v-if="blockModalError" class="error-message modal-error">{{ blockModalError }}</div> -->
        </form>
      </div>
    </div>

    <!-- === Appointment Form Modal Integration === -->
    <AppointmentFormModal
      v-if="showAppointmentModal"
      :start-time="appointmentModalData?.start"
      :end-time="appointmentModalData?.end"
      :appointment-data="appointmentModalData?.existingAppointment"
      @close="closeAppointmentModal"
      @save="handleAppointmentSave"
    />
    <!-- === END Appointment Modal === -->
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  nextTick,
  onBeforeUnmount,
} from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import MedicService from "@/services/MedicService";
import { useToast } from "vue-toastification";
import AppointmentFormModal from "@/components/AppointmentFormModal.vue"; // Import Modal

const toast = useToast();
const fullCalendar = ref(null);

// --- State ---
const isLoading = ref(true);
const loadError = ref("");
const selectedInfo = ref(null); // { start?, end?, jsEvent?, event? }
const contextMenuStyle = reactive({ display: "none", left: "0px", top: "0px" });
const isProcessingAction = ref(false); // Can be boolean or string ('block', 'deleteBlock', etc)
// State for Block Time Modal
const showBlockModal = ref(false);
const blockReason = ref("");
const blockTimeData = ref(null); // { startTime: Date, endTime: Date }
// State for Appointment Modal
const showAppointmentModal = ref(false);
const appointmentModalData = ref(null); // { start, end, existingAppointment? }

// --- Calendar Options ---
const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: "timeGridWeek",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  },
  buttonText: {
    today: "Today",
    month: "Month",
    week: "Week",
    day: "Day",
    list: "List",
  },
  navLinks: true,
  editable: false, // Keep false until drag/drop implemented
  selectable: true,
  selectMirror: true,
  nowIndicator: true,
  slotMinTime: "07:00:00",
  slotMaxTime: "19:00:00",
  slotDuration: "00:15:00",
  snapDuration: "00:15:00",
  allDaySlot: false,
  weekends: true,
  timeZone: "Europe/Bucharest", // IMPORTANT: Set your local timezone
  eventTimeFormat: { hour: "numeric", minute: "2-digit", meridiem: "short" },
  slotLabelFormat: {
    hour: "numeric",
    minute: "2-digit",
    omitZeroMinute: false,
    meridiem: "short",
  },
  // Callbacks
  datesSet: handleDatesSet,
  select: handleDateSelect,
  unselect: handleUnselect,
  eventClick: handleEventClick,
  // Rendering
  eventDidMount: handleEventMount,
  eventSources: [{ id: "medicEvents", events: fetchCalendarEvents }],
  eventColor: "#3498DB", // Default base color
});

// --- Fetching Logic ---
let currentFetchController = null;

async function fetchCalendarEvents(fetchInfo, successCallback, failureCallback) {
  isLoading.value = true;
  loadError.value = "";
  // Removed clearSelection() from here

  if (currentFetchController) {
    currentFetchController.abort();
  }
  currentFetchController = new AbortController();
  const signal = currentFetchController.signal;
  const startDate = fetchInfo.start;
  const endDate = fetchInfo.end;
  console.log(
    `Fetching events from ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  try {
    const response = await MedicService.getCalendarEvents(startDate, endDate);
    if (signal.aborted) {
      console.log("Event fetch aborted.");
      return;
    }
    const mappedEvents = response.data.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start, // Keep as ISO string from backend
      end: event.end, // Keep as ISO string from backend
      color: event.color,
      backgroundColor: event.color,
      borderColor: event.color ? darkenColor(event.color, 15) : "#2980B9",
      extendedProps: {
        type: event.type,
        status: event.status,
        notes: event.notes,
        patientId: event.patientId,
        patientName: event.patientName,
        serviceId: event.serviceId,
        serviceName: event.serviceName,
      },
    }));
    console.log("Events loaded:", mappedEvents.length);
    successCallback(mappedEvents); // Provide events to FullCalendar
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted.");
      return;
    }
    console.error("Error fetching calendar events:", error);
    const message = error.response?.data?.message || "Failed to load schedule data.";
    loadError.value = message;
    toast.error(message);
    failureCallback(error); // Notify FullCalendar of failure
  } finally {
    if (!signal.aborted) {
      isLoading.value = false;
    }
  }
}

function darkenColor(hex, percent) {
  if (!hex || typeof hex !== "string" || hex.charAt(0) !== "#") return hex;
  try {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    const factor = 1 - percent / 100;
    r = Math.max(0, Math.floor(r * factor));
    g = Math.max(0, Math.floor(g * factor));
    b = Math.max(0, Math.floor(b * factor));
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch (e) {
    return hex;
  }
}

// --- Calendar Callbacks ---
function handleDatesSet(dateInfo) {
  console.log("View/Dates Changed:", dateInfo.view.type);
  clearSelection(); // Clear selection when view changes
}
function handleDateSelect(selectionInfo) {
  console.log("Selected:", selectionInfo.startStr, "to", selectionInfo.endStr);
  if (selectedInfo.value?.event) {
    selectedInfo.value = null;
  } // Clear event selection first
  selectedInfo.value = {
    start: selectionInfo.start,
    end: selectionInfo.end,
    jsEvent: selectionInfo.jsEvent,
  };
  positionContextMenu(selectionInfo.jsEvent);
}
function handleUnselect() {
  console.log("Unselect Callback Triggered");
  // Hide context menu ONLY if a modal isn't active and selection state is truly cleared
  if (
    contextMenuStyle.display === "block" &&
    !selectedInfo.value &&
    !showBlockModal.value &&
    !showAppointmentModal.value
  ) {
    contextMenuStyle.display = "none";
  }
}
function handleEventClick(clickInfo) {
  console.log("Event Clicked:", clickInfo.event.id);
  if (fullCalendar.value) {
    fullCalendar.value.getApi().unselect();
  } // Clear time selection
  selectedInfo.value = { event: clickInfo.event, jsEvent: clickInfo.jsEvent }; // Store event info
  positionContextMenu(clickInfo.jsEvent);
}
function handleEventMount(info) {
  if (info.event.extendedProps.notes) {
    info.el.setAttribute("title", `Notes: ${info.event.extendedProps.notes}`);
  }
  if (info.event.extendedProps.type === "block") {
    info.el.classList.add("fc-event-block");
  } else if (info.event.extendedProps.type === "appointment") {
    info.el.classList.add("fc-event-appointment");
    if (info.event.extendedProps.status) {
      info.el.classList.add(
        `fc-event-status-${info.event.extendedProps.status.toLowerCase()}`
      );
    }
  }
}
function handleRetryFetch() {
  if (fullCalendar.value) {
    fullCalendar.value.getApi().refetchEvents();
  }
}

// --- Action Menu & Modal Logic ---
function positionContextMenu(jsEvent) {
  nextTick(() => {
    const menu = document.querySelector(".context-menu");
    if (!menu) return;
    const clickX = jsEvent.clientX;
    const clickY = jsEvent.clientY;
    const menuHeight = menu.offsetHeight;
    const menuWidth = menu.offsetWidth;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    let top = clickY + 5;
    let left = clickX + 5;
    if (top + menuHeight > windowHeight) {
      top = clickY - menuHeight - 5;
    }
    if (left + menuWidth > windowWidth) {
      left = clickX - menuWidth - 5;
    }
    contextMenuStyle.left = `${Math.max(5, left)}px`;
    contextMenuStyle.top = `${Math.max(5, top)}px`;
    contextMenuStyle.display = "block";
  });
}

function clearSelection() {
  console.log("clearSelection called");
  selectedInfo.value = null; // Clear the stored selection info
  contextMenuStyle.display = "none"; // Hide the context menu
  if (fullCalendar.value?.getApi) { // Check existence before calling
    try {
      fullCalendar.value.getApi().unselect(); // Visually unselect on calendar
      console.log("calendarApi.unselect() called");
    } catch (e) {
      console.warn("Error calling unselect:", e);
    }
  }
}

function closeBlockModal() {
  showBlockModal.value = false;
  blockTimeData.value = null;
  // Don't necessarily clear selection here, user might want to do something else with the slot
}

function closeAppointmentModal() {
  showAppointmentModal.value = false;
  appointmentModalData.value = null; // Reset data
}

function formatSelectionTime(selection) {
  if (!selection || !selection.start || !selection.end) return "";
  const options = { timeZone: 'Europe/Bucharest', hour: "numeric", minute: "2-digit", hour12: true };
  try {
    const start = selection.start.toLocaleTimeString(undefined, options);
    const end = selection.end.toLocaleTimeString(undefined, options);
    return `${start} - ${end}`;
  } catch(e) { return "Error formatting time"; }
}

function formatModalTime(date) {
  if (!date) return "";
  const options = { timeZone: 'Europe/Bucharest', hour: "numeric", minute: "2-digit", hour12: true };
   try { return date.toLocaleTimeString(undefined, options); }
   catch (e) { return "Invalid Date"; }
}

// --- Context Menu Actions ---
function actionCreateAppointment() {
  if (!selectedInfo.value || selectedInfo.value.event || isProcessingAction.value) return;
  console.log("ACTION: Create Appointment button clicked");
  appointmentModalData.value = {
    start: selectedInfo.value.start,
    end: selectedInfo.value.end,
    existingAppointment: null,
  };
  showAppointmentModal.value = true;
  contextMenuStyle.display = "none"; // Hide context menu
}

function actionEditAppointment() {
  const eventInfo = selectedInfo.value?.event;
  if (!eventInfo || eventInfo.extendedProps?.type !== 'appointment' || isProcessingAction.value) return;
  console.log("ACTION: Edit Appt", eventInfo.id);
  appointmentModalData.value = {
      start: eventInfo.start,
      end: eventInfo.end,
      existingAppointment: eventInfo // Pass event for editing
  };
  showAppointmentModal.value = true; // Open the modal
  clearSelection(); // Clear selection state
}

function actionCancelAppointment() {
  console.log("ACTION: Cancel Appt", selectedInfo.value?.event?.id);
  toast.info("Cancel Appointment NYI.");
  clearSelection();
}

function actionBlockTime() {
  if (!selectedInfo.value || selectedInfo.value.event || isProcessingAction.value) return;
  console.log("ACTION: Block Time button clicked");
  blockTimeData.value = {
    startTime: selectedInfo.value.start,
    endTime: selectedInfo.value.end,
  };
  blockReason.value = "";
  showBlockModal.value = true;
  contextMenuStyle.display = "none";
}

async function handleBlockTimeSave() {
  if (!blockTimeData.value || isProcessingAction.value === "block") return;
  const blockData = {
    startTime: blockTimeData.value.startTime.toISOString(),
    endTime: blockTimeData.value.endTime.toISOString(),
    reason: blockReason.value.trim() || "Blocked",
  };
  console.log("ACTION: Confirm Block Time Request:", blockData);
  isProcessingAction.value = "block";
  try {
    await MedicService.createTimeBlock(blockData);
    toast.success("Time blocked successfully.");
    closeBlockModal();
    clearSelection(); // Clear underlying selection state
    fullCalendar.value?.getApi().refetchEvents();
  } catch (error) {
    console.error("Error blocking time:", error);
    toast.error(error.response?.data?.message || "Failed.");
  } finally {
    isProcessingAction.value = false;
  }
}

async function actionMarkAvailable() {
  const eventInfo = selectedInfo.value?.event;
  if (!eventInfo || eventInfo.extendedProps?.type !== "block" || isProcessingAction.value)
    return;
  const blockIdStr = eventInfo.id.startsWith("block-") ? eventInfo.id.substring(6) : null;
  const blockId = blockIdStr ? parseInt(blockIdStr, 10) : null;
  if (!blockId || isNaN(blockId)) {
    toast.error("Invalid block ID.");
    clearSelection();
    return;
  }
  if (!confirm(`Mark available (delete block "${eventInfo.title}")?`)) {
    clearSelection();
    return;
  }
  console.log("ACTION: Mark Available (Delete Block ID):", blockId);
  isProcessingAction.value = "deleteBlock";
  try {
    await MedicService.deleteTimeBlock(blockId);
    toast.success("Time block removed.");
    clearSelection(); // Clear selection state
    fullCalendar.value?.getApi().refetchEvents();
  } catch (error) {
    console.error("Error deleting block:", error);
    toast.error(error.response?.data?.message || "Failed delete.");
  } finally {
    isProcessingAction.value = false;
  }
}
async function actionDeleteBlockAlternative() {
  await actionMarkAvailable();
}

// Handles the @save event from the appointment modal
function handleAppointmentSave() {
  console.log("Appointment saved event received. Refetching calendar.");
  // Modal closes itself before emitting 'save'
  clearSelection(); // Clear any underlying selection state
  if (fullCalendar.value) {
    fullCalendar.value.getApi().refetchEvents(); // Refresh the calendar
  }
}

// --- Lifecycle ---
onMounted(() => {
  // Initial fetch handled by eventSources
});
onBeforeUnmount(() => {
  // Clean up AbortController
  if (currentFetchController) {
    currentFetchController.abort();
  }
});
</script>

<style scoped>
/* Styles remain the same */
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}
h1 {
  color: var(--dark-color);
}

/* Loading / Error Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: var(--border-radius-large);
}
.loading-indicator {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-color);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}
.loading-indicator i {
  font-size: 1.5rem;
  animation: fa-spin 1.5s linear infinite;
  color: var(--primary-color-start);
}
.error-message.full-page-error {
  margin: 2rem auto; /* Center error message */
  padding: 1.5rem;
  text-align: center;
  max-width: 600px;
  /* Rely on global error styles */
}
.retry-button {
  margin-left: 1rem;
}

/* Calendar Component Styles */
.calendar-component {
  min-height: 75vh;
  background-color: #fff;
  padding: 1rem;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
  opacity: 1;
  transition: opacity 0.3s ease;
}
.calendar-component.load-error {
  opacity: 0.5; /* Dim calendar if error occurs */
}

/* Context Menu */
.context-menu {
  position: fixed; /* Use fixed for positioning relative to viewport */
  z-index: 1020;
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  padding: 0.75rem;
  display: none; /* Toggled by state */
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px;
  border: 1px solid #eee;
}
.context-menu-header {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}
.context-event-title {
  font-weight: normal;
  color: #6c757d;
  display: block;
  font-size: 0.85em;
  margin-top: 0.2rem;
}
.context-menu .btn {
  width: 100%;
  justify-content: flex-start;
  text-align: left;
  font-size: 0.9rem;
  padding: 0.5rem 0.8rem;
}
.context-menu .btn i {
  width: 20px;
  text-align: center;
  margin-right: 0.6rem;
}

/* Modal Styles */
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
  max-width: 450px; /* Smaller default */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.block-modal-content {
  /* keep size */
}
.appointment-modal-content {
  max-width: 600px; /* Wider for appt form */
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
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
  text-align: center;
  flex-shrink: 0;
}
.modal-content > p {
  text-align: center;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  flex-shrink: 0;
}
.modal-form {
  overflow-y: auto;
  padding-right: 5px; /* Space for scrollbar */
  flex-grow: 1;
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
}
/* Rely on global form-control */
.modal-form .form-label {
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 600;
  font-size: 0.95rem;
}
.modal-form input.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

/* Custom Event Styles */
:deep(.fc-event) {
  cursor: pointer;
  font-size: 0.8rem;
  border: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
:deep(.fc-event-main) {
  padding: 3px 5px;
}
:deep(.fc-event-time) {
  font-weight: 600;
}
:deep(.fc-v-event .fc-event-main) {
  white-space: normal;
}
:deep(.fc-event-block) {
  background-color: #adb5bd !important;
  border-color: #6c757d !important;
  color: #fff !important;
}
:deep(.fc-event-appointment.fc-event-status-completed) {
  background-color: #d1e7dd !important;
  border-color: #a3cfbb !important;
  color: #0f5132 !important;
}
:deep(.fc-event-appointment.fc-event-status-cancelled_by_medic),
:deep(.fc-event-appointment.fc-event-status-cancelled_by_patient) {
  background-color: #f8d7da !important;
  border-color: #f1aeB5 !important;
  color: #842029 !important;
  text-decoration: line-through;
}
:deep(.fc-event-appointment.fc-event-status-no_show) {
  background-color: #fff3cd !important;
  border-color: #ffe69c !important;
  color: #664d03 !important;
}
:deep(.fc-event-appointment) {
  background-color: #cfe2ff !important;
  border-color: #a9c7fe !important;
  color: #052c65 !important;
}
:deep(.fc-event:hover) {
  opacity: 0.85;
}

/* Spinner Animation */
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
</style>