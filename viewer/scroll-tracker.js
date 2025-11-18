/**
 * ScrollTracker - Comprehensive page-level scroll tracking system
 * Tracks scroll position, depth milestones, reading time, and session data
 */

class ScrollTracker {
    constructor(options = {}) {
        this.options = {
            throttleMs: 100,
            saveInterval: 2000,
            milestones: [0, 25, 50, 75, 100],
            minScrollSpeed: 50, // pixels per second to count as active reading
            idleTimeout: 30000, // 30 seconds of no scroll = idle
            ...options
        };

        this.currentDocument = null;
        this.trackingData = {
            scrollPosition: 0,
            scrollPercentage: 0,
            maxScrollPercentage: 0,
            milestonesReached: [],
            startTime: null,
            lastScrollTime: null,
            activeReadingTime: 0,
            totalSessionTime: 0,
            scrollEvents: 0,
            averageScrollSpeed: 0,
            completed: false,
            lastSaveTime: Date.now()
        };

        this.sessionTimer = null;
        this.saveTimer = null;
        this.scrollTimer = null;
        this.idleTimer = null;
        this.isTracking = false;
        this.scrollSpeed = [];

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Throttled scroll event
        let scrollTimeout;
        document.querySelector('.main-content')?.addEventListener('scroll', (e) => {
            if (!this.isTracking) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll(e);
            }, this.options.throttleMs);
        });

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseTracking();
            } else {
                this.resumeTracking();
            }
        });

        // Before unload - save data
        window.addEventListener('beforeunload', () => {
            this.stopTracking();
        });
    }

    startTracking(documentPath) {
        if (this.currentDocument === documentPath && this.isTracking) {
            return; // Already tracking this document
        }

        // Stop previous tracking
        if (this.isTracking) {
            this.stopTracking();
        }

        this.currentDocument = documentPath;
        this.isTracking = true;

        // Initialize tracking data
        this.trackingData = {
            documentPath: documentPath,
            scrollPosition: 0,
            scrollPercentage: 0,
            maxScrollPercentage: 0,
            milestonesReached: [0], // Start with 0%
            startTime: Date.now(),
            lastScrollTime: Date.now(),
            activeReadingTime: 0,
            totalSessionTime: 0,
            scrollEvents: 0,
            averageScrollSpeed: 0,
            completed: false,
            lastSaveTime: Date.now(),
            sessionId: this.generateSessionId(),
            viewportHeight: window.innerHeight,
            documentHeight: this.getDocumentHeight()
        };

        // Load previous progress if exists
        const previousData = window.storageManager?.getDocumentProgress(documentPath);
        if (previousData) {
            this.trackingData.maxScrollPercentage = previousData.maxScrollPercentage || 0;
            this.trackingData.milestonesReached = previousData.milestonesReached || [0];
            this.trackingData.activeReadingTime = previousData.activeReadingTime || 0;
            this.trackingData.totalSessionTime = previousData.totalSessionTime || 0;
            this.trackingData.completed = previousData.completed || false;

            // Restore scroll position if requested
            if (this.options.restorePosition && previousData.scrollPosition) {
                this.restoreScrollPosition(previousData.scrollPosition);
            }
        }

        // Start session timer
        this.startSessionTimer();

        // Start auto-save timer
        this.startSaveTimer();

        console.log(`📊 Scroll tracking started for: ${documentPath}`);
        this.triggerEvent('trackingStarted', this.trackingData);
    }

    stopTracking() {
        if (!this.isTracking) return;

        this.isTracking = false;

        // Stop timers
        this.stopSessionTimer();
        this.stopSaveTimer();
        clearTimeout(this.idleTimer);

        // Final save
        this.saveProgress();

        console.log(`📊 Scroll tracking stopped for: ${this.currentDocument}`);
        console.log(`   Max scroll: ${this.trackingData.maxScrollPercentage.toFixed(1)}%`);
        console.log(`   Active reading time: ${this.formatTime(this.trackingData.activeReadingTime)}`);
        console.log(`   Milestones: ${this.trackingData.milestonesReached.join('%, ')}%`);

        this.triggerEvent('trackingStopped', this.trackingData);
    }

    pauseTracking() {
        if (!this.isTracking) return;
        this.stopSessionTimer();
        this.saveProgress();
    }

    resumeTracking() {
        if (!this.isTracking) return;
        this.startSessionTimer();
    }

    handleScroll(event) {
        const container = event.target;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // Calculate scroll percentage
        const maxScroll = scrollHeight - clientHeight;
        const scrollPercentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 100;

        // Calculate scroll speed
        const now = Date.now();
        const timeDelta = now - (this.trackingData.lastScrollTime || now);
        const scrollDelta = Math.abs(scrollTop - this.trackingData.scrollPosition);
        const speed = timeDelta > 0 ? (scrollDelta / timeDelta) * 1000 : 0; // pixels per second

        // Update tracking data
        this.trackingData.scrollPosition = scrollTop;
        this.trackingData.scrollPercentage = scrollPercentage;
        this.trackingData.scrollEvents++;
        this.trackingData.lastScrollTime = now;

        // Update max scroll percentage
        if (scrollPercentage > this.trackingData.maxScrollPercentage) {
            this.trackingData.maxScrollPercentage = scrollPercentage;
        }

        // Check milestones
        this.checkMilestones(scrollPercentage);

        // Check completion (95% threshold to account for rounding)
        if (scrollPercentage >= 95 && !this.trackingData.completed) {
            this.markAsCompleted();
        }

        // Update scroll speed history
        if (speed > 0) {
            this.scrollSpeed.push(speed);
            if (this.scrollSpeed.length > 10) {
                this.scrollSpeed.shift();
            }
            this.trackingData.averageScrollSpeed =
                this.scrollSpeed.reduce((a, b) => a + b, 0) / this.scrollSpeed.length;
        }

        // Update UI
        this.updateUI();

        // Reset idle timer if actively scrolling
        if (speed > this.options.minScrollSpeed) {
            this.resetIdleTimer();
        }

        // Trigger scroll event for listeners
        this.triggerEvent('scroll', {
            scrollPercentage,
            scrollPosition: scrollTop,
            maxScrollPercentage: this.trackingData.maxScrollPercentage
        });
    }

    checkMilestones(currentPercentage) {
        for (const milestone of this.options.milestones) {
            if (currentPercentage >= milestone &&
                !this.trackingData.milestonesReached.includes(milestone)) {
                this.trackingData.milestonesReached.push(milestone);
                this.trackingData.milestonesReached.sort((a, b) => a - b);

                console.log(`🎯 Milestone reached: ${milestone}%`);
                this.triggerEvent('milestoneReached', {
                    milestone,
                    document: this.currentDocument
                });

                // Save on milestone
                this.saveProgress();
            }
        }
    }

    markAsCompleted() {
        this.trackingData.completed = true;
        this.trackingData.completedAt = Date.now();

        console.log(`✅ Document completed: ${this.currentDocument}`);
        this.triggerEvent('documentCompleted', {
            document: this.currentDocument,
            readingTime: this.trackingData.activeReadingTime
        });

        this.saveProgress();
    }

    startSessionTimer() {
        this.stopSessionTimer();

        const startTime = Date.now();
        this.sessionTimer = setInterval(() => {
            if (this.isTracking) {
                const elapsed = Date.now() - startTime;
                this.trackingData.totalSessionTime += 1000;

                // Only count as active reading if not idle
                if (!this.isIdle()) {
                    this.trackingData.activeReadingTime += 1000;
                }

                this.updateTimer();
            }
        }, 1000);
    }

    stopSessionTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    startSaveTimer() {
        this.stopSaveTimer();

        this.saveTimer = setInterval(() => {
            if (this.isTracking) {
                this.saveProgress();
            }
        }, this.options.saveInterval);
    }

    stopSaveTimer() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
    }

    resetIdleTimer() {
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            this.triggerEvent('userIdle', {
                document: this.currentDocument,
                idleTime: this.options.idleTimeout
            });
        }, this.options.idleTimeout);
    }

    isIdle() {
        if (!this.trackingData.lastScrollTime) return false;
        return (Date.now() - this.trackingData.lastScrollTime) > this.options.idleTimeout;
    }

    saveProgress() {
        if (!this.currentDocument || !window.storageManager) return;

        const dataToSave = {
            ...this.trackingData,
            lastUpdated: Date.now()
        };

        window.storageManager.saveDocumentProgress(this.currentDocument, dataToSave);
        this.trackingData.lastSaveTime = Date.now();

        this.triggerEvent('progressSaved', dataToSave);
    }

    restoreScrollPosition(position) {
        const container = document.querySelector('.main-content');
        if (container) {
            setTimeout(() => {
                container.scrollTop = position;
                console.log(`📍 Restored scroll position: ${position}px`);
            }, 100);
        }
    }

    updateUI() {
        // Update progress bar
        const progressBar = document.getElementById('scrollProgressBar');
        const progressPercentage = document.getElementById('scrollPercentage');

        if (progressBar) {
            progressBar.style.width = `${this.trackingData.scrollPercentage}%`;
        }

        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(this.trackingData.scrollPercentage)}%`;
        }

        // Update scroll indicator dot
        const scrollIndicator = document.querySelector('.scroll-indicator .scroll-dot');
        if (scrollIndicator) {
            const percentage = this.trackingData.scrollPercentage;
            scrollIndicator.style.top = `${percentage}%`;
        }
    }

    updateTimer() {
        const timerElement = document.getElementById('sessionTimer');
        if (timerElement) {
            timerElement.textContent = this.formatTime(this.trackingData.activeReadingTime);
        }
    }

    getDocumentHeight() {
        const container = document.querySelector('.main-content');
        return container ? container.scrollHeight : 0;
    }

    getTrackingData() {
        return { ...this.trackingData };
    }

    getCurrentDocument() {
        return this.currentDocument;
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
        }
        return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Event system for external listeners
    addEventListener(eventName, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }

    removeEventListener(eventName, callback) {
        if (!this.eventListeners || !this.eventListeners[eventName]) return;

        this.eventListeners[eventName] = this.eventListeners[eventName]
            .filter(cb => cb !== callback);
    }

    triggerEvent(eventName, data) {
        if (!this.eventListeners || !this.eventListeners[eventName]) return;

        this.eventListeners[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }

    // Public API
    reset() {
        this.stopTracking();
        this.trackingData = {};
        this.currentDocument = null;
    }

    destroy() {
        this.stopTracking();
        this.eventListeners = {};
    }
}

// Initialize global scroll tracker
window.scrollTracker = new ScrollTracker({
    throttleMs: 100,
    saveInterval: 3000,
    milestones: [0, 25, 50, 75, 100],
    restorePosition: false // Can be enabled if user wants to resume where they left off
});

console.log('✅ Scroll Tracker initialized');
