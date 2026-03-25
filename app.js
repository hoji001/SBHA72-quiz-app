// app.js

const BATCH_SIZE = 30;
let batches = [];
let currentBatch = [];
let currentQuestionIndex = 0;
let score = 0;

// DOM elementlari
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const batchesContainer = document.getElementById('batches-container');
const feedContainer = document.getElementById('feed-container');
const questionProgress = document.getElementById('question-progress');
const scoreDisplay = document.getElementById('score-display');
const finalScore = document.getElementById('final-score');

function prepareBatches() {
    const tests = quizData.testlar;
    for (let i = 0; i < tests.length; i += BATCH_SIZE) {
        batches.push(tests.slice(i, i + BATCH_SIZE));
    }
    renderBatchButtons();
}

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

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz(batchIndex) {
    currentBatch = batches[batchIndex];
    currentQuestionIndex = 0;
    score = 0;

    // Ekranni tozalash
    feedContainer.innerHTML = '';
    resultScreen.classList.add('hidden');

    // Ekranlarni almashtirish
    homeScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    updateHeaderStats();

    // Birinchi savolni yaratish
    appendQuestionTicket(currentQuestionIndex);
}

function updateHeaderStats() {
    questionProgress.innerText = `${currentQuestionIndex}/${currentBatch.length}`;
    scoreDisplay.innerText = `To'g'ri: ${score}`;
}

// Yangi savol chiptasini (ticket) yaratish
function appendQuestionTicket(index) {
    if (index >= currentBatch.length) {
        // Test tugadi, natijani ko'rsatamiz
        showResult();
        return;
    }

    const currentQuestion = currentBatch[index];

    // Asosiy Ticket qutisi
    const ticketDiv = document.createElement('div');
    // Boshida ticket ko'rinmas va biroz pastroqda turadi (animatsiya uchun)
    ticketDiv.className = "bg-white rounded-2xl shadow-md p-6 opacity-0 transform translate-y-8 transition-all duration-500 ease-out";
    ticketDiv.id = `ticket-${index}`;

    // Savol matni
    const questionEl = document.createElement('h2');
    questionEl.className = "text-lg font-bold mb-4 text-gray-800 leading-snug";
    questionEl.innerText = `${index + 1}. ${currentQuestion.savol}`;
    ticketDiv.appendChild(questionEl);

    // Variantlarni tayyorlash va aralashtirish
    let options = [
        { text: currentQuestion.togri_javob, correct: true },
        { text: currentQuestion.javob_2, correct: false },
        { text: currentQuestion.javob_3, correct: false },
        { text: currentQuestion.javob_4, correct: false }
    ];
    options = shuffle(options);

    // Variantlar qutisi
    const optionsDiv = document.createElement('div');
    optionsDiv.className = "flex flex-col space-y-3";

    // Tugmalarni ushlab turish uchun array (keyin hammasini disable qilish uchun kerak)
    const buttonElements = [];

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = "btn-option w-full text-left bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl focus:outline-none";
        btn.innerText = option.text;

        btn.onclick = () => {
            // Javob belgilanganda ishlaydigan mantiq
            handleAnswerSelect(option.correct, btn, buttonElements, currentQuestion.togri_javob);
        };

        optionsDiv.appendChild(btn);
        buttonElements.push(btn);
    });

    ticketDiv.appendChild(optionsDiv);
    feedContainer.appendChild(ticketDiv);

    // Domga qo'shilgandan keyin animatsiyani ishga tushiramiz (paydo bo'lish)
    setTimeout(() => {
        ticketDiv.classList.remove('opacity-0', 'translate-y-8');
        // Ekranni yangi ticketga silliq tushiramiz
        ticketDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// Foydalanuvchi javob tanlaganda
function handleAnswerSelect(isCorrect, selectedBtn, allBtns, correctAnswerText) {
    // 1. Qaytadan bosmaslik uchun barcha tugmalarni muzlatamiz (disable)
    allBtns.forEach(btn => {
        btn.disabled = true;
        // Agar xato javob belgilangan bo'lsa, to'g'risini ham yashil qilib ko'rsatamiz
        if (btn.innerText === correctAnswerText) {
            btn.classList.add('correct');
        }
    });

    // 2. Tanlangan tugmani qizil yoki yashil qilamiz
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('wrong');
    }

    currentQuestionIndex++;
    updateHeaderStats();

    // 3. Qisqa pauzadan keyin (user xatosini ko'rib olishi uchun) pastdan yangi ticket chiqaramiz
    setTimeout(() => {
        appendQuestionTicket(currentQuestionIndex);
    }, 600); // 0.6 soniyadan keyin chiqadi, bu vaqtni o'zgartirishingiz mumkin
}

function showResult() {
    resultScreen.classList.remove('hidden');
    finalScore.innerText = `${score}/${currentBatch.length}`;
    // Ekranni natijaga silliq siljitamiz
    resultScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function goHome() {
    quizScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Ilovani ishga tushirish
prepareBatches();