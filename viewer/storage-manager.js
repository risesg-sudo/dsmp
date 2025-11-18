/**
 * StorageManager - Handles data persistence using localStorage
 * Manages document progress, reading history, and analytics data
 */

class StorageManager {
    constructor() {
        this.storageKey = 'dsmp_revision_data';
        this.version = '1.0.0';
        this.cache = null;
        this.init();
    }

    init() {
        // Initialize storage structure if doesn't exist
        if (!localStorage.getItem(this.storageKey)) {
            this.resetStorage();
        }

        // Load cache
        this.loadCache();

        // Migrate old data if needed
        this.migrateData();

        console.log('✅ Storage Manager initialized');
    }

    loadCache() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.cache = data ? JSON.parse(data) : this.getDefaultStructure();
        } catch (error) {
            console.error('Error loading cache:', error);
            this.cache = this.getDefaultStructure();
        }
    }

    saveCache() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.cleanup();
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
                    return true;
                } catch (retryError) {
                    console.error('Failed to save even after cleanup:', retryError);
                    return false;
                }
            }
            return false;
        }
    }

    getDefaultStructure() {
        return {
            version: this.version,
            createdAt: Date.now(),
            lastUpdated: Date.now(),
            documents: {},
            sessions: [],
            analytics: {
                totalReadingTime: 0,
                documentsCompleted: 0,
                totalScrollEvents: 0,
                averageCompletionPercentage: 0,
                lastActivityDate: null,
                streak: {
                    current: 0,
                    longest: 0,
                    lastActiveDate: null
                },
                categories: {}
            },
            settings: {
                restoreScrollPosition: false,
                autoSave: true,
                trackAnalytics: true
            }
        };
    }

    resetStorage() {
        const structure = this.getDefaultStructure();
        localStorage.setItem(this.storageKey, JSON.stringify(structure));
        this.cache = structure;
        console.log('Storage reset to default structure');
    }

    migrateData() {
        if (this.cache.version !== this.version) {
            console.log(`Migrating data from version ${this.cache.version} to ${this.version}`);
            // Add migration logic here as needed
            this.cache.version = this.version;
            this.saveCache();
        }
    }

    // Document Progress Management
    saveDocumentProgress(documentPath, progressData) {
        if (!documentPath || !progressData) return false;

        // Update document data
        if (!this.cache.documents[documentPath]) {
            this.cache.documents[documentPath] = {
                firstViewed: Date.now(),
                viewCount: 0
            };
        }

        this.cache.documents[documentPath] = {
            ...this.cache.documents[documentPath],
            ...progressData,
            lastViewed: Date.now(),
            viewCount: (this.cache.documents[documentPath].viewCount || 0) + 1
        };

        // Update analytics
        this.updateAnalytics(documentPath, progressData);

        // Update streak
        this.updateStreak();

        this.cache.lastUpdated = Date.now();
        return this.saveCache();
    }

    getDocumentProgress(documentPath) {
        return this.cache.documents[documentPath] || null;
    }

    getAllDocumentsProgress() {
        return { ...this.cache.documents };
    }

    deleteDocumentProgress(documentPath) {
        if (this.cache.documents[documentPath]) {
            delete this.cache.documents[documentPath];
            return this.saveCache();
        }
        return false;
    }

    // Session Management
    saveSession(sessionData) {
        this.cache.sessions.push({
            ...sessionData,
            timestamp: Date.now()
        });

        // Keep only last 100 sessions to manage storage
        if (this.cache.sessions.length > 100) {
            this.cache.sessions = this.cache.sessions.slice(-100);
        }

        return this.saveCache();
    }

    getSessions(limit = 10) {
        return this.cache.sessions.slice(-limit).reverse();
    }

    // Analytics Management
    updateAnalytics(documentPath, progressData) {
        const analytics = this.cache.analytics;

        // Update total reading time
        if (progressData.activeReadingTime) {
            const prevTime = this.cache.documents[documentPath]?.activeReadingTime || 0;
            const timeDiff = progressData.activeReadingTime - prevTime;
            if (timeDiff > 0) {
                analytics.totalReadingTime += timeDiff;
            }
        }

        // Update documents completed
        if (progressData.completed &&
            !this.cache.documents[documentPath]?.completed) {
            analytics.documentsCompleted++;
        }

        // Update scroll events
        if (progressData.scrollEvents) {
            analytics.totalScrollEvents += progressData.scrollEvents;
        }

        // Update category stats
        const category = this.getCategoryFromPath(documentPath);
        if (category) {
            if (!analytics.categories[category]) {
                analytics.categories[category] = {
                    documentsRead: 0,
                    documentsCompleted: 0,
                    totalReadingTime: 0
                };
            }

            const catStats = analytics.categories[category];
            catStats.documentsRead = new Set([
                ...(catStats.documentsRead || []),
                documentPath
            ]).size;

            if (progressData.completed) {
                catStats.documentsCompleted = Object.values(this.cache.documents)
                    .filter(doc =>
                        this.getCategoryFromPath(doc.documentPath) === category &&
                        doc.completed
                    ).length;
            }

            if (progressData.activeReadingTime) {
                const prevTime = this.cache.documents[documentPath]?.activeReadingTime || 0;
                const timeDiff = progressData.activeReadingTime - prevTime;
                if (timeDiff > 0) {
                    catStats.totalReadingTime += timeDiff;
                }
            }
        }

        // Update average completion percentage
        const allDocs = Object.values(this.cache.documents);
        if (allDocs.length > 0) {
            const totalPercentage = allDocs.reduce((sum, doc) =>
                sum + (doc.maxScrollPercentage || 0), 0
            );
            analytics.averageCompletionPercentage = totalPercentage / allDocs.length;
        }

        // Update last activity date
        analytics.lastActivityDate = Date.now();
    }

    updateStreak() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const streak = this.cache.analytics.streak;

        if (!streak.lastActiveDate) {
            // First activity
            streak.current = 1;
            streak.longest = 1;
            streak.lastActiveDate = today;
        } else {
            const lastActive = new Date(streak.lastActiveDate);
            const lastActiveDay = new Date(
                lastActive.getFullYear(),
                lastActive.getMonth(),
                lastActive.getDate()
            ).getTime();

            const daysDiff = Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day, no change
            } else if (daysDiff === 1) {
                // Consecutive day
                streak.current++;
                streak.longest = Math.max(streak.longest, streak.current);
                streak.lastActiveDate = today;
            } else {
                // Streak broken
                streak.current = 1;
                streak.lastActiveDate = today;
            }
        }
    }

    getAnalytics() {
        return { ...this.cache.analytics };
    }

    getCategoryStats() {
        return { ...this.cache.analytics.categories };
    }

    // Settings Management
    getSetting(key) {
        return this.cache.settings[key];
    }

    setSetting(key, value) {
        this.cache.settings[key] = value;
        return this.saveCache();
    }

    getSettings() {
        return { ...this.cache.settings };
    }

    // Utility Functions
    getCategoryFromPath(path) {
        if (!path) return null;

        // Extract category from path like: ../dsmp-revision/01-python-fundamentals/file.md
        const match = path.match(/\/(\d+-[^/]+)\//);
        if (match) {
            return match[1];
        }

        return null;
    }

    getCategoryName(category) {
        if (!category) return 'Unknown';

        // Convert "01-python-fundamentals" to "Python Fundamentals"
        return category
            .replace(/^\d+-/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Data Export/Import
    exportData() {
        return JSON.stringify(this.cache, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.version && data.documents && data.analytics) {
                this.cache = data;
                this.saveCache();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Cleanup and Maintenance
    cleanup() {
        console.log('Performing storage cleanup...');

        // Remove old sessions (keep last 50)
        if (this.cache.sessions.length > 50) {
            this.cache.sessions = this.cache.sessions.slice(-50);
        }

        // Remove documents not accessed in 90 days
        const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
        Object.keys(this.cache.documents).forEach(path => {
            const doc = this.cache.documents[path];
            if (doc.lastViewed < ninetyDaysAgo) {
                delete this.cache.documents[path];
            }
        });

        this.saveCache();
        console.log('Cleanup completed');
    }

    // Statistics and Reports
    getReadingStats() {
        const allDocs = Object.values(this.cache.documents);
        const completed = allDocs.filter(doc => doc.completed);
        const inProgress = allDocs.filter(doc =>
            !doc.completed && doc.maxScrollPercentage > 10
        );

        return {
            totalDocuments: allDocs.length,
            completedDocuments: completed.length,
            inProgressDocuments: inProgress.length,
            totalReadingTime: this.cache.analytics.totalReadingTime,
            averageReadingTime: allDocs.length > 0 ?
                this.cache.analytics.totalReadingTime / allDocs.length : 0,
            completionRate: allDocs.length > 0 ?
                (completed.length / allDocs.length) * 100 : 0,
            currentStreak: this.cache.analytics.streak.current,
            longestStreak: this.cache.analytics.streak.longest
        };
    }

    getDocumentsByCategory() {
        const byCategory = {};

        Object.entries(this.cache.documents).forEach(([path, data]) => {
            const category = this.getCategoryFromPath(path);
            if (category) {
                if (!byCategory[category]) {
                    byCategory[category] = [];
                }
                byCategory[category].push({ path, ...data });
            }
        });

        return byCategory;
    }

    getRecentDocuments(limit = 5) {
        return Object.entries(this.cache.documents)
            .sort((a, b) => (b[1].lastViewed || 0) - (a[1].lastViewed || 0))
            .slice(0, limit)
            .map(([path, data]) => ({ path, ...data }));
    }

    // Storage Info
    getStorageInfo() {
        const data = JSON.stringify(this.cache);
        const sizeInBytes = new Blob([data]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);

        // Estimate localStorage limit (usually 5-10MB)
        const estimatedLimit = 5120; // 5MB in KB

        return {
            usedKB: sizeInKB,
            usedBytes: sizeInBytes,
            estimatedLimitKB: estimatedLimit,
            usagePercentage: ((sizeInKB / estimatedLimit) * 100).toFixed(2),
            documentsCount: Object.keys(this.cache.documents).length,
            sessionsCount: this.cache.sessions.length
        };
    }

    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear all reading progress? This cannot be undone.')) {
            this.resetStorage();
            return true;
        }
        return false;
    }
}

// Initialize global storage manager
window.storageManager = new StorageManager();

console.log('✅ Storage Manager initialized');
