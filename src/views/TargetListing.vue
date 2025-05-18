<script setup>
import { ref, onMounted, computed } from 'vue';
import { useTargetsStore } from '@/stores/targetsStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useTargetsStore();
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const targetToEdit = ref(null);
const targetToDelete = ref(null);

const navigateTo = (path) => {
  router.push(path);
}

// Form data for a new target
const newTarget = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  rewardItem: '',
  rewardCost: '',
  dailyTarget: '',
  targetDays: '',
  bufferDays: '',
  partialThreshold: '',
  partialReward: ''
});

// Reset form to defaults
const resetForm = () => {
  newTarget.value = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    rewardItem: '',
    rewardCost: '',
    dailyTarget: '',
    targetDays: '',
    bufferDays: '',
    partialThreshold: '',
    partialReward: ''
  };
};

// Create a new target
const createTarget = () => {
  store.addTarget({...newTarget.value});
  showAddModal.value = false;
  resetForm();
};

// Set up target for editing
const editTarget = (target) => {
  targetToEdit.value = { ...target };
  showEditModal.value = true;
};

// Save edited target
const saveEditedTarget = () => {
  store.updateTarget(targetToEdit.value.id, targetToEdit.value);
  showEditModal.value = false;
  targetToEdit.value = null;
};

// Set up target for deletion
const confirmDelete = (target) => {
  targetToDelete.value = target;
  showDeleteModal.value = true;
};

// Delete the target
const deleteTarget = () => {
  store.deleteTarget(targetToDelete.value.id);
  showDeleteModal.value = false;
  targetToDelete.value = null;
};

// Calculate progress for a target
const calculateProgress = (target) => {
  if (!target) return 0;
  
  const completedDays = target.activityLog.filter(log => 
    log.hours >= target.dailyTarget
  ).length;
  
  return Math.min(Math.round((completedDays / target.targetDays) * 100), 100);
};

// Format date to readable format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Calculate days remaining
const getDaysRemaining = (endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

// Initialize the store
onMounted(() => {
  store.initializeStore();
});

// Set active target
const setActive = (targetId) => {
  store.setActiveTarget(targetId);
};

// Get today's date string for min attribute of date inputs
const todayString = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});
</script>

<template>
  <main class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">My Goal Targets</h1>
      <button 
        @click="showAddModal = true" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add New Target
      </button>
    </div>

    <!-- Targets List -->
    <div v-if="store.targets.length === 0" class="text-center py-20 bg-gray-50 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
      </svg>
      <h3 class="text-lg font-medium text-gray-600">No targets found</h3>
      <p class="text-gray-500 mt-1">Create your first target to get started</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6">
      <div 
        v-for="target in store.sortedTargets" 
        :key="target.id" 
        :class="['bg-white rounded-lg shadow-md overflow-hidden border-l-4', 
                target.id === store.activeTargetId ? 'border-l-blue-600' : 'border-l-gray-300']"
      >
        <div class="p-5">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ target.name }}</h2>
              <p class="text-gray-600 mt-1">{{ target.description }}</p>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="editTarget(target)"
                class="text-gray-600 hover:text-blue-600"
                title="Edit Target"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                @click="confirmDelete(target)"
                class="text-gray-600 hover:text-red-600"
                title="Delete Target"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-500">Date Range</p>
              <p class="font-medium">{{ formatDate(target.startDate) }} - {{ formatDate(target.endDate) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Reward</p>
              <p class="font-medium">{{ target.rewardItem }} (₹{{ target.rewardCost }})</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Daily Target</p>
              <p class="font-medium">{{ target.dailyTarget }} hours/day</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Requirement</p>
              <p class="font-medium">{{ target.targetDays }} days ({{ target.bufferDays }} buffer)</p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span>Progress: {{ calculateProgress(target) }}%</span>
              <span>{{ getDaysRemaining(target.endDate) }} days remaining</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                class="h-2.5 rounded-full transition-all duration-500" 
                :class="calculateProgress(target) >= 100 ? 'bg-green-600' : 'bg-blue-600'"
                :style="`width: ${calculateProgress(target)}%`"
              ></div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-between mt-4">
            <button 
              v-if="target.id !== store.activeTargetId"
              @click="setActive(target.id)" 
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Set as Active
            </button>
            <span v-else class="text-green-600 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Active Target
            </span>
            <div
              @click="navigateTo(`/target/${target.id}/details`)"
              class="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Target Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">Add New Target</h2>
            <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="createTarget">
            <div class="grid grid-cols-1 gap-4">
              <!-- Basic Information -->
              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Target Name</label>
                <input 
                  v-model="newTarget.name" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., BSPHCL Exam"
                />
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Description</label>
                <textarea 
                  v-model="newTarget.description" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your goal"
                  rows="2"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Start Date</label>
                  <input 
                    v-model="newTarget.startDate" 
                    type="date"
                    :min="todayString"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">End Date</label>
                  <input 
                    v-model="newTarget.endDate" 
                    type="date"
                    :min="newTarget.startDate || todayString"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Reward Information -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Reward Item</label>
                  <input 
                    v-model="newTarget.rewardItem" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Moto Buds Plus 2"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Reward Cost (₹)</label>
                  <input 
                    v-model="newTarget.rewardCost" 
                    type="number" 
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 6000"
                  />
                </div>
              </div>

              <!-- Target Parameters -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Daily Hours Target</label>
                  <input 
                    v-model="newTarget.dailyTarget" 
                    type="number"
                    required
                    min="1"
                    max="24"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 6"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Target Days</label>
                  <input 
                    v-model="newTarget.targetDays" 
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 13"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Buffer Days</label>
                  <input 
                    v-model="newTarget.bufferDays" 
                    type="number"
                    required
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Partial Threshold</label>
                  <input 
                    v-model="newTarget.partialThreshold" 
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Partial Reward (₹)</label>
                  <input 
                    v-model="newTarget.partialReward" 
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3000"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button 
                type="button"
                @click="showAddModal = false" 
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Target
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Target Modal -->
    <div v-if="showEditModal && targetToEdit" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">Edit Target</h2>
            <button @click="showEditModal = false" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveEditedTarget">
            <div class="grid grid-cols-1 gap-4">
              <!-- Basic Information -->
              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Target Name</label>
                <input 
                  v-model="targetToEdit.name" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Description</label>
                <textarea 
                  v-model="targetToEdit.description" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Start Date</label>
                  <input 
                    v-model="targetToEdit.startDate" 
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">End Date</label>
                  <input 
                    v-model="targetToEdit.endDate" 
                    type="date"
                    :min="targetToEdit.startDate"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Reward Information -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Reward Item</label>
                  <input 
                    v-model="targetToEdit.rewardItem" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Reward Cost (₹)</label>
                  <input 
                    v-model="targetToEdit.rewardCost" 
                    type="number" 
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Target Parameters -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Daily Hours Target</label>
                  <input 
                    v-model="targetToEdit.dailyTarget" 
                    type="number"
                    required
                    min="1"
                    max="24"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Target Days</label>
                  <input 
                    v-model="targetToEdit.targetDays" 
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Buffer Days</label>
                  <input 
                    v-model="targetToEdit.bufferDays" 
                    type="number"
                    required
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Partial Threshold</label>
                  <input 
                    v-model="targetToEdit.partialThreshold" 
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Partial Reward (₹)</label>
                  <input 
                    v-model="targetToEdit.partialReward" 
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button 
                type="button"
                @click="showEditModal = false" 
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal && targetToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div class="mb-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <h3 class="text-xl font-bold text-gray-800">Delete Target</h3>
          <p class="text-gray-600 mt-2">
            Are you sure you want to delete "<span class="font-medium">{{ targetToDelete.name }}</span>"? This action cannot be undone.
          </p>
        </div>
        
        <div class="flex justify-center space-x-4">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="deleteTarget" 
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </main>
</template>