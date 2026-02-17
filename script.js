// Tab Management
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const scoreContainer = document.getElementById('scoreContainer');

// Tab Event Listeners
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab contents
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Show/hide score container based on tab
    if (tabName === 'calculator') {
        scoreContainer.style.display = 'none';
    } else {
        scoreContainer.style.display = 'flex';
    }
}

// Calculator State
let calculatorCurrentValue = '0';
let calculatorPreviousValue = '';
let calculatorOperation = null;
let calculatorHistory = [];

// Calculator DOM Elements
const operationDisplay = document.getElementById('operationDisplay');
const resultDisplay = document.getElementById('resultDisplay');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

// Calculator Event Listeners
document.querySelectorAll('.number-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const number = btn.getAttribute('data-number');
        appendNumber(number);
    });
});

document.querySelectorAll('.operator-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const operator = btn.getAttribute('data-operator');
        setOperation(operator);
    });
});

document.querySelector('[data-action="clear"]').addEventListener('click', clearCalculator);
document.querySelector('[data-action="delete"]').addEventListener('click', deleteNumber);
document.querySelector('[data-action="percentage"]').addEventListener('click', calculatePercentage);
document.querySelector('[data-action="equals"]').addEventListener('click', calculate);
clearHistoryBtn.addEventListener('click', clearHistory);

// Calculator Functions
function appendNumber(number) {
    if (number === '.' && calculatorCurrentValue.includes('.')) return;

    if (calculatorCurrentValue === '0' && number !== '.') {
        calculatorCurrentValue = number;
    } else {
        calculatorCurrentValue += number;
    }

    updateCalculatorDisplay();
}

function setOperation(operator) {
    if (calculatorCurrentValue === '') return;

    if (calculatorPreviousValue !== '') {
        calculate();
    }

    calculatorOperation = operator;
    calculatorPreviousValue = calculatorCurrentValue;
    calculatorCurrentValue = '';

    updateCalculatorDisplay();
}

function calculate() {
    let result;
    const prev = parseFloat(calculatorPreviousValue);
    const current = parseFloat(calculatorCurrentValue);

    if (isNaN(prev) || isNaN(current)) return;

    switch (calculatorOperation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                alert('No se puede dividir entre cero');
                clearCalculator();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    // Round to avoid floating point errors
    result = Math.round(result * 100000000) / 100000000;

    // Add to history
    const operationSymbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
    };

    addToHistory(
        `${prev} ${operationSymbols[calculatorOperation]} ${current}`,
        result
    );

    calculatorCurrentValue = result.toString();
    calculatorOperation = null;
    calculatorPreviousValue = '';

    updateCalculatorDisplay();
}

function clearCalculator() {
    calculatorCurrentValue = '0';
    calculatorPreviousValue = '';
    calculatorOperation = null;
    updateCalculatorDisplay();
}

function deleteNumber() {
    if (calculatorCurrentValue.length === 1) {
        calculatorCurrentValue = '0';
    } else {
        calculatorCurrentValue = calculatorCurrentValue.slice(0, -1);
    }
    updateCalculatorDisplay();
}

function calculatePercentage() {
    const current = parseFloat(calculatorCurrentValue);
    if (isNaN(current)) return;

    calculatorCurrentValue = (current / 100).toString();
    updateCalculatorDisplay();
}

function updateCalculatorDisplay() {
    resultDisplay.textContent = calculatorCurrentValue;

    if (calculatorOperation && calculatorPreviousValue) {
        const operationSymbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        operationDisplay.textContent = `${calculatorPreviousValue} ${operationSymbols[calculatorOperation]}`;
    } else {
        operationDisplay.textContent = '';
    }
}

function addToHistory(operation, result) {
    calculatorHistory.unshift({ operation, result });

    // Keep only last 10 operations
    if (calculatorHistory.length > 10) {
        calculatorHistory.pop();
    }

    renderHistory();
}

function renderHistory() {
    if (calculatorHistory.length === 0) {
        historyList.innerHTML = '<p class="history-empty">No hay operaciones aún</p>';
        return;
    }

    historyList.innerHTML = calculatorHistory.map(item => `
        <div class="history-item">
            <span class="history-operation">${item.operation}</span>
            <span class="history-result">= ${item.result}</span>
        </div>
    `).join('');
}

function clearHistory() {
    calculatorHistory = [];
    renderHistory();
}

// Game State
let currentMode = '';
let currentQuestion = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let totalQuestions = 10;
let currentCorrectAnswer = 0;

// DOM Elements
const modeSelection = document.getElementById('modeSelection');
const quizSection = document.getElementById('quizSection');
const resultsSection = document.getElementById('resultsSection');
const modeCards = document.querySelectorAll('.mode-card');
const backButton = document.getElementById('backButton');
const currentModeDisplay = document.getElementById('currentMode');
const questionNumber = document.getElementById('questionNumber');
const questionDisplay = document.getElementById('question');
const progressFill = document.getElementById('progressFill');
const optionsGrid = document.getElementById('optionsGrid');
const nextButton = document.getElementById('nextButton');
const correctScore = document.getElementById('correctScore');
const incorrectScore = document.getElementById('incorrectScore');
const restartButton = document.getElementById('restartButton');

// Mode names in Spanish
const modeNames = {
    'suma': 'Suma',
    'resta': 'Resta',
    'multiplicacion': 'Multiplicación',
    'division': 'División'
};

// Mode symbols
const modeSymbols = {
    'suma': '+',
    'resta': '−',
    'multiplicacion': '×',
    'division': '÷'
};

// Event Listeners
modeCards.forEach(card => {
    card.addEventListener('click', () => {
        const mode = card.getAttribute('data-mode');
        startQuiz(mode);
    });
});

backButton.addEventListener('click', () => {
    resetGame();
    showSection('mode');
});

nextButton.addEventListener('click', () => {
    currentQuestion++;
    if (currentQuestion < totalQuestions) {
        generateQuestion();
        nextButton.classList.add('hidden');
    } else {
        showResults();
    }
});

restartButton.addEventListener('click', () => {
    resetGame();
    showSection('mode');
});

// Functions
function startQuiz(mode) {
    currentMode = mode;
    currentQuestion = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;

    currentModeDisplay.textContent = modeNames[mode];
    updateScores();
    showSection('quiz');
    generateQuestion();
}

function generateQuestion() {
    let num1, num2, answer, questionText;

    questionNumber.textContent = currentQuestion + 1;

    switch (currentMode) {
        case 'suma':
            num1 = getRandomNumber(1, 50);
            num2 = getRandomNumber(1, 50);
            answer = num1 + num2;
            questionText = `${num1} ${modeSymbols[currentMode]} ${num2} = ?`;
            break;

        case 'resta':
            num1 = getRandomNumber(10, 50);
            num2 = getRandomNumber(1, num1);
            answer = num1 - num2;
            questionText = `${num1} ${modeSymbols[currentMode]} ${num2} = ?`;
            break;

        case 'multiplicacion':
            num1 = getRandomNumber(1, 12);
            num2 = getRandomNumber(1, 12);
            answer = num1 * num2;
            questionText = `${num1} ${modeSymbols[currentMode]} ${num2} = ?`;
            break;

        case 'division':
            num2 = getRandomNumber(1, 12);
            answer = getRandomNumber(1, 12);
            num1 = num2 * answer;
            questionText = `${num1} ${modeSymbols[currentMode]} ${num2} = ?`;
            break;
    }

    currentCorrectAnswer = answer;
    questionDisplay.textContent = questionText;

    generateOptions(answer);
    updateProgress();
}

function generateOptions(correctAnswer) {
    const options = [correctAnswer];

    // Generate 3 wrong answers
    while (options.length < 4) {
        let wrongAnswer;

        if (currentMode === 'division') {
            // For division, keep answers as whole numbers
            wrongAnswer = getRandomNumber(Math.max(1, correctAnswer - 5), correctAnswer + 5);
        } else {
            const offset = getRandomNumber(1, 10);
            wrongAnswer = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;

            // Ensure positive answers for subtraction
            if (currentMode === 'resta' && wrongAnswer < 0) {
                wrongAnswer = Math.abs(wrongAnswer);
            }
        }

        if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
            options.push(wrongAnswer);
        }
    }

    // Shuffle options
    shuffleArray(options);

    // Create option buttons
    optionsGrid.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(option, button));
        optionsGrid.appendChild(button);
    });
}

function checkAnswer(selectedAnswer, button) {
    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(btn => btn.classList.add('disabled'));

    if (selectedAnswer === currentCorrectAnswer) {
        button.classList.add('correct');
        correctAnswers++;
    } else {
        button.classList.add('incorrect');
        incorrectAnswers++;

        // Highlight the correct answer
        allButtons.forEach(btn => {
            if (parseInt(btn.textContent) === currentCorrectAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    updateScores();
    nextButton.classList.remove('hidden');
}

function updateScores() {
    correctScore.textContent = correctAnswers;
    incorrectScore.textContent = incorrectAnswers;
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    progressFill.style.width = `${progress}%`;
}

function showResults() {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    document.getElementById('finalCorrect').textContent = correctAnswers;
    document.getElementById('finalIncorrect').textContent = incorrectAnswers;
    document.getElementById('finalPercentage').textContent = `${percentage}%`;

    showSection('results');
}

function resetGame() {
    currentMode = '';
    currentQuestion = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    updateScores();
    progressFill.style.width = '0%';
}

function showSection(section) {
    modeSelection.classList.add('hidden');
    quizSection.classList.add('hidden');
    resultsSection.classList.add('hidden');

    switch (section) {
        case 'mode':
            modeSelection.classList.remove('hidden');
            break;
        case 'quiz':
            quizSection.classList.remove('hidden');
            break;
        case 'results':
            resultsSection.classList.remove('hidden');
            break;
    }
}

// Utility Functions
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize
showSection('mode');
switchTab('practice');
