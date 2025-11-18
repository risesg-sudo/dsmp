/**
 * BookmarksManager - Bookmark system for quick access to documents and positions
 * Allows users to save and quickly jump to important locations
 */

class BookmarksManager {
    constructor() {
        this.storageKey = 'dsmp_bookmarks';
        this.bookmarks = {};
        this.init();
    }

    init() {
        this.loadBookmarks();
        this.setupUI();
        this.bindEvents();
        console.log('✅ Bookmarks Manager initialized');
    }

    loadBookmarks() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.bookmarks = data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            this.bookmarks = {};
        }
    }

    saveBookmarks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks));
            return true;
        } catch (error) {
            console.error('Error saving bookmarks:', error);
            return false;
        }
    }

    setupUI() {
        // Add bookmark button to content header
        const contentHeader = document.querySelector('.content-header');
        if (contentHeader && !document.getElementById('bookmarksToggle')) {
            const bookmarksButton = document.createElement('button');
            bookmarksButton.id = 'bookmarksToggle';
            bookmarksButton.className = 'bookmarks-toggle';
            bookmarksButton.innerHTML = '🔖 Bookmarks';
            bookmarksButton.title = 'View bookmarks';
            contentHeader.appendChild(bookmarksButton);

            // Add bookmark current position button
            const addBookmarkBtn = document.createElement('button');
            addBookmarkBtn.id = 'addBookmarkBtn';
            addBookmarkBtn.className = 'add-bookmark-btn';
            addBookmarkBtn.innerHTML = '+ Bookmark';
            addBookmarkBtn.title = 'Bookmark current position';
            contentHeader.appendChild(addBookmarkBtn);
        }

        // Create bookmarks panel
        if (!document.getElementById('bookmarksPanel')) {
            this.createBookmarksPanel();
        }

        // Update bookmark indicator
        this.updateBookmarkIndicator();
    }

    createBookmarksPanel() {
        const panel = document.createElement('div');
        panel.id = 'bookmarksPanel';
        panel.className = 'bookmarks-panel';
        panel.innerHTML = `
            <div class="bookmarks-panel-header">
                <h3>🔖 Bookmarks</h3>
                <button class="bookmarks-panel-close" id="bookmarksPanelClose">×</button>
            </div>
            <div class="bookmarks-panel-body">
                <div class="bookmarks-toolbar">
                    <select id="bookmarksFilterSelect" class="bookmarks-filter">
                        <option value="all">All Bookmarks</option>
                        <option value="current">Current Document</option>
                        <option value="recent">Recently Added</option>
                    </select>
                    <button class="btn-text" id="sortBookmarksBtn" title="Sort by date">🔃 Sort</button>
                </div>
                <div class="bookmarks-list" id="bookmarksList">
                    <!-- Bookmarks will be rendered here -->
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            // Toggle bookmarks panel
            if (e.target.id === 'bookmarksToggle' || e.target.closest('#bookmarksToggle')) {
                this.toggleBookmarksPanel();
            }

            // Close panel
            if (e.target.id === 'bookmarksPanelClose') {
                this.closeBookmarksPanel();
            }

            // Add bookmark
            if (e.target.id === 'addBookmarkBtn' || e.target.closest('#addBookmarkBtn')) {
                this.addBookmark();
            }

            // Delete bookmark
            if (e.target.classList.contains('delete-bookmark-btn')) {
                const bookmarkId = e.target.dataset.bookmarkId;
                this.deleteBookmark(bookmarkId);
            }

            // Jump to bookmark
            if (e.target.classList.contains('bookmark-item-content') || e.target.closest('.bookmark-item-content')) {
                const bookmarkItem = e.target.closest('.bookmark-item');
                if (bookmarkItem) {
                    const bookmarkId = bookmarkItem.dataset.bookmarkId;
                    this.jumpToBookmark(bookmarkId);
                }
            }

            // Sort bookmarks
            if (e.target.id === 'sortBookmarksBtn') {
                this.toggleSort();
            }
        });

        // Filter change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'bookmarksFilterSelect') {
                this.renderBookmarksList(e.target.value);
            }
        });

        // Listen to document changes to update indicator
        if (window.scrollTracker) {
            window.scrollTracker.addEventListener('trackingStarted', () => {
                this.updateBookmarkIndicator();
            });
        }
    }

    toggleBookmarksPanel() {
        const panel = document.getElementById('bookmarksPanel');
        if (panel) {
            panel.classList.toggle('active');
            if (panel.classList.contains('active')) {
                this.renderBookmarksList('all');
            }
        }
    }

    closeBookmarksPanel() {
        const panel = document.getElementById('bookmarksPanel');
        if (panel) {
            panel.classList.remove('active');
        }
    }

    addBookmark() {
        const currentDoc = window.dsmpApp?.getCurrentDocument();
        if (!currentDoc) {
            alert('No document is currently open');
            return;
        }

        const scrollPosition = this.getCurrentScrollPosition();
        const scrollPercentage = this.getCurrentScrollPercentage();

        // Check if bookmark already exists at this position
        const existing = Object.values(this.bookmarks).find(
            bm => bm.documentPath === currentDoc && Math.abs(bm.scrollPosition - scrollPosition) < 100
        );

        if (existing) {
            alert('A bookmark already exists near this position');
            return;
        }

        const bookmarkId = this.generateBookmarkId();
        const preview = this.getContentPreview();

        const bookmark = {
            id: bookmarkId,
            documentPath: currentDoc,
            documentName: this.getDocumentName(currentDoc),
            scrollPosition: scrollPosition,
            scrollPercentage: Math.round(scrollPercentage),
            preview: preview,
            createdAt: Date.now()
        };

        this.bookmarks[bookmarkId] = bookmark;
        this.saveBookmarks();
        this.updateBookmarkIndicator();

        // Show confirmation
        this.showNotification('✅ Bookmark added');

        console.log(`🔖 Bookmark added: ${bookmarkId}`);
    }

    deleteBookmark(bookmarkId) {
        if (confirm('Delete this bookmark?')) {
            delete this.bookmarks[bookmarkId];
            this.saveBookmarks();
            this.renderBookmarksList(document.getElementById('bookmarksFilterSelect')?.value || 'all');
            this.updateBookmarkIndicator();
            console.log(`🗑️ Bookmark deleted: ${bookmarkId}`);
        }
    }

    jumpToBookmark(bookmarkId) {
        const bookmark = this.bookmarks[bookmarkId];
        if (!bookmark) return;

        const currentDoc = window.dsmpApp?.getCurrentDocument();

        // If different document, load it first
        if (currentDoc !== bookmark.documentPath) {
            window.dsmpApp?.navigateToDocument(bookmark.documentPath);

            // Wait for document to load, then scroll
            setTimeout(() => {
                this.scrollToPosition(bookmark.scrollPosition);
            }, 500);
        } else {
            // Same document, just scroll
            this.scrollToPosition(bookmark.scrollPosition);
        }

        // Close bookmarks panel
        this.closeBookmarksPanel();

        console.log(`🔖 Jumped to bookmark: ${bookmarkId}`);
    }

    renderBookmarksList(filter = 'all') {
        const bookmarksList = document.getElementById('bookmarksList');
        if (!bookmarksList) return;

        let bookmarksToShow = Object.values(this.bookmarks);

        // Apply filter
        if (filter === 'current') {
            const currentDoc = window.dsmpApp?.getCurrentDocument();
            if (currentDoc) {
                bookmarksToShow = bookmarksToShow.filter(bm => bm.documentPath === currentDoc);
            }
        } else if (filter === 'recent') {
            bookmarksToShow.sort((a, b) => b.createdAt - a.createdAt);
            bookmarksToShow = bookmarksToShow.slice(0, 20);
        } else {
            // 'all' - show all, sorted by date
            bookmarksToShow.sort((a, b) => b.createdAt - a.createdAt);
        }

        if (bookmarksToShow.length === 0) {
            bookmarksList.innerHTML = `
                <div class="bookmarks-empty">
                    <p>No bookmarks yet</p>
                    <p class="bookmarks-empty-subtitle">Click "+ Bookmark" to save your position</p>
                </div>
            `;
            return;
        }

        bookmarksList.innerHTML = bookmarksToShow.map(bookmark => `
            <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
                <div class="bookmark-item-content">
                    <div class="bookmark-item-header">
                        <span class="bookmark-icon">🔖</span>
                        <div class="bookmark-info">
                            <div class="bookmark-doc-name">${this.escapeHtml(bookmark.documentName)}</div>
                            <div class="bookmark-position">${bookmark.scrollPercentage}% through document</div>
                        </div>
                        <button class="delete-bookmark-btn" data-bookmark-id="${bookmark.id}" title="Delete">×</button>
                    </div>
                    ${bookmark.preview ? `
                        <div class="bookmark-preview">${this.escapeHtml(bookmark.preview)}</div>
                    ` : ''}
                    <div class="bookmark-meta">
                        <span>${this.formatDate(bookmark.createdAt)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateBookmarkIndicator() {
        const addBookmarkBtn = document.getElementById('addBookmarkBtn');
        if (!addBookmarkBtn) return;

        const currentDoc = window.dsmpApp?.getCurrentDocument();
        if (!currentDoc) return;

        const count = Object.values(this.bookmarks).filter(
            bm => bm.documentPath === currentDoc
        ).length;

        if (count > 0) {
            addBookmarkBtn.innerHTML = `+ Bookmark (${count})`;
        } else {
            addBookmarkBtn.innerHTML = '+ Bookmark';
        }
    }

    toggleSort() {
        // Toggle between date and document name sort
        const bookmarksList = document.getElementById('bookmarksList');
        if (!bookmarksList) return;

        const isSortedByDate = bookmarksList.dataset.sortBy !== 'name';
        bookmarksList.dataset.sortBy = isSortedByDate ? 'name' : 'date';

        this.renderBookmarksList(document.getElementById('bookmarksFilterSelect')?.value || 'all');
    }

    // Utility functions
    generateBookmarkId() {
        return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCurrentScrollPosition() {
        const container = document.querySelector('.main-content');
        return container ? container.scrollTop : 0;
    }

    getCurrentScrollPercentage() {
        const container = document.querySelector('.main-content');
        if (!container) return 0;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const maxScroll = scrollHeight - clientHeight;

        return maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 100;
    }

    scrollToPosition(position) {
        const container = document.querySelector('.main-content');
        if (container) {
            container.scrollTo({
                top: position,
                behavior: 'smooth'
            });
        }
    }

    getContentPreview() {
        const content = document.querySelector('.markdown-content');
        if (!content) return '';

        // Find the heading or paragraph near current scroll position
        const container = document.querySelector('.main-content');
        const scrollTop = container ? container.scrollTop : 0;

        // Get all headings and paragraphs
        const elements = content.querySelectorAll('h1, h2, h3, p');

        for (const el of elements) {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top + scrollTop - container.offsetTop;

            if (elementTop >= scrollTop - 100) {
                let text = el.textContent.trim();
                return text.length > 100 ? text.substring(0, 100) + '...' : text;
            }
        }

        return '';
    }

    getDocumentName(path) {
        if (!path) return 'Unknown';
        const fileName = path.split('/').pop().replace('.md', '');
        return fileName
            .replace(/^\d+-/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'bookmark-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    // Public API
    getBookmarksByDocument(documentPath) {
        return Object.values(this.bookmarks).filter(bm => bm.documentPath === documentPath);
    }

    getAllBookmarks() {
        return Object.values(this.bookmarks);
    }

    getBookmarkCount() {
        return Object.keys(this.bookmarks).length;
    }

    exportBookmarks() {
        return JSON.stringify(this.bookmarks, null, 2);
    }

    importBookmarks(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.bookmarks = { ...this.bookmarks, ...imported };
            this.saveBookmarks();
            return true;
        } catch (error) {
            console.error('Error importing bookmarks:', error);
            return false;
        }
    }

    clearAllBookmarks() {
        if (confirm('Are you sure you want to delete ALL bookmarks? This cannot be undone!')) {
            this.bookmarks = {};
            this.saveBookmarks();
            this.renderBookmarksList();
            this.updateBookmarkIndicator();
            return true;
        }
        return false;
    }
}

// Initialize global bookmarks manager
window.bookmarksManager = new BookmarksManager();

console.log('✅ Bookmarks Manager loaded');
