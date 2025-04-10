<template>
    <div class="page-container">
      <h1>My Account</h1>
  
      <section class="card profile-section">
        <h2>Update Profile</h2>
        <p class="text-muted">Update your name. Email and password changes may require separate procedures.</p>
        <form @submit.prevent="handleUpdateProfile" class="profile-form">
           <div class="form-group">
              <label for="accountEmail">Email Address</label>
              <!-- Display email, typically not editable directly -->
              <input type="email" id="accountEmail" :value="authStore.userEmail" disabled readonly>
              <small class="text-muted">Email address cannot be changed here.</small>
           </div>
           <div class="form-group">
              <label for="accountName">Full Name</label>
              <input type="text" id="accountName" v-model="editableProfile.name" placeholder="Enter your full name" :disabled="isUpdating" required>
           </div>
  
           <div v-if="updateError" class="error-message form-error">{{ updateError }}</div>
  
           <button type="submit" class="btn btn-primary" :disabled="isUpdating || !isChanged">
             <span v-if="isUpdating"><i class="fas fa-spinner fa-spin"></i> Saving...</span>
             <span v-else>Save Changes</span>
           </button>
           <!-- Add button/link for password change later -->
           <!-- <button type="button" class="btn btn-secondary" style="margin-left: 1rem;">Change Password</button> -->
        </form>
      </section>
  
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import UserService from '@/services/UserService';
  import { useAuthStore } from '@/stores/auth';
  import { useToast } from 'vue-toastification';
  
  const toast = useToast();
  const authStore = useAuthStore();
  
  // Use reactive for editable fields, initialize with store data
  const editableProfile = reactive({
      name: '',
  });
  
  const isUpdating = ref(false);
  const updateError = ref('');
  
  // Check if form data has changed from original store data
  const isChanged = computed(() => {
      if (!authStore.user) return false;
      return editableProfile.name !== (authStore.userName || ''); // Compare with current name from store
  });
  
  // Initialize form when component mounts
  onMounted(() => {
      editableProfile.name = authStore.userName || '';
  });
  
  const handleUpdateProfile = async () => {
     if (!isChanged.value) {
         toast.info("No changes to save.");
         return;
    }
    isUpdating.value = true;
    updateError.value = '';
    try {
        const updateData = { name: editableProfile.name };
        const response = await UserService.updateMyProfile(updateData);
  
        // IMPORTANT: Update the Pinia store and localStorage after successful profile update
        // This ensures the name change reflects everywhere (e.g., top bar greeting)
        // A better approach might be for the store action to handle this update.
        // Simple example: Manually update relevant parts of the store's user object.
        const updatedUserData = { ...authStore.user, name: response.data.name }; // Merge existing user data with new name
        authStore.user = updatedUserData; // Directly update store state (if writable)
        localStorage.setItem('kinetoflow_user', JSON.stringify(updatedUserData)); // Update localStorage too
  
        toast.success("Profile updated successfully!");
  
    } catch (error) {
       console.error("Error updating profile:", error);
       const message = error.response?.data?.message || 'Failed to update profile.';
       updateError.value = message;
       toast.error(message);
    } finally {
       isUpdating.value = false;
    }
  };
  
  </script>
  
  <style scoped>
  /* Reuse styles or define specific ones */
  .page-container { /* ... */ display: flex; flex-direction: column; gap: 2rem; }
  h1 { /* ... */ color: var(--dark-color); margin-bottom: 1.5rem; }
  .card { /* ... */ background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); }
  .card h2 { /* ... */ color: var(--dark-color); margin-bottom: 0.5rem; font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
  .card p.text-muted { margin-bottom: 1.5rem; }
  
  .profile-form .form-group { /* ... */ margin-bottom: 1.5rem; }
  .form-group label { /* ... */ display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; }
  .form-group input { /* ... */ width: 100%; padding: 0.7rem 1rem; border: 1px solid #ccc; border-radius: var(--border-radius); font-size: 1rem; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
  .form-group input:focus { /* ... */ outline: none; border-color: var(--primary-color-start); box-shadow: 0 0 0 2px rgba(var(--primary-color-start-rgb), 0.2); }
  .form-group input:disabled { /* ... */ background-color: #e9ecef; cursor: not-allowed; opacity: 0.7; }
  .text-muted { /* ... */ color: #6c757d; font-size: 0.85em; margin-top: 0.25rem; display: block;}
  
  .btn { /* ... */ padding: 0.7rem 1.5rem; border: none; border-radius: var(--border-radius); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 38px; vertical-align: middle; }
  .btn i.fa-spinner { animation: fa-spin 1.5s linear infinite; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-primary { background: var(--gradient-main); color: var(--white-color); box-shadow: var(--shadow-light); }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-medium); filter: brightness(1.1); }
   .btn-secondary { background-color: #6c757d; color: white; border-color: #6c757d;}
   .btn-secondary:hover:not(:disabled) { background-color: #5a6268; border-color: #545b62;}
  
  
  .error-message { color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 0.8rem 1rem; border-radius: var(--border-radius); margin-bottom: 1.5rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; }
  .error-message.form-error { margin-top: 0; }
  .error-message i { font-size: 1.1rem; }
  </style>