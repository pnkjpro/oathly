<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTargetsStore } from '../stores/targetsStore';
import { motivationalQuotes } from '@/data/quotes';


const route = useRoute();
const store = useTargetsStore();
const targetId = route.params.id;
const dailyQuote = ref('');

// Form data
const hoursStudied = ref(0);
const confirmResetModal = ref(false);

// Get current target data from store
const target = computed(() => {
  return store.targets.find(t => t.id === targetId);
});

// If target not found, we'll show error message
const targetNotFound = computed(() => !target.value);

// Generate daily random quote
function setRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  dailyQuote.value = motivationalQuotes[randomIndex];
}

// Generate a numeric hash from a string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Get count of days until exam
const countdownDays = computed(() => {
  if (!target.value) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(target.value.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Calculate progress
const completedDays = computed(() => {
  if (!target.value) return 0;
  return target.value.activityLog.filter(log => log.hours >= target.value.dailyTarget).length;
});

const totalDays = computed(() => {
  if (!target.value) return 0;
  return target.value.totalDays;
});

const progressPercentage = computed(() => {
  if (!target.value) return 0;
  const percentage = Math.min(Math.round((completedDays.value / target.value.targetDays) * 100), 100);
  return percentage;
});

// Calculate earned amount
const earnedAmount = computed(() => {
  if (!target.value) return 0;
  const dailyReward = target.value.rewardCost / target.value.targetDays;
  return Math.round(completedDays.value * dailyReward);
});

// Check if today is already logged
const hasLoggedToday = computed(() => {
  if (!target.value) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return target.value.activityLog.some(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });
});

// Get hours logged today
const todaysHours = computed(() => {
  if (!target.value || !hasLoggedToday.value) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayLog = target.value.activityLog.find(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });
  
  return todayLog ? todayLog.hours : 0;
});

// Check if today is exam day
const isExamDay = computed(() => {
  if (!target.value) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const examDate = new Date(target.value.endDate);
  examDate.setHours(0, 0, 0, 0);
  
  return today.getTime() === examDate.getTime();
});

// Check if exam is completed
const examCompleted = computed(() => {
  if (!target.value) return false;
  return target.value.examCompleted;
});

// Check if target period is over (today > end date)
const isDone = computed(() => {
  if (!target.value) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(target.value.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  return today > endDate;
});

// Calculate missed days
const missedDays = computed(() => {
  if (!target.value) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(target.value.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  let endDate;
  if (today > new Date(target.value.endDate)) {
    endDate = new Date(target.value.endDate);
  } else {
    endDate = new Date(today);
  }
  endDate.setHours(0, 0, 0, 0);
  
  // Calculate expected days from start until today (or end date if past end)
  const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const totalExpectedDays = Math.max(0, Math.min(daysDiff, target.value.totalDays));
  
  const missedCount = Math.max(0, totalExpectedDays - target.value.activityLog.length);
  return missedCount;
});

// Calculate total study hours
const totalStudyHours = computed(() => {
  if (!target.value) return 0;
  
  return target.value.activityLog.reduce((total, log) => total + log.hours, 0);
});

// Sort the activity log by date (newest first)
const activityLogSorted = computed(() => {
  if (!target.value) return [];
  
  return [...target.value.activityLog].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
});

// Determine reward status
const rewardStatus = computed(() => {
  if (!target.value) return 'No Reward';
  
  if (completedDays.value >= target.value.targetDays) {
    return 'Full Reward';
  } else if (completedDays.value >= target.value.partialThreshold) {
    return 'Partial Reward';
  } else {
    return 'No Reward';
  }
});

// Get reward amount based on status
const rewardAmount = computed(() => {
  if (!target.value) return 0;
  
  if (rewardStatus.value === 'Full Reward') {
    return target.value.rewardCost;
  } else if (rewardStatus.value === 'Partial Reward') {
    return target.value.partialReward;
  } else {
    return 0;
  }
});

// Format date to readable format
const formatDate = (dateString) => {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Log today's progress
const logToday = () => {
  if (!target.value) return;
  
  const hours = Number(hoursStudied.value);
  if (isNaN(hours) || hours < 0 || hours > 24) {
    alert('Please enter a valid number of hours between 0 and 24.');
    return;
  }
  
  store.logStudyHours(targetId, hours);
  hoursStudied.value = 0;
};

// Reset today's log
const resetTodayLog = () => {
  if (!target.value) return;
  store.removeTodayLog(targetId);
};

// Complete exam
const completeExam = () => {
  if (!target.value) return;
  store.completeExam(targetId);
};

// Reset all progress
const resetProgress = () => {
  confirmResetModal.value = true;
};

// Confirm reset
const confirmReset = () => {
  if (!target.value) return;
  store.resetProgress(targetId);
  confirmResetModal.value = false;
};

// Cancel reset
const cancelReset = () => {
  confirmResetModal.value = false;
};

// Initialize component
onMounted(() => {
  if (targetId && !target.value) {
    // If targetId is provided but target not found, redirect or show error
  }
  setRandomQuote();
});

// Check for missed days penalties on component mount
watch(() => target.value, (newVal) => {
  if (newVal) {
    store.checkPenalty(targetId);
  }
}, { immediate: true });
</script>

<template>
  <div v-if="targetNotFound" class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-16 text-center">
        <h1 class="text-2xl font-bold text-red-600">Target Not Found</h1>
        <p class="mt-4 text-gray-600">The target you're looking for doesn't exist.</p>
        <router-link to="/" class="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Back to Targets
        </router-link>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-16">
        <div class="max-w-md mx-auto">
          <div class="divide-y divide-gray-200">
            <div class="pb-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <div class="flex justify-between items-center">
                <div>
                  <h1 class="text-3xl font-bold text-blue-600">{{ target?.name }}</h1>
                  <p class="text-gray-600 mt-1">{{ target?.description }}</p>
                </div>
                <span class="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                  {{ countdownDays }} days left
                </span>
              </div>
              
              <!-- Motivational Quote -->
              <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 italic">
                "{{ dailyQuote }}"
              </div>
              
              <!-- Progress Section -->
              <div class="mt-6">
                <div class="flex justify-between mb-1">
                  <span class="text-base font-medium text-blue-700">Progress ({{ progressPercentage }}%)</span>
                  <span class="text-sm font-medium text-blue-700">{{ completedDays }}/{{ target?.targetDays }} days</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    class="h-4 rounded-full transition-all duration-500"
                    :class="[progressPercentage >= 100 ? 'bg-green-600' : 'bg-blue-600']"
                    :style="{ width: `${progressPercentage}%` }"
                  ></div>
                </div>
              </div>
              
              <!-- Reward Status -->
              <div class="mt-4 bg-green-50 p-4 rounded-lg">
                <h3 class="font-semibold text-green-800">Reward Status</h3>
                <div class="flex justify-between items-center mt-2">
                  <span>{{ target?.rewardItem }} (₹{{ target?.rewardCost }})</span>
                  <span class="font-bold">₹{{ earnedAmount }} earned</span>
                </div>
                <div class="mt-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-green-500 h-2 rounded-full"
                      :style="{ width: `${target ? (earnedAmount / target.rewardCost) * 100 : 0}%` }"
                    ></div>
                  </div>
                </div>
              </div>
              
              <!-- Today's Log Section -->
              <div v-if="!isExamDay && !hasLoggedToday && !isDone" class="mt-6 p-4 border border-gray-200 rounded-lg">
                <h3 class="font-semibold text-gray-700">Today's Study Log</h3>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700">Hours studied today</label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <input 
                      type="number" 
                      v-model="hoursStudied" 
                      min="0" 
                      max="24" 
                      step="0.5"
                      class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      :placeholder="`Enter hours (target: ${target?.dailyTarget})`"
                    />
                  </div>
                </div>
                <div class="mt-4">
                  <button 
                    @click="logToday" 
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Log Today's Progress
                  </button>
                </div>
              </div>
              
              <!-- Message if already logged today -->
              <div v-else-if="!isExamDay && hasLoggedToday && !isDone" class="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg">
                <h3 class="font-semibold text-green-700">Today's Progress Logged!</h3>
                <p class="mt-2">You've studied {{ todaysHours }} hours today. 
                  <span v-if="todaysHours >= target?.dailyTarget" class="text-green-700 font-medium">Great job hitting your target!</span>
                  <span v-else class="text-yellow-700 font-medium">Keep going to reach your daily target of {{ target?.dailyTarget }} hours.</span>
                </p>
                <button 
                  @click="resetTodayLog" 
                  class="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset today's log
                </button>
              </div>
              
              <!-- Exam Day Section -->
              <div v-if="isExamDay && !examCompleted" class="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <h3 class="font-semibold text-yellow-800">Exam Day!</h3>
                <p class="mt-2">Today is your {{ target?.name }}. Did you appear for it confidently?</p>
                <button 
                  @click="completeExam" 
                  class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Yes, I Completed the Exam!
                </button>
              </div>
              
              <!-- Final Summary Section -->
              <div v-if="examCompleted || isDone" class="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h3 class="font-semibold text-blue-800">Final Summary</h3>
                <div class="mt-3 space-y-2">
                  <p><span class="font-medium">Total Days Completed:</span> {{ completedDays }}/{{ target?.targetDays }}</p>
                  <p><span class="font-medium">Total Study Hours:</span> {{ totalStudyHours }}</p>
                  <p><span class="font-medium">Buffer Days Used:</span> {{ missedDays }}/{{ target?.bufferDays }}</p>
                  <p class="mt-4"><span class="font-medium">Reward Status:</span> 
                    <span :class="{
                      'text-green-600 font-bold': rewardStatus === 'Full Reward',
                      'text-yellow-600 font-bold': rewardStatus === 'Partial Reward',
                      'text-red-600 font-bold': rewardStatus === 'No Reward'
                    }">
                      {{ rewardStatus }} {{ rewardStatus !== 'No Reward' ? `(₹${rewardAmount})` : '' }}
                    </span>
                  </p>
                </div>
              </div>
              
              <!-- Activity Log -->
              <div class="mt-6">
                <h3 class="font-semibold text-gray-700 mb-2">Activity Log</h3>
                <div v-if="activityLogSorted.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
                  <p class="text-gray-500">No study sessions logged yet.</p>
                </div>
                <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(log, index) in activityLogSorted" :key="index">
                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{{ formatDate(log.date) }}</td>
                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{{ log.hours }}</td>
                        <td class="px-6 py-2 whitespace-nowrap text-sm">
                          <span :class="{
                            'px-2 py-1 text-xs rounded-full': true,
                            'bg-green-100 text-green-800': log.hours >= target?.dailyTarget,
                            'bg-yellow-100 text-yellow-800': log.hours > 0 && log.hours < target?.dailyTarget,
                            'bg-red-100 text-red-800': log.hours === 0
                          }">
                            {{ log.hours >= target?.dailyTarget ? 'Target Met' : log.hours > 0 ? 'Partial' : 'Missed' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="mt-6 flex justify-between">
                <router-link 
                  to="/" 
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                  </svg>
                  Back to Targets
                </router-link>
                
                <button 
                  @click="resetProgress" 
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                  Reset Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm Reset Modal -->
  <div v-if="confirmResetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
      <div class="mb-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-xl font-bold text-gray-800">Reset Progress</h3>
        <p class="text-gray-600 mt-2">
          Are you sure you want to reset all progress for this target? This will delete all activity logs and cannot be undone.
        </p>
      </div>
      
      <div class="flex justify-center space-x-4">
        <button 
          @click="cancelReset" 
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          @click="confirmReset" 
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>