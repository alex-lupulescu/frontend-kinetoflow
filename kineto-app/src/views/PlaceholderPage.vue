<template>
    <div class="placeholder-page">
      <nav class="navbar" id="navbar-placeholder">
         <div class="container">
              <router-link to="/" class="logo">KinetoFlow</router-link>
              <!-- Simple nav for placeholder pages -->
              <router-link to="/" class="cta-button desktop-cta">Back to Home</router-link>
         </div>
      </nav>
      <div class="content-container">
          <h1>{{ title }}</h1>
          <p>Content for the {{ title }} page will go here.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
           <router-link to="/" class="cta-button" style="margin-top: 2rem;">Go Back Home</router-link>
      </div>
      <footer class="footer">
         <div class="container">
              <p class="footer-copy">© {{ new Date().getFullYear() }} KinetoFlow. All rights reserved.</p>
         </div>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router';
  import { onMounted } from 'vue';
  
  const props = defineProps({
      title: {
          type: String,
          default: "Page Content"
      }
  });
  
  // Add basic scroll behavior for placeholder navbar if needed
  onMounted(() => {
       const handleScroll = () => {
         const navBar = document.getElementById('navbar-placeholder');
         if (navBar) {
            if (window.scrollY > 50) {
               navBar.classList.add('scrolled');
            } else {
               navBar.classList.remove('scrolled');
            }
         }
       };
       window.addEventListener('scroll', handleScroll);
       // Cleanup on unmount (although this component might not unmount often)
       return () => window.removeEventListener('scroll', handleScroll);
  });
  
  </script>
  
  <style scoped>
  .placeholder-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
     background-color: var(--white-color);
     font-family: 'Poppins', sans-serif;
  }
  
  /* Re-use navbar styles but scope them or use specific ID */
  #navbar-placeholder {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0;
      position: sticky; /* Make it sticky instead of fixed for simple pages */
      top: 0;
      width: 100%;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: var(--shadow-light);
      transition: background 0.3s ease, box-shadow 0.3s ease;
  }
  #navbar-placeholder.scrolled {
     background: rgba(255, 255, 255, 0.95);
     box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  #navbar-placeholder .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
  #navbar-placeholder .logo { /* Reuse logo style */
      font-size: 1.8rem;
      font-weight: 700;
      background: var(--gradient-main);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-decoration: none;
  }
  #navbar-placeholder .cta-button { /* Reuse button style */
      background: var(--gradient-main);
      color: var(--white-color);
      padding: 0.7rem 1.5rem;
      border: none;
      border-radius: var(--border-radius);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-light);
      cursor: pointer;
      display: inline-block;
  }
  #navbar-placeholder .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-medium);
      filter: brightness(1.1);
  }
  
  
  .content-container {
    flex-grow: 1; /* Takes up remaining vertical space */
    max-width: 900px;
    margin: 4rem auto; /* Add top/bottom margin */
    padding: 2rem;
    color: var(--text-color);
  }
  
  .content-container h1 {
    color: var(--dark-color);
    font-size: 2.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid var(--primary-color-start);
    padding-bottom: 0.5rem;
    display: inline-block;
  }
  
  .content-container p {
    line-height: 1.8;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }
  
  .footer { /* Reuse footer style */
      background-color: var(--dark-color);
      color: var(--light-color);
      padding: 2rem 0;
      text-align: center;
      margin-top: auto; /* Pushes footer to bottom */
  }
  .footer .footer-copy { /* Reuse footer copy style */
      font-size: 0.9rem;
      opacity: 0.6;
      margin: 0;
  }
  </style>