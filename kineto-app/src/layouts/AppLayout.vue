// src/layouts/AppLayout.vue (Complete File)

<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed, open: isSidebarOpenMobile }">
      <div class="sidebar-header">
        <router-link to="/" class="sidebar-logo" v-if="!isSidebarCollapsed">KinetoFlow</router-link>
        <router-link to="/" class="sidebar-logo-collapsed" v-else>KF</router-link>
         <!-- Mobile Close Button -->
         <button @click="toggleSidebar" class="mobile-close-button" title="Close Menu">×</button>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <!-- Common Links -->
          <li>
            <router-link :to="defaultDashboardRoute" class="nav-link" active-class="active" @click="closeMobileSidebar">
              <i class="fas fa-tachometer-alt nav-icon"></i>
              <span v-if="!isSidebarCollapsed">Dashboard</span>
            </router-link>
          </li>

          <!-- App Admin Links -->
          <template v-if="authStore.userRole === 'APP_ADMIN'">
            <li>
              <router-link to="/app/admin/companies" class="nav-link" active-class="active" @click="closeMobileSidebar">
                <i class="fas fa-building nav-icon"></i>
                <span v-if="!isSidebarCollapsed">Companies</span>
              </router-link>
            </li>
            <!-- Add App Admin Users Link -->
            <!-- <li>
              <router-link to="/app/admin/users" class="nav-link" active-class="active" @click="closeMobileSidebar">
                <i class="fas fa-users-cog nav-icon"></i>
                <span v-if="!isSidebarCollapsed">Platform Users</span>
              </router-link>
            </li> -->
          </template>

          <!-- Company Admin Links -->
          <template v-if="authStore.userRole === 'COMPANY_ADMIN'">
            <li>
              <router-link to="/app/company/medics" class="nav-link" active-class="active" @click="closeMobileSidebar">
                <i class="fas fa-user-md nav-icon"></i>
                <span v-if="!isSidebarCollapsed">Medics</span>
              </router-link>
            </li>
            <li>
              <router-link to="/app/company/patients" class="nav-link" active-class="active" @click="closeMobileSidebar">
                <i class="fas fa-user-injured nav-icon"></i>
                <span v-if="!isSidebarCollapsed">Patients</span>
              </router-link>
            </li>
            <li>
              <router-link to="/app/company/services" class="nav-link" active-class="active" @click="closeMobileSidebar">
                <i class="fas fa-concierge-bell nav-icon" title="Services"></i> <!-- Example icon -->
                <span v-if="!isSidebarCollapsed">Services</span> <!-- Adjust v-if/v-show based on your working version -->
              </router-link>
            </li>
             <li>
              <router-link to="/app/company/packages" class="nav-link" active-class="active" @click="closeMobileSidebar">
                <i class="fas fa-box-open nav-icon" title="Packages"></i> <!-- Example icon -->
                <span v-if="!isSidebarCollapsed">Packages</span> <!-- Adjust v-if/v-show based on your working version -->
              </router-link>
            </li>
            <li>
               <router-link to="/app/company/profile" class="nav-link" active-class="active" @click="closeMobileSidebar">
                 <i class="fas fa-clinic-medical nav-icon"></i>
                 <span v-if="!isSidebarCollapsed">Company Profile</span>
               </router-link>
             </li>
          </template>
          

          <!-- Medic Links <<< --- NEW SECTION --- >>> -->
          <template v-if="authStore.userRole === 'MEDIC'">
             <li class="nav-heading" v-show="!isSidebarCollapsed"><small>Medic Area</small></li>
             <li>
               <router-link to="/app/medic/my-patients" class="nav-link" active-class="active" @click="closeMobileSidebar">
                 <i class="fas fa-users nav-icon" title="My Patients"></i>
                 <span v-show="!isSidebarCollapsed">My Patients</span>
               </router-link>
             </li>
             <li>
                <router-link to="/app/medic/calendar" class="nav-link" active-class="active" @click="closeMobileSidebar">
                 <i class="fas fa-calendar-alt nav-icon" title="My Schedule"></i>
                 <span v-show="!isSidebarCollapsed">My Schedule</span>
               </router-link>
             </li>
              <li>
               <router-link to="/app/medic/services" class="nav-link" active-class="active" @click="closeMobileSidebar">
                 <i class="fas fa-concierge-bell nav-icon" title="View Services"></i>
                 <span v-show="!isSidebarCollapsed">View Services</span>
               </router-link>
             </li>
              <li>
               <router-link to="/app/medic/packages" class="nav-link" active-class="active" @click="closeMobileSidebar">
                 <i class="fas fa-box-open nav-icon" title="View Packages"></i>
                 <span v-show="!isSidebarCollapsed">View Packages</span>
               </router-link>
             </li>
             <!-- Add Calendar Link later -->
             <!-- <li>
                <router-link to="/app/medic/calendar" class="nav-link" active-class="active" @click="closeMobileSidebar">
                 <i class="fas fa-calendar-alt nav-icon" title="My Schedule"></i>
                 <span v-show="!isSidebarCollapsed">My Schedule</span>
               </router-link>
             </li> -->
           </template>

           <!-- User Links -->
          <template v-if="authStore.userRole === 'USER'">
             <!-- Add User links here, e.g., -->
             <!-- <li>
               <router-link to="/app/user/my-plan" class="nav-link" active-class="active" @click="closeMobileSidebar">
                 <i class="fas fa-clipboard-list nav-icon"></i>
                 <span v-if="!isSidebarCollapsed">My Plan</span>
               </router-link>
             </li> -->
           </template>

          <!-- Separator -->
           <li class="nav-separator" v-if="!isSidebarCollapsed"></li>

           <!-- Shared Links -->
            <li>
                <router-link to="/app/account" class="nav-link" active-class="active" @click="closeMobileSidebar">
                  <i class="fas fa-user-circle nav-icon"></i>
                  <span v-if="!isSidebarCollapsed">My Account</span>
                </router-link>
            </li>

        </ul>
      </nav>

      <!-- Desktop Collapse Button -->
      <div class="sidebar-footer">
         <button @click="toggleSidebar" class="collapse-button" :title="isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'">
             <i class="fas" :class="isSidebarCollapsed ? 'fa-angle-double-right' : 'fa-angle-double-left'"></i>
         </button>
      </div>
    </aside>

     <!-- Sidebar Overlay for Mobile -->
     <div v-if="isSidebarOpenMobile" class="sidebar-overlay" @click="closeMobileSidebar"></div>

    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="top-bar-left">
            <!-- Mobile Menu Toggle -->
           <button @click="toggleSidebar" class="mobile-toggle-button">
             <i class="fas fa-bars"></i>
           </button>
           <!-- Dynamic Page Title -->
           <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
        <div class="top-bar-right">
          <span class="user-greeting">Hi, {{ authStore.userName }}</span>
          <div class="user-menu">
            <!-- Settings Dropdown Placeholder -->
            <!-- <button class="settings-button" title="Settings"><i class="fas fa-cog"></i></button> -->
             <button @click="handleLogout" class="logout-button" title="Logout">
              <i class="fas fa-sign-out-alt"></i>
              <span class="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <!-- RouterView renders the matched child component -->
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); // Get current route info

// Sidebar State
const isSidebarCollapsed = ref(false); // For desktop collapse
const isSidebarOpenMobile = ref(false); // For mobile overlay menu

// Dynamic Page Title
const currentPageTitle = computed(() => {
    // Find the deepest matched route with a meta.title
    return route.matched.slice().reverse().find(r => r.meta.title)?.meta.title || 'KinetoFlow';
});


const toggleSidebar = () => {
    if (window.innerWidth > 992) { // Check window width
        isSidebarCollapsed.value = !isSidebarCollapsed.value;
    } else {
         isSidebarOpenMobile.value = !isSidebarOpenMobile.value;
    }
};

const closeMobileSidebar = () => {
     if (isSidebarOpenMobile.value) {
         isSidebarOpenMobile.value = false;
     }
}

const handleLogout = () => {
    authStore.logout();
    // Router guard will handle redirect to login
};

// Compute default dashboard route based on role using store helper
 const defaultDashboardRoute = computed(() => {
     return authStore.getDefaultDashboardRoute(authStore.userRole);
 });

// Watch route changes to close mobile sidebar automatically
watch(() => route.path, () => {
    closeMobileSidebar();
});

</script>

<style scoped>
/* Styles need adjustments for mobile overlay */

.app-layout { display: flex; min-height: 100vh; background-color: var(--light-color, #f8f9fa); font-family: 'Poppins', sans-serif; position: relative; /* Needed for overlay */ }

/* --- Sidebar --- */
.sidebar {
    width: 260px; background: var(--dark-color, #2c3e50); color: #e0f2f7;
    display: flex; flex-direction: column; transition: width 0.3s ease, left 0.3s ease;
    position: fixed; height: 100%; z-index: 1010; left: 0;
}
.sidebar.collapsed { width: 80px; }
.sidebar-header {
    padding: 1rem; /* Adjusted padding */
    display: flex; /* Use flex to align items */
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
    height: 65px; /* Match top-bar height */
    box-sizing: border-box;
}
.sidebar.collapsed .sidebar-header { justify-content: center; } /* Center collapsed logo */

.sidebar-logo, .sidebar-logo-collapsed { /* ... */ font-size: 1.8rem; font-weight: 700; color: var(--white-color, #fff); text-decoration: none; display: inline-block; background: var(--gradient-main); -webkit-background-clip: text; background-clip: text; color: transparent; transition: opacity 0.3s ease; line-height: 1; }
.sidebar-logo-collapsed { font-size: 1.6rem; }
.sidebar.collapsed .sidebar-logo { display: none; } /* Hide full logo when collapsed */
.sidebar:not(.collapsed) .sidebar-logo-collapsed { display: none; } /* Hide collapsed logo when expanded */

.mobile-close-button {
    display: none; /* Hidden on desktop */
    background: none; border: none; color: #e0f2f7; font-size: 1.8rem;
    cursor: pointer; padding: 0.5rem; line-height: 1;
}
.mobile-close-button:hover { color: var(--primary-color-end); }

.sidebar-nav { flex-grow: 1; overflow-y: auto; padding-top: 1rem; }
.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.nav-link { display: flex; align-items: center; padding: 0.9rem 1.5rem; color: #e0f2f7; text-decoration: none; transition: background-color 0.2s ease, color 0.2s ease; white-space: nowrap; overflow: hidden; }
.sidebar.collapsed .nav-link { padding: 0.9rem 1.7rem; justify-content: center; }
.nav-icon { font-size: 1.2rem; margin-right: 1rem; width: 20px; text-align: center; transition: margin-right 0.3s ease, font-size 0.3s ease; flex-shrink: 0; }
.sidebar.collapsed .nav-icon { margin-right: 0; font-size: 1.4rem; }
.sidebar.collapsed .nav-link span { display: none; }
.nav-link:hover { background-color: rgba(255, 255, 255, 0.1); color: var(--white-color); }
.nav-link.active { background-color: var(--primary-color-start, #4a90e2); color: var(--white-color); font-weight: 600; }

.nav-separator { height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 1rem 1.5rem; }

.sidebar-footer { padding: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center; flex-shrink: 0; }
.collapse-button { background: none; border: none; color: #e0f2f7; font-size: 1.5rem; cursor: pointer; transition: color 0.2s ease; padding: 0.5rem; }
.collapse-button:hover { color: var(--primary-color-end); }

/* --- Main Content Area --- */
.main-content { flex-grow: 1; margin-left: 260px; transition: margin-left 0.3s ease; display: flex; flex-direction: column; min-width: 0; }
.main-content.sidebar-collapsed { /* Add class dynamically */ margin-left: 80px; }

/* --- Top Bar --- */
.top-bar { background-color: var(--white-color, #fff); padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-light); position: sticky; top: 0; z-index: 1000; height: 65px; box-sizing: border-box;}
.top-bar-left { display: flex; align-items: center; gap: 1rem;}
.mobile-toggle-button { display: none; background: none; border: none; font-size: 1.5rem; color: var(--dark-color); cursor: pointer; }
.page-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--dark-color);
    margin: 0; /* Reset margin */
}
.top-bar-right { display: flex; align-items: center; gap: 1.5rem; }
.user-greeting { font-weight: 600; color: var(--text-color); white-space: nowrap; }
.user-menu { position: relative; }
.logout-button { background: none; border: none; color: var(--dark-color); font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.8rem; border-radius: var(--border-radius); transition: background-color 0.2s ease, color 0.2s ease; }
.logout-button:hover { background-color: #f1f3f5; color: var(--primary-color-start); }
.logout-button i { font-size: 1.1rem; }
.logout-text { display: inline; }

/* --- Page Content --- */
.page-content { padding: 2rem; flex-grow: 1; background-color: var(--light-color, #f8f9fa); }

/* --- Mobile Overlay --- */
.sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1005; /* Below sidebar, above content */
}

/* --- Responsiveness --- */
@media (max-width: 992px) {
    .sidebar {
        left: -260px; /* Start hidden */
        transition: left 0.3s ease;
    }
     .sidebar.collapsed {
        left: -80px; /* Ensure collapsed is also hidden initially */
        width: 80px;
    }
    .sidebar.open {
        left: 0; /* Slide in */
    }
     .sidebar:not(.collapsed) { width: 260px; } /* Ensure correct width when open */

    .main-content { margin-left: 0 !important; } /* Force no margin */

    .mobile-toggle-button { display: block; } /* Show mobile hamburger */
    .mobile-close-button { display: block; } /* Show mobile close button in sidebar header */
    .collapse-button { display: none; } /* Hide desktop collapse button */

    .sidebar.open + .sidebar-overlay { /* Show overlay only when mobile menu is open */
         display: block;
    }

    .logout-text { display: none; }
    .logout-button { padding: 0.5rem; }
}


  /* Scrollbar styling (optional) */
  .sidebar-nav::-webkit-scrollbar { width: 6px; }
  .sidebar-nav::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); }
  .sidebar-nav::-webkit-scrollbar-thumb { background-color: rgba(var(--primary-color-start-rgb, 74, 144, 226), 0.6); border-radius: 3px; }
  .sidebar-nav { scrollbar-width: thin; scrollbar-color: rgba(var(--primary-color-start-rgb, 74, 144, 226), 0.6) rgba(255, 255, 255, 0.1); }
  :root { /* Add RGB var if not present */ --primary-color-start-rgb: 74, 144, 226; }
  </style>