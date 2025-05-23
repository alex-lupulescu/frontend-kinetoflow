<template>
    <div class="modal-overlay" @click.self="closeModal">
        <div class="modal-content working-hours-modal-content">
            <button @click="closeModal" class="modal-close-button" title="Close">×</button>
            <h2>Set Your Working Hours</h2>

            <div v-if="isLoading" class="loading-indicator modal-loading">
                <i class="fas fa-spinner fa-spin"></i> Loading working hours...
            </div>

            <div v-if="loadError" class="error-message modal-error">
                {{ loadError }}
            </div>

            <form @submit.prevent="saveWorkingHours" class="modal-form" v-if="!isLoading && !loadError">
                <div v-for="dayConfig in workingHoursForm" :key="dayConfig.dayOfWeek" class="day-config-row">
                    <div class="day-label">
                        <input type="checkbox" v-model="dayConfig.isWorkingDay" :id="`working-${dayConfig.dayOfWeek}`" />
                        <label :for="`working-${dayConfig.dayOfWeek}`">{{ formatDayOfWeek(dayConfig.dayOfWeek) }}</label>
                    </div>
                    <div class="time-inputs" :class="{ disabled: !dayConfig.isWorkingDay }">
                        <input type="time" v-model="dayConfig.startTime" :disabled="!dayConfig.isWorkingDay" required />
                        <span>to</span>
                        <input type="time" v-model="dayConfig.endTime" :disabled="!dayConfig.isWorkingDay" required />
                    </div>
                </div>

                <div v-if="saveError" class="error-message modal-error">
                    {{ saveError }}
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeModal" class="btn btn-cancel" :disabled="isSaving">Cancel</button>
                    <button type="submit" class="btn btn-primary" :disabled="isSaving || !isFormValid">
                        <span v-if="isSaving"><i class="fas fa-spinner fa-spin"></i> Saving...</span>
                        <span v-else>Save Working Hours</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import MedicService from '@/services/MedicService'; // Assuming this path

const emit = defineEmits(['close', 'saved']);
const toast = useToast();

const isLoading = ref(true);
const loadError = ref('');
const isSaving = ref(false);
const saveError = ref('');

// Represents the form state for each day
const workingHoursForm = reactive([
    { dayOfWeek: 'MONDAY',    startTime: '09:00', endTime: '17:00', isWorkingDay: true },
    { dayOfWeek: 'TUESDAY',   startTime: '09:00', endTime: '17:00', isWorkingDay: true },
    { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isWorkingDay: true },
    { dayOfWeek: 'THURSDAY',  startTime: '09:00', endTime: '17:00', isWorkingDay: true },
    { dayOfWeek: 'FRIDAY',    startTime: '09:00', endTime: '17:00', isWorkingDay: true },
    { dayOfWeek: 'SATURDAY',  startTime: '10:00', endTime: '14:00', isWorkingDay: false },
    { dayOfWeek: 'SUNDAY',    startTime: '10:00', endTime: '14:00', isWorkingDay: false },
]);

const daysOfWeekOrdered = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

async function fetchWorkingHours() {
    isLoading.value = true;
    loadError.value = '';
    try {
        const response = await MedicService.getMyWorkingHours(); // API method to be created
        const fetchedHours = response.data;
        
        daysOfWeekOrdered.forEach(dayName => {
            const formEntry = workingHoursForm.find(d => d.dayOfWeek === dayName);
            const fetchedEntry = fetchedHours.find(h => h.dayOfWeek === dayName);
            if (formEntry) {
                if (fetchedEntry) {
                    formEntry.startTime = fetchedEntry.startTime;
                    formEntry.endTime = fetchedEntry.endTime;
                    formEntry.isWorkingDay = true;
                } else {
                    formEntry.isWorkingDay = false; // If not fetched, assume not a working day
                }
            }
        });
    } catch (error) {
        console.error("Error fetching working hours:", error);
        loadError.value = error.response?.data?.message || 'Failed to load working hours.';
        toast.error(loadError.value);
    } finally {
        isLoading.value = false;
    }
}

async function saveWorkingHours() {
    isSaving.value = true;
    saveError.value = '';

    const payload = workingHoursForm
        .filter(day => day.isWorkingDay)
        .map(day => ({
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
        }));

    try {
        await MedicService.setMyWorkingHours(payload); // API method to be created
        toast.success('Working hours saved successfully!');
        emit('saved');
        closeModal();
    } catch (error) {
        console.error("Error saving working hours:", error);
        saveError.value = error.response?.data?.message || 'Failed to save working hours.';
        toast.error(saveError.value);
    } finally {
        isSaving.value = false;
    }
}

const isFormValid = computed(() => {
    return workingHoursForm.every(day => {
        if (!day.isWorkingDay) return true; // Valid if not a working day
        // Basic time validation (start before end)
        return day.startTime && day.endTime && day.startTime < day.endTime;
    });
});

const closeModal = () => {
    if (isSaving.value) return;
    emit('close');
};

const formatDayOfWeek = (day) => {
    if (!day) return '';
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
};

onMounted(() => {
    fetchWorkingHours();
});

</script>

<style scoped>
.modal-overlay {
    /* ... existing modal overlay styles ... */
    position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; padding: 1rem;
}
.working-hours-modal-content {
    background-color: #fff;
    padding: 2rem 2.5rem;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-dark);
    position: relative;
    width: 90%;
    max-width: 600px; /* Adjusted width */
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}
.modal-close-button {
    /* ... existing close button styles ... */
    position: absolute; top: 0.5rem; right: 0.8rem; font-size: 2rem; font-weight: bold; color: #aaa; background: none; border: none; cursor: pointer; line-height: 1; padding: 0.2rem 0.5rem;
}
.modal-close-button:hover { color: #777; }

.modal-content h2 {
    color: var(--dark-color);
    margin-top: 0;
    margin-bottom: 1.5rem; 
    font-size: 1.4rem;
    text-align: center;
}
.modal-form {
    overflow-y: auto;
    padding-right: 5px; 
    flex-grow: 1;
}
.day-config-row {
    display: flex;
    align-items: center;
    margin-bottom: 1.2rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid #eee;
}
.day-config-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
}
.day-label {
    flex-basis: 150px; /* Increased width */
    font-weight: 600;
    display: flex;
    align-items: center;
}
.day-label input[type="checkbox"] {
    margin-right: 0.8rem;
    transform: scale(1.2);
}
.time-inputs {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}
.time-inputs.disabled input[type="time"] {
    background-color: #e9ecef;
    cursor: not-allowed;
}
.time-inputs input[type="time"] {
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: var(--border-radius);
    font-size: 0.95rem;
    width: 100px; /* Fixed width */
}
.modal-actions {
    /* ... existing modal actions styles ... */
    display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; flex-shrink: 0;
}
.loading-indicator.modal-loading {
    text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem;}
.error-message.modal-error { margin-top: 1rem; margin-bottom: 0; text-align: center; }

/* Basic button styling (ensure these classes or similar are defined globally or here) */
.btn { padding: 0.6rem 1.2rem; border-radius: var(--border-radius); cursor: pointer; font-weight: 500; font-size: 0.95rem; transition: background-color 0.2s ease, border-color 0.2s ease; }
.btn-primary { background-color: var(--primary-color-start); color: white; border: 1px solid var(--primary-color-start); }
.btn-primary:hover { background-color: var(--primary-color-end); border-color: var(--primary-color-end); }
.btn-primary:disabled { background-color: #a0aec0; border-color: #a0aec0; cursor: not-allowed; }
.btn-cancel { background-color: #e2e8f0; color: #4a5568; border: 1px solid #e2e8f0; }
.btn-cancel:hover { background-color: #cbd5e0; }
.btn-cancel:disabled { background-color: #e2e8f0; opacity: 0.7; cursor: not-allowed; }
.fa-spinner { animation: fa-spin 1.5s linear infinite; }
@keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style> 