/**
 * Flashcards Manager - Spaced Repetition System (SRS)
 * Implements SM-2 algorithm for optimal learning
 *
 * Phase 3 Feature: Advanced spaced repetition with flashcards
 */

class FlashcardsManager {
    constructor() {
        this.storageKey = 'dsmp-flashcards';
        this.flashcards = this.loadFlashcards();
        this.currentDeck = [];
        this.currentCardIndex = 0;
        this.studySession = null;
        this.init();
    }

    init() {
        this.createFlashcardsUI();
        this.attachEventListeners();
        this.updateFlashcardStats();
    }

    // SM-2 Algorithm for Spaced Repetition
    // EF (Easiness Factor) starts at 2.5
    // Interval increases based on quality of recall (0-5)
    calculateNextReview(card, quality) {
        // quality: 0-5 (0 = complete blackout, 5 = perfect recall)
        let ef = card.easinessFactor || 2.5;
        let interval = card.interval || 0;
        let repetition = card.repetition || 0;

        // Update easiness factor
        ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

        // Minimum EF is 1.3
        if (ef < 1.3) ef = 1.3;

        // Calculate next interval
        if (quality < 3) {
            // Failed recall - restart
            repetition = 0;
            interval = 1;
        } else {
            if (repetition === 0) {
                interval = 1;
            } else if (repetition === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * ef);
            }
            repetition++;
        }

        return {
            easinessFactor: ef,
            interval: interval,
            repetition: repetition,
            nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000)
        };
    }

    createFlashcardsUI() {
        // Add flashcards button to header
        const contentHeader = document.querySelector('.content-header');
        if (contentHeader) {
            const flashcardsBtn = document.createElement('button');
            flashcardsBtn.className = 'flashcards-toggle';
            flashcardsBtn.innerHTML = '🃏 Flashcards';
            flashcardsBtn.id = 'flashcardsToggle';
            contentHeader.appendChild(flashcardsBtn);
        }

        // Create flashcards panel
        const panel = document.createElement('div');
        panel.className = 'flashcards-panel';
        panel.id = 'flashcardsPanel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🃏 Flashcards & SRS</h3>
                <button class="panel-close" id="closeFlashcards">×</button>
            </div>

            <div class="panel-tabs">
                <button class="tab-btn active" data-tab="study">Study</button>
                <button class="tab-btn" data-tab="create">Create</button>
                <button class="tab-btn" data-tab="browse">Browse</button>
                <button class="tab-btn" data-tab="stats">Stats</button>
            </div>

            <div class="panel-content">
                <!-- Study Tab -->
                <div class="tab-panel active" id="studyTab">
                    <div class="study-options">
                        <h4>Start Study Session</h4>
                        <button class="btn btn-primary" id="studyDue">Study Due Cards (<span id="dueCount">0</span>)</button>
                        <button class="btn btn-secondary" id="studyNew">Study New Cards (<span id="newCount">0</span>)</button>
                        <button class="btn btn-secondary" id="studyAll">Study All Cards (<span id="allCount">0</span>)</button>
                    </div>

                    <div class="study-session hidden" id="studySession">
                        <div class="session-progress">
                            <span id="sessionProgress">0/0</span>
                            <div class="progress-bar">
                                <div class="progress-fill" id="sessionProgressBar"></div>
                            </div>
                        </div>

                        <div class="flashcard" id="flashcard">
                            <div class="card-front" id="cardFront">
                                <div class="card-content"></div>
                            </div>
                            <div class="card-back hidden" id="cardBack">
                                <div class="card-content"></div>
                            </div>
                            <button class="flip-btn" id="flipCard">Show Answer</button>
                        </div>

                        <div class="quality-buttons hidden" id="qualityButtons">
                            <h4>How well did you recall?</h4>
                            <button class="quality-btn quality-0" data-quality="0">
                                <span class="quality-label">Again</span>
                                <span class="quality-desc">Complete blackout</span>
                            </button>
                            <button class="quality-btn quality-1" data-quality="1">
                                <span class="quality-label">Hard</span>
                                <span class="quality-desc">Incorrect, but remembered</span>
                            </button>
                            <button class="quality-btn quality-3" data-quality="3">
                                <span class="quality-label">Good</span>
                                <span class="quality-desc">Correct with hesitation</span>
                            </button>
                            <button class="quality-btn quality-4" data-quality="4">
                                <span class="quality-label">Easy</span>
                                <span class="quality-desc">Perfect recall</span>
                            </button>
                        </div>

                        <button class="btn btn-secondary" id="endSession">End Session</button>
                    </div>
                </div>

                <!-- Create Tab -->
                <div class="tab-panel" id="createTab">
                    <h4>Create New Flashcard</h4>
                    <form id="createCardForm">
                        <div class="form-group">
                            <label>Front (Question)</label>
                            <textarea id="cardFrontInput" rows="3" placeholder="Enter question or prompt..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Back (Answer)</label>
                            <textarea id="cardBackInput" rows="3" placeholder="Enter answer..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Tags (comma-separated)</label>
                            <input type="text" id="cardTags" placeholder="e.g., python, pandas, ml">
                        </div>
                        <div class="form-group">
                            <label>Deck/Category</label>
                            <input type="text" id="cardDeck" placeholder="e.g., ML Algorithms">
                        </div>
                        <button type="submit" class="btn btn-primary">Create Flashcard</button>
                    </form>

                    <div class="quick-create">
                        <h4>Quick Create from Selection</h4>
                        <p>Select text in the document, then click to create a flashcard automatically.</p>
                        <button class="btn btn-secondary" id="createFromSelection">Create from Selection</button>
                    </div>
                </div>

                <!-- Browse Tab -->
                <div class="tab-panel" id="browseTab">
                    <div class="browse-controls">
                        <input type="text" id="searchCards" placeholder="Search flashcards...">
                        <select id="filterDeck">
                            <option value="">All Decks</option>
                        </select>
                    </div>
                    <div class="cards-list" id="cardsList"></div>
                </div>

                <!-- Stats Tab -->
                <div class="tab-panel" id="statsTab">
                    <div class="flashcard-stats" id="flashcardStats"></div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    attachEventListeners() {
        // Toggle panel
        const toggleBtn = document.getElementById('flashcardsToggle');
        const closeBtn = document.getElementById('closeFlashcards');
        const panel = document.getElementById('flashcardsPanel');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                panel.classList.toggle('open');
                this.updateFlashcardStats();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.classList.remove('open');
            });
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Study buttons
        document.getElementById('studyDue')?.addEventListener('click', () => this.startStudySession('due'));
        document.getElementById('studyNew')?.addEventListener('click', () => this.startStudySession('new'));
        document.getElementById('studyAll')?.addEventListener('click', () => this.startStudySession('all'));
        document.getElementById('endSession')?.addEventListener('click', () => this.endStudySession());
        document.getElementById('flipCard')?.addEventListener('click', () => this.flipCard());

        // Quality buttons
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quality = parseInt(btn.dataset.quality);
                this.rateCard(quality);
            });
        });

        // Create card form
        document.getElementById('createCardForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createFlashcard();
        });

        document.getElementById('createFromSelection')?.addEventListener('click', () => {
            this.createFromSelection();
        });

        // Browse
        document.getElementById('searchCards')?.addEventListener('input', (e) => {
            this.searchCards(e.target.value);
        });

        document.getElementById('filterDeck')?.addEventListener('change', (e) => {
            this.filterByDeck(e.target.value);
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Tab`);
        });

        if (tabName === 'browse') {
            this.renderCardsList();
        } else if (tabName === 'stats') {
            this.renderStats();
        }
    }

    createFlashcard() {
        const front = document.getElementById('cardFrontInput').value.trim();
        const back = document.getElementById('cardBackInput').value.trim();
        const tags = document.getElementById('cardTags').value.split(',').map(t => t.trim()).filter(t => t);
        const deck = document.getElementById('cardDeck').value.trim() || 'General';

        if (!front || !back) return;

        const card = {
            id: Date.now(),
            front,
            back,
            tags,
            deck,
            created: new Date(),
            easinessFactor: 2.5,
            interval: 0,
            repetition: 0,
            nextReview: new Date(),
            reviews: []
        };

        this.flashcards.push(card);
        this.saveFlashcards();

        // Clear form
        document.getElementById('createCardForm').reset();

        this.showNotification('Flashcard created successfully!', 'success');
        this.updateFlashcardStats();
    }

    createFromSelection() {
        const selection = window.getSelection().toString().trim();
        if (!selection) {
            this.showNotification('Please select some text first', 'warning');
            return;
        }

        // Auto-fill the form with selection
        const sentences = selection.split(/[.!?]\s+/);
        if (sentences.length >= 2) {
            document.getElementById('cardFrontInput').value = sentences[0] + '?';
            document.getElementById('cardBackInput').value = sentences.slice(1).join('. ');
        } else {
            document.getElementById('cardFrontInput').value = 'What is: ' + selection.substring(0, 50) + '...?';
            document.getElementById('cardBackInput').value = selection;
        }

        this.switchTab('create');
        this.showNotification('Flashcard template created from selection', 'success');
    }

    startStudySession(type) {
        const now = new Date();
        let deck = [];

        if (type === 'due') {
            deck = this.flashcards.filter(card => new Date(card.nextReview) <= now);
        } else if (type === 'new') {
            deck = this.flashcards.filter(card => card.repetition === 0);
        } else {
            deck = [...this.flashcards];
        }

        if (deck.length === 0) {
            this.showNotification('No cards available for this session', 'info');
            return;
        }

        // Shuffle deck
        this.currentDeck = this.shuffleArray(deck);
        this.currentCardIndex = 0;
        this.studySession = {
            type,
            startTime: new Date(),
            cardsStudied: 0,
            ratings: []
        };

        document.querySelector('.study-options').classList.add('hidden');
        document.getElementById('studySession').classList.remove('hidden');

        this.showCurrentCard();
    }

    showCurrentCard() {
        if (this.currentCardIndex >= this.currentDeck.length) {
            this.endStudySession();
            return;
        }

        const card = this.currentDeck[this.currentCardIndex];
        document.querySelector('#cardFront .card-content').textContent = card.front;
        document.querySelector('#cardBack .card-content').textContent = card.back;

        document.getElementById('cardFront').classList.remove('hidden');
        document.getElementById('cardBack').classList.add('hidden');
        document.getElementById('flipCard').classList.remove('hidden');
        document.getElementById('qualityButtons').classList.add('hidden');

        // Update progress
        const progress = ((this.currentCardIndex) / this.currentDeck.length) * 100;
        document.getElementById('sessionProgress').textContent = `${this.currentCardIndex + 1}/${this.currentDeck.length}`;
        document.getElementById('sessionProgressBar').style.width = `${progress}%`;
    }

    flipCard() {
        document.getElementById('cardFront').classList.add('hidden');
        document.getElementById('cardBack').classList.remove('hidden');
        document.getElementById('flipCard').classList.add('hidden');
        document.getElementById('qualityButtons').classList.remove('hidden');
    }

    rateCard(quality) {
        const card = this.currentDeck[this.currentCardIndex];

        // Update card using SM-2 algorithm
        const update = this.calculateNextReview(card, quality);
        Object.assign(card, update);

        // Record review
        card.reviews.push({
            date: new Date(),
            quality,
            interval: update.interval
        });

        // Update in main array
        const index = this.flashcards.findIndex(c => c.id === card.id);
        if (index !== -1) {
            this.flashcards[index] = card;
        }

        this.saveFlashcards();

        // Track session
        this.studySession.cardsStudied++;
        this.studySession.ratings.push(quality);

        // Next card
        this.currentCardIndex++;
        this.showCurrentCard();
    }

    endStudySession() {
        if (this.studySession) {
            const duration = Math.round((new Date() - this.studySession.startTime) / 1000 / 60);
            const avgRating = this.studySession.ratings.length > 0
                ? (this.studySession.ratings.reduce((a, b) => a + b, 0) / this.studySession.ratings.length).toFixed(1)
                : 0;

            this.showNotification(
                `Session complete! ${this.studySession.cardsStudied} cards in ${duration}m. Avg rating: ${avgRating}`,
                'success'
            );
        }

        document.querySelector('.study-options').classList.remove('hidden');
        document.getElementById('studySession').classList.add('hidden');
        this.studySession = null;
        this.currentDeck = [];
        this.currentCardIndex = 0;
        this.updateFlashcardStats();
    }

    renderCardsList() {
        const container = document.getElementById('cardsList');
        if (!container) return;

        if (this.flashcards.length === 0) {
            container.innerHTML = '<p class="empty-state">No flashcards yet. Create your first card!</p>';
            return;
        }

        container.innerHTML = this.flashcards.map(card => `
            <div class="card-item" data-id="${card.id}">
                <div class="card-item-header">
                    <span class="card-deck">${card.deck}</span>
                    <button class="btn-delete" onclick="flashcardsManager.deleteCard(${card.id})">×</button>
                </div>
                <div class="card-item-content">
                    <div class="card-front-preview"><strong>Q:</strong> ${card.front}</div>
                    <div class="card-back-preview"><strong>A:</strong> ${card.back}</div>
                </div>
                <div class="card-item-meta">
                    <span>Reviews: ${card.reviews.length}</span>
                    <span>Next: ${this.formatDate(card.nextReview)}</span>
                    <span>EF: ${card.easinessFactor.toFixed(2)}</span>
                </div>
                ${card.tags.length > 0 ? `<div class="card-tags">${card.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            </div>
        `).join('');

        // Update deck filter
        const decks = [...new Set(this.flashcards.map(c => c.deck))];
        const deckFilter = document.getElementById('filterDeck');
        deckFilter.innerHTML = '<option value="">All Decks</option>' +
            decks.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    deleteCard(id) {
        if (!confirm('Delete this flashcard?')) return;
        this.flashcards = this.flashcards.filter(c => c.id !== id);
        this.saveFlashcards();
        this.renderCardsList();
        this.updateFlashcardStats();
    }

    searchCards(query) {
        const filtered = this.flashcards.filter(card =>
            card.front.toLowerCase().includes(query.toLowerCase()) ||
            card.back.toLowerCase().includes(query.toLowerCase()) ||
            card.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
        );
        // Render filtered cards (simplified)
        this.renderFilteredCards(filtered);
    }

    filterByDeck(deck) {
        const filtered = deck ? this.flashcards.filter(c => c.deck === deck) : this.flashcards;
        this.renderFilteredCards(filtered);
    }

    renderFilteredCards(cards) {
        const container = document.getElementById('cardsList');
        if (!container) return;

        if (cards.length === 0) {
            container.innerHTML = '<p class="empty-state">No cards match your filter.</p>';
            return;
        }

        // Use same rendering as renderCardsList but with filtered cards
        const tempFlashcards = this.flashcards;
        this.flashcards = cards;
        this.renderCardsList();
        this.flashcards = tempFlashcards;
    }

    renderStats() {
        const container = document.getElementById('flashcardStats');
        if (!container) return;

        const now = new Date();
        const dueCards = this.flashcards.filter(c => new Date(c.nextReview) <= now).length;
        const newCards = this.flashcards.filter(c => c.repetition === 0).length;
        const matureCards = this.flashcards.filter(c => c.interval >= 21).length;

        const totalReviews = this.flashcards.reduce((sum, c) => sum + c.reviews.length, 0);
        const avgEF = this.flashcards.length > 0
            ? (this.flashcards.reduce((sum, c) => sum + c.easinessFactor, 0) / this.flashcards.length).toFixed(2)
            : 0;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${this.flashcards.length}</div>
                    <div class="stat-label">Total Cards</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${dueCards}</div>
                    <div class="stat-label">Due Today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${newCards}</div>
                    <div class="stat-label">New Cards</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${matureCards}</div>
                    <div class="stat-label">Mature Cards</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalReviews}</div>
                    <div class="stat-label">Total Reviews</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgEF}</div>
                    <div class="stat-label">Avg Easiness</div>
                </div>
            </div>

            <h4>Review Heatmap (Last 30 Days)</h4>
            <div class="review-heatmap">
                ${this.renderReviewHeatmap()}
            </div>

            <h4>Deck Breakdown</h4>
            <div class="deck-breakdown">
                ${this.renderDeckBreakdown()}
            </div>
        `;
    }

    renderReviewHeatmap() {
        const days = 30;
        const heatmap = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const reviewCount = this.flashcards.reduce((count, card) => {
                return count + card.reviews.filter(r => {
                    const reviewDate = new Date(r.date).toISOString().split('T')[0];
                    return reviewDate === dateStr;
                }).length;
            }, 0);

            const intensity = reviewCount === 0 ? 0 : Math.min(4, Math.ceil(reviewCount / 5));
            heatmap.push(`<div class="heatmap-cell level-${intensity}" title="${dateStr}: ${reviewCount} reviews"></div>`);
        }

        return heatmap.join('');
    }

    renderDeckBreakdown() {
        const decks = {};
        this.flashcards.forEach(card => {
            if (!decks[card.deck]) {
                decks[card.deck] = { total: 0, new: 0, due: 0 };
            }
            decks[card.deck].total++;
            if (card.repetition === 0) decks[card.deck].new++;
            if (new Date(card.nextReview) <= new Date()) decks[card.deck].due++;
        });

        return Object.entries(decks).map(([name, stats]) => `
            <div class="deck-stats">
                <div class="deck-name">${name}</div>
                <div class="deck-counts">
                    <span>${stats.total} total</span>
                    <span>${stats.new} new</span>
                    <span class="due">${stats.due} due</span>
                </div>
            </div>
        `).join('');
    }

    updateFlashcardStats() {
        const now = new Date();
        const dueCount = this.flashcards.filter(c => new Date(c.nextReview) <= now).length;
        const newCount = this.flashcards.filter(c => c.repetition === 0).length;

        const dueEl = document.getElementById('dueCount');
        const newEl = document.getElementById('newCount');
        const allEl = document.getElementById('allCount');

        if (dueEl) dueEl.textContent = dueCount;
        if (newEl) newEl.textContent = newCount;
        if (allEl) allEl.textContent = this.flashcards.length;
    }

    // Utility functions
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `${diffDays} days`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
        return `${Math.floor(diffDays / 30)} months`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Storage
    loadFlashcards() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading flashcards:', error);
            return [];
        }
    }

    saveFlashcards() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.flashcards));
        } catch (error) {
            console.error('Error saving flashcards:', error);
        }
    }
}

// Initialize when DOM is ready
let flashcardsManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        flashcardsManager = new FlashcardsManager();
    });
} else {
    flashcardsManager = new FlashcardsManager();
}
