/**
 * GoalsManager - Learning goals and targets system
 * Helps users set and track learning objectives and milestones
 */

class GoalsManager {
    constructor() {
        this.storageKey = 'dsmp_goals';
        this.goals = {};
        this.activeGoalId = null;
        this.init();
    }

    init() {
        this.loadGoals();
        this.setupUI();
        this.bindEvents();
        this.startProgressTracking();
        console.log('✅ Goals Manager initialized');
    }

    loadGoals() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.goals = data ? JSON.parse(data) : this.getDefaultGoals();
        } catch (error) {
            console.error('Error loading goals:', error);
            this.goals = this.getDefaultGoals();
        }
    }

    getDefaultGoals() {
        return {};
    }

    saveGoals() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.goals));
            return true;
        } catch (error) {
            console.error('Error saving goals:', error);
            return false;
        }
    }

    setupUI() {
        // Add goals button to sidebar
        const progressSummary = document.querySelector('.progress-summary');
        if (progressSummary && !document.getElementById('goalsToggle')) {
            const goalsButton = document.createElement('button');
            goalsButton.id = 'goalsToggle';
            goalsButton.className = 'goals-toggle';
            goalsButton.innerHTML = '🎯 My Goals';
            goalsButton.style.cssText = 'width: 100%; margin-top: 15px; padding: 10px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;';
            progressSummary.appendChild(goalsButton);
        }

        // Create goals modal
        if (!document.getElementById('goalsModal')) {
            this.createGoalsModal();
        }

        // Update progress summary with goals info
        this.updateGoalsSummary();
    }

    createGoalsModal() {
        const modal = document.createElement('div');
        modal.id = 'goalsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2>🎯 Learning Goals</h2>
                    <button class="modal-close" id="goalsModalClose">×</button>
                </div>
                <div class="modal-body" id="goalsModalBody">
                    <div class="goals-toolbar">
                        <button class="btn-primary" id="addGoalBtn">+ Create Goal</button>
                        <div class="goals-tabs">
                            <button class="tab-btn active" data-tab="active">Active</button>
                            <button class="tab-btn" data-tab="completed">Completed</button>
                            <button class="tab-btn" data-tab="all">All Goals</button>
                        </div>
                    </div>

                    <div class="goals-content" id="goalsContent">
                        <!-- Goals will be rendered here -->
                    </div>
                </div>
            </div>

            <!-- Goal Editor Modal -->
            <div class="goal-editor-modal" id="goalEditorModal" style="display: none;">
                <div class="goal-editor-content">
                    <div class="goal-editor-header">
                        <h3 id="goalEditorTitle">Create Goal</h3>
                        <button class="modal-close" id="goalEditorClose">×</button>
                    </div>
                    <div class="goal-editor-body">
                        <div class="form-group">
                            <label>Goal Title</label>
                            <input type="text" id="goalTitle" class="form-input" placeholder="e.g., Complete Python Fundamentals">
                        </div>

                        <div class="form-group">
                            <label>Description (optional)</label>
                            <textarea id="goalDescription" class="form-textarea" placeholder="What do you want to achieve?"></textarea>
                        </div>

                        <div class="form-group">
                            <label>Goal Type</label>
                            <select id="goalType" class="form-select">
                                <option value="documents">Read N Documents</option>
                                <option value="category">Complete Category</option>
                                <option value="time">Study for N Hours</option>
                                <option value="streak">Maintain Streak</option>
                                <option value="custom">Custom Goal</option>
                            </select>
                        </div>

                        <div class="form-group" id="goalTargetGroup">
                            <label id="goalTargetLabel">Target</label>
                            <input type="number" id="goalTarget" class="form-input" placeholder="10" min="1">
                        </div>

                        <div class="form-group" id="goalCategoryGroup" style="display: none;">
                            <label>Category</label>
                            <select id="goalCategory" class="form-select">
                                <option value="">Select Category</option>
                                <option value="01-python-fundamentals">Python Fundamentals</option>
                                <option value="02-numpy-pandas">NumPy & Pandas</option>
                                <option value="03-data-visualization">Data Visualization</option>
                                <option value="04-sql">SQL</option>
                                <option value="05-statistics-probability">Statistics & Probability</option>
                                <option value="07-ml-basics">Machine Learning Basics</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Deadline (optional)</label>
                            <input type="date" id="goalDeadline" class="form-input">
                        </div>

                        <div class="form-group">
                            <label>Priority</label>
                            <select id="goalPriority" class="form-select">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div class="goal-editor-footer">
                        <button class="btn-secondary" id="cancelGoalBtn">Cancel</button>
                        <button class="btn-primary" id="saveGoalBtn">Save Goal</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            // Open goals modal
            if (e.target.id === 'goalsToggle') {
                this.showGoalsModal();
            }

            // Close goals modal
            if (e.target.id === 'goalsModalClose') {
                this.closeGoalsModal();
            }

            // Add goal button
            if (e.target.id === 'addGoalBtn') {
                this.showGoalEditor();
            }

            // Save goal
            if (e.target.id === 'saveGoalBtn') {
                this.saveGoal();
            }

            // Cancel goal editing
            if (e.target.id === 'cancelGoalBtn' || e.target.id === 'goalEditorClose') {
                this.closeGoalEditor();
            }

            // Tab switching
            if (e.target.classList.contains('tab-btn')) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.renderGoals(e.target.dataset.tab);
            }

            // Delete goal
            if (e.target.classList.contains('delete-goal-btn')) {
                const goalId = e.target.dataset.goalId;
                this.deleteGoal(goalId);
            }

            // Edit goal
            if (e.target.classList.contains('edit-goal-btn')) {
                const goalId = e.target.dataset.goalId;
                this.editGoal(goalId);
            }

            // Complete goal
            if (e.target.classList.contains('complete-goal-btn')) {
                const goalId = e.target.dataset.goalId;
                this.completeGoal(goalId);
            }
        });

        // Goal type change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'goalType') {
                this.handleGoalTypeChange(e.target.value);
            }
        });

        // Close modal on background click
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('goalsModal');
            if (e.target === modal) {
                this.closeGoalsModal();
            }

            const editorModal = document.getElementById('goalEditorModal');
            if (e.target === editorModal) {
                this.closeGoalEditor();
            }
        });
    }

    handleGoalTypeChange(type) {
        const targetGroup = document.getElementById('goalTargetGroup');
        const targetLabel = document.getElementById('goalTargetLabel');
        const targetInput = document.getElementById('goalTarget');
        const categoryGroup = document.getElementById('goalCategoryGroup');

        categoryGroup.style.display = 'none';
        targetGroup.style.display = 'block';

        switch (type) {
            case 'documents':
                targetLabel.textContent = 'Number of Documents';
                targetInput.placeholder = '10';
                break;
            case 'category':
                targetLabel.textContent = 'Target (optional)';
                targetInput.placeholder = 'Leave blank for all';
                categoryGroup.style.display = 'block';
                break;
            case 'time':
                targetLabel.textContent = 'Hours';
                targetInput.placeholder = '5';
                break;
            case 'streak':
                targetLabel.textContent = 'Days';
                targetInput.placeholder = '7';
                break;
            case 'custom':
                targetLabel.textContent = 'Target (optional)';
                targetInput.placeholder = 'e.g., 100';
                break;
        }
    }

    showGoalsModal() {
        const modal = document.getElementById('goalsModal');
        if (modal) {
            modal.classList.add('active');
            this.renderGoals('active');
        }
    }

    closeGoalsModal() {
        const modal = document.getElementById('goalsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showGoalEditor(goalId = null) {
        const modal = document.getElementById('goalEditorModal');
        const title = document.getElementById('goalEditorTitle');

        if (goalId) {
            // Edit mode
            const goal = this.goals[goalId];
            if (goal) {
                title.textContent = 'Edit Goal';
                this.populateGoalForm(goal);
                this.activeGoalId = goalId;
            }
        } else {
            // Create mode
            title.textContent = 'Create Goal';
            this.resetGoalForm();
            this.activeGoalId = null;
        }

        modal.style.display = 'flex';
    }

    closeGoalEditor() {
        const modal = document.getElementById('goalEditorModal');
        modal.style.display = 'none';
        this.activeGoalId = null;
    }

    populateGoalForm(goal) {
        document.getElementById('goalTitle').value = goal.title || '';
        document.getElementById('goalDescription').value = goal.description || '';
        document.getElementById('goalType').value = goal.type || 'documents';
        document.getElementById('goalTarget').value = goal.target || '';
        document.getElementById('goalCategory').value = goal.category || '';
        document.getElementById('goalPriority').value = goal.priority || 'medium';

        if (goal.deadline) {
            const date = new Date(goal.deadline);
            document.getElementById('goalDeadline').value = date.toISOString().split('T')[0];
        }

        this.handleGoalTypeChange(goal.type);
    }

    resetGoalForm() {
        document.getElementById('goalTitle').value = '';
        document.getElementById('goalDescription').value = '';
        document.getElementById('goalType').value = 'documents';
        document.getElementById('goalTarget').value = '';
        document.getElementById('goalCategory').value = '';
        document.getElementById('goalDeadline').value = '';
        document.getElementById('goalPriority').value = 'medium';
        this.handleGoalTypeChange('documents');
    }

    saveGoal() {
        const title = document.getElementById('goalTitle').value.trim();
        const description = document.getElementById('goalDescription').value.trim();
        const type = document.getElementById('goalType').value;
        const target = parseInt(document.getElementById('goalTarget').value) || 0;
        const category = document.getElementById('goalCategory').value;
        const deadline = document.getElementById('goalDeadline').value;
        const priority = document.getElementById('goalPriority').value;

        if (!title) {
            alert('Please enter a goal title');
            return;
        }

        if (type === 'category' && !category) {
            alert('Please select a category');
            return;
        }

        const goalId = this.activeGoalId || this.generateGoalId();

        const goal = {
            id: goalId,
            title,
            description,
            type,
            target,
            category,
            deadline: deadline ? new Date(deadline).getTime() : null,
            priority,
            progress: this.goals[goalId]?.progress || 0,
            completed: this.goals[goalId]?.completed || false,
            completedAt: this.goals[goalId]?.completedAt || null,
            createdAt: this.goals[goalId]?.createdAt || Date.now(),
            updatedAt: Date.now()
        };

        this.goals[goalId] = goal;
        this.saveGoals();
        this.closeGoalEditor();
        this.renderGoals(document.querySelector('.tab-btn.active')?.dataset.tab || 'active');
        this.updateGoalsSummary();

        console.log(`🎯 Goal ${this.activeGoalId ? 'updated' : 'created'}: ${goalId}`);
    }

    editGoal(goalId) {
        this.showGoalEditor(goalId);
    }

    deleteGoal(goalId) {
        if (confirm('Delete this goal?')) {
            delete this.goals[goalId];
            this.saveGoals();
            this.renderGoals(document.querySelector('.tab-btn.active')?.dataset.tab || 'active');
            this.updateGoalsSummary();
        }
    }

    completeGoal(goalId) {
        const goal = this.goals[goalId];
        if (goal) {
            goal.completed = true;
            goal.completedAt = Date.now();
            goal.progress = goal.target || 100;
            this.saveGoals();
            this.renderGoals(document.querySelector('.tab-btn.active')?.dataset.tab || 'active');
            this.updateGoalsSummary();
            this.showNotification('🎉 Goal completed!');
        }
    }

    renderGoals(filter = 'active') {
        const container = document.getElementById('goalsContent');
        if (!container) return;

        let goalsToShow = Object.values(this.goals);

        // Apply filter
        if (filter === 'active') {
            goalsToShow = goalsToShow.filter(g => !g.completed);
        } else if (filter === 'completed') {
            goalsToShow = goalsToShow.filter(g => g.completed);
        }

        // Sort by priority and deadline
        goalsToShow.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;

            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }

            return (a.deadline || Infinity) - (b.deadline || Infinity);
        });

        if (goalsToShow.length === 0) {
            container.innerHTML = `
                <div class="goals-empty">
                    <p>No ${filter} goals</p>
                    <p class="goals-empty-subtitle">Click "Create Goal" to set a new learning objective</p>
                </div>
            `;
            return;
        }

        container.innerHTML = goalsToShow.map(goal => this.renderGoalCard(goal)).join('');
    }

    renderGoalCard(goal) {
        const progressPercent = goal.target > 0 ? (goal.progress / goal.target) * 100 : 0;
        const isOverdue = goal.deadline && goal.deadline < Date.now() && !goal.completed;

        const priorityColors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        };

        const priorityColor = priorityColors[goal.priority] || '#6366f1';

        return `
            <div class="goal-card ${goal.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}"
                 style="border-left: 4px solid ${priorityColor}">
                <div class="goal-card-header">
                    <div class="goal-card-title">
                        ${goal.completed ? '✅ ' : ''}${this.escapeHtml(goal.title)}
                    </div>
                    <div class="goal-card-actions">
                        ${!goal.completed ? `
                            <button class="goal-action-btn complete-goal-btn" data-goal-id="${goal.id}" title="Mark as complete">✓</button>
                        ` : ''}
                        <button class="goal-action-btn edit-goal-btn" data-goal-id="${goal.id}" title="Edit">✏️</button>
                        <button class="goal-action-btn delete-goal-btn" data-goal-id="${goal.id}" title="Delete">🗑️</button>
                    </div>
                </div>

                ${goal.description ? `
                    <div class="goal-card-description">${this.escapeHtml(goal.description)}</div>
                ` : ''}

                <div class="goal-card-meta">
                    <span class="goal-type">${this.getGoalTypeLabel(goal)}</span>
                    ${goal.deadline ? `
                        <span class="goal-deadline ${isOverdue ? 'overdue' : ''}">
                            📅 ${this.formatDeadline(goal.deadline)}
                        </span>
                    ` : ''}
                    <span class="goal-priority" style="color: ${priorityColor}">
                        ${goal.priority.toUpperCase()}
                    </span>
                </div>

                ${goal.target > 0 ? `
                    <div class="goal-progress">
                        <div class="goal-progress-text">
                            <span>Progress: ${goal.progress} / ${goal.target}</span>
                            <span>${Math.min(progressPercent, 100).toFixed(0)}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${Math.min(progressPercent, 100)}%"></div>
                        </div>
                    </div>
                ` : ''}

                ${goal.completed ? `
                    <div class="goal-completed-badge">
                        Completed ${this.formatDate(goal.completedAt)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getGoalTypeLabel(goal) {
        const labels = {
            documents: `📚 ${goal.target} Documents`,
            category: `📂 ${goal.category ? this.getCategoryName(goal.category) : 'Category'}`,
            time: `⏱️ ${goal.target} Hours`,
            streak: `🔥 ${goal.target} Day Streak`,
            custom: '🎯 Custom'
        };

        return labels[goal.type] || 'Goal';
    }

    getCategoryName(category) {
        return category
            .replace(/^\d+-/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    updateGoalsSummary() {
        const activeGoals = Object.values(this.goals).filter(g => !g.completed);
        const completedGoals = Object.values(this.goals).filter(g => g.completed);

        // Update button text
        const toggleBtn = document.getElementById('goalsToggle');
        if (toggleBtn && activeGoals.length > 0) {
            toggleBtn.innerHTML = `🎯 My Goals (${activeGoals.length})`;
        }
    }

    startProgressTracking() {
        // Update goal progress based on actual progress
        setInterval(() => {
            this.updateGoalProgress();
        }, 5000); // Update every 5 seconds
    }

    updateGoalProgress() {
        const stats = window.storageManager?.getReadingStats();
        if (!stats) return;

        let updated = false;

        Object.values(this.goals).forEach(goal => {
            if (goal.completed) return;

            let newProgress = goal.progress;

            switch (goal.type) {
                case 'documents':
                    newProgress = stats.completedDocuments;
                    break;
                case 'time':
                    newProgress = Math.floor(stats.totalReadingTime / 3600000); // Convert ms to hours
                    break;
                case 'streak':
                    newProgress = stats.currentStreak;
                    break;
                case 'category':
                    if (goal.category) {
                        const categoryStats = window.storageManager?.getCategoryStats();
                        const catStat = categoryStats[goal.category];
                        if (catStat) {
                            newProgress = catStat.documentsCompleted || 0;
                        }
                    }
                    break;
            }

            if (newProgress !== goal.progress) {
                goal.progress = newProgress;
                updated = true;

                // Auto-complete if target reached
                if (goal.target > 0 && newProgress >= goal.target && !goal.completed) {
                    this.completeGoal(goal.id);
                }
            }
        });

        if (updated) {
            this.saveGoals();
        }
    }

    // Utility functions
    generateGoalId() {
        return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }

    formatDeadline(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = date - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days < 0) {
            return `Overdue by ${Math.abs(days)} days`;
        } else if (days === 0) {
            return 'Due today';
        } else if (days === 1) {
            return 'Due tomorrow';
        } else if (days < 7) {
            return `Due in ${days} days`;
        } else {
            return date.toLocaleDateString();
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'goal-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Public API
    getActiveGoals() {
        return Object.values(this.goals).filter(g => !g.completed);
    }

    getCompletedGoals() {
        return Object.values(this.goals).filter(g => g.completed);
    }

    getGoalById(goalId) {
        return this.goals[goalId];
    }

    exportGoals() {
        return JSON.stringify(this.goals, null, 2);
    }

    importGoals(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.goals = { ...this.goals, ...imported };
            this.saveGoals();
            return true;
        } catch (error) {
            console.error('Error importing goals:', error);
            return false;
        }
    }
}

// Initialize global goals manager
window.goalsManager = new GoalsManager();

console.log('✅ Goals Manager loaded');
