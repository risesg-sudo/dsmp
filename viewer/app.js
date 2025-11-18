/**
 * Main Application - DSMP 2.0 Revision Notes Viewer
 * Handles navigation, markdown rendering, and coordinates all modules
 */

class DSMPApp {
    constructor() {
        this.currentDocument = null;
        this.documentStructure = null;
        this.basePathMappings = {
            'dsmp-revision': '../dsmp-revision'
        };
        this.init();
    }

    async init() {
        console.log('🚀 Initializing DSMP App...');

        // Load document structure
        await this.loadDocumentStructure();

        // Render navigation
        this.renderNavigation();

        // Bind UI events
        this.bindEvents();

        // Setup markdown renderer
        this.setupMarkdownRenderer();

        // Load last viewed document if exists
        this.loadLastDocument();

        // Initial analytics update
        if (window.analytics) {
            window.analytics.updateSummary();
            window.analytics.refreshNavProgress();
        }

        console.log('✅ DSMP App initialized');
    }

    async loadDocumentStructure() {
        // Define the structure of documents
        // In production, this could be loaded from a JSON file
        this.documentStructure = {
            'Python Fundamentals': [
                { name: 'Python Basics', path: '../dsmp-revision/01-python-fundamentals/01-python-basics.md' },
                { name: 'Data Structures', path: '../dsmp-revision/01-python-fundamentals/02-data-structures.md' },
                { name: 'Functions & Modules', path: '../dsmp-revision/01-python-fundamentals/03-functions-modules.md' },
                { name: 'OOP Concepts', path: '../dsmp-revision/01-python-fundamentals/04-oop-concepts.md' },
                { name: 'File Handling', path: '../dsmp-revision/01-python-fundamentals/05-file-handling.md' },
                { name: 'Error Handling', path: '../dsmp-revision/01-python-fundamentals/06-error-handling.md' },
                { name: 'Decorators & Generators', path: '../dsmp-revision/01-python-fundamentals/07-decorators-generators.md' },
                { name: 'Advanced Topics', path: '../dsmp-revision/01-python-fundamentals/08-advanced-topics.md' }
            ],
            'NumPy & Pandas': [
                { name: 'NumPy Basics', path: '../dsmp-revision/02-numpy-pandas/01-numpy-basics.md' },
                { name: 'NumPy Advanced', path: '../dsmp-revision/02-numpy-pandas/02-numpy-advanced.md' },
                { name: 'Pandas Basics', path: '../dsmp-revision/02-numpy-pandas/03-pandas-basics.md' },
                { name: 'Pandas Advanced', path: '../dsmp-revision/02-numpy-pandas/04-pandas-advanced.md' },
                { name: 'Data Manipulation', path: '../dsmp-revision/02-numpy-pandas/05-data-manipulation.md' },
                { name: 'Time Series', path: '../dsmp-revision/02-numpy-pandas/06-time-series.md' }
            ],
            'Data Visualization': [
                { name: 'Matplotlib Basics', path: '../dsmp-revision/03-data-visualization/01-matplotlib-basics.md' },
                { name: 'Matplotlib Advanced', path: '../dsmp-revision/03-data-visualization/02-matplotlib-advanced.md' },
                { name: 'Seaborn', path: '../dsmp-revision/03-data-visualization/03-seaborn.md' },
                { name: 'Plotly', path: '../dsmp-revision/03-data-visualization/04-plotly.md' },
                { name: 'Visualization Best Practices', path: '../dsmp-revision/03-data-visualization/05-visualization-best-practices.md' }
            ],
            'SQL': [
                { name: 'SQL Basics', path: '../dsmp-revision/04-sql/01-sql-basics.md' },
                { name: 'SQL Joins', path: '../dsmp-revision/04-sql/02-sql-joins.md' },
                { name: 'Aggregate Functions', path: '../dsmp-revision/04-sql/03-aggregate-functions.md' },
                { name: 'Window Functions', path: '../dsmp-revision/04-sql/04-window-functions.md' },
                { name: 'Subqueries & CTEs', path: '../dsmp-revision/04-sql/05-subqueries-ctes.md' },
                { name: 'SQL Optimization', path: '../dsmp-revision/04-sql/06-sql-optimization.md' }
            ],
            'Statistics & Probability': [
                { name: 'Descriptive Statistics', path: '../dsmp-revision/05-statistics-probability/01-descriptive-statistics.md' },
                { name: 'Probability', path: '../dsmp-revision/05-statistics-probability/02-probability.md' },
                { name: 'Distributions', path: '../dsmp-revision/05-statistics-probability/03-distributions.md' },
                { name: 'Hypothesis Testing', path: '../dsmp-revision/05-statistics-probability/04-hypothesis-testing.md' },
                { name: 'Central Limit Theorem', path: '../dsmp-revision/05-statistics-probability/05-central-limit-theorem.md' },
                { name: 'Correlation & Regression', path: '../dsmp-revision/05-statistics-probability/06-correlation-regression.md' }
            ],
            'Machine Learning Basics': [
                { name: 'ML Introduction', path: '../dsmp-revision/07-ml-basics/01-ml-introduction.md' },
                { name: 'Linear Regression', path: '../dsmp-revision/07-ml-basics/02-linear-regression.md' },
                { name: 'Gradient Descent', path: '../dsmp-revision/07-ml-basics/03-gradient-descent.md' },
                { name: 'Regularization', path: '../dsmp-revision/07-ml-basics/04-regularization.md' },
                { name: 'Model Evaluation', path: '../dsmp-revision/07-ml-basics/05-model-evaluation.md' }
            ]
        };
    }

    renderNavigation() {
        const navTree = document.getElementById('navTree');
        if (!navTree) return;

        let html = '';

        Object.entries(this.documentStructure).forEach(([category, documents]) => {
            html += `
                <div class="nav-category" data-category="${category}">
                    <div class="nav-category-title">
                        ${category}
                        <span class="toggle"></span>
                    </div>
                    <div class="nav-items">
                        ${documents.map(doc => `
                            <div class="nav-item" data-path="${doc.path}">
                                <span>${doc.name}</span>
                                <span class="progress-badge">0%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        navTree.innerHTML = html;

        // Bind navigation events
        this.bindNavigationEvents();

        // Load progress badges
        if (window.analytics) {
            window.analytics.refreshNavProgress();
        }
    }

    bindNavigationEvents() {
        // Category toggle
        document.querySelectorAll('.nav-category-title').forEach(title => {
            title.addEventListener('click', (e) => {
                const category = e.currentTarget.closest('.nav-category');
                category.classList.toggle('collapsed');
            });
        });

        // Document navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const path = e.currentTarget.dataset.path;
                this.loadDocument(path);
            });
        });
    }

    bindEvents() {
        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Close sidebar when clicking on nav item (mobile)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar?.classList.remove('active');
                }
            });
        });
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        const navItems = document.querySelectorAll('.nav-item');
        const categories = document.querySelectorAll('.nav-category');

        if (!searchTerm) {
            // Show all
            navItems.forEach(item => item.style.display = 'flex');
            categories.forEach(cat => {
                cat.style.display = 'block';
                cat.classList.remove('collapsed');
            });
            return;
        }

        // Filter items
        categories.forEach(category => {
            let hasVisibleItems = false;
            const items = category.querySelectorAll('.nav-item');

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'flex';
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });

            if (hasVisibleItems) {
                category.style.display = 'block';
                category.classList.remove('collapsed');
            } else {
                category.style.display = 'none';
            }
        });
    }

    async loadDocument(path) {
        console.log(`📖 Loading document: ${path}`);

        // Stop current tracking
        if (window.scrollTracker && this.currentDocument) {
            window.scrollTracker.stopTracking();
        }

        // Update UI
        this.setActiveNavItem(path);
        this.updateBreadcrumb(path);

        try {
            // Fetch markdown file
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load: ${response.statusText}`);
            }

            const markdown = await response.text();

            // Render markdown
            this.renderMarkdown(markdown);

            // Update current document
            this.currentDocument = path;

            // Start tracking
            if (window.scrollTracker) {
                window.scrollTracker.startTracking(path);
            }

            // Save as last viewed
            localStorage.setItem('lastViewedDocument', path);

            console.log(`✅ Document loaded: ${path}`);

        } catch (error) {
            console.error('Error loading document:', error);
            this.showError(`Failed to load document: ${error.message}`);
        }
    }

    setupMarkdownRenderer() {
        // Configure marked.js
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.error('Highlight error:', err);
                        }
                    }
                    return code;
                },
                breaks: true,
                gfm: true
            });
        }
    }

    renderMarkdown(markdown) {
        const contentElement = document.getElementById('markdownContent');
        if (!contentElement) return;

        try {
            // Parse and render markdown
            const html = marked.parse(markdown);
            contentElement.innerHTML = html;

            // Scroll to top
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }

            // Re-highlight code blocks
            if (typeof hljs !== 'undefined') {
                contentElement.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }

        } catch (error) {
            console.error('Error rendering markdown:', error);
            this.showError(`Failed to render document: ${error.message}`);
        }
    }

    setActiveNavItem(path) {
        // Remove active class from all items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current item
        const activeItem = document.querySelector(`.nav-item[data-path="${path}"]`);
        if (activeItem) {
            activeItem.classList.add('active');

            // Ensure parent category is expanded
            const category = activeItem.closest('.nav-category');
            if (category) {
                category.classList.remove('collapsed');
            }
        }
    }

    updateBreadcrumb(path) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        // Extract category and document name from path
        const parts = path.split('/');
        const fileName = parts[parts.length - 1].replace('.md', '');
        const categoryFolder = parts[parts.length - 2];

        // Format category name
        const categoryName = categoryFolder
            .replace(/^\d+-/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Format document name
        const docName = fileName
            .replace(/^\d+-/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        breadcrumb.innerHTML = `${categoryName} / ${docName}`;
    }

    loadLastDocument() {
        const lastViewed = localStorage.getItem('lastViewedDocument');
        if (lastViewed) {
            // Check if document still exists in structure
            const exists = Object.values(this.documentStructure)
                .flat()
                .some(doc => doc.path === lastViewed);

            if (exists) {
                this.loadDocument(lastViewed);
                return;
            }
        }

        // Load first document by default
        const firstCategory = Object.values(this.documentStructure)[0];
        if (firstCategory && firstCategory[0]) {
            this.loadDocument(firstCategory[0].path);
        }
    }

    showError(message) {
        const contentElement = document.getElementById('markdownContent');
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="welcome-screen">
                    <h1>⚠️ Error</h1>
                    <p>${message}</p>
                    <p>Please try selecting another document from the sidebar.</p>
                </div>
            `;
        }
    }

    // Public API
    getCurrentDocument() {
        return this.currentDocument;
    }

    getDocumentStructure() {
        return this.documentStructure;
    }

    navigateToDocument(path) {
        this.loadDocument(path);
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }

            // Ctrl/Cmd + S: Show stats
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                window.analytics?.showAnalyticsDashboard();
            }

            // Escape: Close modal
            if (e.key === 'Escape') {
                const modal = document.getElementById('statsModal');
                if (modal?.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            }
        });
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dsmpApp = new DSMPApp();
    });
} else {
    window.dsmpApp = new DSMPApp();
}

console.log('✅ App script loaded');
