<template>
    <div class="auth-page">
      <div class="auth-container">
         <router-link to="/" class="logo-link">
            <h1 class="logo">KinetoFlow</h1>
         </router-link>
        <h2>Accept Invitation</h2>
 
        <div v-if="isLoadingData" class="loading">Loading invitation details...</div>
        <!-- Display data fetching error -->
        <div v-if="dataError" class="error-message">{{ dataError }}</div>
 
        <div v-if="invitationDetails && !submissionSuccess && !dataError">
            <p>
                Welcome! You've been invited by <strong>{{ invitationDetails.inviterName || 'Admin' }}</strong> to join
                <strong>{{ invitationDetails.companyName }}</strong>
                as a <strong>{{ invitationDetails.role }}</strong>.
            </p>
            <p>Please set your password to activate your account.</p>
 
            <form @submit.prevent="handleAccept" class="auth-form">
              <div class="form-group">
                  <label for="name">Full Name</label>
                  <input type="text" id="name" v-model="name" required placeholder="Enter your full name">
              </div>
            <div class="form-group">
                <label for="email">Email</label>
                <!-- Use :value for read-only controlled input -->
                <input type="email" id="email" :value="invitationDetails.email" disabled readonly>
                <small>Your email address is linked to this invitation.</small>
            </div>
            <div class="form-group">
                <label for="password">Set Password</label>
                <input type="password" id="password" v-model="password" required placeholder="Choose a strong password (min 8 chars)">
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" v-model="confirmPassword" required placeholder="Re-enter your password">
            </div>
             <!-- Display submission error -->
             <div v-if="submitError" class="error-message">{{ submitError }}</div>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Activating Account...' : 'Activate Account' }}
            </button>
            </form>
        </div>
 
         <!-- Display success message -->
         <div v-if="submissionSuccess" class="success-message">
             <p><strong>Success!</strong> Your account has been activated.</p>
             <router-link to="/login" class="btn-submit" style="text-decoration: none; display: inline-block; width: auto; margin-top: 1rem;">
                 Proceed to Login
             </router-link>
         </div>
 
           <!-- Link back if token was invalid -->
           <p v-if="!isLoadingData && !invitationDetails && dataError && !submissionSuccess" class="back-link">
               Back to <router-link to="/">Homepage</router-link>
           </p>
      </div>
    </div>
  </template>
 
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter, RouterLink } from 'vue-router';
  import { useAuthStore } from '@/stores/auth'; // Import the store
 
  const props = defineProps({
      token: {
          type: String,
          required: true
      }
  });
 
  const router = useRouter();
  const authStore = useAuthStore(); // Get store instance
 
  const isLoadingData = ref(true);
  const isSubmitting = ref(false);
  const dataError = ref(''); // Error fetching details
  const submitError = ref(''); // Error submitting acceptance
  const submissionSuccess = ref(false);
 
  const invitationDetails = ref(null);
  const name = ref('');
  const password = ref('');
  const confirmPassword = ref('');
 
  const fetchInvitationDetails = async () => {
      isLoadingData.value = true;
      dataError.value = '';
      invitationDetails.value = null;
      try {
          // Call store action to fetch details via API
          const details = await authStore.getInvitationDetails(props.token);
          invitationDetails.value = details;
      } catch (error) {
          console.error("Component: Failed to fetch invitation details:", error.message);
          dataError.value = error.message || 'Failed to load invitation details.';
      } finally {
          isLoadingData.value = false;
      }
  };
 
  const handleAccept = async () => {
      submitError.value = '';
      if (!name.value.trim()) {
          submitError.value = 'Please enter your full name.'; return;
      }
      if (password.value !== confirmPassword.value) {
          submitError.value = 'Passwords do not match.'; return;
      }
      if (password.value.length < 8) {
          submitError.value = 'Password must be at least 8 characters long.'; return;
      }
 
      isSubmitting.value = true;
      try {
          // Call store action to accept invitation via API
          await authStore.acceptInvitation({
              token: props.token,
              name: name.value,
              password: password.value
          });
          submissionSuccess.value = true; // Show success message
      } catch (error) {
          console.error("Component: Failed to accept invitation:", error.message);
          submitError.value = error.message || 'Failed to activate account.';
      } finally {
          isSubmitting.value = false;
      }
  };
 
  onMounted(() => {
      fetchInvitationDetails();
  });
  </script>
 
  <style scoped>
  /* Styles are loaded globally from landing.css */
  /* Readonly input style */
  input:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
      opacity: 0.7;
  }
  </style>