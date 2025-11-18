/**
 * NotesManager - Personal notes system for documents
 * Allows users to add, edit, and manage notes on specific documents or sections
 */

class NotesManager {
    constructor() {
        this.storageKey = 'dsmp_notes';
        this.notes = {};
        this.activeNoteId = null;
        this.init();
    }

    init() {
        this.loadNotes();
        this.setupUI();
        this.bindEvents();
        console.log('✅ Notes Manager initialized');
    }

    loadNotes() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.notes = data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading notes:', error);
            this.notes = {};
        }
    }

    saveNotes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
            return true;
        } catch (error) {
            console.error('Error saving notes:', error);
            return false;
        }
    }

    setupUI() {
        // Add notes button to content header
        const contentHeader = document.querySelector('.content-header');
        if (contentHeader && !document.getElementById('notesToggle')) {
            const notesButton = document.createElement('button');
            notesButton.id = 'notesToggle';
            notesButton.className = 'notes-toggle';
            notesButton.innerHTML = '📝 Notes';
            notesButton.title = 'View and add notes';
            contentHeader.appendChild(notesButton);
        }

        // Create notes panel if it doesn't exist
        if (!document.getElementById('notesPanel')) {
            this.createNotesPanel();
        }
    }

    createNotesPanel() {
        const panel = document.createElement('div');
        panel.id = 'notesPanel';
        panel.className = 'notes-panel';
        panel.innerHTML = `
            <div class="notes-panel-header">
                <h3>📝 My Notes</h3>
                <button class="notes-panel-close" id="notesPanelClose">×</button>
            </div>
            <div class="notes-panel-body">
                <div class="notes-toolbar">
                    <button class="btn-primary" id="addNoteBtn">+ Add Note</button>
                    <select id="notesFilterSelect" class="notes-filter">
                        <option value="current">Current Document</option>
                        <option value="all">All Documents</option>
                        <option value="recent">Recent Notes</option>
                    </select>
                </div>
                <div class="notes-list" id="notesList">
                    <!-- Notes will be rendered here -->
                </div>
            </div>

            <!-- Note Editor Modal -->
            <div class="note-editor-modal" id="noteEditorModal">
                <div class="note-editor-content">
                    <div class="note-editor-header">
                        <h3 id="noteEditorTitle">Add Note</h3>
                        <button class="modal-close" id="noteEditorClose">×</button>
                    </div>
                    <div class="note-editor-body">
                        <input type="text"
                               id="noteTitle"
                               class="note-input"
                               placeholder="Note title (optional)">
                        <textarea id="noteContent"
                                  class="note-textarea"
                                  placeholder="Write your note here..."></textarea>
                        <div class="note-tags">
                            <input type="text"
                                   id="noteTags"
                                   class="note-input"
                                   placeholder="Tags (comma-separated)">
                        </div>
                        <div class="note-color-picker">
                            <label>Color:</label>
                            <div class="color-options">
                                <button class="color-btn" data-color="#3b82f6" style="background: #3b82f6"></button>
                                <button class="color-btn" data-color="#10b981" style="background: #10b981"></button>
                                <button class="color-btn" data-color="#f59e0b" style="background: #f59e0b"></button>
                                <button class="color-btn" data-color="#ef4444" style="background: #ef4444"></button>
                                <button class="color-btn" data-color="#8b5cf6" style="background: #8b5cf6"></button>
                                <button class="color-btn active" data-color="#6366f1" style="background: #6366f1"></button>
                            </div>
                        </div>
                    </div>
                    <div class="note-editor-footer">
                        <button class="btn-secondary" id="cancelNoteBtn">Cancel</button>
                        <button class="btn-primary" id="saveNoteBtn">Save Note</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    bindEvents() {
        // Notes toggle button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'notesToggle' || e.target.closest('#notesToggle')) {
                this.toggleNotesPanel();
            }

            // Close panel
            if (e.target.id === 'notesPanelClose') {
                this.closeNotesPanel();
            }

            // Add note button
            if (e.target.id === 'addNoteBtn') {
                this.showNoteEditor();
            }

            // Save note button
            if (e.target.id === 'saveNoteBtn') {
                this.saveNote();
            }

            // Cancel button
            if (e.target.id === 'cancelNoteBtn' || e.target.id === 'noteEditorClose') {
                this.closeNoteEditor();
            }

            // Delete note
            if (e.target.classList.contains('delete-note-btn')) {
                const noteId = e.target.dataset.noteId;
                this.deleteNote(noteId);
            }

            // Edit note
            if (e.target.classList.contains('edit-note-btn')) {
                const noteId = e.target.dataset.noteId;
                this.editNote(noteId);
            }

            // Color picker
            if (e.target.classList.contains('color-btn')) {
                document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });

        // Notes filter
        document.addEventListener('change', (e) => {
            if (e.target.id === 'notesFilterSelect') {
                this.renderNotesList(e.target.value);
            }
        });

        // Close editor on background click
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('noteEditorModal');
            if (e.target === modal) {
                this.closeNoteEditor();
            }
        });
    }

    toggleNotesPanel() {
        const panel = document.getElementById('notesPanel');
        if (panel) {
            panel.classList.toggle('active');
            if (panel.classList.contains('active')) {
                this.renderNotesList('current');
            }
        }
    }

    closeNotesPanel() {
        const panel = document.getElementById('notesPanel');
        if (panel) {
            panel.classList.remove('active');
        }
    }

    showNoteEditor(noteId = null) {
        const modal = document.getElementById('noteEditorModal');
        const title = document.getElementById('noteEditorTitle');
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        const noteTags = document.getElementById('noteTags');

        if (noteId) {
            // Edit mode
            const note = this.notes[noteId];
            if (note) {
                title.textContent = 'Edit Note';
                noteTitle.value = note.title || '';
                noteContent.value = note.content || '';
                noteTags.value = note.tags ? note.tags.join(', ') : '';
                this.activeNoteId = noteId;

                // Set color
                const colorBtn = document.querySelector(`.color-btn[data-color="${note.color}"]`);
                if (colorBtn) {
                    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
                    colorBtn.classList.add('active');
                }
            }
        } else {
            // Add mode
            title.textContent = 'Add Note';
            noteTitle.value = '';
            noteContent.value = '';
            noteTags.value = '';
            this.activeNoteId = null;
        }

        modal.classList.add('active');
        noteContent.focus();
    }

    closeNoteEditor() {
        const modal = document.getElementById('noteEditorModal');
        modal.classList.remove('active');
        this.activeNoteId = null;
    }

    saveNote() {
        const noteTitle = document.getElementById('noteTitle').value.trim();
        const noteContent = document.getElementById('noteContent').value.trim();
        const noteTags = document.getElementById('noteTags').value;
        const selectedColor = document.querySelector('.color-btn.active')?.dataset.color || '#6366f1';

        if (!noteContent) {
            alert('Please enter note content');
            return;
        }

        const currentDoc = window.dsmpApp?.getCurrentDocument();
        if (!currentDoc) {
            alert('No document is currently open');
            return;
        }

        const noteId = this.activeNoteId || this.generateNoteId();
        const tags = noteTags.split(',').map(tag => tag.trim()).filter(tag => tag);

        const note = {
            id: noteId,
            title: noteTitle || 'Untitled Note',
            content: noteContent,
            tags: tags,
            color: selectedColor,
            documentPath: currentDoc,
            documentName: this.getDocumentName(currentDoc),
            scrollPosition: this.getCurrentScrollPosition(),
            createdAt: this.notes[noteId]?.createdAt || Date.now(),
            updatedAt: Date.now()
        };

        this.notes[noteId] = note;
        this.saveNotes();
        this.closeNoteEditor();
        this.renderNotesList(document.getElementById('notesFilterSelect')?.value || 'current');

        console.log(`✅ Note ${this.activeNoteId ? 'updated' : 'created'}: ${noteId}`);
    }

    editNote(noteId) {
        this.showNoteEditor(noteId);
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            delete this.notes[noteId];
            this.saveNotes();
            this.renderNotesList(document.getElementById('notesFilterSelect')?.value || 'current');
            console.log(`🗑️ Note deleted: ${noteId}`);
        }
    }

    renderNotesList(filter = 'current') {
        const notesList = document.getElementById('notesList');
        if (!notesList) return;

        let notesToShow = Object.values(this.notes);

        // Apply filter
        if (filter === 'current') {
            const currentDoc = window.dsmpApp?.getCurrentDocument();
            if (currentDoc) {
                notesToShow = notesToShow.filter(note => note.documentPath === currentDoc);
            }
        } else if (filter === 'recent') {
            notesToShow.sort((a, b) => b.updatedAt - a.updatedAt);
            notesToShow = notesToShow.slice(0, 20);
        } else {
            // 'all' - show all notes, sorted by update time
            notesToShow.sort((a, b) => b.updatedAt - a.updatedAt);
        }

        if (notesToShow.length === 0) {
            notesList.innerHTML = `
                <div class="notes-empty">
                    <p>No notes yet</p>
                    <p class="notes-empty-subtitle">Click "Add Note" to create your first note</p>
                </div>
            `;
            return;
        }

        notesList.innerHTML = notesToShow.map(note => `
            <div class="note-item" style="border-left: 4px solid ${note.color}">
                <div class="note-item-header">
                    <h4 class="note-item-title">${this.escapeHtml(note.title)}</h4>
                    <div class="note-item-actions">
                        <button class="note-action-btn edit-note-btn" data-note-id="${note.id}" title="Edit">✏️</button>
                        <button class="note-action-btn delete-note-btn" data-note-id="${note.id}" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="note-item-content">${this.escapeHtml(note.content)}</div>
                ${note.tags.length > 0 ? `
                    <div class="note-item-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="note-item-meta">
                    <span class="note-meta-doc">📄 ${this.escapeHtml(note.documentName)}</span>
                    <span class="note-meta-date">${this.formatDate(note.updatedAt)}</span>
                </div>
            </div>
        `).join('');
    }

    // Utility functions
    generateNoteId() {
        return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCurrentScrollPosition() {
        const container = document.querySelector('.main-content');
        return container ? container.scrollTop : 0;
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

    // Public API
    getNotesByDocument(documentPath) {
        return Object.values(this.notes).filter(note => note.documentPath === documentPath);
    }

    getAllNotes() {
        return Object.values(this.notes);
    }

    getNoteCount() {
        return Object.keys(this.notes).length;
    }

    exportNotes() {
        return JSON.stringify(this.notes, null, 2);
    }

    importNotes(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.notes = { ...this.notes, ...imported };
            this.saveNotes();
            return true;
        } catch (error) {
            console.error('Error importing notes:', error);
            return false;
        }
    }

    clearAllNotes() {
        if (confirm('Are you sure you want to delete ALL notes? This cannot be undone!')) {
            this.notes = {};
            this.saveNotes();
            this.renderNotesList();
            return true;
        }
        return false;
    }
}

// Initialize global notes manager
window.notesManager = new NotesManager();

console.log('✅ Notes Manager loaded');
