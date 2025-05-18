// targetsStore.js - Pinia store for managing multiple targets
import { defineStore } from 'pinia';

export const useTargetsStore = defineStore('targets', {
  state: () => ({
    targets: [],
    activeTargetId: null
  }),
  
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'habit-targets-tracker',
        storage: localStorage
      }
    ]
  },
  
  getters: {
    activeTarget: (state) => {
      return state.targets.find(target => target.id === state.activeTargetId) || null;
    },
    
    activeTargetIndex: (state) => {
      return state.targets.findIndex(target => target.id === state.activeTargetId);
    },
    
    // Get targets sorted by their end date (closest first)
    sortedTargets: (state) => {
      return [...state.targets].sort((a, b) => {
        return new Date(a.endDate) - new Date(b.endDate);
      });
    }
  },
  
  actions: {
    initializeStore() {
      // Initialize with a sample target if no targets exist
      if (this.targets.length === 0) {
        this.addTarget({
          name: "BSPHCL Exam",
          description: "Preparation for BSPHCL examination",
          startDate: "2025-05-17",
          endDate: "2025-06-02",
          rewardItem: "Moto Buds Plus 2",
          rewardCost: 6000,
          dailyTarget: 6,
          targetDays: 13,
          bufferDays: 2,
          partialThreshold: 10,
          partialReward: 3000
        });
        // Set this as active target
        this.activeTargetId = this.targets[0].id;
      }
    },
    
    addTarget(targetData) {
      const newTarget = {
        id: Date.now().toString(),
        name: targetData.name,
        description: targetData.description,
        startDate: targetData.startDate,
        endDate: targetData.endDate,
        rewardItem: targetData.rewardItem,
        rewardCost: Number(targetData.rewardCost),
        dailyTarget: Number(targetData.dailyTarget),
        targetDays: Number(targetData.targetDays),
        bufferDays: Number(targetData.bufferDays),
        partialThreshold: Number(targetData.partialThreshold),
        partialReward: Number(targetData.partialReward),
        activityLog: [],
        examCompleted: false,
        createdAt: new Date().toISOString(),
        totalDays: this.calculateTotalDays(targetData.startDate, targetData.endDate)
      };
      
      this.targets.push(newTarget);
      this.activeTargetId = newTarget.id;
      return newTarget.id;
    },
    
    updateTarget(id, updatedData) {
      const index = this.targets.findIndex(t => t.id === id);
      if (index !== -1) {
        // Update specific properties while preserving activity logs
        const target = this.targets[index];
        Object.assign(target, {
          name: updatedData.name,
          description: updatedData.description,
          startDate: updatedData.startDate,
          endDate: updatedData.endDate,
          rewardItem: updatedData.rewardItem,
          rewardCost: Number(updatedData.rewardCost),
          dailyTarget: Number(updatedData.dailyTarget),
          targetDays: Number(updatedData.targetDays),
          bufferDays: Number(updatedData.bufferDays),
          partialThreshold: Number(updatedData.partialThreshold),
          partialReward: Number(updatedData.partialReward),
          totalDays: this.calculateTotalDays(updatedData.startDate, updatedData.endDate)
        });
      }
    },
    
    deleteTarget(id) {
      const index = this.targets.findIndex(t => t.id === id);
      if (index !== -1) {
        this.targets.splice(index, 1);
        
        // If we deleted the active target, select another one if available
        if (id === this.activeTargetId) {
          this.activeTargetId = this.targets.length > 0 ? this.targets[0].id : null;
        }
      }
    },
    
    setActiveTarget(id) {
      this.activeTargetId = id;
    },
    
    logStudyHours(targetId, hours) {
      const target = this.targets.find(t => t.id === targetId);
      if (!target) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if today is already logged
      const todayIndex = target.activityLog.findIndex(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });
      
      if (todayIndex !== -1) {
        // Update existing log
        target.activityLog[todayIndex].hours = hours;
      } else {
        // Add new log
        target.activityLog.push({
          date: today.toISOString(),
          hours: hours
        });
      }
      
      // Check penalty conditions
      this.checkPenalty(targetId);
    },
    
    removeTodayLog(targetId) {
      const target = this.targets.find(t => t.id === targetId);
      if (!target) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      target.activityLog = target.activityLog.filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() !== today.getTime();
      });
    },
    
    completeExam(targetId) {
      const target = this.targets.find(t => t.id === targetId);
      if (target) {
        target.examCompleted = true;
      }
    },
    
    resetProgress(targetId) {
      const target = this.targets.find(t => t.id === targetId);
      if (target) {
        target.activityLog = [];
        target.examCompleted = false;
      }
    },
    
    checkPenalty(targetId) {
      const target = this.targets.find(t => t.id === targetId);
      if (!target) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startDate = new Date(target.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      // Calculate expected days from start until today (but not exceeding total days)
      const totalExpectedDays = Math.min(
        this.getDaysBetweenDates(startDate, today) + 1,
        target.totalDays
      );
      
      const missedDays = totalExpectedDays - target.activityLog.length;
      
      // If missed days exceed buffer, reset progress
      if (missedDays > target.bufferDays) {
        target.activityLog = [];
        return true; // Indicating penalty was applied
      }
      
      return false;
    },
    
    getDaysBetweenDates(startDate, endDate) {
      const time = endDate.getTime() - startDate.getTime();
      return Math.floor(time / (1000 * 3600 * 24));
    },
    
    calculateTotalDays(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return this.getDaysBetweenDates(start, end) + 1;
    }
  }
});