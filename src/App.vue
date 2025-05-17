<!-- App.vue - Main application component -->
<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-16">
        <div class="max-w-md mx-auto">
          <div class="divide-y divide-gray-200">
            <div class="pb-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-blue-600">BSPHCL Exam Tracker</h1>
                <span class="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
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
                  <span class="text-sm font-medium text-blue-700">{{ completedDays }}/{{ totalDays }} days</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    class="bg-blue-600 h-4 rounded-full transition-all duration-500"
                    :style="{ width: `${progressPercentage}%` }"
                  ></div>
                </div>
              </div>
              
              <!-- Reward Status -->
              <div class="mt-4 bg-green-50 p-4 rounded-lg">
                <h3 class="font-semibold text-green-800">Reward Status</h3>
                <div class="flex justify-between items-center mt-2">
                  <span>Moto Buds Plus 2 (₹6000)</span>
                  <span class="font-bold">₹{{ earnedAmount }} earned</span>
                </div>
                <div class="mt-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-green-500 h-2 rounded-full"
                      :style="{ width: `${(earnedAmount / 6000) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
              
              <!-- Today's Log Section -->
              <div v-if="!isExamDay && !hasLoggedToday" class="mt-6 p-4 border border-gray-200 rounded-lg">
                <h3 class="font-semibold text-gray-700">Today's Study Log</h3>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700">Hours studied today</label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <input 
                      type="number" 
                      v-model="hoursStudied" 
                      min="0" 
                      max="24" 
                      class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Enter hours (e.g. 6)"
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
              <div v-else-if="!isExamDay && hasLoggedToday" class="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg">
                <h3 class="font-semibold text-green-700">Today's Progress Logged!</h3>
                <p class="mt-2">You've studied {{ todaysHours }} hours today. Great job!</p>
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
                <p class="mt-2">Today is your BSPHCL exam. Did you appear for it confidently?</p>
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
                  <p><span class="font-medium">Total Days Completed:</span> {{ completedDays }}/{{ totalDays }}</p>
                  <p><span class="font-medium">Total Study Hours:</span> {{ totalStudyHours }}</p>
                  <p><span class="font-medium">Buffer Days Used:</span> {{ missedDays }}/2</p>
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
                <div class="border border-gray-200 rounded-lg overflow-hidden">
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
                            'bg-green-100 text-green-800': log.hours >= 6,
                            'bg-yellow-100 text-yellow-800': log.hours > 0 && log.hours < 6,
                            'bg-red-100 text-red-800': log.hours === 0
                          }">
                            {{ log.hours >= 6 ? 'Target Met' : log.hours > 0 ? 'Partial' : 'Missed' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Reset Progress Button -->
              <div class="mt-6 flex justify-end">
                <button 
                  @click="resetProgress" 
                  class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reset All Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStudyStore } from './stores/studyStore';
import { storeToRefs } from 'pinia';
import { motivationalQuotes } from './data/quotes';

const store = useStudyStore();
const { 
  activityLog, 
  startDate, 
  endDate, 
  dailyTarget, 
  targetDays, 
  totalDays, 
  examCompleted 
} = storeToRefs(store);

// Local state
const hoursStudied = ref(0);
const dailyQuote = ref('');

// Computed properties
const today = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
});

const hasLoggedToday = computed(() => {
  return activityLog.value.some(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    const todayDate = today.value;
    return logDate.getTime() === todayDate.getTime();
  });
});

const todaysHours = computed(() => {
  const todayLog = activityLog.value.find(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    const todayDate = today.value;
    return logDate.getTime() === todayDate.getTime();
  });
  return todayLog ? todayLog.hours : 0;
});

const isExamDay = computed(() => {
  const examDate = new Date(endDate.value);
  examDate.setHours(0, 0, 0, 0);
  const todayDate = today.value;
  return examDate.getTime() === todayDate.getTime();
});

const isDone = computed(() => {
  const examDate = new Date(endDate.value);
  examDate.setHours(0, 0, 0, 0);
  const todayDate = today.value;
  return todayDate > examDate;
});

const completedDays = computed(() => {
  return activityLog.value.filter(log => log.hours >= dailyTarget.value).length;
});

const missedDays = computed(() => {
  const totalExpectedDays = Math.min(
    getDaysBetweenDates(new Date(startDate.value), today.value) + 1,
    totalDays.value
  );
  return totalExpectedDays - activityLog.value.length;
});

const progressPercentage = computed(() => {
  return Math.min(Math.round((completedDays.value / targetDays.value) * 100), 100);
});

const earnedAmount = computed(() => {
  return completedDays.value * 400;
});

const countdownDays = computed(() => {
  const examDate = new Date(endDate.value);
  examDate.setHours(0, 0, 0, 0);
  const todayDate = today.value;
  
  if (todayDate > examDate) return 0;
  
  const timeDiff = examDate.getTime() - todayDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

const totalStudyHours = computed(() => {
  return activityLog.value.reduce((total, log) => total + log.hours, 0);
});

const rewardStatus = computed(() => {
  if (completedDays.value >= 13) return 'Full Reward';
  if (completedDays.value >= 10) return 'Partial Reward';
  return 'No Reward';
});

const rewardAmount = computed(() => {
  if (completedDays.value >= 13) return 6000;
  if (completedDays.value >= 10) return 3000;
  return 0;
});

const activityLogSorted = computed(() => {
  return [...activityLog.value].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
});

// Methods
function logToday() {
  if (hoursStudied.value < 0) hoursStudied.value = 0;
  if (hoursStudied.value > 24) hoursStudied.value = 24;
  
  store.logStudyHours(hoursStudied.value);
  checkPenalty();
  hoursStudied.value = 0;
}

function resetTodayLog() {
  store.removeTodayLog();
}

function completeExam() {
  store.completeExam();
}

function resetProgress() {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
    store.resetProgress();
  }
}

function checkPenalty() {
  if (missedDays.value > 2) {
    alert('You have missed more than 2 days! Your progress has been reset.');
    store.resetProgress();
    setRandomQuote();
  }
}

function setRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  dailyQuote.value = motivationalQuotes[randomIndex];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });
}

function getDaysBetweenDates(startDate, endDate) {
  const time = endDate.getTime() - startDate.getTime();
  return Math.floor(time / (1000 * 3600 * 24));
}

// Lifecycle hooks
onMounted(() => {
  setRandomQuote();
  store.initializeStore();
});
</script>