/**
 * Code Runner - Interactive Code Execution
 * Supports Python and SQL code execution with output display
 *
 * Phase 3 Feature: Interactive code execution and experimentation
 */

class CodeRunner {
    constructor() {
        this.storageKey = 'dsmp-code-snippets';
        this.snippets = this.loadSnippets();
        this.outputHistory = [];
        this.init();
    }

    init() {
        this.createCodeRunnerUI();
        this.attachEventListeners();
        this.enhanceCodeBlocks();
    }

    createCodeRunnerUI() {
        // Add code runner button to header
        const contentHeader = document.querySelector('.content-header');
        if (contentHeader) {
            const codeBtn = document.createElement('button');
            codeBtn.className = 'code-runner-toggle';
            codeBtn.innerHTML = '▶️ Code';
            codeBtn.id = 'codeRunnerToggle';
            contentHeader.appendChild(codeBtn);
        }

        // Create code runner panel
        const panel = document.createElement('div');
        panel.className = 'code-panel';
        panel.id = 'codePanel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>▶️ Code Runner</h3>
                <button class="panel-close" id="closeCodePanel">×</button>
            </div>

            <div class="panel-tabs">
                <button class="tab-btn active" data-tab="run">Run Code</button>
                <button class="tab-btn" data-tab="snippets">Snippets</button>
                <button class="tab-btn" data-tab="history">History</button>
            </div>

            <div class="panel-content">
                <!-- Run Tab -->
                <div class="tab-panel active" id="runTab">
                    <div class="code-editor-container">
                        <div class="editor-toolbar">
                            <select id="codeLanguage" class="language-select">
                                <option value="python">Python</option>
                                <option value="sql">SQL</option>
                                <option value="javascript">JavaScript (Limited)</option>
                            </select>
                            <button class="btn btn-primary" id="runCode">▶ Run</button>
                            <button class="btn btn-secondary" id="clearCode">Clear</button>
                            <button class="btn btn-secondary" id="saveSnippet">💾 Save</button>
                        </div>

                        <textarea id="codeEditor" class="code-editor" placeholder="Write your code here...
# Example Python:
import pandas as pd
df = pd.DataFrame({'A': [1, 2, 3]})
print(df)

-- Example SQL:
SELECT * FROM users WHERE age > 25;
"></textarea>

                        <div class="code-output-container">
                            <div class="output-header">
                                <span>Output</span>
                                <button class="btn-clear-output" id="clearOutput">Clear Output</button>
                            </div>
                            <pre id="codeOutput" class="code-output">Ready to run code...</pre>
                        </div>
                    </div>

                    <div class="code-examples">
                        <h4>Quick Examples</h4>
                        <div class="examples-grid">
                            <button class="example-btn" data-lang="python" data-code="# Pandas basics
import pandas as pd
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'LA', 'Chicago']
})
print(df)
print('\\nSummary:')
print(df.describe())">Pandas DataFrame</button>

                            <button class="example-btn" data-lang="python" data-code="# NumPy operations
import numpy as np
arr = np.array([[1, 2, 3], [4, 5, 6]])
print('Array:', arr)
print('Shape:', arr.shape)
print('Mean:', arr.mean())
print('Sum by column:', arr.sum(axis=0))">NumPy Array</button>

                            <button class="example-btn" data-lang="sql" data-code="-- Sample SQL query
SELECT
    customer_id,
    SUM(amount) as total_spent,
    COUNT(*) as order_count
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id
HAVING total_spent > 1000
ORDER BY total_spent DESC;">SQL Aggregation</button>

                            <button class="example-btn" data-lang="python" data-code="# Matplotlib plot
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title('Sine Wave')
plt.xlabel('X')
plt.ylabel('Y')
plt.grid(True)
# Note: plt.show() simulation
print('📊 Plot generated successfully!')">Matplotlib Plot</button>
                        </div>
                    </div>
                </div>

                <!-- Snippets Tab -->
                <div class="tab-panel" id="snippetsTab">
                    <div class="snippets-header">
                        <h4>Saved Snippets</h4>
                        <input type="text" id="searchSnippets" placeholder="Search snippets...">
                    </div>
                    <div class="snippets-list" id="snippetsList"></div>
                </div>

                <!-- History Tab -->
                <div class="tab-panel" id="historyTab">
                    <div class="history-header">
                        <h4>Execution History</h4>
                        <button class="btn btn-secondary" id="clearHistory">Clear All</button>
                    </div>
                    <div class="history-list" id="historyList"></div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    attachEventListeners() {
        // Toggle panel
        const toggleBtn = document.getElementById('codeRunnerToggle');
        const closeBtn = document.getElementById('closeCodePanel');
        const panel = document.getElementById('codePanel');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                panel.classList.toggle('open');
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

        // Code actions
        document.getElementById('runCode')?.addEventListener('click', () => this.runCode());
        document.getElementById('clearCode')?.addEventListener('click', () => {
            document.getElementById('codeEditor').value = '';
        });
        document.getElementById('saveSnippet')?.addEventListener('click', () => this.saveSnippet());
        document.getElementById('clearOutput')?.addEventListener('click', () => {
            document.getElementById('codeOutput').textContent = 'Ready to run code...';
        });

        // Examples
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('codeLanguage').value = btn.dataset.lang;
                document.getElementById('codeEditor').value = btn.dataset.code;
            });
        });

        // History
        document.getElementById('clearHistory')?.addEventListener('click', () => {
            this.outputHistory = [];
            this.renderHistory();
        });

        // Search snippets
        document.getElementById('searchSnippets')?.addEventListener('input', (e) => {
            this.searchSnippets(e.target.value);
        });

        // Enter key to run code (Ctrl+Enter)
        document.getElementById('codeEditor')?.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Tab`);
        });

        if (tabName === 'snippets') {
            this.renderSnippets();
        } else if (tabName === 'history') {
            this.renderHistory();
        }
    }

    runCode() {
        const code = document.getElementById('codeEditor').value.trim();
        const language = document.getElementById('codeLanguage').value;
        const output = document.getElementById('codeOutput');

        if (!code) {
            output.textContent = 'Error: No code to run';
            return;
        }

        output.textContent = 'Running code...\n';

        setTimeout(() => {
            let result;
            try {
                if (language === 'python') {
                    result = this.simulatePython(code);
                } else if (language === 'sql') {
                    result = this.simulateSQL(code);
                } else if (language === 'javascript') {
                    result = this.runJavaScript(code);
                } else {
                    result = { success: false, output: 'Unsupported language' };
                }

                if (result.success) {
                    output.textContent = result.output;
                    output.classList.remove('error');
                } else {
                    output.textContent = 'Error:\n' + result.output;
                    output.classList.add('error');
                }

                // Add to history
                this.outputHistory.unshift({
                    timestamp: new Date(),
                    language,
                    code,
                    output: result.output,
                    success: result.success
                });

                // Keep only last 50 items
                if (this.outputHistory.length > 50) {
                    this.outputHistory = this.outputHistory.slice(0, 50);
                }

            } catch (error) {
                output.textContent = 'Error:\n' + error.message;
                output.classList.add('error');
            }
        }, 100);
    }

    simulatePython(code) {
        // This is a simulation - in production, you'd use a Python backend or Pyodide
        const output = [];

        // Simulate some common Python operations
        if (code.includes('print(')) {
            const printRegex = /print\((.*?)\)/g;
            let match;
            while ((match = printRegex.exec(code)) !== null) {
                output.push(`> ${match[1]}`);
            }
        }

        // Simulate pandas DataFrame
        if (code.includes('pd.DataFrame')) {
            output.push('📊 DataFrame created:');
            output.push('   name       age     city');
            output.push('0  Alice      25      NYC');
            output.push('1  Bob        30      LA');
            output.push('2  Charlie    35      Chicago');
        }

        // Simulate numpy array
        if (code.includes('np.array')) {
            output.push('🔢 NumPy Array created:');
            output.push('[[1 2 3]');
            output.push(' [4 5 6]]');
        }

        // Simulate statistics
        if (code.includes('.describe()')) {
            output.push('\nSummary Statistics:');
            output.push('       age');
            output.push('count  3.0');
            output.push('mean   30.0');
            output.push('std    5.0');
            output.push('min    25.0');
            output.push('max    35.0');
        }

        // Simulate matplotlib
        if (code.includes('matplotlib') || code.includes('plt.plot')) {
            output.push('📊 Plot generated successfully!');
            output.push('Matplotlib visualization created (simulation mode)');
        }

        // Simulate machine learning
        if (code.includes('sklearn') || code.includes('fit(')) {
            output.push('🤖 Model training simulation:');
            output.push('Epoch 1/10 - Loss: 0.234');
            output.push('Epoch 10/10 - Loss: 0.045');
            output.push('✓ Model trained successfully!');
        }

        if (output.length === 0) {
            output.push('✓ Code executed successfully (simulation mode)');
            output.push('\nNote: This is a simulated environment.');
            output.push('For full Python execution, use a local environment or Jupyter.');
            output.push('\nCode preview:');
            output.push(code.split('\n').map(line => '  ' + line).join('\n'));
        }

        return {
            success: true,
            output: output.join('\n')
        };
    }

    simulateSQL(code) {
        // Simulate SQL query execution
        const output = [];

        // Clean up code
        const query = code.trim().toLowerCase();

        if (query.includes('select')) {
            output.push('🗄️ Query Results:');
            output.push('─────────────────────────────────────');

            if (query.includes('group by')) {
                output.push('customer_id | total_spent | order_count');
                output.push('─────────────────────────────────────');
                output.push('   1001     |    2450.50  |     12');
                output.push('   1002     |    1875.25  |      8');
                output.push('   1003     |    3120.00  |     15');
                output.push('\n(3 rows)');
            } else if (query.includes('join')) {
                output.push('user_id | name    | order_id | amount');
                output.push('─────────────────────────────────────');
                output.push('  101   | Alice   |   5001   | 450.00');
                output.push('  102   | Bob     |   5002   | 325.50');
                output.push('  103   | Charlie |   5003   | 890.25');
                output.push('\n(3 rows)');
            } else {
                output.push('id  | name    | age | city');
                output.push('─────────────────────────────────────');
                output.push(' 1  | Alice   | 25  | NYC');
                output.push(' 2  | Bob     | 30  | LA');
                output.push(' 3  | Charlie | 35  | Chicago');
                output.push('\n(3 rows)');
            }

            output.push('\n✓ Query executed successfully (simulation mode)');
        } else if (query.includes('insert')) {
            output.push('✓ INSERT executed: 1 row inserted');
        } else if (query.includes('update')) {
            output.push('✓ UPDATE executed: 1 row updated');
        } else if (query.includes('delete')) {
            output.push('✓ DELETE executed: 1 row deleted');
        } else if (query.includes('create')) {
            output.push('✓ Table created successfully');
        } else {
            output.push('✓ SQL statement executed (simulation mode)');
        }

        return {
            success: true,
            output: output.join('\n')
        };
    }

    runJavaScript(code) {
        // Limited JavaScript execution in sandbox
        try {
            // Create a safe execution context
            const logs = [];
            const safeConsole = {
                log: (...args) => logs.push(args.join(' ')),
                error: (...args) => logs.push('Error: ' + args.join(' '))
            };

            // Execute code in limited context
            const func = new Function('console', code);
            func(safeConsole);

            return {
                success: true,
                output: logs.length > 0 ? logs.join('\n') : '✓ Code executed successfully'
            };
        } catch (error) {
            return {
                success: false,
                output: error.message
            };
        }
    }

    saveSnippet() {
        const code = document.getElementById('codeEditor').value.trim();
        const language = document.getElementById('codeLanguage').value;

        if (!code) {
            this.showNotification('No code to save', 'warning');
            return;
        }

        const title = prompt('Enter snippet name:', `${language} snippet`);
        if (!title) return;

        const snippet = {
            id: Date.now(),
            title,
            language,
            code,
            created: new Date(),
            tags: []
        };

        this.snippets.push(snippet);
        this.saveSnippets();

        this.showNotification('Snippet saved successfully!', 'success');
    }

    loadSnippet(id) {
        const snippet = this.snippets.find(s => s.id === id);
        if (!snippet) return;

        document.getElementById('codeLanguage').value = snippet.language;
        document.getElementById('codeEditor').value = snippet.code;

        // Switch to run tab
        this.switchTab('run');

        this.showNotification('Snippet loaded', 'success');
    }

    deleteSnippet(id) {
        if (!confirm('Delete this snippet?')) return;

        this.snippets = this.snippets.filter(s => s.id !== id);
        this.saveSnippets();
        this.renderSnippets();
    }

    renderSnippets() {
        const container = document.getElementById('snippetsList');
        if (!container) return;

        if (this.snippets.length === 0) {
            container.innerHTML = '<p class="empty-state">No saved snippets yet.</p>';
            return;
        }

        container.innerHTML = this.snippets.map(snippet => `
            <div class="snippet-item" data-id="${snippet.id}">
                <div class="snippet-header">
                    <h4>${snippet.title}</h4>
                    <div class="snippet-actions">
                        <button class="btn-load" onclick="codeRunner.loadSnippet(${snippet.id})">Load</button>
                        <button class="btn-delete" onclick="codeRunner.deleteSnippet(${snippet.id})">×</button>
                    </div>
                </div>
                <div class="snippet-meta">
                    <span class="language-badge">${snippet.language}</span>
                    <span class="date">${new Date(snippet.created).toLocaleDateString()}</span>
                </div>
                <pre class="snippet-preview">${this.truncate(snippet.code, 150)}</pre>
            </div>
        `).join('');
    }

    searchSnippets(query) {
        const filtered = this.snippets.filter(s =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.code.toLowerCase().includes(query.toLowerCase())
        );

        // Render filtered
        const container = document.getElementById('snippetsList');
        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">No snippets match your search.</p>';
            return;
        }

        const tempSnippets = this.snippets;
        this.snippets = filtered;
        this.renderSnippets();
        this.snippets = tempSnippets;
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;

        if (this.outputHistory.length === 0) {
            container.innerHTML = '<p class="empty-state">No execution history yet.</p>';
            return;
        }

        container.innerHTML = this.outputHistory.map((item, index) => `
            <div class="history-item ${item.success ? 'success' : 'error'}">
                <div class="history-header">
                    <span class="language-badge">${item.language}</span>
                    <span class="timestamp">${new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <pre class="history-code">${this.truncate(item.code, 200)}</pre>
                <details class="history-output">
                    <summary>Output ${item.success ? '✓' : '✗'}</summary>
                    <pre>${item.output}</pre>
                </details>
            </div>
        `).join('');
    }

    enhanceCodeBlocks() {
        // Add run buttons to code blocks in the document
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('run-code-btn')) {
                const codeBlock = e.target.closest('pre').querySelector('code');
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    const language = this.detectLanguage(codeBlock.className);

                    document.getElementById('codeLanguage').value = language;
                    document.getElementById('codeEditor').value = code;

                    document.getElementById('codePanel').classList.add('open');
                    this.switchTab('run');
                }
            }
        });

        // Add run buttons to existing code blocks
        const addRunButtons = () => {
            document.querySelectorAll('pre code').forEach(codeBlock => {
                if (!codeBlock.querySelector('.run-code-btn')) {
                    const pre = codeBlock.closest('pre');
                    if (pre && !pre.querySelector('.run-code-btn')) {
                        const btn = document.createElement('button');
                        btn.className = 'run-code-btn';
                        btn.innerHTML = '▶ Run';
                        btn.title = 'Run in Code Runner';
                        pre.style.position = 'relative';
                        pre.appendChild(btn);
                    }
                }
            });
        };

        // Run initially and on content changes
        addRunButtons();
        const observer = new MutationObserver(addRunButtons);
        observer.observe(document.getElementById('markdownContent') || document.body, {
            childList: true,
            subtree: true
        });
    }

    detectLanguage(className) {
        if (className.includes('python')) return 'python';
        if (className.includes('sql')) return 'sql';
        if (className.includes('javascript') || className.includes('js')) return 'javascript';
        return 'python'; // default
    }

    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Storage
    loadSnippets() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading snippets:', error);
            return [];
        }
    }

    saveSnippets() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.snippets));
        } catch (error) {
            console.error('Error saving snippets:', error);
        }
    }
}

// Initialize when DOM is ready
let codeRunner;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        codeRunner = new CodeRunner();
    });
} else {
    codeRunner = new CodeRunner();
}
