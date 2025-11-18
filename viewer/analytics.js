/**
 * Analytics - Displays and manages reading analytics and statistics
 */

class Analytics {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateSummary();
        console.log('✅ Analytics initialized');
    }

    bindEvents() {
        // Stats modal toggle
        const statsToggle = document.getElementById('statsToggle');
        const modal = document.getElementById('statsModal');
        const modalClose = document.getElementById('modalClose');

        if (statsToggle) {
            statsToggle.addEventListener('click', () => {
                this.showAnalyticsDashboard();
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        // Listen to tracking events
        if (window.scrollTracker) {
            window.scrollTracker.addEventListener('documentCompleted', () => {
                this.updateSummary();
            });

            window.scrollTracker.addEventListener('milestoneReached', () => {
                this.updateSummary();
            });
        }
    }

    updateSummary() {
        if (!window.storageManager) return;

        const stats = window.storageManager.getReadingStats();
        const allProgress = window.storageManager.getAllDocumentsProgress();
        const totalDocs = Object.keys(allProgress).length;

        // Update documents read
        const docsReadElement = document.getElementById('docsRead');
        if (docsReadElement) {
            docsReadElement.textContent = `${stats.completedDocuments}/${totalDocs}`;
        }

        // Update total time
        const totalTimeElement = document.getElementById('totalTime');
        if (totalTimeElement) {
            totalTimeElement.textContent = this.formatTime(stats.totalReadingTime);
        }

        // Update streak
        const streakElement = document.getElementById('currentStreak');
        if (streakElement) {
            const streak = stats.currentStreak;
            streakElement.textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;
        }
    }

    showAnalyticsDashboard() {
        const modal = document.getElementById('statsModal');
        const modalBody = document.getElementById('statsModalBody');

        if (!modal || !modalBody || !window.storageManager) return;

        const stats = window.storageManager.getReadingStats();
        const analytics = window.storageManager.getAnalytics();
        const categoryStats = window.storageManager.getCategoryStats();
        const recentDocs = window.storageManager.getRecentDocuments(10);
        const storageInfo = window.storageManager.getStorageInfo();

        // Get goals and notes data
        const activeGoals = window.goalsManager?.getActiveGoals() || [];
        const notesCount = window.notesManager?.getNoteCount() || 0;
        const bookmarksCount = window.bookmarksManager?.getBookmarkCount() || 0;

        // Build analytics HTML with enhanced visualizations
        const html = `
            <!-- Overview Cards with Progress Circles -->
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>Documents Read</h3>
                    <div class="circle-progress" data-percent="${stats.completionRate.toFixed(0)}">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" class="circle-bg"></circle>
                            <circle cx="50" cy="50" r="45" class="circle-fill"
                                    style="stroke-dasharray: ${stats.completionRate * 2.827}, 282.7"></circle>
                        </svg>
                        <div class="circle-text">
                            <div class="circle-value">${stats.completedDocuments}</div>
                            <div class="circle-label">of ${stats.totalDocuments}</div>
                        </div>
                    </div>
                </div>

                <div class="analytics-card">
                    <h3>Total Reading Time</h3>
                    <div class="value">${this.formatTimeShort(stats.totalReadingTime)}</div>
                    <div class="subtitle">${this.formatTime(stats.averageReadingTime)} avg/doc</div>
                    <div class="mini-chart">
                        ${this.renderTimeDistribution()}
                    </div>
                </div>

                <div class="analytics-card">
                    <h3>Current Streak</h3>
                    <div class="value">${stats.currentStreak} 🔥</div>
                    <div class="subtitle">Longest: ${stats.longestStreak} days</div>
                    <div class="streak-bar">
                        <div class="streak-bar-fill" style="width: ${Math.min((stats.currentStreak / stats.longestStreak) * 100, 100)}%"></div>
                    </div>
                </div>

                <div class="analytics-card">
                    <h3>Phase 2 Features</h3>
                    <div class="feature-stats">
                        <div>📝 ${notesCount} Notes</div>
                        <div>🔖 ${bookmarksCount} Bookmarks</div>
                        <div>🎯 ${activeGoals.length} Active Goals</div>
                    </div>
                </div>
            </div>

            <!-- Category Progress Chart -->
            <div class="document-list">
                <h3>📚 Progress by Category</h3>
                ${this.renderCategoryChart(categoryStats)}
            </div>

            <!-- Goals Progress -->
            ${activeGoals.length > 0 ? `
                <div class="document-list" style="margin-top: 30px;">
                    <h3>🎯 Active Goals Progress</h3>
                    ${this.renderGoalsProgress(activeGoals)}
                </div>
            ` : ''}

            <!-- Recent Documents -->
            <div class="document-list" style="margin-top: 30px;">
                <h3>📖 Recently Read</h3>
                ${this.renderRecentDocuments(recentDocs)}
            </div>

            <!-- Detailed Statistics -->
            <div class="document-list" style="margin-top: 30px;">
                <h3>📊 Detailed Statistics</h3>
                <div class="document-item">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 13px;">
                        <div>
                            <strong style="color: var(--text-primary);">Total Scroll Events:</strong><br>
                            <span style="color: var(--text-muted);">${analytics.totalScrollEvents.toLocaleString()}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-primary);">Avg Completion:</strong><br>
                            <span style="color: var(--text-muted);">${analytics.averageCompletionPercentage.toFixed(1)}%</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-primary);">Last Activity:</strong><br>
                            <span style="color: var(--text-muted);">${this.formatDate(analytics.lastActivityDate)}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-primary);">Storage Used:</strong><br>
                            <span style="color: var(--text-muted);">${storageInfo.usedKB} KB (${storageInfo.usagePercentage}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="window.analytics.exportAllData()"
                        style="padding: 10px 20px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    📥 Export All Data
                </button>
                <button onclick="window.analytics.clearData()"
                        style="padding: 10px 20px; background: var(--danger-color); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🗑️ Clear All Data
                </button>
            </div>
        `;

        modalBody.innerHTML = html;
        modal.classList.add('active');
    }

    renderCategoryChart(categoryStats) {
        const categories = Object.entries(categoryStats);

        if (categories.length === 0) {
            return `
                <div class="document-item">
                    <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                        No reading data yet. Start reading to see your progress!
                    </div>
                </div>
            `;
        }

        // Find max for scaling
        const maxDocs = Math.max(...categories.map(([, stats]) => stats.documentsRead || 0));

        return `
            <div class="category-chart">
                ${categories
                    .sort((a, b) => (b[1].documentsCompleted || 0) - (a[1].documentsCompleted || 0))
                    .map(([category, stats]) => {
                        const categoryName = window.storageManager.getCategoryName(category);
                        const completion = stats.documentsRead > 0 ?
                            (stats.documentsCompleted / stats.documentsRead) * 100 : 0;
                        const barWidth = maxDocs > 0 ? (stats.documentsRead / maxDocs) * 100 : 0;

                        return `
                            <div class="chart-row">
                                <div class="chart-label">${categoryName}</div>
                                <div class="chart-bar-container">
                                    <div class="chart-bar" style="width: ${barWidth}%">
                                        <div class="chart-bar-fill" style="width: ${completion}%"></div>
                                    </div>
                                    <div class="chart-value">${stats.documentsCompleted}/${stats.documentsRead}</div>
                                </div>
                            </div>
                        `;
                    })
                    .join('')}
            </div>
        `;
    }

    renderGoalsProgress(goals) {
        return goals
            .slice(0, 5) // Show top 5
            .map(goal => {
                const progress = goal.target > 0 ? (goal.progress / goal.target) * 100 : 0;

                return `
                    <div class="document-item">
                        <div class="document-item-header">
                            <div class="document-name">🎯 ${goal.title}</div>
                            <div class="document-progress">${Math.min(progress, 100).toFixed(0)}%</div>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    renderTimeDistribution() {
        // Simple time distribution visualization
        const stats = window.storageManager?.getReadingStats();
        if (!stats) return '';

        const avgTime = stats.averageReadingTime;
        const totalTime = stats.totalReadingTime;

        if (totalTime === 0) return '';

        return `
            <div class="time-bars">
                <div class="time-bar" style="height: 60%;" title="Avg Time"></div>
                <div class="time-bar" style="height: 100%;" title="Total Time"></div>
            </div>
        `;
    }

    renderCategoryBreakdown(categoryStats) {
        const categories = Object.entries(categoryStats);

        if (categories.length === 0) {
            return `
                <div class="document-item">
                    <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                        No reading data yet. Start reading to see your progress!
                    </div>
                </div>
            `;
        }

        return categories
            .sort((a, b) => (b[1].totalReadingTime || 0) - (a[1].totalReadingTime || 0))
            .map(([category, stats]) => {
                const categoryName = window.storageManager.getCategoryName(category);
                const completion = stats.documentsRead > 0 ?
                    (stats.documentsCompleted / stats.documentsRead) * 100 : 0;

                return `
                    <div class="document-item">
                        <div class="document-item-header">
                            <div class="document-name">${categoryName}</div>
                            <div class="document-progress">${stats.documentsCompleted}/${stats.documentsRead} completed</div>
                        </div>
                        <div class="document-stats">
                            <span>⏱️ ${this.formatTime(stats.totalReadingTime || 0)}</span>
                            <span>📈 ${completion.toFixed(0)}% complete</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${completion}%"></div>
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    renderRecentDocuments(documents) {
        if (documents.length === 0) {
            return `
                <div class="document-item">
                    <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                        No documents read yet
                    </div>
                </div>
            `;
        }

        return documents.map(doc => {
            const fileName = doc.path.split('/').pop().replace('.md', '');
            const percentage = doc.maxScrollPercentage || 0;
            const isCompleted = doc.completed;

            return `
                <div class="document-item">
                    <div class="document-item-header">
                        <div class="document-name">
                            ${isCompleted ? '✅ ' : '📄 '}${fileName}
                        </div>
                        <div class="document-progress">${percentage.toFixed(1)}%</div>
                    </div>
                    <div class="document-stats">
                        <span>⏱️ ${this.formatTime(doc.activeReadingTime || 0)}</span>
                        <span>👁️ ${doc.viewCount || 1} ${doc.viewCount === 1 ? 'view' : 'views'}</span>
                        <span>🕐 ${this.formatDate(doc.lastViewed)}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    exportData() {
        if (!window.storageManager) return;

        const data = window.storageManager.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dsmp-reading-progress-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ Data exported successfully');
    }

    exportAllData() {
        // Export all data including progress, notes, bookmarks, and goals
        const allData = {
            progress: window.storageManager?.exportData(),
            notes: window.notesManager?.exportNotes(),
            bookmarks: window.bookmarksManager?.exportBookmarks(),
            goals: window.goalsManager?.exportGoals(),
            exportedAt: Date.now(),
            version: '2.0.0'
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dsmp-complete-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ Complete data exported successfully');
        alert('All data exported successfully!\n\nIncludes: Progress, Notes, Bookmarks, and Goals');
    }

    clearData() {
        if (!window.storageManager) return;

        if (confirm('⚠️ Are you sure you want to clear ALL reading progress?\n\nThis action cannot be undone!')) {
            window.storageManager.clearAllData();
            this.updateSummary();

            // Close modal and show confirmation
            const modal = document.getElementById('statsModal');
            if (modal) {
                modal.classList.remove('active');
            }

            alert('✅ All data has been cleared.');
        }
    }

    formatTime(milliseconds) {
        if (!milliseconds || milliseconds === 0) return '0m';

        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }

    formatTimeShort(milliseconds) {
        if (!milliseconds || milliseconds === 0) return '0m';

        const minutes = Math.floor(milliseconds / 60000);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${minutes}m`;
        }
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Never';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Update nav item progress badges
    updateNavProgress(documentPath, progress) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const itemPath = item.dataset.path;
            if (itemPath === documentPath) {
                const badge = item.querySelector('.progress-badge');
                if (badge) {
                    const percentage = Math.round(progress.maxScrollPercentage || 0);
                    badge.textContent = `${percentage}%`;

                    // Update item class based on progress
                    item.classList.remove('completed', 'in-progress');
                    if (progress.completed) {
                        item.classList.add('completed');
                    } else if (percentage > 10) {
                        item.classList.add('in-progress');
                    }
                }
            }
        });
    }

    // Refresh all navigation progress indicators
    refreshNavProgress() {
        if (!window.storageManager) return;

        const allProgress = window.storageManager.getAllDocumentsProgress();
        Object.entries(allProgress).forEach(([path, progress]) => {
            this.updateNavProgress(path, progress);
        });
    }
}

// Initialize global analytics
window.analytics = new Analytics();

console.log('✅ Analytics initialized');
