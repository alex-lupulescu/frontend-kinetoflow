<template>
    <div> <!-- Root element -->
      <!-- Navigation -->
      <nav class="navbar" id="navbar">
        <div class="container">
          <a href="#" class="logo">KinetoFlow</a>
          <ul class="nav-links" id="nav-links" :class="{ active: isMenuOpen }">
            <li><a href="#features" @click="smoothScrollAndCloseMenu">Features</a></li>
            <li><a href="#how-it-works" @click="smoothScrollAndCloseMenu">How It Works</a></li>
            <li><a href="#benefits" @click="smoothScrollAndCloseMenu">Benefits</a></li>
            <li><a href="#cta" @click="smoothScrollAndCloseMenu">Contact</a></li>
            <li><a href="#cta" class="cta-button mobile-cta" @click="smoothScrollAndCloseMenu">Request Demo</a></li>
          </ul>
          <!-- Replace #cta with actual Login/Register routes later -->
          <router-link to="/login" class="cta-button desktop-cta">Login / Sign Up</router-link>
          <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu" :aria-expanded="isMenuOpen.toString()" @click="toggleMenu">
            <i class="fas" :class="[isMenuOpen ? 'fa-times' : 'fa-bars']"></i>
          </button>
        </div>
      </nav>
  
      <!-- Hero Section -->
      <section class="hero" id="home">
        <div class="shape shape1"></div>
        <div class="shape shape2"></div>
        <div class="shape shape3"></div>
        <div class="container">
          <div class="hero-content">
            <h1>Elevate Your <span class="highlight">Kineto Therapy</span> Practice</h1>
            <p>Streamline clinic management, empower your medics, and engage patients with KinetoFlow - the all-in-one platform designed for modern therapy companies.</p>
            <a href="#cta" class="cta-button" @click="smoothScroll">Request a Demo</a>
            <!-- Consider router-link for Login/Register later -->
            <!-- <router-link to="/login" class="cta-button">Login</router-link> -->
          </div>
          <div class="hero-image">
            <!-- Placeholder still uses SVG defined in CSS -->
            <img src="" alt="KinetoFlow Application Interface">
          </div>
        </div>
      </section>
  
      <!-- Features Section -->
      <section id="features" class="section">
        <div class="container">
          <h2 class="section-title animate-on-scroll fade-in">Powerful Features, Seamless Experience</h2>
          <p class="section-subtitle animate-on-scroll fade-in" data-delay="0.1s">KinetoFlow provides the tools your entire team needs to succeed, from administration to patient care.</p>
          <div class="features-grid">
            <!-- Card 1 -->
            <div class="feature-card animate-on-scroll slide-up" data-delay="0.1s">
              <div class="feature-icon-wrapper">
                <i class="fas fa-sitemap feature-icon"></i>
              </div>
              <h3>Centralized Company Management</h3>
              <p>Admins easily manage medics, patients, locations, and company-wide settings from one intuitive dashboard.</p>
            </div>
            <!-- Card 2 -->
            <div class="feature-card animate-on-scroll slide-up" data-delay="0.2s">
              <div class="feature-icon-wrapper">
                <i class="fas fa-user-md feature-icon"></i>
              </div>
              <h3>Efficient Medic Workflow</h3>
              <p>Medics access patient profiles, assign exercise plans, track progress, schedule appointments, and communicate securely.</p>
            </div>
            <!-- Card 3 -->
            <div class="feature-card animate-on-scroll slide-up" data-delay="0.3s">
              <div class="feature-icon-wrapper">
                <i class="fas fa-person-running feature-icon"></i>
              </div>
              <h3>Engaging Patient Portal</h3>
              <p>Users view personalized plans, follow video exercises, log activity, and interact easily with their assigned medic.</p>
            </div>
            <!-- Card 4 -->
            <div class="feature-card animate-on-scroll slide-up" data-delay="0.1s"> <!-- Reset delay for next row -->
              <div class="feature-icon-wrapper">
                <i class="fas fa-shield-alt feature-icon"></i>
              </div>
              <h3>Secure Multi-Tenancy</h3>
              <p>Each company operates within its own secure, isolated environment, ensuring data privacy and control.</p>
            </div>
            <!-- Card 5 -->
            <div class="feature-card animate-on-scroll slide-up" data-delay="0.2s">
              <div class="feature-icon-wrapper">
                <i class="fas fa-chart-line feature-icon"></i>
              </div>
              <h3>Insightful Analytics</h3>
              <p>Track key metrics for patient progress, medic performance, and clinic efficiency to drive better outcomes.</p>
            </div>
            <!-- Card 6 -->
            <div class="feature-card animate-on-scroll slide-up" data-delay="0.3s">
              <div class="feature-icon-wrapper">
                <i class="fas fa-envelope-open-text feature-icon"></i>
              </div>
              <h3>Seamless Invitation System</h3>
              <p>Effortlessly onboard Admins, Medics, and Users via secure, role-specific email invitation links.</p>
            </div>
          </div>
        </div>
      </section>
  
      <!-- How It Works Section -->
      <section id="how-it-works" class="section">
        <div class="container">
          <h2 class="section-title animate-on-scroll fade-in">Get Started in Minutes</h2>
          <p class="section-subtitle animate-on-scroll fade-in" data-delay="0.1s">Our simple onboarding process gets your company up and running quickly.</p>
          <div class="how-it-works-steps">
            <div class="step animate-on-scroll slide-up" data-delay="0.2s">
              <div class="step-number">1</div>
              <h4>Register Company</h4>
              <p>Sign up and create your secure company space within KinetoFlow.</p>
              <!-- Link to actual registration/invitation later -->
            </div>
            <div class="step animate-on-scroll slide-up" data-delay="0.4s">
              <div class="step-number">2</div>
              <h4>Invite Your Team</h4>
              <p>Admin sends email invitations to Medics & links patients.</p>
            </div>
            <div class="step animate-on-scroll slide-up" data-delay="0.6s">
              <div class="step-number">3</div>
              <h4>Manage & Treat</h4>
              <p>Medics create plans, track progress. Patients engage via portal.</p>
            </div>
            <div class="step animate-on-scroll slide-up" data-delay="0.8s">
              <div class="step-number">4</div>
              <h4>Analyze & Grow</h4>
              <p>Utilize insights to optimize treatments and scale your practice.</p>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Benefits Section -->
      <section id="benefits" class="section">
        <div class="container">
          <div class="benefits-container">
            <div class="benefits-image animate-on-scroll slide-left" data-delay="0.2s">
              <img src="" alt="Benefits of KinetoFlow">
            </div>
            <div class="benefits-content animate-on-scroll slide-right" data-delay="0.4s">
              <h2>Transform Your Therapy Delivery</h2>
              <div class="benefit-item">
                <span class="benefit-icon"><i class="fas fa-tachometer-alt"></i></span>
                <div>
                  <h4>Boost Efficiency</h4>
                  <p>Reduce administrative overhead and manual tracking, freeing up time for patient care.</p>
                </div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon"><i class="fas fa-users"></i></span>
                <div>
                  <h4>Enhance Patient Engagement</h4>
                  <p>Keep patients motivated and compliant with interactive plans and easy communication.</p>
                </div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon"><i class="fas fa-clipboard-check"></i></span>
                <div>
                  <h4>Improve Outcomes</h4>
                  <p>Leverage data to personalize treatments and demonstrate measurable progress.</p>
                </div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon"><i class="fas fa-expand-arrows-alt"></i></span>
                <div>
                  <h4>Scale Your Business</h4>
                  <p>Manage multiple locations, teams, and a growing patient base with ease.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Call to Action Section -->
      <section id="cta" class="section">
        <div class="container animate-on-scroll fade-in">
          <h2>Ready to Revolutionize Your Practice?</h2>
          <p>See KinetoFlow in action and discover how it can specifically benefit your Kineto Therapy company. Request a personalized demo today!</p>
          <a href="#" class="cta-button-secondary" @click.prevent="handleDemoRequest">Request Your Free Demo</a>
          <!-- Maybe link to /register or /contact later -->
        </div>
      </section>
  
      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <a href="#" class="footer-logo" @click="smoothScroll">KinetoFlow</a>
            <ul class="footer-links">
              <li><router-link to="/privacy">Privacy Policy</router-link></li>
              <li><router-link to="/terms">Terms of Service</router-link></li>
              <li><a href="#features" @click="smoothScrollAndCloseMenu">Features</a></li>
              <li><a href="#cta" @click="smoothScrollAndCloseMenu">Contact</a></li>
            </ul>
            <ul class="social-icons">
              <li><a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook-f"></i></a></li>
              <li><a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i></a></li>
              <li><a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin-in"></i></a></li>
              <li><a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a></li>
            </ul>
            <p class="footer-copy">© {{ new Date().getFullYear() }} KinetoFlow. All rights reserved. Conceptual design.</p>
          </div>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import { RouterLink } from 'vue-router'; // Import RouterLink for internal links
  
  const isMenuOpen = ref(false);
  let observer = null; // Declare observer variable
  
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
    document.body.style.overflow = isMenuOpen.value ? 'hidden' : '';
  };
  
  const closeMenu = () => {
      if (isMenuOpen.value) {
          isMenuOpen.value = false;
          document.body.style.overflow = '';
      }
  };
  
  const smoothScroll = (event) => {
      event.preventDefault();
      const targetId = event.target.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
          // Calculate offset if navbar is fixed
          const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20; // Extra 20px buffer
  
          window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
          });
      }
  }
  
  const smoothScrollAndCloseMenu = (event) => {
      smoothScroll(event);
      // Use nextTick to ensure the scroll starts before the menu potentially blocks the view
      nextTick(() => {
        closeMenu();
      });
  }
  
  // --- Navbar style change on scroll ---
  const handleScroll = () => {
    const navBar = document.getElementById('navbar');
    if (navBar) { // Check if navbar exists
       if (window.scrollY > 50) {
          navBar.classList.add('scrolled');
       } else {
          navBar.classList.remove('scrolled');
       }
    }
  };
  
  // --- Scroll-based Animations ---
  const setupScrollAnimations = () => {
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
  
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const delay = el.dataset.delay || window.getComputedStyle(el).transitionDelay || '0s';
  
        if (entry.isIntersecting) {
          // Use setTimeout for delay reliability across browsers
           setTimeout(() => {
              el.classList.add('animated');
           }, parseFloat(delay) * 1000); // Convert delay string (e.g., "0.1s") to ms
  
           // Optional: Stop observing after animation
           // observer.unobserve(el);
        } else {
          // Optional: Remove class to re-animate (more complex)
           // Requires resetting initial transform/opacity if 'animated' is removed
           // el.classList.remove('animated');
           // Maybe re-add initial state classes like 'slide-up' etc.
        }
      });
    }, {
      threshold: 0.15 // Trigger when 15% of the element is visible
    });
  
    scrollElements.forEach(el => {
      observer.observe(el);
    });
  };
  
  const handleDemoRequest = () => {
      // Implement what happens when "Request Demo" is clicked
      // e.g., show a modal, scroll to a contact form, or navigate to a contact page
      console.log("Demo request clicked");
      // Example: Smooth scroll to CTA section (if it contained a form)
      const ctaSection = document.getElementById('cta');
      if (ctaSection) {
          const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
          const elementPosition = ctaSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
           window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
          });
      }
      // Or show a modal, etc.
  }
  
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    setupScrollAnimations();
  });
  
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    if (observer) {
       observer.disconnect(); // Clean up the observer
    }
    document.body.style.overflow = ''; // Ensure scroll is reset if component is destroyed while menu is open
  });
  </script>
  
  <style scoped>
   /* Scoped styles specific to HomePage if needed. */
   /* landing.css is loaded globally, so most styles are already applied. */
  </style>