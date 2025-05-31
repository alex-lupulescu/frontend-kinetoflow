<template>
  <div class="page-container calendar-page-container">
    <!-- Header -->
    <div class="page-header">
      <h1>My Schedule</h1>
      <div class="header-actions">
      <button @click="openWorkingHoursModal" class="btn btn-secondary">
        <i class="fas fa-clock"></i> Set Working Hours
      </button>
        <button @click="openVacationDaysModal" class="btn btn-info">
          <i class="fas fa-umbrella-beach"></i> Vacation Days
        </button>
        <button @click="openExtraWorkDaysModal" class="btn btn-success">
          <i class="fas fa-plus-circle"></i> Extra Work Days
        </button>
      </div>
    </div>

    <!-- Loading/Error State Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-indicator">
        <i class="fas fa-spinner fa-spin"></i> Loading Schedule...
      </div>
    </div>
    
    <!-- Dragging Indicator Overlay -->
    <div v-if="isDragging" class="dragging-overlay">
      <div class="dragging-indicator">
        <i class="fas fa-arrows-alt fa-spin"></i> Moving Event...
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
        <span v-if="selectedInfo.event">Event: {{ selectedInfo.event.title }}</span>
        <span v-else>Selected: {{ formatSelectionTime(selectedInfo) }}</span>
      </div>
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
      <template v-if="selectedInfo.event">
        <button
          type="button"
          v-if="selectedInfo.event.extendedProps?.type === 'appointment' && selectedInfo.event.extendedProps?.status === 'SCHEDULED'"
          class="btn btn-sm btn-success"
          @click.stop="actionMarkCompleted"
          :disabled="isProcessingAction"
        >
          <span v-if="isProcessingAction === 'markCompleted'"
            ><i class="fas fa-spinner fa-spin"></i
          ></span>
          <span v-else><i class="fas fa-check-circle"></i> Mark Completed</span>
        </button>
        <button
          type="button"
          v-if="selectedInfo.event.extendedProps?.type === 'appointment' && selectedInfo.event.extendedProps?.status === 'SCHEDULED'"
          class="btn btn-sm btn-info"
          @click.stop="actionEditAppointment"
          :disabled="isProcessingAction"
        >
          <i class="fas fa-edit"></i> Edit
        </button>
        <button
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
        <button
          v-if="selectedInfo.event.extendedProps?.type === 'appointment' && selectedInfo.event.extendedProps?.status === 'SCHEDULED'"
          class="btn btn-sm btn-danger"
          @click.stop="actionCancelAppointment"
          :disabled="isProcessingAction"
        >
          <span v-if="isProcessingAction === 'cancelAppt'"
            ><i class="fas fa-spinner fa-spin"></i
          ></span>
          <span v-else><i class="fas fa-calendar-times"></i> Cancel Appt.</span>
        </button>
        <button
          v-if="selectedInfo.event.extendedProps?.type === 'block'"
          class="btn btn-sm btn-danger"
          @click.stop="actionDeleteBlockAlternative"
          :disabled="isProcessingAction"
        >
          <span v-if="isProcessingAction === 'deleteBlockAlt'"
            ><i class="fas fa-spinner fa-spin"></i
          ></span>
          <span v-else><i class="fas fa-trash"></i> Delete</span>
        </button>
        <button
          v-if="selectedInfo.event.extendedProps?.status === 'CANCELLED_BY_MEDIC' || selectedInfo.event.extendedProps?.status === 'CANCELLED_BY_PATIENT'"
          type="button"
          class="context-menu-item btn btn-outline-danger"
          @click.stop="handleDeleteCancelledAppointment"
          :disabled="isProcessingAction === 'delete'"
        >
          <i class="fas fa-trash"></i> Delete Appointment
        </button>
      </template>
      <button
        type="button"
        class="btn btn-sm btn-cancel"
        @click.stop="clearSelection"
        :disabled="isProcessingAction"
      >
        <i class="fas fa-times"></i> Clear
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
        </form>
      </div>
    </div>

    <!-- Appointment Form Modal Integration -->
    <AppointmentFormModal
      v-if="showAppointmentModal"
      :start-time="appointmentModalData?.start"
      :end-time="appointmentModalData?.end"
      :appointment-data="appointmentModalData?.existingAppointment"
      @close="closeAppointmentModal"
      @save="handleAppointmentSave"
    />

    <!-- Cancel Appointment Modal Integration -->
    <CancelAppointmentModal
      v-if="showCancelModal"
      :appointment-id="cancelModalData?.appointmentId"
      :appointment-title="cancelModalData?.appointmentTitle"
      :isDeleting="isDeletingAppointment"
      :status="cancelModalData?.status"
      @close="closeCancelModal"
      @cancelled="handleAppointmentCancelled"
      @delete="handleAppointmentDelete"
    />

    <!-- Medic Working Hours Modal -->
    <MedicWorkingHoursModal 
      v-if="showWorkingHoursModal"
      @close="closeWorkingHoursModal"
      @saved="handleWorkingHoursSaved"
    />

    <!-- Vacation Days Modal -->
    <VacationDaysModal
      v-if="showVacationDaysModal"
      @close="closeVacationDaysModal"
      @saved="handleVacationDaysSaved"
    />

    <!-- Extra Work Days Modal -->
    <ExtraWorkDaysModal
      v-if="showExtraWorkDaysModal"
      @close="closeExtraWorkDaysModal"
      @saved="handleExtraWorkDaysSaved"
    />

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
import AppointmentFormModal from "@/components/AppointmentFormModal.vue";
import CancelAppointmentModal from "@/components/CancelAppointmentModal.vue"; // Import Cancel Modal
import MedicWorkingHoursModal from "@/components/MedicWorkingHoursModal.vue"; // Import the new modal
import VacationDaysModal from "@/components/VacationDaysModal.vue";
import ExtraWorkDaysModal from "@/components/ExtraWorkDaysModal.vue";

const toast = useToast();
const fullCalendar = ref(null);

// --- State ---
const isLoading = ref(true);
const loadError = ref("");
const selectedInfo = ref(null);
const contextMenuStyle = reactive({ display: "none", left: "0px", top: "0px" });
const isProcessingAction = ref(false);
// Drag and Drop State
const isDragging = ref(false);
const dragError = ref("");
// Block Modal State
const showBlockModal = ref(false);
const blockReason = ref("");
const blockTimeData = ref(null);
// Appointment Modal State
const showAppointmentModal = ref(false);
const appointmentModalData = ref(null);
// Cancel Appointment Modal State
const showCancelModal = ref(false);
const cancelModalData = ref(null);
const isDeletingAppointment = ref(false);
// Working Hours Modal State
const showWorkingHoursModal = ref(false);
const medicBusinessHours = ref([]); // To store fetched business hours
// Vacation Days Modal State
const showVacationDaysModal = ref(false);
// Extra Work Days Modal State
const showExtraWorkDaysModal = ref(false);

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
  editable: true,
  selectable: true,
  selectMirror: true,
  nowIndicator: true,
  slotMinTime: "07:00:00",
  slotMaxTime: "19:00:00",
  slotDuration: "00:15:00",
  snapDuration: "00:15:00",
  allDaySlot: false,
  weekends: true,
  timeZone: "Europe/Bucharest",
  eventTimeFormat: { hour: "numeric", minute: "2-digit", meridiem: "short" },
  slotLabelFormat: {
    hour: "numeric",
    minute: "2-digit",
    omitZeroMinute: false,
    meridiem: "short",
  },
  datesSet: handleDatesSet,
  select: handleDateSelect,
  unselect: handleUnselect,
  eventClick: handleEventClick,
  eventDidMount: handleEventMount,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventDragStart: handleEventDragStart,
  eventDragStop: handleEventDragStop,
  eventSources: [{ id: "medicEvents", events: fetchCalendarEvents }],
  eventColor: "#3498DB",
  businessHours: computed(() => medicBusinessHours.value) // Use a computed ref for reactivity
});

async function handleContextMenuAction(action) {
  if (!selectedInfo.value) return;

  const event = selectedInfo.value.event;
  const appointmentIdStr = event?.id?.startsWith('appt-') ? event.id.substring(5) : event?.id;
  const appointmentId = parseInt(appointmentIdStr, 10);

  switch (action) {
    case 'cancel':
      cancelModalData.value = {
        appointmentId: appointmentId,
        appointmentTitle: event.title
      };
      showCancelModal.value = true;
      break;
    case 'delete':
      if (!appointmentId || isNaN(appointmentId)) {
        toast.error("Invalid appointment ID.");
        break;
      }
      if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        break;
      }
      isProcessingAction.value = 'delete';
      try {
        await MedicService.deleteAppointment(appointmentId);
        toast.success('Appointment deleted successfully');
        if (fullCalendar.value) fullCalendar.value.getApi().refetchEvents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete appointment');
      } finally {
        isProcessingAction.value = false;
        clearSelection();
      }
      break;
    // ... other cases ...
  }

  contextMenuStyle.display = 'none';
  selectedInfo.value = null;
}

// --- Fetching Logic ---
let currentFetchController = null;
async function fetchCalendarEvents(fetchInfo, successCallback, failureCallback) {
  isLoading.value = true;
  loadError.value = "";
  if (currentFetchController) {
    currentFetchController.abort();
  }
  currentFetchController = new AbortController();
  const signal = currentFetchController.signal;
  const startDate = fetchInfo.start;
  const endDate = fetchInfo.end;

  try {
    const response = await MedicService.getCalendarEvents(startDate, endDate);

    if (signal.aborted) {
      return;
    }

    const mappedEvents = response.data.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      color: event.color,
      backgroundColor: event.color,
      borderColor: event.color ? darkenColor(event.color, 15) : "#2980B9",
      // Drag and drop configuration
      editable: isEventEditable(event),
      startEditable: isEventEditable(event),
      durationEditable: isEventResizable(event),
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
    successCallback(mappedEvents);
  } catch (error) {
    if (signal.aborted) {
      return;
    }
    const message = error.response?.data?.message || "Failed to load schedule.";
    loadError.value = message;
    toast.error(message);
    failureCallback(error);
  } finally {
    if (!signal.aborted) {
      isLoading.value = false;
    }
  }
}

function darkenColor(hex, percent) { 
  // This is a placeholder. Replace with your actual color darkening logic.
  // console.warn("darkenColor placeholder in use");
  return hex; 
}

// --- Drag and Drop Helper Functions ---
function isEventEditable(event) {
  const eventType = event.type;
  const eventStatus = event.status;
  
  // Allow dragging for:
  // 1. Time blocks
  // 2. Scheduled appointments
  // 3. Pending vacation/extra work days
  switch (eventType) {
    case 'block':
      return true;
    case 'appointment':
      return eventStatus === 'SCHEDULED';
    case 'vacation':
    case 'extrawork':
      return eventStatus === 'PENDING';
    case 'holiday':
    default:
      return false;
  }
}

function isEventResizable(event) {
  const eventType = event.type;
  const eventStatus = event.status;
  
  // Allow resizing for:
  // 1. Time blocks
  // 2. Scheduled appointments (with caution)
  switch (eventType) {
    case 'block':
      return true;
    case 'appointment':
      return eventStatus === 'SCHEDULED';
    case 'vacation':
    case 'extrawork':
    case 'holiday':
    default:
      return false;
  }
}

// --- Calendar Callbacks ---
function handleDatesSet(dateInfo) { console.log("View/Dates Changed:", dateInfo.view.type); clearSelection(); }
function handleDateSelect(selectionInfo) { if (selectedInfo.value?.event) selectedInfo.value = null; selectedInfo.value = { start: selectionInfo.start, end: selectionInfo.end, jsEvent: selectionInfo.jsEvent }; positionContextMenu(selectionInfo.jsEvent); }
function handleUnselect() { console.log("Unselect Callback Triggered"); if (contextMenuStyle.display === 'block' && !selectedInfo.value && !showBlockModal.value && !showAppointmentModal.value && !showCancelModal.value) { contextMenuStyle.display = 'none'; } }
function handleEventClick(clickInfo) { if (fullCalendar.value) fullCalendar.value.getApi().unselect(); selectedInfo.value = { event: clickInfo.event, jsEvent: clickInfo.jsEvent }; positionContextMenu(clickInfo.jsEvent); }
function handleEventMount(info) { 
  // Add tooltip with notes if available
  if (info.event.extendedProps.notes) { 
    info.el.setAttribute("title", `Notes: ${info.event.extendedProps.notes}`); 
  } 
  
  // Add classes based on event type
  const eventType = info.event.extendedProps.type;
  
  if(eventType === 'block') { 
    info.el.classList.add('fc-event-block'); 
  } else if (eventType === 'appointment') { 
    info.el.classList.add('fc-event-appointment'); 
    if(info.event.extendedProps.status) { 
      info.el.classList.add(`fc-event-status-${info.event.extendedProps.status.toLowerCase()}`); 
    } 
  } else if (eventType === 'vacation') {
    info.el.classList.add('fc-event-vacation');
    info.el.setAttribute('data-type', 'vacation');
    if(info.event.extendedProps.status) {
      info.el.classList.add(`fc-event-status-${info.event.extendedProps.status.toLowerCase()}`);
      // Add status indicator to title
      const statusText = info.event.extendedProps.status === 'PENDING' ? ' (Pending Approval)' : '';
      if (statusText && !info.el.getAttribute("title")) {
        info.el.setAttribute("title", `Vacation Day${statusText}`);
      }
    }
  } else if (eventType === 'extrawork') {
    info.el.classList.add('fc-event-extrawork');
    info.el.setAttribute('data-type', 'extrawork');
    if(info.event.extendedProps.status) {
      info.el.classList.add(`fc-event-status-${info.event.extendedProps.status.toLowerCase()}`);
      // Add status indicator to title
      const statusText = info.event.extendedProps.status === 'PENDING' ? ' (Pending Approval)' : '';
      if (statusText && !info.el.getAttribute("title")) {
        info.el.setAttribute("title", `Extra Work Day${statusText}`);
      }
    }
  } else if (eventType === 'holiday') {
    info.el.classList.add('fc-event-holiday');
    info.el.setAttribute('data-type', 'holiday');
    if (!info.el.getAttribute("title")) {
      info.el.setAttribute("title", `Company Holiday: ${info.event.title}`);
    }
  }
}
function handleRetryFetch() { if (fullCalendar.value) { fullCalendar.value.getApi().refetchEvents(); } }

// --- Drag and Drop Event Handlers ---
function handleEventDragStart(info) {
  isDragging.value = true;
  dragError.value = "";
  clearSelection(); // Clear any existing selection when starting to drag
}

function handleEventDragStop(info) {
  isDragging.value = false;
}

async function handleEventDrop(info) {
  const event = info.event;
  const delta = info.delta;
  const revert = info.revert;
  
  // Clear any drag error from previous operations
  dragError.value = "";
  
  try {
    const eventType = event.extendedProps?.type;
    const eventStatus = event.extendedProps?.status;
    
    // Validate the drop operation
    if (!isEventEditable({ type: eventType, status: eventStatus })) {
      revert();
      toast.error("This event cannot be moved.");
      return;
    }
    
    // Show loading state
    isDragging.value = true;
    
    // Handle different event types
    switch (eventType) {
      case 'appointment':
        await handleAppointmentDrop(event, info);
        break;
      case 'block':
        await handleTimeBlockDrop(event, info);
        break;
      case 'vacation':
        await handleVacationDayDrop(event, info);
        break;
      case 'extrawork':
        await handleExtraWorkDayDrop(event, info);
        break;
      default:
        revert();
        toast.error("This event type cannot be moved.");
        return;
    }
    
    toast.success("Event moved successfully.");
    
  } catch (error) {
    console.error("Failed to move event:", error);
    revert();
    const errorMessage = error.response?.data?.message || "Failed to move event. Please try again.";
    toast.error(errorMessage);
    dragError.value = errorMessage;
  } finally {
    isDragging.value = false;
  }
}

async function handleEventResize(info) {
  const event = info.event;
  const revert = info.revert;
  
  // Clear any drag error from previous operations
  dragError.value = "";
  
  try {
    const eventType = event.extendedProps?.type;
    const eventStatus = event.extendedProps?.status;
    
    // Validate the resize operation
    if (!isEventResizable({ type: eventType, status: eventStatus })) {
      revert();
      toast.error("This event cannot be resized.");
      return;
    }
    
    // Show loading state
    isDragging.value = true;
    
    // Handle different event types
    switch (eventType) {
      case 'appointment':
        await handleAppointmentResize(event, info);
        break;
      case 'block':
        await handleTimeBlockResize(event, info);
        break;
      default:
        revert();
        toast.error("This event type cannot be resized.");
        return;
    }
    
    toast.success("Event resized successfully.");
    
  } catch (error) {
    console.error("Failed to resize event:", error);
    revert();
    const errorMessage = error.response?.data?.message || "Failed to resize event. Please try again.";
    toast.error(errorMessage);
    dragError.value = errorMessage;
  } finally {
    isDragging.value = false;
  }
}

// Specific event type handlers
async function handleAppointmentDrop(event, info) {
  const appointmentIdStr = event.id.startsWith('appt-') ? event.id.substring(5) : event.id;
  const appointmentId = parseInt(appointmentIdStr, 10);
  
  if (!appointmentId || isNaN(appointmentId)) {
    throw new Error("Invalid appointment ID");
  }
  
  const updateData = {
    startTime: event.start.toISOString(),
    endTime: event.end.toISOString()
  };
  
  await MedicService.updateAppointmentTime(appointmentId, updateData);
}

async function handleAppointmentResize(event, info) {
  const appointmentIdStr = event.id.startsWith('appt-') ? event.id.substring(5) : event.id;
  const appointmentId = parseInt(appointmentIdStr, 10);
  
  if (!appointmentId || isNaN(appointmentId)) {
    throw new Error("Invalid appointment ID");
  }
  
  const updateData = {
    startTime: event.start.toISOString(),
    endTime: event.end.toISOString()
  };
  
  await MedicService.updateAppointmentTime(appointmentId, updateData);
}

async function handleTimeBlockDrop(event, info) {
  const blockIdStr = event.id.startsWith('block-') ? event.id.substring(6) : event.id;
  const blockId = parseInt(blockIdStr, 10);
  
  if (!blockId || isNaN(blockId)) {
    throw new Error("Invalid block ID");
  }
  
  const updateData = {
    startTime: event.start.toISOString(),
    endTime: event.end.toISOString(),
    reason: event.title || "Blocked"
  };
  
  await MedicService.updateTimeBlock(blockId, updateData);
}

async function handleTimeBlockResize(event, info) {
  const blockIdStr = event.id.startsWith('block-') ? event.id.substring(6) : event.id;
  const blockId = parseInt(blockIdStr, 10);
  
  if (!blockId || isNaN(blockId)) {
    throw new Error("Invalid block ID");
  }
  
  const updateData = {
    startTime: event.start.toISOString(),
    endTime: event.end.toISOString(),
    reason: event.title || "Blocked"
  };
  
  await MedicService.updateTimeBlock(blockId, updateData);
}

async function handleVacationDayDrop(event, info) {
  const vacationIdStr = event.id.startsWith('vacation-') ? event.id.substring(9) : event.id;
  const vacationId = parseInt(vacationIdStr, 10);
  
  if (!vacationId || isNaN(vacationId)) {
    throw new Error("Invalid vacation day ID");
  }
  
  const updateData = {
    startDate: event.start.toISOString().split('T')[0], // Get just the date part
    endDate: event.end ? event.end.toISOString().split('T')[0] : event.start.toISOString().split('T')[0]
  };
  
  await MedicService.updateVacationDay(vacationId, updateData);
}

async function handleExtraWorkDayDrop(event, info) {
  const extraWorkIdStr = event.id.startsWith('extrawork-') ? event.id.substring(10) : event.id;
  const extraWorkId = parseInt(extraWorkIdStr, 10);
  
  if (!extraWorkId || isNaN(extraWorkId)) {
    throw new Error("Invalid extra work day ID");
  }
  
  const updateData = {
    date: event.start.toISOString().split('T')[0], // Get just the date part
    startTime: event.start.toISOString(),
    endTime: event.end.toISOString()
  };
  
  await MedicService.updateExtraWorkDay(extraWorkId, updateData);
}

// --- Action Menu & Modal Logic ---
function positionContextMenu(jsEvent) { nextTick(() => { const menu = document.querySelector(".context-menu"); if (!menu) return; const clickX = jsEvent.clientX; const clickY = jsEvent.clientY; let top = clickY + 5; let left = clickX + 5; const menuRect = menu.getBoundingClientRect(); const windowHeight = window.innerHeight; const windowWidth = window.innerWidth; if (top + menuRect.height > windowHeight) top = clickY - menuRect.height - 5; if (left + menuRect.width > windowWidth) left = clickX - menuRect.width - 5; contextMenuStyle.left = `${Math.max(5, left)}px`; contextMenuStyle.top = `${Math.max(5, top)}px`; contextMenuStyle.display = "block"; }); }
function clearSelection() { selectedInfo.value = null; contextMenuStyle.display = 'none'; if (fullCalendar.value?.getApi) { try { fullCalendar.value.getApi().unselect(); } catch (e) {} } }
function closeBlockModal() { showBlockModal.value = false; blockTimeData.value = null; }
function closeAppointmentModal() { showAppointmentModal.value = false; appointmentModalData.value = null; }
function closeCancelModal() { showCancelModal.value = false; cancelModalData.value = null; }
function formatSelectionTime(selection) { if (!selection || !selection.start || !selection.end) return ""; const options = { timeZone: 'Europe/Bucharest', hour: "numeric", minute: "2-digit", hour12: true }; try { const start = selection.start.toLocaleTimeString(undefined, options); const end = selection.end.toLocaleTimeString(undefined, options); return `${start} - ${end}`; } catch(e) { return "Error formatting time"; } }
function formatModalTime(date) { if (!date) return ""; const options = { timeZone: 'Europe/Bucharest', hour: "numeric", minute: "2-digit", hour12: true }; try { return date.toLocaleTimeString(undefined, options); } catch (e) { return "Invalid Date"; } }

// --- Context Menu Actions ---
function actionCreateAppointment() { if (!selectedInfo.value || selectedInfo.value.event) return; appointmentModalData.value = { start: selectedInfo.value.start, end: selectedInfo.value.end, existingAppointment: null }; showAppointmentModal.value = true; contextMenuStyle.display = 'none'; }
function actionEditAppointment() { const eventInfo = selectedInfo.value?.event; if (!eventInfo || eventInfo.extendedProps?.type !== 'appointment') return; appointmentModalData.value = { start: eventInfo.start, end: eventInfo.end, existingAppointment: eventInfo }; showAppointmentModal.value = true; clearSelection(); }

function actionCancelAppointment() {
  const eventInfo = selectedInfo.value?.event;
  if (!eventInfo || eventInfo.extendedProps?.type !== 'appointment' || eventInfo.extendedProps?.status !== 'SCHEDULED') { clearSelection(); return; }
  const appointmentIdStr = eventInfo.id.startsWith('appt-') ? eventInfo.id.substring(5) : eventInfo.id;
  const appointmentId = parseInt(appointmentIdStr, 10);
  if (!appointmentId || isNaN(appointmentId)) { toast.error("Invalid appointment ID."); clearSelection(); return; }
  cancelModalData.value = { appointmentId: appointmentId, appointmentTitle: eventInfo.title };
  showCancelModal.value = true;
  contextMenuStyle.display = 'none';
}

function actionBlockTime() { if (!selectedInfo.value || selectedInfo.value.event) return; blockTimeData.value = { startTime: selectedInfo.value.start, endTime: selectedInfo.value.end }; blockReason.value = ''; showBlockModal.value = true; contextMenuStyle.display = 'none'; }
async function handleBlockTimeSave() { if (!blockTimeData.value || isProcessingAction.value === 'block') return; const blockData = { startTime: blockTimeData.value.startTime.toISOString(), endTime: blockTimeData.value.endTime.toISOString(), reason: blockReason.value.trim() || "Blocked" }; isProcessingAction.value = 'block'; try { await MedicService.createTimeBlock(blockData); toast.success("Time blocked."); closeBlockModal(); clearSelection(); fullCalendar.value?.getApi().refetchEvents(); } catch (error) { toast.error(error.response?.data?.message || "Failed."); } finally { isProcessingAction.value = false; } }
async function actionMarkAvailable() { const eventInfo = selectedInfo.value?.event; if (!eventInfo || eventInfo.extendedProps?.type !== 'block') return; const blockIdStr = eventInfo.id.startsWith('block-') ? eventInfo.id.substring(6) : eventInfo.id; const blockId = parseInt(blockIdStr, 10); if (!blockId || isNaN(blockId)) { toast.error("Invalid block ID."); clearSelection(); return; } if (!confirm(`Delete block "${eventInfo.title}"?`)) { clearSelection(); return; } isProcessingAction.value = 'deleteBlock'; try { await MedicService.deleteTimeBlock(blockId); toast.success("Block removed."); clearSelection(); fullCalendar.value?.getApi().refetchEvents(); } catch (error) { toast.error(error.response?.data?.message || "Failed delete."); } finally { isProcessingAction.value = false; } }
async function actionDeleteBlockAlternative() { await actionMarkAvailable(); }

// --- Modal Event Handlers ---
function handleAppointmentSave() { console.log("Appt saved. Refetching."); clearSelection(); if (fullCalendar.value) { fullCalendar.value.getApi().refetchEvents(); } }
function handleAppointmentCancelled() { console.log("Appt cancelled. Refetching."); clearSelection(); if (fullCalendar.value) { fullCalendar.value.getApi().refetchEvents(); } }
async function handleAppointmentDelete() {
  const appointmentId = cancelModalData.value?.appointmentId;
  if (!appointmentId) return;
  isDeletingAppointment.value = true;
  try {
    await MedicService.deleteAppointment(appointmentId);
    toast.success('Appointment deleted successfully');
    closeCancelModal();
    if (fullCalendar.value) fullCalendar.value.getApi().refetchEvents();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete appointment');
  } finally {
    isDeletingAppointment.value = false;
  }
}

// Add this handler in <script setup>
async function handleDeleteCancelledAppointment() {
    const event = selectedInfo.value?.event;
    if (!event) return;
    const appointmentIdStr = event.id.startsWith('appt-') ? event.id.substring(5) : event.id;
    const appointmentId = parseInt(appointmentIdStr, 10);
    if (!appointmentId || isNaN(appointmentId)) {
        toast.error("Invalid appointment ID.");
        return;
    }
    isProcessingAction.value = 'delete';
    try {
        await MedicService.deleteAppointment(appointmentId);
        toast.success('Canceled appointment deleted successfully');
        clearSelection();
        if (fullCalendar.value) fullCalendar.value.getApi().refetchEvents();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete appointment');
    } finally {
        isProcessingAction.value = false;
    }
}

// --- Lifecycle ---
onMounted(() => {
    fetchAndSetBusinessHours();
    // Initial event fetch is handled by eventSources in calendarOptions
});
onBeforeUnmount(() => { if (currentFetchController) { currentFetchController.abort(); } });

// --- Working Hours Modal Logic ---
function openWorkingHoursModal() {
    showWorkingHoursModal.value = true;
}

function closeWorkingHoursModal() {
    showWorkingHoursModal.value = false;
}

function handleWorkingHoursSaved() {
    closeWorkingHoursModal();
    toast.info('Working hours updated. Calendar display will reflect changes.');
    fetchAndSetBusinessHours(); // Refetch and update business hours
}

async function fetchAndSetBusinessHours() {
  // It's good practice to also manage a loading state for this,
  // or ensure it doesn't interfere with the main `isLoading` if they are separate concerns.
  // For now, let's assume it's quick and doesn't need its own visible loading state.
  try {
    const response = await MedicService.getMyWorkingHours();
    const rawHours = response.data; // Assuming this is an array of { dayOfWeek, startTime, endTime }

    medicBusinessHours.value = rawHours.map(wh => ({
      daysOfWeek: [convertDayOfWeekToFCCalo(wh.dayOfWeek)], // FullCalendar expects an array
      startTime: wh.startTime, // e.g., "09:00"
      endTime: wh.endTime,     // e.g., "17:00"
    }));
    // console.log("Fetched and set business hours:", JSON.stringify(medicBusinessHours.value));
    // If FullCalendar is already initialized, you might need to tell it to re-render or update options
    // However, since businessHours is a computed ref in calendarOptions, Vue's reactivity should handle it.
  } catch (error) {
    console.error("Failed to fetch or set business hours:", error);
    toast.error("Could not load working hours. Calendar may not display them correctly.");
    medicBusinessHours.value = []; // Clear or set to default on error
  }
}

function convertDayOfWeekToFCCalo(dayOfWeek) {
  // Java DayOfWeek (MONDAY=1, ..., SUNDAY=7) to FullCalendar (Sunday=0, Monday=1, ..., Saturday=6)
  const mapping = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 0,
  };
  return mapping[dayOfWeek] !== undefined ? mapping[dayOfWeek] : -1; // Return -1 or handle error for unknown
}

async function actionMarkCompleted() {
  const eventInfo = selectedInfo.value?.event;
  if (!eventInfo || eventInfo.extendedProps?.type !== 'appointment' || eventInfo.extendedProps?.status !== 'SCHEDULED') {
    clearSelection();
    return;
  }
  
  const appointmentIdStr = eventInfo.id.startsWith('appt-') ? eventInfo.id.substring(5) : eventInfo.id;
  const appointmentId = parseInt(appointmentIdStr, 10);
  
  if (!appointmentId || isNaN(appointmentId)) {
    toast.error("Invalid appointment ID.");
    clearSelection();
    return;
  }
  
  if (!confirm(`Mark appointment "${eventInfo.title}" as completed? This will trigger a feedback request notification to the patient.`)) {
    clearSelection();
    return;
  }
  
  isProcessingAction.value = 'markCompleted';
  try {
    await MedicService.markAppointmentCompleted(appointmentId);
    toast.success("Appointment marked as completed. Patient will be notified to leave feedback.");
    clearSelection();
    fullCalendar.value?.getApi().refetchEvents();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to mark appointment as completed.");
  } finally {
    isProcessingAction.value = false;
  }
}

// --- Vacation Days Modal Logic ---
function openVacationDaysModal() {
    showVacationDaysModal.value = true;
}

function closeVacationDaysModal() {
    showVacationDaysModal.value = false;
}

function handleVacationDaysSaved() {
    closeVacationDaysModal();
    toast.success('Vacation days updated successfully.');
    if (fullCalendar.value) fullCalendar.value.getApi().refetchEvents();
}

// --- Extra Work Days Modal Logic ---
function openExtraWorkDaysModal() {
    showExtraWorkDaysModal.value = true;
}

function closeExtraWorkDaysModal() {
    showExtraWorkDaysModal.value = false;
}

function handleExtraWorkDaysSaved() {
    closeExtraWorkDaysModal();
    toast.success('Extra work days updated successfully.');
    if (fullCalendar.value) fullCalendar.value.getApi().refetchEvents();
}
</script>

<style scoped>
    /* Styles remain the same as the previous full file */
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; position: relative; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; }
    h1 { color: var(--dark-color); }
    .loading-overlay { position: absolute; inset: 0; background-color: rgba(255, 255, 255, 0.7); display: flex; justify-content: center; align-items: center; z-index: 10; border-radius: var(--border-radius-large); }
    .loading-indicator { text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
    .loading-indicator i { font-size: 1.5rem; animation: fa-spin 1.5s linear infinite; color: var(--primary-color-start);}
    .dragging-overlay { position: absolute; inset: 0; background-color: rgba(52, 152, 219, 0.1); display: flex; justify-content: center; align-items: center; z-index: 15; border-radius: var(--border-radius-large); pointer-events: none; }
    .dragging-indicator { text-align: center; padding: 2rem 1rem; color: var(--primary-color-start); font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; font-weight: 600; background-color: rgba(255, 255, 255, 0.9); border-radius: var(--border-radius); box-shadow: var(--shadow-light); padding: 1rem 2rem; }
    .dragging-indicator i { font-size: 1.3rem; animation: fa-spin 2s linear infinite; color: var(--primary-color-start); }
    .error-message.full-page-error { margin: 2rem auto; padding: 1.5rem; text-align: center; max-width: 600px; }
    .retry-button { margin-left: 1rem;}
    .calendar-component { min-height: 75vh; background-color: #fff; padding: 1rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); opacity: 1; transition: opacity 0.3s ease; }
    .calendar-component.load-error { opacity: 0.5; }
    .context-menu { position: fixed; z-index: 1020; background-color: var(--white-color); border-radius: var(--border-radius); box-shadow: var(--shadow-medium); padding: 0.75rem; display: none; flex-direction: column; gap: 0.5rem; min-width: 180px; border: 1px solid #eee; }
    .context-menu-header { font-size: 0.9rem; font-weight: 600; color: var(--text-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #eee; }
    .context-event-title { font-weight: normal; color: #6c757d; display: block; font-size: 0.85em; margin-top: 0.2rem; }
    .context-menu .btn { width: 100%; justify-content: flex-start; text-align: left; font-size: 0.9rem; padding: 0.5rem 0.8rem; }
    .context-menu .btn i { width: 20px; text-align: center; margin-right: 0.6rem; }
    .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; padding: 1rem; }
    .modal-content { background-color: #fff; padding: 2rem 2.5rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-dark); position: relative; width: 90%; max-width: 450px; max-height: 90vh; display: flex; flex-direction: column; }
    .block-modal-content { /* keep size */ }
    .appointment-modal-content { max-width: 600px; }
    .cancel-appointment-modal-content { max-width: 500px; }
    .modal-close-button { position: absolute; top: 0.5rem; right: 0.8rem; font-size: 2rem; font-weight: bold; color: #aaa; background: none; border: none; cursor: pointer; line-height: 1; padding: 0.2rem 0.5rem; }
    .modal-close-button:hover { color: #777; }
    .modal-content h2 { color: var(--dark-color); margin-top: 0; margin-bottom: 0.5rem; font-size: 1.4rem; text-align: center; flex-shrink: 0;}
    .modal-content > p { text-align: center; color: var(--text-color); margin-bottom: 1.5rem; font-size: 0.95rem; flex-shrink: 0;}
    .modal-form { overflow-y: auto; padding-right: 5px; flex-grow: 1; }
    .modal-form .form-group { margin-bottom: 1.5rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; flex-shrink: 0;}
    .modal-error { margin-top: 1rem; margin-bottom: 0; }
    .modal-form .form-label { display: block; margin-bottom: 0.6rem; font-weight: 600; font-size: 0.95rem; }
    :deep(.fc-event) { cursor: pointer; font-size: 0.8rem; border: none !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    :deep(.fc-event-main) { padding: 3px 5px; }
    :deep(.fc-event-time) { font-weight: 600; }
    :deep(.fc-v-event .fc-event-main) { white-space: normal; }
    :deep(.fc-event-block) { background-color: #adb5bd !important; border-color: #6c757d !important; color: #fff !important; }
    :deep(.fc-event-appointment.fc-event-status-completed) { background-color: #d1e7dd !important; border-color: #a3cfbb !important; color: #0f5132 !important; }
    :deep(.fc-event-appointment.fc-event-status-cancelled_by_medic), :deep(.fc-event-appointment.fc-event-status-cancelled_by_patient) { background-color: #f8d7da !important; border-color: #f1aeB5 !important; color: #842029 !important; text-decoration: line-through; }
    :deep(.fc-event-appointment.fc-event-status-no_show) { background-color: #fff3cd !important; border-color: #ffe69c !important; color: #664d03 !important; }
    :deep(.fc-event-appointment) { background-color: #cfe2ff !important; border-color: #a9c7fe !important; color: #052c65 !important; }
    
    /* Vacation Events */
    :deep(.fc-event[data-type="vacation"]) { 
      border-radius: 6px !important; 
      font-weight: 600 !important;
    }
    
    :deep(.fc-event-vacation.fc-event-status-pending) {
      background-color: #fff3cd !important;
      border-color: #ffc107 !important;
      color: #856404 !important;
    }
    
    :deep(.fc-event-vacation.fc-event-status-approved) {
      background-color: #f8d7da !important;
      border-color: #dc3545 !important;
      color: #721c24 !important;
    }
    
    /* Extra Work Events */
    :deep(.fc-event[data-type="extrawork"]) { 
      border-radius: 6px !important; 
      font-weight: 600 !important;
    }
    
    :deep(.fc-event-extrawork.fc-event-status-pending) {
      background-color: #d1ecf1 !important;
      border-color: #17a2b8 !important;
      color: #0c5460 !important;
    }
    
    :deep(.fc-event-extrawork.fc-event-status-approved) {
      background-color: #d1e7dd !important;
      border-color: #28a745 !important;
      color: #155724 !important;
    }
    
    /* Holiday Events */
    :deep(.fc-event[data-type="holiday"]) { 
      border-radius: 6px !important; 
      font-weight: 600 !important;
      background-color: #6f42c1 !important;
      border-color: #6f42c1 !important;
      color: #ffffff !important;
    }
    
    :deep(.fc-event-holiday) {
      background-color: #6f42c1 !important;
      border-color: #6f42c1 !important;
      color: #ffffff !important;
      font-weight: 600 !important;
      border-radius: 6px !important;
    }
    
    :deep(.fc-event:hover) { opacity: 0.85; }

    /* Drag and Drop Styles */
    :deep(.fc-event.fc-event-draggable) { cursor: move; transition: all 0.2s ease; }
    :deep(.fc-event.fc-event-draggable:hover) { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); opacity: 0.9; }
    :deep(.fc-event.fc-event-resizable) { cursor: ew-resize; }
    :deep(.fc-event.fc-event-dragging) { opacity: 0.7; transform: scale(0.95); }
    :deep(.fc-event.fc-event-mirror) { opacity: 0.8; z-index: 999; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
    
    /* Resize handle styles */
    :deep(.fc-event .fc-event-resizer) { background-color: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.2); }
    :deep(.fc-event:hover .fc-event-resizer) { background-color: rgba(255,255,255,1); }
    
    /* Non-draggable events should show default cursor */
    :deep(.fc-event:not(.fc-event-draggable)) { cursor: pointer; }

    .fa-spinner { animation: fa-spin 1.5s linear infinite; }
    @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .context-menu {
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
    }

    .context-menu-item {
        display: block;
        width: 100%;
        padding: 8px 16px;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;
        white-space: nowrap;
    }

    .context-menu-item:hover {
        background-color: #f5f5f5;
    }

    .context-menu-item:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .context-menu-item i {
        margin-right: 8px;
        width: 16px;
    }

    .btn-outline-danger {
      color: #dc3545;
      background: transparent;
      border: 1.5px solid #dc3545;
      transition: background 0.2s, color 0.2s;
    }
    .btn-outline-danger:hover,
    .btn-outline-danger:focus {
      background: #dc3545;
      color: #fff;
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

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .header-actions .btn {
      font-size: 0.9rem;
      padding: 0.6rem 1rem;
    }
</style>