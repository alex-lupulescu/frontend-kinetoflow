<template>
  <div class="searchable-dropdown" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <!-- Dropdown Trigger -->
    <div 
      class="dropdown-trigger" 
      @click="toggleDropdown"
      @keydown.enter="toggleDropdown"
      @keydown.space="toggleDropdown"
      @keydown.arrow-down="openDropdown"
      tabindex="0"
      :class="{ 'has-value': modelValue, 'is-invalid': isInvalid }"
    >
      <div class="selected-content">
        <i v-if="icon" :class="icon" class="dropdown-icon"></i>
        <span v-if="modelValue && selectedOption" class="selected-text">
          {{ getDisplayText(selectedOption) }}
        </span>
        <span v-else class="placeholder-text">
          {{ placeholder }}
        </span>
      </div>
      <div class="dropdown-indicators">
        <button 
          v-if="modelValue && clearable" 
          @click.stop="clearSelection"
          class="clear-button"
          type="button"
          :disabled="disabled"
        >
          <i class="fas fa-times"></i>
        </button>
        <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'is-open': isOpen }"></i>
      </div>
    </div>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu" ref="dropdownMenu">
        <!-- Search Input -->
        <div v-if="searchable" class="search-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              ref="searchInput"
              v-model="searchTerm"
              type="text"
              class="search-input"
              :placeholder="searchPlaceholder"
              @keydown.arrow-down.prevent="highlightNext"
              @keydown.arrow-up.prevent="highlightPrevious"
              @keydown.enter.prevent="selectHighlighted"
              @keydown.escape="closeDropdown"
            />
            <button 
              v-if="searchTerm" 
              @click="clearSearch" 
              class="clear-search-button"
              type="button"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Options List -->
        <div class="options-container" :style="{ maxHeight: maxHeight }">
          <div v-if="loading" class="option-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>{{ loadingText }}</span>
          </div>
          
          <div v-else-if="filteredOptions.length === 0" class="option-empty">
            <i class="fas fa-search"></i>
            <span>{{ noOptionsText }}</span>
          </div>
          
          <div v-else class="options-list">
            <div
              v-for="(option, index) in filteredOptions"
              :key="getOptionKey(option)"
              class="dropdown-option"
              :class="{ 
                'is-selected': isSelected(option), 
                'is-highlighted': highlightedIndex === index,
                'is-disabled': isOptionDisabled(option),
                'has-payment-status': hasPaymentStatus(option)
              }"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <div class="option-content">
                <i v-if="getOptionIcon(option)" 
                   :class="getOptionIcon(option)" 
                   class="option-icon"
                   :style="getIconStyle(option)"></i>
                <div class="option-text">
                  <div class="option-title" v-html="highlightSearchTerm(getDisplayText(option))"></div>
                  <div v-if="getOptionSubtext(option)" class="option-subtitle">
                    {{ getOptionSubtext(option) }}
                  </div>
                  <!-- Payment Status Display -->
                  <div v-if="hasPaymentStatus(option)" class="option-payment-status" :style="getPaymentStatusStyle(option)">
                    <i :class="getPaymentIcon(option)" class="payment-status-icon"></i>
                    <span class="payment-status-text">{{ getPaymentStatusText(option) }}</span>
                  </div>
                </div>
                <div v-if="getOptionMeta(option)" class="option-meta">
                  {{ getOptionMeta(option) }}
                </div>
              </div>
              <i v-if="isSelected(option)" class="fas fa-check option-check"></i>
            </div>
          </div>
        </div>

        <!-- Footer (if provided) -->
        <div v-if="$slots.footer" class="dropdown-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </transition>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select an option...'
  },
  searchPlaceholder: {
    type: String,
    default: 'Search options...'
  },
  searchable: {
    type: Boolean,
    default: true
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  noOptionsText: {
    type: String,
    default: 'No options found'
  },
  maxHeight: {
    type: String,
    default: '300px'
  },
  icon: {
    type: String,
    default: ''
  },
  // Properties for display customization
  labelKey: {
    type: String,
    default: 'label'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  subtextKey: {
    type: String,
    default: 'subtext'
  },
  metaKey: {
    type: String,
    default: 'meta'
  },
  iconKey: {
    type: String,
    default: 'icon'
  },
  disabledKey: {
    type: String,
    default: 'disabled'
  },
  errorMessage: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'open', 'close', 'select'])

// State
const isOpen = ref(false)
const searchTerm = ref('')
const highlightedIndex = ref(-1)
const dropdownMenu = ref(null)
const searchInput = ref(null)

// Computed
const isInvalid = computed(() => {
  return props.required && !props.modelValue && props.errorMessage
})

const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find(option => {
    if (typeof option === 'object') {
      return option[props.valueKey] === props.modelValue
    }
    return option === props.modelValue
  })
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchTerm.value) {
    return props.options
  }
  
  const search = searchTerm.value.toLowerCase()
  return props.options.filter(option => {
    const text = getDisplayText(option).toLowerCase()
    const subtext = getOptionSubtext(option)?.toLowerCase() || ''
    return text.includes(search) || subtext.includes(search)
  })
})

// Methods
const getDisplayText = (option) => {
  if (!option) return ''
  if (typeof option === 'string') return option
  return option[props.labelKey] || option.name || option.title || String(option)
}

const getOptionKey = (option) => {
  if (typeof option === 'object') {
    return option[props.valueKey] || option.id || JSON.stringify(option)
  }
  return option
}

const getOptionSubtext = (option) => {
  if (typeof option === 'object') {
    return option[props.subtextKey]
  }
  return null
}

const getOptionMeta = (option) => {
  if (typeof option === 'object') {
    return option[props.metaKey]
  }
  return null
}

const getOptionIcon = (option) => {
  if (typeof option === 'object') {
    return option[props.iconKey]
  }
  return null
}

const isOptionDisabled = (option) => {
  if (typeof option === 'object') {
    return option[props.disabledKey]
  }
  return false
}

const isSelected = (option) => {
  if (!props.modelValue) return false
  if (typeof option === 'object') {
    return option[props.valueKey] === props.modelValue
  }
  return option === props.modelValue
}

const highlightSearchTerm = (text) => {
  if (!props.searchable || !searchTerm.value) return text
  
  const search = searchTerm.value
  const regex = new RegExp(`(${search})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const toggleDropdown = () => {
  if (props.disabled) return
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = () => {
  if (props.disabled) return
  
  isOpen.value = true
  highlightedIndex.value = -1
  
  nextTick(() => {
    if (props.searchable && searchInput.value) {
      searchInput.value.focus()
    }
  })
  
  emit('open')
}

const closeDropdown = () => {
  isOpen.value = false
  searchTerm.value = ''
  highlightedIndex.value = -1
  emit('close')
}

const selectOption = (option) => {
  if (isOptionDisabled(option)) return
  
  const value = typeof option === 'object' ? option[props.valueKey] : option
  emit('update:modelValue', value)
  emit('select', option)
  closeDropdown()
}

const clearSelection = () => {
  emit('update:modelValue', null)
  emit('select', null)
}

const clearSearch = () => {
  searchTerm.value = ''
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const highlightNext = () => {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++
    scrollToHighlighted()
  }
}

const highlightPrevious = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
    scrollToHighlighted()
  }
}

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  }
}

const scrollToHighlighted = () => {
  nextTick(() => {
    const highlighted = dropdownMenu.value?.querySelector('.is-highlighted')
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' })
    }
  })
}

const handleClickOutside = (event) => {
  if (!dropdownMenu.value?.contains(event.target) && !event.target.closest('.searchable-dropdown')) {
    closeDropdown()
  }
}

// Payment status methods
const hasPaymentStatus = (option) => {
  return option && typeof option === 'object' && option.paymentStatus
}

const getPaymentStatusText = (option) => {
  if (hasPaymentStatus(option)) {
    return option.paymentStatusText || option.paymentStatus
  }
  return ''
}

const getPaymentIcon = (option) => {
  if (hasPaymentStatus(option)) {
    return option.paymentIcon || 'fas fa-info-circle'
  }
  return ''
}

const getPaymentStatusStyle = (option) => {
  if (hasPaymentStatus(option) && option.paymentColor) {
    return {
      color: option.paymentColor,
      borderColor: option.paymentColor
    }
  }
  return {}
}

const getIconStyle = (option) => {
  if (hasPaymentStatus(option) && option.paymentColor) {
    return {
      color: option.paymentColor
    }
  }
  return {}
}

// Watchers
watch(searchTerm, (newTerm) => {
  highlightedIndex.value = -1
  emit('search', newTerm)
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.searchable-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.dropdown-trigger:hover:not(.is-disabled) {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dropdown-trigger:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dropdown-trigger.has-value {
  border-color: #10b981;
}

.dropdown-trigger.is-invalid {
  border-color: #ef4444;
}

.is-disabled .dropdown-trigger {
  background: #f8fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

.selected-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.dropdown-icon {
  color: #6b7280;
  font-size: 1.1rem;
}

.selected-text {
  color: #1f2937;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder-text {
  color: #9ca3af;
}

.dropdown-indicators {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.clear-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.dropdown-arrow {
  color: #6b7280;
  transition: transform 0.2s ease;
  font-size: 0.875rem;
}

.dropdown-arrow.is-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  overflow: hidden;
}

.search-container {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
  font-size: 0.875rem;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #fff;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.clear-search-button {
  position: absolute;
  right: 0.5rem;
  width: 20px;
  height: 20px;
  border: none;
  background: #e5e7eb;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.75rem;
}

.clear-search-button:hover {
  background: #d1d5db;
}

.options-container {
  overflow-y: auto;
  max-height: 300px;
}

.option-loading,
.option-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.option-loading i {
  color: #3b82f6;
}

.options-list {
  padding: 0.25rem 0;
}

.dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover:not(.is-disabled) {
  background-color: #f8fafc;
}

.dropdown-option.is-highlighted {
  background-color: #eff6ff;
  border-color: #dbeafe;
}

.dropdown-option.is-selected {
  background-color: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
}

.dropdown-option.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #9ca3af;
}

.dropdown-option.has-payment-status {
  border-left: 3px solid transparent;
}

.dropdown-option.has-payment-status.is-selected {
  border-left-color: #3b82f6;
}

.option-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.option-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  min-width: 0;
}

.option-title {
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
  word-break: break-word;
}

.option-title :deep(mark) {
  background: #fef3c7;
  color: #92400e;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
}

.option-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
  line-height: 1.3;
}

.option-payment-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.375rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.payment-status-icon {
  font-size: 0.75rem;
}

.payment-status-text {
  white-space: nowrap;
}

.option-meta {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.option-check {
  color: #10b981;
  font-size: 1rem;
  flex-shrink: 0;
}

.dropdown-footer {
  border-top: 1px solid #f1f5f9;
  padding: 0.75rem;
  background: #f8fafc;
}

.error-message {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scaleY(0.8) translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8) translateY(-10px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .dropdown-trigger {
    padding: 0.625rem 0.875rem;
    font-size: 0.9rem;
  }
  
  .dropdown-menu {
    max-height: 60vh;
  }
  
  .search-container {
    padding: 0.625rem;
  }
  
  .dropdown-option {
    padding: 0.625rem 0.875rem;
  }
  
  .option-title {
    font-size: 0.9rem;
  }
  
  .option-subtitle {
    font-size: 0.75rem;
  }
}
</style> 