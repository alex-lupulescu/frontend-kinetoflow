<template>
    <div class="auth-page">
      <div class="auth-container">
        <router-link to="/" class="logo-link">
          <h1 class="logo">KinetoFlow</h1>
        </router-link>
        <h2>Login</h2>
        <p>Welcome back! Please enter your details.</p>
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required placeholder="********">
          </div>
          <!-- Display error message from login attempt -->
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          <button type="submit" class="btn-submit" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
          <div class="form-links">
            <a href="#" @click.prevent="handleForgotPassword">Forgot Password?</a>
            <!-- Registration is via invite only -->
          </div>
          <p class="back-link">Back to <router-link to="/">Homepage</router-link></p>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter, RouterLink } from 'vue-router';
  import { useAuthStore } from '@/stores/auth'; // Import the store
  
  const email = ref('');
  const password = ref('');
  const errorMessage = ref(''); // To display login errors
  const isLoading = ref(false);
  const router = useRouter(); // Use router if needed for manual navigation (though store handles it now)
  const authStore = useAuthStore(); // Get the store instance
  
  const handleLogin = async () => {
    isLoading.value = true;
    errorMessage.value = ''; // Clear previous errors
    try {
      // Call the login action from the store
      await authStore.login({ email: email.value, password: password.value });
  
      // No redirection needed here - the store handles it on success
      // console.log('Login successful, store should redirect.');
  
    } catch (error) {
      console.error("Login component caught error:", error.message);
      // Display the error message thrown by the store/API
      errorMessage.value = error.message || 'An unexpected error occurred during login.';
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleForgotPassword = () => {
    alert('Forgot Password functionality not implemented yet.');
    console.log("Forgot password clicked for:", email.value);
  }
  </script>
  
  <style scoped>
  /* Styles are loaded globally from landing.css */
  </style>