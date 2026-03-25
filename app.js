// app.js

const BATCH_SIZE = 30;
let batches = [];
let currentBatch = [];
let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;

// DOM elementlari
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const batchesContainer = document.getElementById('batches-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionProgress = document.getElementById('question-progress');
const scoreDisplay = document.getElementById('score-display');
const finalScore = document.getElementById('final-score');

// 1. Ma'lumotlarni qismlarga bo'lish (Chunking)
function prepareBatches() {
    const tests = quizData.testlar;
    for (let i = 0; i < tests.length; i += BATCH_SIZE) {
        batches.push(tests.slice(i, i + BATCH_SIZE));
    }
    renderBatchButtons();
}

// 2. Bosh sahifada bo'lim tugmalarini chiqarish
function renderBatchButtons() {
    batchesContainer.innerHTML = '';
    batches.forEach((batch, index) => {
        const start = index * BATCH_SIZE + 1;
        const end = start + batch.length - 1;

        const btn = document.createElement('button');
        btn.className = "bg-white border-2 border-blue-100 hover:border-blue-500 text-blue-700 font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm";
        btn.innerText = `${start} - ${end}`;
        btn.onclick = () => startQuiz(index);
        batchesContainer.appendChild(btn);
    });
}

// 3. Array ni aralashtirish funksiyasi (Fisher-Yates)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 4. Testni boshlash
function startQuiz(batchIndex) {
    currentBatch = batches[batchIndex];
    currentQuestionIndex = 0;
    score = 0;

    homeScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    loadQuestion();
}

// 5. Savolni ekranga chiqarish
function loadQuestion() {
    isAnswered = false;
    const currentQuestion = currentBatch[currentQuestionIndex];

    // Progressni yangilash
    questionProgress.innerText = `${currentQuestionIndex + 1}/${currentBatch.length}`;
    scoreDisplay.innerText = `To'g'ri: ${score}`;
    questionText.innerText = currentQuestion.savol;

    // Javoblarni massivga yig'ib aralashtiramiz
    let options = [
        { text: currentQuestion.togri_javob, correct: true },
        { text: currentQuestion.javob_2, correct: false },
        { text: currentQuestion.javob_3, correct: false },
        { text: currentQuestion.javob_4, correct: false }
    ];
    options = shuffle(options);

    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = "btn-option w-full text-left bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl focus:outline-none";
        btn.innerText = option.text;
        btn.onclick = (e) => checkAnswer(option.correct, e.target, optionsContainer.children);
        optionsContainer.appendChild(btn);
    });
}

// 6. Javobni tekshirish (Telegram style animatsiya bilan)
function checkAnswer(isCorrect, selectedBtn, allBtns) {
    if (isAnswered) return; // Ikki marta bosmaslik uchun
    isAnswered = true;

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('wrong');
        // Noto'g'ri topsa, to'g'ri javobni ham ko'rsatib qo'yamiz
        Array.from(allBtns).forEach(btn => {
            const currentQ = currentBatch[currentQuestionIndex];
            if (btn.innerText === currentQ.togri_javob) {
                btn.classList.add('correct');
            }
        });
    }

    scoreDisplay.innerText = `To'g'ri: ${score}`;

    // 1.5 soniyadan so'ng keyingi savolga o'tish
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentBatch.length) {
            loadQuestion();
        } else {
            showResult();
        }
    }, 1500);
}

// 7. Natijani ko'rsatish
function showResult() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    finalScore.innerText = `${score}/${currentBatch.length}`;
}

// 8. Bosh sahifaga qaytish
function goHome() {
    resultScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
}

// Ilovani ishga tushirish
prepareBatches();