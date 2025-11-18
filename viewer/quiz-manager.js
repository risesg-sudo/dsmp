/**
 * Quiz Manager - Automated Quiz Generation
 * Auto-generate quizzes from content for active recall practice
 *
 * Phase 3 Feature: Intelligent quiz generation and assessment
 */

class QuizManager {
    constructor() {
        this.storageKey = 'dsmp-quizzes';
        this.resultsKey = 'dsmp-quiz-results';
        this.quizzes = this.loadQuizzes();
        this.results = this.loadResults();
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.currentAnswers = [];
        this.init();
    }

    init() {
        this.createQuizUI();
        this.attachEventListeners();
    }

    createQuizUI() {
        // Add quiz button to header
        const contentHeader = document.querySelector('.content-header');
        if (contentHeader) {
            const quizBtn = document.createElement('button');
            quizBtn.className = 'quiz-toggle';
            quizBtn.innerHTML = '📝 Quiz';
            quizBtn.id = 'quizToggle';
            contentHeader.appendChild(quizBtn);
        }

        // Create quiz panel
        const panel = document.createElement('div');
        panel.className = 'quiz-panel';
        panel.id = 'quizPanel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>📝 Quiz Generator</h3>
                <button class="panel-close" id="closeQuizPanel">×</button>
            </div>

            <div class="panel-tabs">
                <button class="tab-btn active" data-tab="generate">Generate</button>
                <button class="tab-btn" data-tab="take">Take Quiz</button>
                <button class="tab-btn" data-tab="results">Results</button>
            </div>

            <div class="panel-content">
                <!-- Generate Tab -->
                <div class="tab-panel active" id="generateTab">
                    <div class="generate-options">
                        <h4>Generate Quiz from Current Document</h4>

                        <div class="form-group">
                            <label>Number of Questions</label>
                            <input type="number" id="numQuestions" min="5" max="20" value="10">
                        </div>

                        <div class="form-group">
                            <label>Question Types</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="includeMultipleChoice" checked> Multiple Choice</label>
                                <label><input type="checkbox" id="includeTrueFalse" checked> True/False</label>
                                <label><input type="checkbox" id="includeFillBlank"> Fill in the Blank</label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Difficulty</label>
                            <select id="quizDifficulty">
                                <option value="easy">Easy</option>
                                <option value="medium" selected>Medium</option>
                                <option value="hard">Hard</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>

                        <button class="btn btn-primary" id="generateQuiz">🎲 Generate Quiz</button>
                        <button class="btn btn-secondary" id="generateFromSelection">Generate from Selection</button>
                    </div>

                    <div class="saved-quizzes">
                        <h4>Saved Quizzes</h4>
                        <div id="savedQuizzesList"></div>
                    </div>
                </div>

                <!-- Take Quiz Tab -->
                <div class="tab-panel" id="takeTab">
                    <div class="quiz-start" id="quizStart">
                        <h4>Select a quiz to begin</h4>
                        <p>Generate a new quiz or select from saved quizzes.</p>
                    </div>

                    <div class="quiz-active hidden" id="quizActive">
                        <div class="quiz-progress">
                            <div class="progress-info">
                                <span id="quizProgress">Question 1/10</span>
                                <span id="quizTimer">0:00</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="quizProgressBar"></div>
                            </div>
                        </div>

                        <div class="question-container" id="questionContainer">
                            <!-- Questions will be dynamically loaded -->
                        </div>

                        <div class="quiz-navigation">
                            <button class="btn btn-secondary" id="prevQuestion" disabled>← Previous</button>
                            <button class="btn btn-primary" id="nextQuestion">Next →</button>
                            <button class="btn btn-success hidden" id="submitQuiz">Submit Quiz</button>
                        </div>

                        <button class="btn btn-secondary" id="exitQuiz">Exit Quiz</button>
                    </div>

                    <div class="quiz-results hidden" id="quizResults">
                        <!-- Results will be shown here -->
                    </div>
                </div>

                <!-- Results Tab -->
                <div class="tab-panel" id="resultsTab">
                    <div class="results-summary" id="resultsSummary"></div>
                    <div class="results-history" id="resultsHistory"></div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    attachEventListeners() {
        // Toggle panel
        const toggleBtn = document.getElementById('quizToggle');
        const closeBtn = document.getElementById('closeQuizPanel');
        const panel = document.getElementById('quizPanel');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                panel.classList.toggle('open');
                this.renderSavedQuizzes();
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

        // Generate quiz
        document.getElementById('generateQuiz')?.addEventListener('click', () => this.generateQuiz());
        document.getElementById('generateFromSelection')?.addEventListener('click', () => this.generateFromSelection());

        // Quiz navigation
        document.getElementById('prevQuestion')?.addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextQuestion')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('submitQuiz')?.addEventListener('click', () => this.submitQuiz());
        document.getElementById('exitQuiz')?.addEventListener('click', () => this.exitQuiz());
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Tab`);
        });

        if (tabName === 'generate') {
            this.renderSavedQuizzes();
        } else if (tabName === 'results') {
            this.renderResults();
        }
    }

    generateQuiz() {
        const numQuestions = parseInt(document.getElementById('numQuestions').value);
        const includeMultipleChoice = document.getElementById('includeMultipleChoice').checked;
        const includeTrueFalse = document.getElementById('includeTrueFalse').checked;
        const includeFillBlank = document.getElementById('includeFillBlank')?.checked || false;
        const difficulty = document.getElementById('quizDifficulty').value;

        // Get current document content
        const content = document.getElementById('markdownContent')?.innerText || '';
        if (!content || content.length < 100) {
            this.showNotification('Not enough content to generate a quiz', 'warning');
            return;
        }

        // Generate questions
        const questions = this.generateQuestionsFromContent(
            content,
            numQuestions,
            { includeMultipleChoice, includeTrueFalse, includeFillBlank },
            difficulty
        );

        // Get current document title
        const breadcrumb = document.getElementById('breadcrumb')?.textContent || 'Current Document';

        const quiz = {
            id: Date.now(),
            title: `Quiz: ${breadcrumb}`,
            document: breadcrumb,
            created: new Date(),
            questions,
            difficulty,
            timeLimit: null // optional
        };

        this.quizzes.push(quiz);
        this.saveQuizzes();

        this.showNotification(`Quiz generated with ${questions.length} questions!`, 'success');
        this.renderSavedQuizzes();

        // Automatically start the quiz
        this.startQuiz(quiz.id);
    }

    generateQuestionsFromContent(content, numQuestions, types, difficulty) {
        const questions = [];
        const sentences = content.split(/[.!?]\n/).filter(s => s.trim().length > 20);
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);

        // Extract key terms (simplified)
        const keyTerms = this.extractKeyTerms(content);

        let questionTypes = [];
        if (types.includeMultipleChoice) questionTypes.push('multiple-choice');
        if (types.includeTrueFalse) questionTypes.push('true-false');
        if (types.includeFillBlank) questionTypes.push('fill-blank');

        if (questionTypes.length === 0) questionTypes = ['multiple-choice'];

        for (let i = 0; i < numQuestions; i++) {
            const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

            if (type === 'multiple-choice') {
                questions.push(this.generateMultipleChoice(sentences, keyTerms, difficulty));
            } else if (type === 'true-false') {
                questions.push(this.generateTrueFalse(sentences, difficulty));
            } else if (type === 'fill-blank') {
                questions.push(this.generateFillBlank(sentences, keyTerms, difficulty));
            }
        }

        return questions;
    }

    extractKeyTerms(content) {
        // Extract capitalized words, technical terms, and important keywords
        const words = content.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || [];
        const technical = content.match(/\b(?:function|class|method|algorithm|model|data|parameter|variable)\b/gi) || [];

        return [...new Set([...words, ...technical])].filter(term => term.length > 3).slice(0, 50);
    }

    generateMultipleChoice(sentences, keyTerms, difficulty) {
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];
        const term = keyTerms[Math.floor(Math.random() * keyTerms.length)] || 'concept';

        // Create question
        const question = {
            type: 'multiple-choice',
            question: `What is true about ${term}?`,
            options: [
                sentence.substring(0, 100),
                this.generateDistractor(sentence, 1),
                this.generateDistractor(sentence, 2),
                this.generateDistractor(sentence, 3)
            ],
            correctAnswer: 0,
            difficulty
        };

        // Shuffle options
        const correctText = question.options[0];
        question.options = this.shuffleArray(question.options);
        question.correctAnswer = question.options.indexOf(correctText);

        return question;
    }

    generateTrueFalse(sentences, difficulty) {
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];
        const isTrue = Math.random() > 0.5;

        return {
            type: 'true-false',
            question: isTrue ? sentence : this.negateStatement(sentence),
            correctAnswer: isTrue,
            difficulty
        };
    }

    generateFillBlank(sentences, keyTerms, difficulty) {
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];
        const words = sentence.split(' ').filter(w => w.length > 4);

        if (words.length === 0) {
            return this.generateMultipleChoice(sentences, keyTerms, difficulty);
        }

        const blankWord = words[Math.floor(Math.random() * words.length)];
        const questionText = sentence.replace(blankWord, '______');

        return {
            type: 'fill-blank',
            question: questionText,
            correctAnswer: blankWord.toLowerCase().replace(/[^a-z]/g, ''),
            difficulty
        };
    }

    generateDistractor(correctAnswer, variant) {
        const distractors = [
            'This is not the correct answer',
            'This statement is incorrect',
            'This does not accurately describe the concept',
            'This is a common misconception'
        ];
        return distractors[variant % distractors.length];
    }

    negateStatement(statement) {
        // Simple negation (in real implementation, use NLP)
        if (statement.includes(' is ')) {
            return statement.replace(' is ', ' is not ');
        }
        if (statement.includes(' are ')) {
            return statement.replace(' are ', ' are not ');
        }
        return 'It is false that: ' + statement;
    }

    generateFromSelection() {
        const selection = window.getSelection().toString().trim();
        if (!selection || selection.length < 50) {
            this.showNotification('Please select at least a paragraph of text', 'warning');
            return;
        }

        const questions = this.generateQuestionsFromContent(
            selection,
            5,
            { includeMultipleChoice: true, includeTrueFalse: true, includeFillBlank: false },
            'medium'
        );

        const quiz = {
            id: Date.now(),
            title: 'Quiz from Selection',
            document: 'Selection',
            created: new Date(),
            questions,
            difficulty: 'medium'
        };

        this.quizzes.push(quiz);
        this.saveQuizzes();

        this.showNotification('Quiz generated from selection!', 'success');
        this.startQuiz(quiz.id);
    }

    startQuiz(quizId) {
        const quiz = this.quizzes.find(q => q.id === quizId);
        if (!quiz) return;

        this.currentQuiz = quiz;
        this.currentQuestionIndex = 0;
        this.currentAnswers = new Array(quiz.questions.length).fill(null);
        this.quizStartTime = new Date();

        document.getElementById('quizStart').classList.add('hidden');
        document.getElementById('quizActive').classList.remove('hidden');
        document.getElementById('quizResults').classList.add('hidden');

        this.switchTab('take');
        this.showQuestion();
        this.startTimer();
    }

    showQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const container = document.getElementById('questionContainer');

        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        document.getElementById('quizProgress').textContent =
            `Question ${this.currentQuestionIndex + 1}/${this.currentQuiz.questions.length}`;
        document.getElementById('quizProgressBar').style.width = `${progress}%`;

        // Render question
        let questionHTML = `
            <div class="question">
                <h4>Question ${this.currentQuestionIndex + 1}</h4>
                <p class="question-text">${question.question}</p>
        `;

        if (question.type === 'multiple-choice') {
            questionHTML += '<div class="options">';
            question.options.forEach((option, index) => {
                const isSelected = this.currentAnswers[this.currentQuestionIndex] === index;
                questionHTML += `
                    <label class="option ${isSelected ? 'selected' : ''}">
                        <input type="radio" name="answer" value="${index}" ${isSelected ? 'checked' : ''}>
                        <span>${option}</span>
                    </label>
                `;
            });
            questionHTML += '</div>';
        } else if (question.type === 'true-false') {
            const isTrue = this.currentAnswers[this.currentQuestionIndex] === true;
            const isFalse = this.currentAnswers[this.currentQuestionIndex] === false;
            questionHTML += `
                <div class="options">
                    <label class="option ${isTrue ? 'selected' : ''}">
                        <input type="radio" name="answer" value="true" ${isTrue ? 'checked' : ''}>
                        <span>True</span>
                    </label>
                    <label class="option ${isFalse ? 'selected' : ''}">
                        <input type="radio" name="answer" value="false" ${isFalse ? 'checked' : ''}>
                        <span>False</span>
                    </label>
                </div>
            `;
        } else if (question.type === 'fill-blank') {
            const answer = this.currentAnswers[this.currentQuestionIndex] || '';
            questionHTML += `
                <div class="fill-blank">
                    <input type="text" class="fill-blank-input" value="${answer}" placeholder="Type your answer...">
                </div>
            `;
        }

        questionHTML += '</div>';
        container.innerHTML = questionHTML;

        // Attach event listeners for answers
        container.querySelectorAll('input[name="answer"]').forEach(input => {
            input.addEventListener('change', (e) => {
                if (question.type === 'true-false') {
                    this.currentAnswers[this.currentQuestionIndex] = e.target.value === 'true';
                } else {
                    this.currentAnswers[this.currentQuestionIndex] = parseInt(e.target.value);
                }

                // Update UI
                container.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                e.target.closest('.option').classList.add('selected');
            });
        });

        container.querySelector('.fill-blank-input')?.addEventListener('input', (e) => {
            this.currentAnswers[this.currentQuestionIndex] = e.target.value.trim();
        });

        // Update navigation buttons
        document.getElementById('prevQuestion').disabled = this.currentQuestionIndex === 0;
        document.getElementById('nextQuestion').classList.toggle(
            'hidden',
            this.currentQuestionIndex === this.currentQuiz.questions.length - 1
        );
        document.getElementById('submitQuiz').classList.toggle(
            'hidden',
            this.currentQuestionIndex !== this.currentQuiz.questions.length - 1
        );
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    }

    submitQuiz() {
        if (!confirm('Submit quiz? You cannot change answers after submission.')) {
            return;
        }

        const duration = Math.round((new Date() - this.quizStartTime) / 1000);
        const score = this.calculateScore();

        const result = {
            id: Date.now(),
            quizId: this.currentQuiz.id,
            quizTitle: this.currentQuiz.title,
            date: new Date(),
            score: score.percentage,
            correct: score.correct,
            total: this.currentQuiz.questions.length,
            duration,
            answers: this.currentAnswers
        };

        this.results.push(result);
        this.saveResults();

        this.showResults(result, score);
    }

    calculateScore() {
        let correct = 0;
        const details = [];

        this.currentQuiz.questions.forEach((question, index) => {
            const userAnswer = this.currentAnswers[index];
            let isCorrect = false;

            if (question.type === 'multiple-choice') {
                isCorrect = userAnswer === question.correctAnswer;
            } else if (question.type === 'true-false') {
                isCorrect = userAnswer === question.correctAnswer;
            } else if (question.type === 'fill-blank') {
                const correctAnswer = question.correctAnswer.toLowerCase();
                const userAnswerClean = (userAnswer || '').toLowerCase().replace(/[^a-z]/g, '');
                isCorrect = userAnswerClean === correctAnswer;
            }

            if (isCorrect) correct++;

            details.push({
                question: question.question,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect
            });
        });

        return {
            correct,
            total: this.currentQuiz.questions.length,
            percentage: Math.round((correct / this.currentQuiz.questions.length) * 100),
            details
        };
    }

    showResults(result, scoreDetails) {
        const resultsContainer = document.getElementById('quizResults');

        let html = `
            <div class="results-header">
                <h3>Quiz Complete!</h3>
                <div class="score-display">
                    <div class="score-circle ${this.getScoreClass(result.score)}">
                        <span class="score-value">${result.score}%</span>
                        <span class="score-label">${result.correct}/${result.total} correct</span>
                    </div>
                </div>
                <div class="results-meta">
                    <span>⏱️ Time: ${this.formatDuration(result.duration)}</span>
                    <span>📊 ${this.getScoreMessage(result.score)}</span>
                </div>
            </div>

            <div class="results-breakdown">
                <h4>Question Breakdown</h4>
        `;

        scoreDetails.details.forEach((detail, index) => {
            html += `
                <div class="result-item ${detail.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="result-header">
                        <span>Question ${index + 1}</span>
                        <span class="result-icon">${detail.isCorrect ? '✓' : '✗'}</span>
                    </div>
                    <p class="result-question">${detail.question}</p>
                    ${!detail.isCorrect ? `
                        <div class="result-answers">
                            <p class="your-answer">Your answer: ${detail.userAnswer ?? 'No answer'}</p>
                            <p class="correct-answer">Correct answer: ${detail.correctAnswer}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `
            </div>
            <div class="results-actions">
                <button class="btn btn-primary" onclick="quizManager.retakeQuiz()">Retake Quiz</button>
                <button class="btn btn-secondary" onclick="quizManager.exitQuiz()">Exit</button>
            </div>
        `;

        resultsContainer.innerHTML = html;
        resultsContainer.classList.remove('hidden');
        document.getElementById('quizActive').classList.add('hidden');
    }

    retakeQuiz() {
        if (this.currentQuiz) {
            this.startQuiz(this.currentQuiz.id);
        }
    }

    exitQuiz() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.currentAnswers = [];

        document.getElementById('quizStart').classList.remove('hidden');
        document.getElementById('quizActive').classList.add('hidden');
        document.getElementById('quizResults').classList.add('hidden');

        this.stopTimer();
    }

    startTimer() {
        this.quizTimer = setInterval(() => {
            const elapsed = Math.floor((new Date() - this.quizStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('quizTimer').textContent =
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }
    }

    renderSavedQuizzes() {
        const container = document.getElementById('savedQuizzesList');
        if (!container) return;

        if (this.quizzes.length === 0) {
            container.innerHTML = '<p class="empty-state">No saved quizzes yet. Generate your first quiz!</p>';
            return;
        }

        container.innerHTML = this.quizzes.map(quiz => {
            const attempts = this.results.filter(r => r.quizId === quiz.id).length;
            const bestScore = attempts > 0
                ? Math.max(...this.results.filter(r => r.quizId === quiz.id).map(r => r.score))
                : null;

            return `
                <div class="quiz-item">
                    <div class="quiz-item-header">
                        <h4>${quiz.title}</h4>
                        <button class="btn-delete" onclick="quizManager.deleteQuiz(${quiz.id})">×</button>
                    </div>
                    <div class="quiz-item-meta">
                        <span>${quiz.questions.length} questions</span>
                        <span>${quiz.difficulty}</span>
                        <span>${new Date(quiz.created).toLocaleDateString()}</span>
                    </div>
                    ${bestScore !== null ? `<div class="quiz-best-score">Best: ${bestScore}%</div>` : ''}
                    <button class="btn btn-primary" onclick="quizManager.startQuiz(${quiz.id})">Start Quiz</button>
                </div>
            `;
        }).join('');
    }

    deleteQuiz(id) {
        if (!confirm('Delete this quiz?')) return;

        this.quizzes = this.quizzes.filter(q => q.id !== id);
        this.saveQuizzes();
        this.renderSavedQuizzes();
    }

    renderResults() {
        const summaryContainer = document.getElementById('resultsSummary');
        const historyContainer = document.getElementById('resultsHistory');

        if (this.results.length === 0) {
            summaryContainer.innerHTML = '';
            historyContainer.innerHTML = '<p class="empty-state">No quiz results yet.</p>';
            return;
        }

        // Summary stats
        const avgScore = Math.round(this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length);
        const totalQuizzes = this.results.length;
        const perfectScores = this.results.filter(r => r.score === 100).length;

        summaryContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${totalQuizzes}</div>
                    <div class="stat-label">Quizzes Taken</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgScore}%</div>
                    <div class="stat-label">Average Score</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${perfectScores}</div>
                    <div class="stat-label">Perfect Scores</div>
                </div>
            </div>
        `;

        // Results history
        historyContainer.innerHTML = this.results.slice().reverse().map(result => `
            <div class="result-history-item">
                <div class="result-history-header">
                    <h4>${result.quizTitle}</h4>
                    <span class="result-score ${this.getScoreClass(result.score)}">${result.score}%</span>
                </div>
                <div class="result-history-meta">
                    <span>${new Date(result.date).toLocaleDateString()}</span>
                    <span>${result.correct}/${result.total} correct</span>
                    <span>${this.formatDuration(result.duration)}</span>
                </div>
            </div>
        `).join('');
    }

    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }

    getScoreMessage(score) {
        if (score >= 90) return 'Excellent work!';
        if (score >= 70) return 'Good job!';
        if (score >= 50) return 'Keep practicing!';
        return 'Review the material and try again.';
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
    loadQuizzes() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading quizzes:', error);
            return [];
        }
    }

    saveQuizzes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.quizzes));
        } catch (error) {
            console.error('Error saving quizzes:', error);
        }
    }

    loadResults() {
        try {
            const data = localStorage.getItem(this.resultsKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading results:', error);
            return [];
        }
    }

    saveResults() {
        try {
            localStorage.setItem(this.resultsKey, JSON.stringify(this.results));
        } catch (error) {
            console.error('Error saving results:', error);
        }
    }
}

// Initialize when DOM is ready
let quizManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        quizManager = new QuizManager();
    });
} else {
    quizManager = new QuizManager();
}
