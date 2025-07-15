document.addEventListener('DOMContentLoaded', () => {
    // ---- HTML ELEMENTLERİ ---- //
    const introScreen = document.getElementById('intro-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const langToggleButton = document.getElementById('language-toggle-intro');
    const countrySelect = document.getElementById('country-select');
    const gsmInput = document.getElementById('gsm');
    const legalConsentCheckbox = document.getElementById('legal-consent');
    const consentLabel = document.querySelector('label[for="legal-consent"] span');
    const attemptsLeftDisplay = document.getElementById('attempts-left');
    
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const questionCounterDisplay = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress-bar');
    
    const questionTextDisplay = document.getElementById('question-text');
    const answerButtonsContainer = document.getElementById('answer-buttons');
    const resultTextDisplay = document.getElementById('result-text');
    const claimRewardBtn = document.getElementById('claim-reward-btn');

    const jokerAudienceBtn = document.getElementById('joker-audience');
    const jokerFiftyBtn = document.getElementById('joker-fifty');
    const jokerDoubleBtn = document.getElementById('joker-double');
    const jokerSkipBtn = document.getElementById('joker-skip');
    const audienceChart = document.getElementById('audience-chart');
    
    const endTitle = document.getElementById('end-title');
    const finalScoreText = document.getElementById('final-score-text');
    const bkWebsiteLink = document.querySelector('[data-lang-key="bkWebsite"]');

    // ---- OYUN DEĞİŞKENLERİ ---- //
    let allQuestions = {};
    let currentQuestionData = {};
    let totalQuestionIndex = 0;
    let score = 0;
    let currentLanguage = 'tr';
    let doubleAnswerUsed = false;
    let timerInterval;

    let jokers = {
        audience: true, fiftyFifty: false,
        double: false, skip: false
    };

    // Dil metinleri ve ülke listesi önceki kodla aynı kalabilir...
    const uiTexts = { /* ... Önceki koddan kopyalanacak ... */ };
    const europeanCountries = [ /* ... Önceki koddan kopyalanacak ... */ ];
    
    // ---- ANA FONKSİYONLAR ---- //
    
    async function init() {
        populateCountries();
        await loadQuestions();
        updateLanguageUI();
        checkDailyAttempts(); // Katılım hakkını kontrol et
        addEventListeners();
    }
    
    function addEventListeners() {
        langToggleButton.addEventListener('click', toggleLanguage);
        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', () => location.reload());
        jokerAudienceBtn.addEventListener('click', useAudienceJoker);
        jokerFiftyBtn.addEventListener('click', useFiftyFiftyJoker);
        jokerDoubleBtn.addEventListener('click', useDoubleAnswerJoker);
        jokerSkipBtn.addEventListener('click', useSkipJoker);
        claimRewardBtn.addEventListener('click', handleClaimReward);
    }

    // ---- GÜNLÜK KATILIM HAKKI MANTIĞI ---- //
    function checkDailyAttempts() {
        const today = new Date().toISOString().slice(0, 10);
        let attemptsData = JSON.parse(localStorage.getItem('kyrosilQuizData')) || { date: '', count: 0 };

        if (attemptsData.date !== today) {
            attemptsData = { date: today, count: 0 };
        }

        const attemptsLeft = 3 - attemptsData.count;
        attemptsLeftDisplay.textContent = currentLanguage === 'tr' ? `Bugünkü Katılım Hakkın: ${attemptsLeft}/3` : `Attempts Left Today: ${attemptsLeft}/3`;

        if (attemptsLeft <= 0) {
            startButton.disabled = true;
            const noAttemptsKey = currentLanguage === 'tr' ? 'noAttemptsTr' : 'noAttemptsEn';
            uiTexts.tr.noAttemptsTr = "HAKKINIZ BİTTİ";
            uiTexts.en.noAttemptsEn = "NO ATTEMPTS LEFT";
            startButton.textContent = uiTexts[currentLanguage][noAttemptsKey];
            attemptsLeftDisplay.textContent = currentLanguage === 'tr' ? "Yarın tekrar bekleriz!" : "Come back tomorrow!";
        }
        localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
    }
    
    function recordAttempt() {
        let attemptsData = JSON.parse(localStorage.getItem('kyrosilQuizData'));
        attemptsData.count++;
        localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
    }

    // ---- ZAMANLAYICI MANTIĞI ---- //
    function startTimer() {
        clearInterval(timerInterval); // Önceki zamanlayıcıyı temizle
        
        const level = Math.floor(totalQuestionIndex / 5);
        const timeMap = [60, 90, 120, 150]; // 1-5, 6-10, 11-15, 16-20
        let timeLeft = timeMap[level];
        timerDisplay.classList.remove('low-time');

        const updateTimerDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (timeLeft <= 10) {
                timerDisplay.classList.add('low-time');
            }
        };

        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeUp();
            }
        }, 1000);
    }
    
    function handleTimeUp() {
        resultTextDisplay.textContent = currentLanguage === 'tr' ? "Süre Doldu!" : "Time's Up!";
        revealAnswers(-1); // -1 geçersiz index, sadece doğruyu gösterir
        setTimeout(() => endGame(), 2000);
    }

    // ---- OYUN AKIŞI (GÜNCELLENDİ) ---- //
    
    function startGame() {
        if (!validateForm()) return;
        
        recordAttempt();
        checkDailyAttempts(); // UI'ı anında güncellemek için tekrar çağır

        introScreen.classList.remove('active');
        gameScreen.classList.add('active');
        
        resetGameState();
        loadNextQuestion();
    }

    function loadNextQuestion() {
        clearInterval(timerInterval);
        claimRewardBtn.classList.add('hidden');
        doubleAnswerUsed = false;
        
        const level = Math.floor(totalQuestionIndex / 5) + 1;
        const questionInLevelIndex = totalQuestionIndex % 5;
        const levelKey = `seviye${level}`;
        
        if (!allQuestions[levelKey] || !allQuestions[levelKey][currentLanguage][questionInLevelIndex]) {
            endGame(true); // Tüm sorular bitti, kazandı
            return;
        }
        
        currentQuestionData = allQuestions[levelKey][currentLanguage][questionInLevelIndex];
        
        displayQuestion();
        updateHUD();
        startTimer(); // Zamanlayıcıyı başlat
    }
    
    function selectAnswer(selectedIndex) {
        clearInterval(timerInterval); // Cevap verildiğinde zamanlayıcıyı durdur
        
        if (doubleAnswerUsed) { /* ... önceki kodla aynı ... */ }
        const isCorrect = selectedIndex === currentQuestionData.correct;
        if (jokers.double && !isCorrect) { /* ... önceki kodla aynı ... */ }

        revealAnswers(selectedIndex);
        
        if (isCorrect) {
            score += 50;
            resultTextDisplay.textContent = uiTexts[currentLanguage].correct;
        } else {
            resultTextDisplay.textContent = uiTexts[currentLanguage].wrong;
        }

        setTimeout(() => {
            if (isCorrect) {
                handleCorrectAnswerFlow();
            } else {
                endGame(false); // Yanlış cevap, kaybetti
            }
        }, 2000);
    }
    
    function endGame(isWinner = false) {
        clearInterval(timerInterval);
        gameScreen.classList.remove('active');
        endScreen.classList.add('active');

        if (totalQuestionIndex < 5 && !isWinner) {
            endTitle.textContent = currentLanguage === 'tr' ? 'Daha İyi Olabilir!' : 'Could Be Better!';
        } else {
            endTitle.textContent = uiTexts[currentLanguage].congrats;
        }
        
        finalScoreText.textContent = `${uiTexts[currentLanguage].finalScore}: ${score}`;
    }

    // Joker, UI ve diğer yardımcı fonksiyonlar önceki kodla büyük ölçüde aynı kalabilir.
    // Önemli olan yukarıdaki yeni fonksiyonları ve güncellenmiş akışı eklemektir.
    // ... [Önceki script.js'den kalan tüm yardımcı fonksiyonlar (populateCountries, updateLanguageUI, joker fonksiyonları, handleClaimReward vb.) buraya eklenecek] ...
    
    // Oyunu Başlat
    init();
});
