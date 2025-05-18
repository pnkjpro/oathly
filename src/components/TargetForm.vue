<!-- components/TargetForm.vue -->
<template>
  <div class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="saveTarget">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ editing ? 'Edit Target' : 'Add New Target' }}
                </h3>
                <div class="mt-6 space-y-6">
                  <!-- Basic info -->
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Target Name</label>
                    <div class="mt-1">
                      <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        v-model="formData.name" 
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., BSPHCL Exam Preparation"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <div class="mt-1">
                      <textarea 
                        id="description" 
                        name="description" 
                        rows="3" 
                        v-model="formData.description" 
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Describe your target and why it's important to you"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Dates -->
                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
                      <div class="mt-1">
                        <input 
                          type="date" 
                          name="startDate" 
                          id="startDate" 
                          v-model="formData.startDate" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
                      <div class="mt-1">
                        <input 
                          type="date" 
                          name="endDate" 
                          id="endDate" 
                          v-model="formData.endDate" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Target parameters -->
                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label for="dailyTarget" class="block text-sm font-medium text-gray-700">Daily Target (hours)</label>
                      <div class="mt-1">
                        <input 
                          type="number" 
                          name="dailyTarget" 
                          id="dailyTarget" 
                          min="0.5"
                          step="0.5"
                          v-model="formData.dailyTarget" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label for="targetDays" class="block text-sm font-medium text-gray-700">Target Days (total)</label>
                      <div class="mt-1">
                        <input 
                          type="number" 
                          name="targetDays" 
                          id="targetDays" 
                          min="1"
                          v-model="formData.targetDays" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label for="bufferDays" class="block text-sm font-medium text-gray-700">Buffer Days Allowed</label>
                      <div class="mt-1">
                        <input 
                          type="number" 
                          name="bufferDays" 
                          id="bufferDays" 
                          min="0"
                          v-model="formData.bufferDays" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <p class="mt-1 text-xs text-gray-500">Days you can miss without penalty</p>
                    </div>
                    <div>
                      <label for="weeklyFrequency" class="block text-sm font-medium text-gray-700">Weekly Frequency (days)</label>
                      <div class="mt-1">
                        <input 
                          type="number" 
                          name="weeklyFrequency" 
                          id="weeklyFrequency" 
                          min="1"
                          max="7"
                          v-model="formData.weeklyFrequency" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <p class="mt-1 text-xs text-gray-500">Days per week you aim to meet the target</p>
                    </div>
                  </div>

                  <!-- Reward settings -->
                  <div>
                    <label for="rewardItem" class="block text-sm font-medium text-gray-700">Reward Item</label>
                    <div class="mt-1">
                      <input 
                        type="text" 
                        name="rewardItem" 
                        id="rewardItem" 
                        v-model="formData.rewardItem" 
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., Moto Buds Plus 2"
                        required
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label for="rewardCost" class="block text-sm font-medium text-gray-700">Reward Cost (₹)</label>
                      <div class="mt-1">
                        <input 
                          type="number" 
                          name="rewardCost" 
                          id="rewardCost" 
                          min="1"
                          v-model="formData.rewardCost" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label for="dailyEarn" class="block text-sm font-medium text-gray-700">Daily Earn Amount (₹)</label>
                      <div class="mt-1">
                        <input 
                          type="number" 
                          name="dailyEarn" 
                          id="dailyEarn" 
                          min="1"
                          v-model="formData.dailyEarn" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <p class="mt-1 text-xs text-gray-500">Virtual amount earned per completed day</p>
                    </div>
                  </div>

                  <!-- Partial reward settings -->
                  <div class="border-t border-gray-200 pt-4">
                    <div class="flex items-center">
                      <input 
                        id="enablePartialReward" 
                        name="enablePartialReward" 
                        type="checkbox" 
                        v-model="formData.enablePartialReward"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="enablePartialReward" class="ml-2 block text-sm text-gray-900">
                        Enable Partial Reward
                      </label>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Get a partial reward if you meet a lower threshold</p>
                  </div>

                  <div v-if="formData.enablePartialReward" class="grid grid-cols-2 gap-6">
                    <div>
                      <label for="partialThreshold" class="block text-sm font-medium text-gray-700">Partial Threshold (days)</label>
                      <div class="mt-1">
                        <input 
                          type="number" 
                          name="partialThreshold" 
                          id="partialThreshold" 
                          :min="1"
                          :max="formData.targetDays - 1"
                          v-model="formData.partialThreshold" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <p class="mt-1 text-xs text-gray-500">Minimum days to earn partial reward</p>
                    </div>
                    <div>
                      <label for="partialReward" class="block text-sm font-medium text-gray-700">Partial Reward Amount (₹)</label>
                      <div class="mt-1">
                        <input 
                          type="number" 
                          name="partialReward" 
                          id="partialReward" 
                          min="1"
                          :max="formData.rewardCost - 1"
                          v-model="formData.partialReward" 
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Penalty settings -->
                  <div class="border-t border-gray-200 pt-4">
                    <div class="flex items-center">
                      <input 
                        id="enablePenalty" 
                        name="enablePenalty" 
                        type="checkbox" 
                        v-model="formData.enablePenalty"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="enablePenalty" class="ml-2 block text-sm text-gray-900">
                        Enable Penalty System
                      </label>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Reset progress if you exceed buffer days</p>
                  </div>

                  <!-- Final goal confirmation -->
                  <div class="border-t border-gray-200 pt-4">
                    <div class="flex items-center">
                      <input 
                        id="requireCompletion" 
                        name="requireCompletion" 
                        type="checkbox" 
                        v-model="formData.requireCompletion"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="requireCompletion" class="ml-2 block text-sm text-gray-900">
                        Require Final Goal Completion
                      </label>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Require manually confirming you completed the final goal (e.g., taking an exam)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="submit" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ editing ? 'Update' : 'Create' }}
            </button>
            <button 
              type="button" 
              @click="$emit('close')" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTargetsStore } from '../stores/targetsStore';
import { storeToRefs } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

// Props
const props = defineProps({
  editing: {
    type: Boolean,
    default: false
  },
  targetId: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits(['close', 'save']);

// Store
const store = useTargetsStore();
const { activeTargetId } = storeToRefs(store);

// Form data with defaults
const formData = ref({
  id: null,
  name: '',
  description: '',
  startDate: formatDateForInput(new Date()),
  endDate: '',
  dailyTarget: 6,
  targetDays: 15,
  bufferDays: 2,
  weeklyFrequency: 6,
  rewardItem: '',
  rewardCost: 0,
  dailyEarn: 0,
  enablePartialReward: false,
  partialThreshold: 0,
  partialReward: 0,
  enablePenalty: true,
  requireCompletion: true,
  activityLog: [],
  completed: false
});

// Computed
const targetTotalDays = computed(() => {
  if (!formData.value.startDate || !formData.value.endDate) return 0;
  
  const start = new Date(formData.value.startDate);
  const end = new Date(formData.value.endDate);
  
  // Add 1 to include both start and end days
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
});

// Watch for date changes to update targetDays suggestion
watch([() => formData.value.startDate, () => formData.value.endDate], () => {
  if (formData.value.startDate && formData.value.endDate) {
    formData.value.targetDays = targetTotalDays.value;
    
    // Set partialThreshold to 80% of target days by default
    if (formData.value.enablePartialReward) {
      formData.value.partialThreshold = Math.floor(formData.value.targetDays * 0.8);
    }
    
    // Set dailyEarn based on reward cost and target days if not set
    if (!formData.value.dailyEarn && formData.value.rewardCost > 0) {
      formData.value.dailyEarn = Math.ceil(formData.value.rewardCost / formData.value.targetDays);
    }
  }
});

// Watch for reward cost changes to update dailyEarn and partialReward
watch(() => formData.value.rewardCost, (newValue) => {
  if (newValue > 0 && formData.value.targetDays > 0) {
    formData.value.dailyEarn = Math.ceil(newValue / formData.value.targetDays);
    
    if (formData.value.enablePartialReward) {
      formData.value.partialReward = Math.floor(newValue / 2);
    }
  }
});

// Methods
function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

function initializeForm() {
  if (props.editing && props.targetId) {
    const target = store.getTargetById(props.targetId);
    if (target) {
      // Clone to avoid direct mutation
      const targetCopy = JSON.parse(JSON.stringify(target));
      
      // Format dates for input fields
      if (targetCopy.startDate) {
        targetCopy.startDate = new Date(targetCopy.startDate).toISOString().split('T')[0];
      }
      if (targetCopy.endDate) {
        targetCopy.endDate = new Date(targetCopy.endDate).toISOString().split('T')[0];
      }
      
      // Set up partial reward flags
      targetCopy.enablePartialReward = !!targetCopy.partialThreshold && !!targetCopy.partialReward;
      
      // Set up penalty flag
      targetCopy.enablePenalty = true; // Default to true since original app had this feature
      
      formData.value = targetCopy;
    }
  } else {
    // Set up defaults for new target
    formData.value = {
      id: null,
      name: '',
      description: '',
      startDate: formatDateForInput(new Date()),
      endDate: '',
      dailyTarget: 6,
      targetDays: 15,
      bufferDays: 2,
      weeklyFrequency: 6,
      rewardItem: '',
      rewardCost: 0,
      dailyEarn: 0,
      enablePartialReward: false,
      partialThreshold: 0,
      partialReward: 0,
      enablePenalty: true,
      requireCompletion: true,
      activityLog: [],
      completed: false
    };
  }
}

function saveTarget() {
  // Prepare data for saving
  const targetData = { ...formData.value };
  
  // Clean up flags that shouldn't be stored directly
  if (!targetData.enablePartialReward) {
    targetData.partialThreshold = null;
    targetData.partialReward = null;
  }
  delete targetData.enablePartialReward;
  
  // The enablePenalty flag is used client-side only - the functionality is in the store
  delete targetData.enablePenalty;
  
  // If it's a new target, generate ID
  if (!props.editing) {
    targetData.id = uuidv4();
    targetData.activityLog = [];
    
    store.addTarget(targetData);
  } else {
    store.updateTarget(targetData);
  }
  
  // Notify parent
  emit('save', targetData);
}

// Initialize on mount
onMounted(() => {
  initializeForm();
});
</script>