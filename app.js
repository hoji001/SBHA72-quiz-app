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

// YANGI: Qidiruv elementlari
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');

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
    // YANGI: Agar "Barcha savollar" tanlangan bo'lsa
    if (batchIndex === 'all') {
        currentBatch = quizData.testlar;
        searchContainer.classList.remove('hidden'); // Qidiruvni yoqish
    } else {
        currentBatch = batches[batchIndex];
        searchContainer.classList.add('hidden'); // Qidiruvni o'chirish
    }

    searchInput.value = ''; // Qidiruvni tozalash
    searchClearBtn.classList.add('hidden');

    currentQuestionIndex = 0;
    score = 0;

    feedContainer.innerHTML = '';
    resultScreen.classList.add('hidden');
    homeScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    updateHeaderStats();
    appendQuestionTicket(currentQuestionIndex);
}

function updateHeaderStats() {
    questionProgress.innerText = `${currentQuestionIndex}/${currentBatch.length}`;
    scoreDisplay.innerText = `To'g'ri: ${score}`;
}

// ==========================================
// QIDIRUV MANTIG'I
// ==========================================

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (term.length > 0) {
        searchClearBtn.classList.remove('hidden');
        renderSearchResults(term);
    } else {
        searchClearBtn.classList.add('hidden');
        clearSearchAndResume();
    }
});

searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.classList.add('hidden');
    clearSearchAndResume();
});

function renderSearchResults(term) {
    feedContainer.innerHTML = ''; // Lentani tozalaymiz
    const matches = currentBatch.filter(q => q.savol.toLowerCase().includes(term));

    if (matches.length === 0) {
        feedContainer.innerHTML = '<p class="text-center text-gray-500 mt-8 font-medium">Hech narsa topilmadi 😕</p>';
        return;
    }

    // Topilgan har bir savol uchun mustaqil ticket yaratish
    matches.forEach(q => {
        appendStandaloneTicket(q);
    });
}

function clearSearchAndResume() {
    feedContainer.innerHTML = '';
    // Qidiruvdan chiqgach, oldin to'xtagan savoldan davom ettiramiz
    if (currentQuestionIndex < currentBatch.length) {
        appendQuestionTicket(currentQuestionIndex);
    } else {
        showResult();
    }
}

// Qidiruv orqali topilgan testlar uchun mustaqil ticket (Natijaga ta'sir qilmaydi)
function appendStandaloneTicket(question) {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = "bg-white rounded-2xl shadow border border-blue-100 p-6";

    const questionEl = document.createElement('h2');
    questionEl.className = "text-lg font-bold mb-4 text-gray-800 leading-snug";
    questionEl.innerHTML = `<span class="text-blue-500">#${question.id}.</span> ${question.savol}`;
    ticketDiv.appendChild(questionEl);

    let options = [
        { text: question.togri_javob, correct: true },
        { text: question.javob_2, correct: false },
        { text: question.javob_3, correct: false },
        { text: question.javob_4, correct: false }
    ];
    options = shuffle(options);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = "flex flex-col space-y-3";
    const buttonElements = [];

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = "btn-option w-full text-left bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl focus:outline-none";
        btn.innerText = option.text;

        btn.onclick = () => {
            buttonElements.forEach(b => {
                b.disabled = true;
                if (b.innerText === question.togri_javob) b.classList.add('correct');
            });
            if (option.correct) btn.classList.add('correct');
            else btn.classList.add('wrong');
        };

        optionsDiv.appendChild(btn);
        buttonElements.push(btn);
    });

    ticketDiv.appendChild(optionsDiv);
    feedContainer.appendChild(ticketDiv);
}

// ==========================================
// ASOSIY TEST MANTIG'I
// ==========================================

function appendQuestionTicket(index) {
    if (index >= currentBatch.length) {
        showResult();
        return;
    }

    const currentQuestion = currentBatch[index];

    const ticketDiv = document.createElement('div');
    ticketDiv.className = "bg-white rounded-2xl shadow-md p-6 opacity-0 transform translate-y-8 transition-all duration-500 ease-out";
    ticketDiv.id = `ticket-${index}`;

    const questionEl = document.createElement('h2');
    questionEl.className = "text-lg font-bold mb-4 text-gray-800 leading-snug";
    questionEl.innerText = `${index + 1}. ${currentQuestion.savol}`;
    ticketDiv.appendChild(questionEl);

    let options = [
        { text: currentQuestion.togri_javob, correct: true },
        { text: currentQuestion.javob_2, correct: false },
        { text: currentQuestion.javob_3, correct: false },
        { text: currentQuestion.javob_4, correct: false }
    ];
    options = shuffle(options);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = "flex flex-col space-y-3";
    const buttonElements = [];

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = "btn-option w-full text-left bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl focus:outline-none";
        btn.innerText = option.text;

        btn.onclick = () => handleAnswerSelect(option.correct, btn, buttonElements, currentQuestion.togri_javob);

        optionsDiv.appendChild(btn);
        buttonElements.push(btn);
    });

    ticketDiv.appendChild(optionsDiv);
    feedContainer.appendChild(ticketDiv);

    setTimeout(() => {
        ticketDiv.classList.remove('opacity-0', 'translate-y-8');
        ticketDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function handleAnswerSelect(isCorrect, selectedBtn, allBtns, correctAnswerText) {
    allBtns.forEach(btn => {
        btn.disabled = true;
        if (btn.innerText === correctAnswerText) {
            btn.classList.add('correct');
        }
    });

    // To'g'ri/Noto'g'ri javob tekshiruvi
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;

        // YANGI: Konfetti animatsiyasini chaqirish
        confetti({
            particleCount: 150, // Qog'ozchalar soni
            spread: 80,         // Qanchalik keng sochilib ketishi
            origin: { y: 0.6 }, // Ekranning qayeridan otilishi (0.6 - biroz pastroqdan markazga qarab)
            zIndex: 100         // Barcha narsaning ustida turishi uchun
        });

    } else {
        selectedBtn.classList.add('wrong');
    }

    currentQuestionIndex++;
    updateHeaderStats();

    setTimeout(() => {
        // Agar qidiruv rejimida bo'lmasakgina navbatdagisini chiqaramiz
        if (searchContainer.classList.contains('hidden') || searchInput.value.trim() === '') {
            appendQuestionTicket(currentQuestionIndex);
        }
    }, 600);
}

function showResult() {
    resultScreen.classList.remove('hidden');
    finalScore.innerText = `${score}/${currentBatch.length}`;
    resultScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function goHome() {
    quizScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

prepareBatches();