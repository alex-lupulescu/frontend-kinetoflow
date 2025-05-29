<template>
  <!-- Modal Overlay -->
  <div 
    v-if="isVisible" 
    class="modal-overlay"
    @click="closeModal"
  >
    <!-- Modal Container -->
    <div 
      class="modal-container"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <div class="header-text">
            <h2 class="modal-title">Creează Voucher Nou</h2>
            <p class="modal-subtitle">Configurează un voucher pentru pacienții tăi</p>
          </div>
        </div>
        <button 
          type="button" 
          class="modal-close-btn"
          @click="closeModal"
          aria-label="Închide"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" ref="modalBody">
        <form @submit.prevent="createVoucher" class="voucher-form">
          <!-- Form Steps Indicator -->
          <div class="form-steps">
            <div class="step" :class="{ active: currentStep >= 1 }" @click="scrollToSection('basic-info')" title="Click pentru a naviga la secțiunea Informații de bază">
              <div class="step-number">1</div>
              <span class="step-label">Informații de bază</span>
            </div>
            <div class="step-divider"></div>
            <div class="step" :class="{ active: currentStep >= 2 }" @click="scrollToSection('discount-config')" title="Click pentru a naviga la secțiunea Configurare discount">
              <div class="step-number">2</div>
              <span class="step-label">Configurare discount</span>
            </div>
            <div class="step-divider"></div>
            <div class="step" :class="{ active: currentStep >= 3 }" @click="scrollToSection('period-limits')" title="Click pentru a naviga la secțiunea Perioada și limite">
              <div class="step-number">3</div>
              <span class="step-label">Perioada și limite</span>
            </div>
          </div>

          <!-- Basic Information Section -->
          <div class="form-section" id="basic-info" ref="basicInfoSection">
            <div class="section-header">
              <h3 class="section-title">
                <i class="fas fa-info-circle"></i>
                Informații de bază
              </h3>
              <p class="section-description">Definește codul și numele voucher-ului</p>
            </div>

            <div class="form-grid">
              <!-- Voucher Code -->
              <div class="form-group">
                <label for="voucherCode" class="form-label">
                  <i class="fas fa-tag"></i>
                  Cod Voucher <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    class="form-input"
                    id="voucherCode"
                    v-model="form.code"
                    :class="{ 'error': errors.code, 'success': form.code && !errors.code }"
                    placeholder="ex: DISCOUNT20, WELCOME50"
                    maxlength="50"
                    required
                    @input="updateStepProgress"
                  />
                  <div class="input-icon">
                    <i class="fas fa-check" v-if="form.code && !errors.code"></i>
                  </div>
                </div>
                <div class="form-hint">
                  <i class="fas fa-lightbulb"></i>
                  Doar litere mari, cifre, underscore și liniuțe
                </div>
                <div v-if="errors.code" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.code }}
                </div>
              </div>

              <!-- Voucher Name -->
              <div class="form-group">
                <label for="voucherName" class="form-label">
                  <i class="fas fa-signature"></i>
                  Nume Voucher <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    class="form-input"
                    id="voucherName"
                    v-model="form.name"
                    :class="{ 'error': errors.name, 'success': form.name && !errors.name }"
                    placeholder="ex: Discount 20%, Voucher de bun venit"
                    maxlength="150"
                    required
                    @input="updateStepProgress"
                  />
                  <div class="input-icon">
                    <i class="fas fa-check" v-if="form.name && !errors.name"></i>
                  </div>
                </div>
                <div v-if="errors.name" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.name }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="voucherDescription" class="form-label">
                <i class="fas fa-align-left"></i>
                Descriere
              </label>
              <div class="textarea-wrapper">
                <textarea
                  class="form-textarea"
                  id="voucherDescription"
                  v-model="form.description"
                  :class="{ 'error': errors.description }"
                  placeholder="Descriere opțională pentru voucher..."
                  maxlength="500"
                  rows="3"
                  @input="updateStepProgress"
                ></textarea>
                <div class="char-counter">{{ (form.description || '').length }}/500</div>
              </div>
              <div v-if="errors.description" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ errors.description }}
              </div>
            </div>
          </div>

          <!-- Discount Configuration Section -->
          <div class="form-section" id="discount-config" ref="discountConfigSection">
            <div class="section-header">
              <h3 class="section-title">
                <i class="fas fa-percentage"></i>
                Configurare Discount
              </h3>
              <p class="section-description">Stabilește tipul și valoarea discount-ului</p>
            </div>

            <div class="form-grid">
              <!-- Discount Type -->
              <div class="form-group">
                <label for="discountType" class="form-label">
                  <i class="fas fa-sliders-h"></i>
                  Tip Discount <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <select
                    class="form-select"
                    id="discountType"
                    v-model="form.discountType"
                    :class="{ 'error': errors.discountType, 'success': form.discountType && !errors.discountType }"
                    required
                    @change="updateStepProgress"
                  >
                    <option value="">Selectează tipul</option>
                    <option value="PERCENTAGE">📊 Procent (%)</option>
                    <option value="FIXED_AMOUNT">💰 Sumă fixă (RON)</option>
                  </select>
                  <div class="select-icon">
                    <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
                <div v-if="errors.discountType" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.discountType }}
                </div>
              </div>

              <!-- Discount Value -->
              <div class="form-group">
                <label for="discountValue" class="form-label">
                  <i class="fas fa-calculator"></i>
                  Valoare Discount <span class="required">*</span>
                </label>
                <div class="input-group">
                  <div class="input-wrapper">
                    <input
                      type="number"
                      class="form-input"
                      id="discountValue"
                      v-model.number="form.discountValue"
                      :class="{ 'error': errors.discountValue, 'success': form.discountValue && !errors.discountValue }"
                      :placeholder="form.discountType === 'PERCENTAGE' ? 'ex: 20' : 'ex: 50'"
                      :max="form.discountType === 'PERCENTAGE' ? 100 : null"
                      min="0.01"
                      step="0.01"
                      required
                      @input="updateStepProgress"
                    />
                    <div class="input-suffix">
                      <span class="suffix-badge" :class="form.discountType === 'PERCENTAGE' ? 'percentage' : 'currency'">
                        {{ form.discountType === 'PERCENTAGE' ? '%' : 'RON' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="errors.discountValue" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.discountValue }}
                </div>
              </div>
            </div>

            <!-- Minimum Order Value -->
            <div class="form-group">
              <label for="minimumOrderValue" class="form-label">
                <i class="fas fa-shopping-cart"></i>
                Valoare Minimă Comandă (RON)
              </label>
              <div class="input-wrapper">
                <input
                  type="number"
                  class="form-input"
                  id="minimumOrderValue"
                  v-model.number="form.minimumOrderValue"
                  :class="{ 'error': errors.minimumOrderValue }"
                  placeholder="ex: 100 (opțional)"
                  min="0"
                  step="0.01"
                  @input="updateStepProgress"
                />
                <div class="input-icon">
                  <i class="fas fa-coins"></i>
                </div>
              </div>
              <div class="form-hint">
                <i class="fas fa-lightbulb"></i>
                Suma minimă pentru care poate fi aplicat voucherul
              </div>
              <div v-if="errors.minimumOrderValue" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ errors.minimumOrderValue }}
              </div>
            </div>
          </div>

          <!-- Period and Limits Section -->
          <div class="form-section" id="period-limits" ref="periodLimitsSection">
            <div class="section-header">
              <h3 class="section-title">
                <i class="fas fa-calendar-alt"></i>
                Perioada și Limite
              </h3>
              <p class="section-description">Definește perioada de valabilitate și limitele de utilizare</p>
            </div>

            <div class="form-grid">
              <!-- Start Date -->
              <div class="form-group">
                <label for="startDate" class="form-label">
                  <i class="fas fa-play"></i>
                  Data Început <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="date"
                    class="form-input date-input"
                    id="startDate"
                    v-model="form.startDate"
                    :class="{ 'error': errors.startDate, 'success': form.startDate && !errors.startDate }"
                    :min="today"
                    required
                    @change="updateStepProgress"
                  />
                </div>
                <div v-if="errors.startDate" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.startDate }}
                </div>
              </div>

              <!-- End Date -->
              <div class="form-group">
                <label for="endDate" class="form-label">
                  <i class="fas fa-stop"></i>
                  Data Sfârșit <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="date"
                    class="form-input date-input"
                    id="endDate"
                    v-model="form.endDate"
                    :class="{ 'error': errors.endDate, 'success': form.endDate && !errors.endDate }"
                    :min="form.startDate || today"
                    required
                    @change="updateStepProgress"
                  />
                </div>
                <div v-if="errors.endDate" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.endDate }}
                </div>
              </div>
            </div>

            <div class="form-grid">
              <!-- Max Total Uses -->
              <div class="form-group">
                <label for="maxTotalUses" class="form-label">
                  <i class="fas fa-users"></i>
                  Număr Maxim Utilizări Totale
                </label>
                <div class="input-wrapper">
                  <input
                    type="number"
                    class="form-input"
                    id="maxTotalUses"
                    v-model.number="form.maxTotalUses"
                    :class="{ 'error': errors.maxTotalUses }"
                    placeholder="ex: 100 (opțional)"
                    min="1"
                    @input="updateStepProgress"
                  />
                  <div class="input-icon">
                    <i class="fas fa-infinity" v-if="!form.maxTotalUses"></i>
                    <i class="fas fa-hashtag" v-else></i>
                  </div>
                </div>
                <div class="form-hint">
                  <i class="fas fa-lightbulb"></i>
                  Lăsați gol pentru utilizări nelimitate
                </div>
                <div v-if="errors.maxTotalUses" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.maxTotalUses }}
                </div>
              </div>

              <!-- Max Uses Per Patient -->
              <div class="form-group">
                <label for="maxUsesPerPatient" class="form-label">
                  <i class="fas fa-user"></i>
                  Număr Maxim Utilizări per Pacient
                </label>
                <div class="input-wrapper">
                  <input
                    type="number"
                    class="form-input"
                    id="maxUsesPerPatient"
                    v-model.number="form.maxUsesPerPatient"
                    :class="{ 'error': errors.maxUsesPerPatient }"
                    placeholder="ex: 1 (opțional)"
                    min="1"
                    @input="updateStepProgress"
                  />
                  <div class="input-icon">
                    <i class="fas fa-infinity" v-if="!form.maxUsesPerPatient"></i>
                    <i class="fas fa-hashtag" v-else></i>
                  </div>
                </div>
                <div class="form-hint">
                  <i class="fas fa-lightbulb"></i>
                  Lăsați gol pentru utilizări nelimitate per pacient
                </div>
                <div v-if="errors.maxUsesPerPatient" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.maxUsesPerPatient }}
                </div>
              </div>
            </div>
          </div>

          <!-- Preview Section -->
          <div v-if="isFormValid" class="voucher-preview">
            <div class="preview-header">
              <h4 class="preview-title">
                <i class="fas fa-eye"></i>
                Preview Voucher
              </h4>
              <div class="preview-badge">
                <i class="fas fa-magic"></i>
                Gata de creare
              </div>
            </div>
            
            <div class="preview-card">
              <div class="preview-voucher">
                <div class="voucher-design">
                  <div class="voucher-pattern"></div>
                  <div class="voucher-content">
                    <div class="voucher-header-preview">
                      <h5 class="voucher-name-preview">{{ form.name }}</h5>
                      <div class="voucher-code-preview">{{ form.code }}</div>
                    </div>
                    
                    <div class="voucher-discount-preview">
                      <div class="discount-value-large">{{ formatDiscountPreview() }}</div>
                      <div class="discount-label">DISCOUNT</div>
                    </div>
                    
                    <div class="voucher-details-preview">
                      <div class="detail-item" v-if="form.minimumOrderValue">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Comandă min. {{ form.minimumOrderValue }} RON</span>
                      </div>
                      <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>{{ formatDate(form.startDate) }} - {{ formatDate(form.endDate) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="closeModal"
            >
              <i class="fas fa-times"></i>
              Anulează
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading || !isFormValid"
            >
              <div class="btn-content">
                <i class="fas fa-spinner fa-spin" v-if="loading"></i>
                <i class="fas fa-plus" v-else></i>
                <span>{{ loading ? 'Se creează...' : 'Creează Voucher' }}</span>
              </div>
              <div class="btn-shine" v-if="!loading && isFormValid"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import VoucherService from '../services/VoucherService.js';

export default {
  name: 'CreateVoucherModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'voucher-created'],
  data() {
    return {
      loading: false,
      form: {
        code: '',
        name: '',
        description: '',
        discountType: '',
        discountValue: null,
        minimumOrderValue: null,
        startDate: '',
        endDate: '',
        maxTotalUses: null,
        maxUsesPerPatient: null
      },
      errors: {},
      currentStep: 1,
      intersectionObserver: null
    };
  },
  computed: {
    today() {
      return new Date().toISOString().split('T')[0];
    },
    isFormValid() {
      return this.form.code && 
             this.form.name && 
             this.form.discountType && 
             this.form.discountValue && 
             this.form.startDate && 
             this.form.endDate &&
             Object.keys(this.errors).length === 0;
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
        this.form.startDate = this.today;
        this.$nextTick(() => {
          this.setupScrollSpy();
        });
      } else {
        document.body.style.overflow = '';
        this.resetForm();
        this.cleanupScrollSpy();
      }
    },
    'form.code'(newVal) {
      if (newVal) {
        this.form.code = newVal.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      }
      this.updateStepProgress();
    },
    'form.name'() {
      this.updateStepProgress();
    },
    'form.discountType'() {
      this.validateDiscountValue();
      this.updateStepProgress();
    },
    'form.discountValue'() {
      this.validateDiscountValue();
      this.updateStepProgress();
    },
    'form.startDate'() {
      this.validateDates();
      this.updateStepProgress();
    },
    'form.endDate'() {
      this.validateDates();
      this.updateStepProgress();
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },

    async createVoucher() {
      if (!this.validateForm()) return;

      this.loading = true;
      try {
        const voucherData = { ...this.form };
        
        // Remove null values
        Object.keys(voucherData).forEach(key => {
          if (voucherData[key] === null || voucherData[key] === '') {
            delete voucherData[key];
          }
        });

        const createdVoucher = await VoucherService.createVoucher(voucherData);
        
        this.$emit('voucher-created', createdVoucher);
        this.showSuccessMessage('Voucher creat cu succes!');
        this.closeModal();
        
      } catch (error) {
        console.error('Error creating voucher:', error);
        this.handleApiError(error);
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      this.errors = {};
      
      // Validate required fields
      if (!this.form.code) this.errors.code = 'Codul este obligatoriu';
      if (!this.form.name) this.errors.name = 'Numele este obligatoriu';
      if (!this.form.discountType) this.errors.discountType = 'Tipul discount-ului este obligatoriu';
      if (!this.form.discountValue) this.errors.discountValue = 'Valoarea discount-ului este obligatorie';
      if (!this.form.startDate) this.errors.startDate = 'Data de început este obligatorie';
      if (!this.form.endDate) this.errors.endDate = 'Data de sfârșit este obligatorie';
      
      this.validateDiscountValue();
      this.validateDates();
      
      return Object.keys(this.errors).length === 0;
    },

    validateDiscountValue() {
      if (this.form.discountType === 'PERCENTAGE' && this.form.discountValue > 100) {
        this.errors.discountValue = 'Procentul nu poate fi mai mare de 100%';
      } else if (this.form.discountValue <= 0) {
        this.errors.discountValue = 'Valoarea trebuie să fie mai mare de 0';
      } else {
        delete this.errors.discountValue;
      }
    },

    validateDates() {
      const today = new Date().toISOString().split('T')[0];
      
      if (this.form.startDate < today) {
        this.errors.startDate = 'Data de început nu poate fi în trecut';
      } else {
        delete this.errors.startDate;
      }
      
      if (this.form.endDate && this.form.startDate && this.form.endDate <= this.form.startDate) {
        this.errors.endDate = 'Data de sfârșit trebuie să fie după data de început';
      } else {
        delete this.errors.endDate;
      }
    },

    formatDiscountPreview() {
      if (!this.form.discountType || !this.form.discountValue) return '';
      
      if (this.form.discountType === 'PERCENTAGE') {
        return `${this.form.discountValue}%`;
      } else {
        return `${this.form.discountValue} RON`;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ro-RO');
    },

    resetForm() {
      this.form = {
        code: '',
        name: '',
        description: '',
        discountType: '',
        discountValue: null,
        minimumOrderValue: null,
        startDate: '',
        endDate: '',
        maxTotalUses: null,
        maxUsesPerPatient: null
      };
      this.errors = {};
    },

    handleApiError(error) {
      if (error.response?.data?.message) {
        this.showErrorMessage(error.response.data.message);
      } else {
        this.showErrorMessage('A apărut o eroare la crearea voucher-ului');
      }
    },

    showSuccessMessage(message) {
      // You can implement a toast notification system here
      alert(message);
    },

    showErrorMessage(message) {
      // You can implement a toast notification system here
      alert(message);
    },

    scrollToSection(sectionId) {
      const section = this.$refs[sectionId + 'Section'];
      if (section) {
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    },

    updateStepProgress() {
      // Step 1: Basic Information
      if (this.form.code && this.form.name) {
        this.currentStep = Math.max(this.currentStep, 2);
      }
      
      // Step 2: Discount Configuration
      if (this.form.discountType && this.form.discountValue) {
        this.currentStep = Math.max(this.currentStep, 3);
      }
      
      // Step 3: Period and Limits
      if (this.form.startDate && this.form.endDate) {
        this.currentStep = Math.max(this.currentStep, 3);
      }
    },

    setupScrollSpy() {
      if (this.intersectionObserver) {
        this.cleanupScrollSpy();
      }

      const options = {
        root: this.$refs.modalBody || null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1
      };

      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            switch (sectionId) {
              case 'basic-info':
                this.currentStep = Math.max(1, this.currentStep);
                break;
              case 'discount-config':
                this.currentStep = Math.max(2, this.currentStep);
                break;
              case 'period-limits':
                this.currentStep = Math.max(3, this.currentStep);
                break;
            }
          }
        });
      }, options);

      // Observe all sections
      const sections = ['basicInfoSection', 'discountConfigSection', 'periodLimitsSection'];
      sections.forEach(sectionRef => {
        const section = this.$refs[sectionRef];
        if (section) {
          this.intersectionObserver.observe(section);
        }
      });
    },

    cleanupScrollSpy() {
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      }
    }
  },

  beforeUnmount() {
    document.body.style.overflow = '';
    this.cleanupScrollSpy();
  }
};
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  backdrop-filter: blur(8px);
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

/* Modal Container */
.modal-container {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid var(--border-color);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-40px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-8);
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.modal-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary-200), transparent);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-xl);
  box-shadow: 
    0 10px 25px -5px rgba(var(--primary-500), 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.header-text {
  flex: 1;
}

.modal-title {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--text-primary), var(--primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-subtitle {
  margin: var(--space-1) 0 0 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.modal-close-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: var(--text-lg);
}

.modal-close-btn:hover {
  background: var(--danger-50);
  border-color: var(--danger-200);
  color: var(--danger-600);
  transform: scale(1.05);
}

/* Modal Body */
.modal-body {
  padding: var(--space-8);
  overflow-y: auto;
  flex: 1;
  background: var(--bg-primary);
}

/* Form Styles */
.voucher-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Form Steps */
.form-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.3s ease;
  opacity: 0.5;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  position: relative;
}

.step:hover {
  opacity: 0.8;
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.step.active {
  opacity: 1;
  color: var(--primary-600);
}

.step.active:hover {
  background: var(--primary-50);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.step:hover .step-number {
  transform: scale(1.1);
  border-color: var(--primary-300);
}

.step.active .step-number {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-color: var(--primary-500);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--primary-500), 0.3);
}

.step.active .step-number::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: stepShine 2s ease-in-out infinite;
}

@keyframes stepShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.step-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.step:hover .step-label {
  color: var(--primary-600);
  font-weight: var(--font-semibold);
}

.step.active .step-label {
  color: var(--primary-700);
  font-weight: var(--font-bold);
}

.step-divider {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, var(--border-color), var(--primary-200), var(--border-color));
  border-radius: var(--radius-full);
  margin: 0 var(--space-4);
  max-width: 60px;
  transition: all 0.3s ease;
}

.step.active + .step-divider {
  background: linear-gradient(90deg, var(--primary-300), var(--primary-500), var(--primary-300));
  box-shadow: 0 0 8px rgba(var(--primary-500), 0.3);
}

/* Form Sections */
.form-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-500), var(--secondary-500), var(--primary-500));
  border-radius: var(--radius-full);
}

.form-section:hover {
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.section-header {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-title i {
  color: var(--primary-500);
  font-size: var(--text-base);
}

.section-description {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-sm);
  margin: 0;
}

.form-label i {
  color: var(--primary-500);
  font-size: var(--text-sm);
}

.required {
  color: var(--danger-500);
  font-weight: var(--font-bold);
}

/* Input Styles */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-4);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: var(--font-medium);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 
    0 0 0 4px rgba(var(--primary-500), 0.1),
    0 4px 12px rgba(var(--primary-500), 0.15);
  transform: translateY(-1px);
}

.form-input.success,
.form-textarea.success,
.form-select.success {
  border-color: var(--success-500);
  background: var(--success-50);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: var(--danger-500);
  background: var(--danger-50);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.date-input {
  color-scheme: light;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
}

.textarea-wrapper {
  position: relative;
}

.char-counter {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

/* Select Styles */
.select-wrapper {
  position: relative;
}

.form-select {
  appearance: none;
  cursor: pointer;
  padding-right: var(--space-12);
}

.select-icon {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
  transition: transform 0.3s ease;
}

.form-select:focus + .select-icon {
  transform: translateY(-50%) rotate(180deg);
}

/* Input Icons and Suffixes */
.input-icon {
  position: absolute;
  right: var(--space-4);
  color: var(--success-500);
  font-size: var(--text-sm);
  pointer-events: none;
  animation: checkmark 0.3s ease-in-out;
}

@keyframes checkmark {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.input-group {
  position: relative;
}

.input-suffix {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.suffix-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.suffix-badge.percentage {
  background: var(--primary-100);
  color: var(--primary-700);
}

.suffix-badge.currency {
  background: var(--success-100);
  color: var(--success-700);
}

/* Form Hints and Errors */
.form-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.form-hint i {
  color: var(--info-500);
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--danger-600);
  font-weight: var(--font-semibold);
  background: var(--danger-50);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--danger-200);
}

/* Voucher Preview */
.voucher-preview {
  background: linear-gradient(135deg, var(--primary-50), var(--secondary-50));
  border: 2px solid var(--primary-200);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
  animation: previewSlideIn 0.5s ease-out;
}

@keyframes previewSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.voucher-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.preview-title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.preview-badge {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--success-500), var(--success-600));
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  box-shadow: 0 4px 12px rgba(var(--success-500), 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.preview-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
}

.preview-voucher {
  width: 100%;
  max-width: 350px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
  transform: perspective(1000px) rotateX(5deg);
  transition: transform 0.3s ease;
}

.preview-voucher:hover {
  transform: perspective(1000px) rotateX(0deg) scale(1.02);
}

.voucher-design {
  position: relative;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  padding: var(--space-6);
  color: white;
}

.voucher-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 30px 30px;
}

.voucher-content {
  position: relative;
  z-index: 1;
}

.voucher-header-preview {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.voucher-name-preview {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: white;
  line-height: 1.2;
}

.voucher-code-preview {
  background: rgba(255, 255, 255, 0.2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: white;
  backdrop-filter: blur(10px);
}

.voucher-discount-preview {
  text-align: center;
  margin: var(--space-6) 0;
}

.discount-value-large {
  font-size: var(--text-4xl);
  font-weight: var(--font-black);
  color: white;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.discount-label {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.8);
  font-weight: var(--font-bold);
  letter-spacing: 0.1em;
  margin-top: var(--space-1);
}

.voucher-details-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.9);
}

.detail-item i {
  width: 16px;
  text-align: center;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-4);
  padding: var(--space-8);
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
  border-top: 1px solid var(--border-color);
  position: relative;
}

.modal-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary-200), transparent);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  min-width: 140px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  box-shadow: 
    0 4px 12px rgba(var(--primary-500), 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(var(--primary-500), 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-quaternary);
  color: var(--text-primary);
  border-color: var(--primary-300);
  transform: translateY(-1px);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
  z-index: 2;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .modal-container {
    max-height: 95vh;
    border-radius: var(--radius-xl);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-6);
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .modal-title {
    font-size: var(--text-xl);
  }
  
  .form-steps {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .step-divider {
    display: none;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-section {
    padding: var(--space-4);
  }
  
  .section-title {
    font-size: var(--text-base);
  }
  
  .preview-voucher {
    max-width: 280px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    gap: var(--space-3);
  }
  
  .btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-4);
  }
  
  .header-content {
    gap: var(--space-3);
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .modal-title {
    font-size: var(--text-lg);
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    padding: var(--space-3);
  }
  
  .voucher-design {
    padding: var(--space-4);
  }
  
  .discount-value-large {
    font-size: var(--text-3xl);
  }
}
</style> 