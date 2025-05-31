// src/router/index.js (Complete File)

import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';

// --- Import Layouts and Public Views ---
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import AcceptInvitationPage from '../views/AcceptInvitationPage.vue';
import NotFoundPage from '../views/NotFoundPage.vue';
import PrivacyPolicyPage from '../views/PlaceholderPage.vue';
import TermsOfServicePage from '../views/PlaceholderPage.vue';
import AppLayout from '../layouts/AppLayout.vue';
import UnauthorizedPage from '../views/UnauthorizedPage.vue';

// --- Import Authenticated Views ---
// App Admin
import AppAdminDashboard from '../views/app-admin/AppAdminDashboard.vue';
import AppAdminCompanies from '../views/app-admin/AppAdminCompanies.vue';
// Company Admin
import CompanyAdminDashboard from '../views/company-admin/CompanyAdminDashboard.vue';
import CompanyAdminMedics from '../views/company-admin/CompanyAdminMedics.vue';
import CompanyAdminPatients from '../views/company-admin/CompanyAdminPatients.vue';
import CompanyProfile from '../views/company-admin/CompanyProfile.vue';
import CompanyAdminServices from '../views/company-admin/CompanyAdminServices.vue'; // <-- New Import
import CompanyAdminPackages from '../views/company-admin/CompanyAdminPackages.vue'; // <-- New Import
import CompanyAdminFeedback from '../views/company-admin/CompanyAdminFeedback.vue'; // <-- New Import
import CompanyAdminVouchers from '../views/company-admin/CompanyAdminVouchers.vue'; // <-- Voucher Import
import CompanyAdminApprovals from '../views/company-admin/CompanyAdminApprovals.vue'; // <-- Approval Import
import HolidaysPage from '../views/admin/HolidaysPage.vue'; // <-- Holidays Import
// Medic <<< --- NEW IMPORTS --- >>>
import MedicDashboard from '../views/medic/MedicDashboard.vue';
import MedicMyPatients from '../views/medic/MedicMyPatients.vue';
import MedicViewServices from '../views/medic/MedicViewServices.vue';
import MedicViewPackages from '../views/medic/MedicViewPackages.vue';
import MedicPatientPlanDetail from '../views/medic/MedicPatientPlanDetail.vue'; // <-- Import new view
import MedicCalendar from '../views/medic/MedicCalendar.vue'; // <-- Import Calendar View
import MedicPatientPayments from '../views/medic/MedicPatientPayments.vue'; // <-- Import Payments View
import MedicPaymentsOverview from '../views/medic/MedicPaymentsOverview.vue'; // <-- Import Payments Overview View
import MedicFeedback from '../views/medic/MedicFeedback.vue'; // <-- Import Feedback View
// User (Patient) Views
import UserDashboard from '../views/user/UserDashboard.vue';
import UserMyAppointments from '../views/user/UserMyAppointments.vue';
import UserMyPlans from '../views/user/UserMyPlans.vue';
// Generic/Shared
import MyAccount from '../views/MyAccount.vue';
import GenericDashboard from '../views/GenericDashboard.vue';
import NotificationsPage from '../views/NotificationsPage.vue';

const routes = [
  // --- Public Routes ---
  { path: '/', name: 'home', component: HomePage },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/accept-invitation/:token', name: 'accept-invitation', component: AcceptInvitationPage, props: true },
  { path: '/privacy', name: 'privacy', component: PrivacyPolicyPage, props: { title: "Privacy Policy" } },
  { path: '/terms', name: 'terms', component: TermsOfServicePage, props: { title: "Terms of Service" } },
  { path: '/unauthorized', name: 'unauthorized', component: UnauthorizedPage },

  // --- Authenticated Routes (using AppLayout) ---
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'dashboard', component: GenericDashboard, meta: { title: 'Dashboard' } },
      { path: 'account', name: 'my-account', component: MyAccount, meta: { title: 'My Account' } },
      { path: 'notifications', name: 'notifications', component: NotificationsPage, meta: { title: 'Notifications' } },

      // == App Admin Routes ==
      {
        path: 'admin',
        meta: { role: 'APP_ADMIN', breadcrumb: 'App Admin' },
        children: [
          { path: '', redirect: { name: 'app-admin-dashboard' } },
          { path: 'dashboard', name: 'app-admin-dashboard', component: AppAdminDashboard, meta: { title: 'Platform Dashboard' } },
          { path: 'companies', name: 'app-admin-companies', component: AppAdminCompanies, meta: { title: 'Manage Companies' } },
          // { path: 'users', ... }
        ]
      },

      // == Company Admin Routes ==
      {
        path: 'company',
        meta: { role: 'COMPANY_ADMIN', breadcrumb: 'Company' },
        children: [
           { path: '', redirect: { name: 'company-admin-dashboard' } },
           { path: 'dashboard', name: 'company-admin-dashboard', component: CompanyAdminDashboard, meta: { title: 'Company Dashboard' } },
           { path: 'medics', name: 'company-admin-medics', component: CompanyAdminMedics, meta: { title: 'Manage Medics' } },
           { path: 'patients', name: 'company-admin-patients', component: CompanyAdminPatients, meta: { title: 'Manage Patients' } },
           { path: 'profile', name: 'company-profile', component: CompanyProfile, meta: { title: 'Company Profile' } },
           // --- NEW ROUTES ---
           { path: 'services', name: 'company-admin-services', component: CompanyAdminServices, meta: { title: 'Manage Services' } },
           { path: 'packages', name: 'company-admin-packages', component: CompanyAdminPackages, meta: { title: 'Manage Packages' } },
           { path: 'feedback', name: 'company-admin-feedback', component: CompanyAdminFeedback, meta: { title: 'Feedback Management' } },
           { path: 'vouchers', name: 'company-admin-vouchers', component: CompanyAdminVouchers, meta: { title: 'Manage Vouchers' } },
           { path: 'approvals', name: 'company-admin-approvals', component: CompanyAdminApprovals, meta: { title: 'Manage Approvals' } },
           { path: 'holidays', name: 'company-admin-holidays', component: HolidaysPage, meta: { title: 'Manage Holidays' } },
           // --- END NEW ---
        ]
      },

      // == Medic Routes == <<< --- NEW SECTION --- >>>
      {
        path: 'medic',
        meta: { role: 'MEDIC', breadcrumb: 'Medic Area' },
        children: [
            { path: '', redirect: { name: 'medic-dashboard' } }, // Redirect /app/medic to dashboard
            { path: 'dashboard', name: 'medic-dashboard', component: MedicDashboard, meta: { title: 'Medic Dashboard'} },
            { path: 'my-patients', name: 'medic-patients', component: MedicMyPatients, meta: { title: 'My Patients'} },
            {
              path: 'patients/:patientId/plans', // Use patientId parameter
              name: 'medic-patient-plan-detail',
              component: MedicPatientPlanDetail,
              props: true, // Pass route params as props (patientId)
              meta: { title: 'Patient Plan Details' }
            },
            { path: 'services', name: 'medic-services', component: MedicViewServices, meta: { title: 'View Services'} },
            { path: 'packages', name: 'medic-packages', component: MedicViewPackages, meta: { title: 'View Packages'} },
            { path: 'calendar', name: 'medic-calendar', component: MedicCalendar, meta: { title: 'My Schedule'} },
            { path: 'feedback', name: 'medic-feedback', component: MedicFeedback, meta: { title: 'My Feedback'} },
            {
              path: 'patients/:patientId/payments',
              name: 'medic-patient-payments',
              component: MedicPatientPayments,
              props: true,
              meta: { title: 'Patient Payments' }
            },
            {
              path: 'payments-overview',
              name: 'medic-payments-overview',
              component: MedicPaymentsOverview,
              meta: { title: 'Payments Overview' }
            }
            // Add routes for calendar, patient detail/plan later
        ]
      },

      // == User Routes ==
      {
        path: 'user',
        meta: { role: 'USER', breadcrumb: 'My Area' }, // Added USER role and breadcrumb
        children: [
          { path: '', redirect: { name: 'user-dashboard' } }, // Redirect /app/user to /app/user/dashboard
          { 
            path: 'dashboard', 
            name: 'user-dashboard', 
            component: UserDashboard, 
            meta: { title: 'My Dashboard' } 
          },
          { 
            path: 'my-appointments', 
            name: 'user-appointments', 
            component: UserMyAppointments, 
            meta: { title: 'My Appointments' } 
          },
          { 
            path: 'my-plan', 
            name: 'user-my-plan', 
            component: UserMyPlans, 
            meta: { title: 'My Plan Details' } 
          }
          // Add other user routes here later (e.g., billing)
        ]
      }
    ]
  },

  // --- Catch-all ---
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  async scrollBehavior(to, from, savedPosition) {
     // scroll behavior code...
     if (to.hash) { await nextTick(); /* ... */ }
     if (savedPosition) return savedPosition;
     return { top: 0, behavior: 'smooth' };
  }
});

// --- Navigation Guards (remain the same) ---
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiredRole = to.matched.slice().reverse().find(record => record.meta.role)?.meta.role;

    if (requiresAuth && !authStore.isAuthenticated) {
        authStore.setReturnUrl(to.fullPath); next({ name: 'login' });
    } else if (requiresAuth && requiredRole && authStore.userRole !== requiredRole) {
        next({ name: 'unauthorized' });
    } else if ((to.name === 'login' || to.name === 'accept-invitation') && authStore.isAuthenticated) {
        next({ path: authStore.getDefaultDashboardRoute(authStore.userRole) });
    } else {
        next();
    }
});

export default router;