// studyStore.js - Pinia store with persistence
import { defineStore } from 'pinia';

export const useStudyStore = defineStore('study', {
  state: () => ({
    activityLog: [],
    startDate: '2025-05-17',
    endDate: '2025-06-02',
    dailyTarget: 6,
    targetDays: 13,
    totalDays: 15,
    examCompleted: false
  }),
  
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'bsphcl-study-tracker',
        storage: localStorage
      }
    ]
  },
  
  actions: {
    initializeStore() {
      // Initialize if store is empty
      if (this.activityLog.length === 0) {
        // Set initial state
        this.startDate = '2025-05-17';
        this.endDate = '2025-06-02';
        this.dailyTarget = 6;
        this.targetDays = 13;
        this.totalDays = 15;
        this.examCompleted = false;
      }
    },
    
    logStudyHours(hours) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if today is already logged
      const todayIndex = this.activityLog.findIndex(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });
      
      if (todayIndex !== -1) {
        // Update existing log
        this.activityLog[todayIndex].hours = hours;
      } else {
        // Add new log
        this.activityLog.push({
          date: today.toISOString(),
          hours: hours
        });
      }
    },
    
    removeTodayLog() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      this.activityLog = this.activityLog.filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() !== today.getTime();
      });
    },
    
    completeExam() {
      this.examCompleted = true;
    },
    
    resetProgress() {
      this.activityLog = [];
      this.examCompleted = false;
    }
  }
});