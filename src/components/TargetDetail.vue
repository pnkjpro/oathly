<!-- components/TargetDetail.vue -->
<template>
  <div class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div v-if="target" class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ target.name }}
                </h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium" 
                      :class="daysLeft === 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'">
                  {{ daysLeft }} days left
                </span>
              </div>

              <!-- Progress section -->
              <div class="mb-6">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium">Progress</span>
                  <span>{{ completedDays }}/{{ target.targetDays }} days</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${progressPercentage}%` }"></div>
                </div>
              </div>

              <!-- Target details -->
              <div class="space-y-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-500">Description</h4>
                  <p class="mt-1 text-sm text-gray-900">{{ target.description }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">Start Date</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDate(target.startDate) }}</p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">End Date</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDate(target.endDate) }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">Daily Target</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ target.dailyTarget }} hours</p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">Target Days</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ target.targetDays }} days</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">Buffer Days</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ target.bufferDays || 0 }} days</p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">Days Used</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ missedDays }} days</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">Reward</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ target.rewardItem }}</p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">Cost</h4>
                    <p class="mt-1 text-sm text-gray-900">₹{{ target.rewardCost }}</p>
                  </div>
                </div>
                
                <div>
                  <h4 class="text-sm font-medium text-gray-500">Reward Status</h4>
                  <p class="mt-1 text-sm" :class="rewardStatus.color">{{ rewardStatus.text }}</p>
                </div>
              </div>

              <!-- Activity log -->
              <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-500 mb-3">Activity Log</h4>
                <div class="max-h-60 overflow-y-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(log, index) in sortedActivityLog" :key="index">
                        <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{{ formatDate(log.date) }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{{ log.hours }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-xs">
                          <span :class="log.hours >= target.dailyTarget ? 'text-green-600' : 'text-red-600'">
                            {{ log.hours >= target.dailyTarget ? 'Completed' : 'Missed' }}
                          </span>
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-right text-xs">
                          <button @click="editLogEntry(log)" class="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                          <button @click="deleteLogEntry(log.date)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr v-if="sortedActivityLog.length === 0">
                        <td colspan="4" class="px-3 py-4 text-center text-sm text-gray-500">No activity recorded yet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Log entry input -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6">
          <div v-if="!isEditing" class="flex items-center space-x-2">
            <div class="w-full">
              <label for="hours" class="block text-sm font-medium text-gray-700">Log Hours for Today</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input 
                  type="number" 
                  name="hours" 
                  id="hours" 
                  min="0"
                  max="24"
                  step="0.5"
                  v-model="newLogHours" 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Hours"
                />
              </div>
            </div>
            <button 
              @click="addLogEntry" 
              class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Log
            </button>
          </div>
          
          <div v-else class="flex items-center space-x-2">
            <div class="w-full">
              <label for="edit-hours" class="block text-sm font-medium text-gray-700">Edit Hours for {{ formatDate(editingLog.date) }}</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input 
                  type="number" 
                  name="edit-hours" 
                  id="edit-hours" 
                  min="0"
                  max="24"
                  step="0.5"
                  v-model="editingLog.hours" 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Hours"
                />
              </div>
            </div>
            <div class="flex mt-6 space-x-2">
              <button 
                @click="saveLogEdit" 
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save
              </button>
              <button 
                @click="cancelEdit" 
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            v-if="canCompleteTarget"
            @click="completeTarget" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Mark as Completed
          </button>
          <button 
            @click="editTarget" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Edit Target
          </button>
          <button 
            @click="$emit('close')" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTargetsStore } from '../stores/targetsStore';
import { storeToRefs } from 'pinia';

// Props
const props = defineProps({
  targetId: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['close']);

// Store
const store = useTargetsStore();

// Local state
const newLogHours = ref(0);
const isEditing = ref(false);
const editingLog = ref({ date: '', hours: 0 });

// Get the target data
const target = computed(() => store.getTargetById(props.targetId));

// Computed values
const sortedActivityLog = computed(() => {
  if (!target.value || !target.value.activityLog) return [];
  
  return [...target.value.activityLog].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
});

const daysLeft = computed(() => {
  if (!target.value) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(target.value.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  if (today > endDate) return 0;
  
  const timeDiff = endDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

const completedDays = computed(() => {
  if (!target.value || !target.value.activityLog) return 0;
  return target.value.activityLog.filter(log => log.hours >= target.value.dailyTarget).length;
});

const missedDays = computed(() => {
  if (!target.value || !target.value.activityLog) return 0;
  return target.value.activityLog.filter(log => log.hours < target.value.dailyTarget).length;
});

const progressPercentage = computed(() => {
  if (!target.value) return 0;
  return Math.min(Math.round((completedDays.value / target.value.targetDays) * 100), 100);
});

const rewardStatus = computed(() => {
  if (!target.value) return { text: 'Unknown', color: 'text-gray-500' };
  
  // Get the minimum threshold
  const minThreshold = target.value.targetDays - (target.value.bufferDays || 0);
  // Get the partial threshold (if applicable)
  const partialThreshold = target.value.partialThreshold || Math.floor(minThreshold * 0.8);
  
  if (completedDays.value >= minThreshold) {
    return { text: `Full reward (₹${target.value.rewardCost})`, color: 'text-green-600' };
  } else if (completedDays.value >= partialThreshold) {
    const partialAmount = target.value.partialReward || Math.floor(target.value.rewardCost / 2);
    return { text: `Partial reward (₹${partialAmount})`, color: 'text-yellow-600' };
  } else {
    return { text: 'Not eligible for reward yet', color: 'text-red-600' };
  }
});

const canCompleteTarget = computed(() => {
  if (!target.value) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(target.value.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  return today >= endDate && !target.value.completed;
});

// Methods
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function addLogEntry() {
  if (newLogHours.value < 0) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  store.addActivityLog(props.targetId, {
    date: today.toISOString(),
    hours: parseFloat(newLogHours.value)
  });
  
  // Check for penalty condition
  checkPenaltyCondition();
  
  newLogHours.value = 0;
}

function editLogEntry(log) {
  isEditing.value = true;
  editingLog.value = { ...log };
}

function saveLogEdit() {
  if (editingLog.value.hours < 0) return;
  
  store.updateActivityLog(props.targetId, editingLog.value);
  
  // Check for penalty condition
  checkPenaltyCondition();
  
  cancelEdit();
}

function cancelEdit() {
  isEditing.value = false;
  editingLog.value = { date: '', hours: 0 };
}

function deleteLogEntry(date) {
  if (confirm('Are you sure you want to delete this entry?')) {
    store.removeActivityLog(props.targetId, date);
    
    // Check for penalty condition
    checkPenaltyCondition();
  }
}

function checkPenaltyCondition() {
  if (!target.value || !target.value.bufferDays) return;
  
  // Check if we've exceeded the buffer days
  if (missedDays.value > target.value.bufferDays) {
    if (confirm(`You've missed more than ${target.value.bufferDays} days, which exceeds your buffer. Would you like to reset your progress?`)) {
      store.resetProgress(props.targetId);
    }
  }
}

function editTarget() {
  store.setActiveTarget(props.targetId);
  emit('close');
  // Parent component will handle opening the edit modal
}

function completeTarget() {
  if (confirm('Are you sure you want to mark this target as completed?')) {
    store.completeTarget(props.targetId);
  }
}
</script>