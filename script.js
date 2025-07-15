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

    // HUD
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const questionCounterDisplay = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress-bar');

    // Soru ve Cevap Alanları
    const questionTextDisplay = document.getElementById('question-text');
    const answerButtonsContainer = document.getElementById('answer-buttons');
    const resultTextDisplay = document.getElementById('result-text');
    const claimRewardBtn = document.getElementById('claim-reward-btn');

    // Jokerler
    const jokerAudienceBtn = document.getElementById('joker-audience');
    const jokerFiftyBtn = document.getElementById('joker-fifty');
    const jokerDoubleBtn = document.getElementById('joker-double');
    const jokerSkipBtn = document.getElementById('joker-skip');
    const audienceChart = document.getElementById('audience-chart');

    // Bitiş Ekranı
    const endTitle = document.getElementById('end-title');
    const finalScoreText = document.getElementById('final-score-text');

    // Footer
    const bkWebsiteLink = document.querySelector('[data-lang-key="bkWebsite"]');

    // ---- OYUN DEĞİŞKENLERİ ---- //
    let allQuestions = {};
    let currentQuestionData = {};
    let totalQuestionIndex = 0;
    let score = 0;
    let currentLanguage = 'tr';
    let isDoubleAnswerActive = false;
    let timerInterval;
    let shuffledLevelIndices = {}; // YENİ: Karıştırılmış soru indekslerini tutar

    let jokers = {
        audience: true, fiftyFifty: false,
        double: false, skip: false
    };

    // ---- DİL VE METİN VERİLERİ ---- //
    const uiTexts = {
        tr: {
            title: "Kyrosil ile Bil Kazan", subtitle: "Supported by Burger King",
            rulesTitle: "Oyun Kuralları",
            rulesDesc: "20 soruluk tarih maratonuna hoş geldiniz! Zorluğu giderek artan soruları ve zaman sınırını aşarak kilometre taşlarına ulaşın, muhteşem ödüller kazanın. 4 farklı joker hakkınız stratejinize güç katacak!",
            prizesTitle: "Ödüller",
            prize5: "<b>5. Soru:</b> Burger King'den Whopper Menü!",
            prize10: "<b>10. Soru:</b> BK'da geçerli 1000 TL / 20€ Bakiye!",
            prize15: "<b>15. Soru:</b> BK'da geçerli 5000 TL / 120€ Bakiye!",
            prize20: "<b>20. Soru:</b> 20.000 TL / 500€ Nakit Ödül!",
            langNotice: "Türkiye'den katılan yarışmacıların <b>Türkçe</b>, Avrupa'dan katılanların ise <b>İngilizce</b> dilini seçmesi ödül kazanımı için zorunludur.",
            firstName: "Adınız", lastName: "Soyadınız", email: "E-posta",
            social: "Sosyal Medya (Instagram veya EU Portal)", // DEĞİŞTİRİLDİ
            gsmTr: "Tıkla Gelsin'e Kayıtlı GSM Numaranız",
            consentTr: '<a href="#" target="_blank">KVKK Aydınlatma Metni\'ni</a> okudum, anladım ve kişisel verilerimin işlenmesini onaylıyorum.',
            startButton: "OYUNU BAŞLAT",
            score: "Puan", question: "Soru",
            correct: "Doğru!", wrong: "Yanlış!", timeUp: "Süre Doldu!",
            jokerAudience: "Seyirci", jokerFifty: "Yarı Yarıya", jokerDouble: "Çift Cevap", jokerSkip: "Pas Geç",
            claimReward: "Ödülünü Al!",
            congrats: "Tebrikler!", finalScore: "Final Puanınız", restartButton: "Yeniden Başla",
            endGameLost: "Neredeyse Başarıyordun!",
            bkWebsite: "Burger King Türkiye",
            noAttempts: "HAKKINIZ BİTTİ",
            comeback: "Yarın tekrar bekleriz!",
            attemptsLeft: "Bugünkü Katılım Hakkın:"
        },
        en: {
            title: "Know and Win with Kyrosil", subtitle: "Supported by Burger King",
            rulesTitle: "Game Rules",
            rulesDesc: "Welcome to the 20-question history marathon! Answer progressively harder questions correctly, pass milestones, and win amazing prizes. Your 4 different jokers will empower your strategy!",
            prizesTitle: "Prizes",
            prize5: "<b>Question 5:</b> A Whopper Menu from Burger King!",
            prize10: "<b>Question 10:</b> 1000 TL / 20€ Balance at BK!",
            prize15: "<b>Question 15:</b> 5000 TL / 120€ Balance at BK!",
            prize20: "<b>Question 20:</b> 20,000 TL / 500€ Cash Prize!",
            langNotice: "Participants from Turkey are required to select <b>Turkish</b>, and participants from Europe are required to select the <b>English</b> language to be eligible for prizes.",
            firstName: "First Name", lastName: "Last Name", email: "Email",
            social: "Social Media (e.g., Instagram or EU Portal)", // DEĞİŞTİRİLDİ
            gsmEn: "GSM Number Registered to Burger King App",
            consentEn: 'I have read and understood the <a href="#" target="_blank">GDPR Policy</a> and I consent to the processing of my personal data.',
            startButton: "START GAME",
            score: "Score", question: "Question",
            correct: "Correct!", wrong: "Wrong!", timeUp: "Time's Up!",
            jokerAudience: "Audience", jokerFifty: "50:50", jokerDouble: "Double Answer", jokerSkip: "Skip",
            claimReward: "Claim Your Prize!",
            congrats: "Congratulations!", finalScore: "Your Final Score", restartButton: "Restart Game",
            endGameLost: "Could Be Better!",
            bkWebsite: "Burger King Global",
            noAttempts: "NO ATTEMPTS LEFT",
            comeback: "Come back tomorrow!",
            attemptsLeft: "Attempts Left Today:"
        }
    };

    const europeanCountries = ["Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City"];

    // ---- ANA FONKSİYONLAR ---- //

    async function init() {
        populateCountries();
        await loadQuestions();
        addEventListeners();
        updateLanguageUI();
        checkDailyAttempts();
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
            localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
        }

        const attemptsLeft = 3 - attemptsData.count;
        attemptsLeftDisplay.textContent = `${uiTexts[currentLanguage].attemptsLeft} ${attemptsLeft}/3`;

        if (attemptsLeft <= 0) {
            startButton.disabled = true;
            startButton.textContent = uiTexts[currentLanguage].noAttempts;
            attemptsLeftDisplay.textContent = uiTexts[currentLanguage].comeback;
        } else {
            startButton.disabled = false;
            startButton.textContent = uiTexts[currentLanguage].startButton;
        }
    }

    function recordAttempt() {
        let attemptsData = JSON.parse(localStorage.getItem('kyrosilQuizData'));
        attemptsData.count++;
        localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
    }

    // ---- ZAMANLAYICI MANTIĞI ---- //
    function startTimer() {
        clearInterval(timerInterval);
        const level = Math.floor(totalQuestionIndex / 5);
        const timeMap = [60, 90, 120, 150];
        let timeLeft = timeMap[level];
        timerDisplay.classList.remove('low-time');

        const updateTimerDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (timeLeft <= 10 && timeLeft > 0) {
                timerDisplay.classList.add('low-time');
            } else {
                timerDisplay.classList.remove('low-time');
            }
        };

        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                handleTimeUp();
            }
        }, 1000);
    }

    function handleTimeUp() {
        resultTextDisplay.textContent = uiTexts[currentLanguage].timeUp;
        revealAnswers(-1);
        setTimeout(() => endGame(false), 2000);
    }

    // ---- DİL VE UI ---- //
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
        updateLanguageUI();
        checkDailyAttempts();
    }

    function updateLanguageUI() {
        const texts = uiTexts[currentLanguage];
        document.title = texts.title;
        langToggleButton.textContent = currentLanguage === 'tr' ? 'EN' : 'TR';

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.dataset.langKey;
            if (texts[key]) el.innerHTML = texts[key];
        });

        document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
            const key = el.dataset.langPlaceholder;
            if (texts[key]) el.placeholder = texts[key];
        });

        if (currentLanguage === 'en') {
            countrySelect.classList.remove('hidden');
            gsmInput.placeholder = texts.gsmEn;
            consentLabel.innerHTML = texts.consentEn;
            bkWebsiteLink.href = "https://www.bk.com/";
        } else {
            countrySelect.classList.add('hidden');
            gsmInput.placeholder = texts.gsmTr;
            consentLabel.innerHTML = texts.consentTr;
            bkWebsiteLink.href = "https://www.burgerking.com.tr/";
        }
    }

    function populateCountries() {
        europeanCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }

    // ---- OYUN AKIŞI ---- //
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            allQuestions = await response.json();
        } catch (error) {
            console.error("Sorular yüklenemedi:", error);
        }
    }

    // YENİ: Fisher-Yates shuffle algoritması
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startGame() {
        if (!validateForm()) return;

        recordAttempt();
        checkDailyAttempts();

        introScreen.classList.remove('active');
        gameScreen.classList.add('active');

        resetGameState();
        loadNextQuestion();
    }

    function validateForm() {
        const inputs = [document.getElementById('firstName'), document.getElementById('lastName'), document.getElementById('email'), document.getElementById('social'), gsmInput];
        if (currentLanguage === 'en') inputs.push(countrySelect);
        for (let input of inputs) {
            if (!input.value) {
                alert(currentLanguage === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.');
                return false;
            }
        }
        if (!legalConsentCheckbox.checked) {
            alert(currentLanguage === 'tr' ? 'Lütfen yasal koşulları onaylayın.' : 'Please accept the legal terms.');
            return false;
        }
        return true;
    }

    function resetGameState() {
        score = 0;
        totalQuestionIndex = 0;
        jokers = { audience: true, fiftyFifty: false, double: false, skip: false };
        updateJokerUI();

        // YENİ: Her seviye için soru indekslerini karıştır
        shuffledLevelIndices = {};
        for (const levelKey in allQuestions) {
            const questionCount = allQuestions[levelKey][currentLanguage].length;
            const indices = Array.from(Array(questionCount).keys()); // [0, 1, 2, 3, 4]
            shuffledLevelIndices[levelKey] = shuffleArray(indices);
        }
    }

    function loadNextQuestion() {
        clearInterval(timerInterval);
        claimRewardBtn.classList.add('hidden');
        isDoubleAnswerActive = false;

        const level = Math.floor(totalQuestionIndex / 5) + 1;
        const questionInLevelIndex = totalQuestionIndex % 5;
        const levelKey = `seviye${level}`;

        // YENİ: Karıştırılmış sıradan bir sonraki soruyu al
        const shuffledIndex = shuffledLevelIndices[levelKey]?.[questionInLevelIndex];

        if (!allQuestions[levelKey] || shuffledIndex === undefined) {
            endGame(true);
            return;
        }

        currentQuestionData = allQuestions[levelKey][currentLanguage][shuffledIndex];
        displayQuestion();
        updateHUD();
        startTimer();
    }


    function displayQuestion() {
        questionTextDisplay.textContent = currentQuestionData.question;
        answerButtonsContainer.innerHTML = '';
        resultTextDisplay.textContent = '';
        audienceChart.classList.add('hidden');

        currentQuestionData.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.innerHTML = answer;
            button.classList.add('answer-btn');
            button.dataset.index = index;
            button.addEventListener('click', () => selectAnswer(parseInt(button.dataset.index)));
            answerButtonsContainer.appendChild(button);
        });
    }

    function selectAnswer(selectedIndex) {
        clearInterval(timerInterval);

        const isCorrect = selectedIndex === currentQuestionData.correct;

        if (isDoubleAnswerActive) {
            isDoubleAnswerActive = false;
            jokers.double = false;
            updateJokerUI();
            handleSecondAnswer(selectedIndex);
            return;
        }

        if (jokers.double && !isCorrect) {
            isDoubleAnswerActive = true;
            const buttons = answerButtonsContainer.querySelectorAll('.answer-btn');
            buttons[selectedIndex].classList.add('wrong');
            buttons[selectedIndex].disabled = true;
            return;
        }

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
                endGame(false);
            }
        }, 2000);
    }

    function handleSecondAnswer(selectedIndex) {
        const isCorrect = selectedIndex === currentQuestionData.correct;
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
                endGame(false);
            }
        }, 2000);
    }

    function revealAnswers(selectedIndex) {
        const buttons = answerButtonsContainer.querySelectorAll('.answer-btn');
        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === currentQuestionData.correct) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex) {
                btn.classList.add('wrong');
            }
        });
    }

    function handleCorrectAnswerFlow() {
        totalQuestionIndex++;
        const milestone = totalQuestionIndex;
        if (milestone === 5 || milestone === 10 || milestone === 15 || milestone === 20) {
            if (milestone === 5) jokers.double = true;
            if (milestone === 10) jokers.fiftyFifty = true;
            if (milestone === 15) jokers.skip = true;
            updateJokerUI();
            claimRewardBtn.classList.remove('hidden');
        } else if (totalQuestionIndex >= 20) {
            endGame(true);
        } else {
            loadNextQuestion();
        }
    }

    function updateHUD() {
        scoreDisplay.textContent = `${uiTexts[currentLanguage].score}: ${score}`;
        questionCounterDisplay.textContent = `${uiTexts[currentLanguage].question} ${Math.min(totalQuestionIndex + 1, 20)}/20`;
        progressBar.style.width = `${((totalQuestionIndex) / 20) * 100}%`;
    }

    function endGame(isWinner) {
        clearInterval(timerInterval);
        gameScreen.classList.remove('active');
        endScreen.classList.add('active');

        if (totalQuestionIndex < 5 && !isWinner) {
            endTitle.textContent = uiTexts[currentLanguage].endGameLost;
        } else {
            endTitle.textContent = uiTexts[currentLanguage].congrats;
        }

        finalScoreText.textContent = `${uiTexts[currentLanguage].finalScore}: ${score}`;
    }

    // ---- JOKER VE ÖDÜL MANTIĞI ---- //
    function updateJokerUI() {
        jokerAudienceBtn.disabled = !jokers.audience;
        jokerFiftyBtn.disabled = !jokers.fiftyFifty;
        jokerDoubleBtn.disabled = !jokers.double;
        jokerSkipBtn.disabled = !jokers.skip;
    }

    function useDoubleAnswerJoker() {
        if (!jokers.double) return;
        alert(currentLanguage === 'tr' ? 'Çift Cevap hakkı aktif! İlk cevabınız yanlış ise bir hak daha verilecek.' : 'Double Answer joker is active! If your first answer is wrong, you will get a second chance.');
    }

    function useSkipJoker() {
        if (!jokers.skip) return;
        clearInterval(timerInterval);
        jokers.skip = false;
        updateJokerUI();
        score += 25;
        handleCorrectAnswerFlow();
    }

    function handleClaimReward() {
        const milestone = totalQuestionIndex;
        const prizeMap = { 5: "Whopper Menu", 10: "1000 TL / 20 Euro Balance", 15: "5000 TL / 120 Euro Balance", 20: "20.000 TL / 500 Euro Cash" };
        const prizeWon = prizeMap[milestone];
        const userData = {
            firstName: document.getElementById('firstName').value, lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value, social: document.getElementById('social').value,
            gsm: gsmInput.value, country: currentLanguage === 'en' ? countrySelect.value : 'Turkey'
        };
        const mailBody = `Kyrosil x Burger King Yarışması Ödül Talebi\n------------------------------------------\nUlaşılan Kilometre Taşı: Soru ${milestone}\nKazanılan Ödül: ${prizeWon}\n------------------------------------------\nKullanıcı Bilgileri:\nAd: ${userData.firstName}\nSoyad: ${userData.lastName}\nE-posta: ${userData.email}\nSosyal Medya: ${userData.social}\nÜlke: ${userData.country}\nGSM No: ${userData.gsm}\n------------------------------------------\nTalep Tarihi: ${new Date().toLocaleString()}`;
        const subject = "Kyrosil x Burger King Ödül Başvurusu";
        const mailtoLink = `mailto:bkgift@kyrosil.eu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
        window.location.href = mailtoLink;
        claimRewardBtn.classList.add('hidden');
        if (totalQuestionIndex >= 20) {
            endGame(true);
        } else {
            loadNextQuestion();
        }
    }

    function useAudienceJoker() {
        if (!jokers.audience) return;
        jokers.audience = false;
        updateJokerUI();

        audienceChart.classList.remove('hidden');
        const bars = audienceChart.querySelectorAll('.bar-container .bar');
        let percentages = [10, 10, 10, 10];

        const isLucky = Math.random() < 0.95;
        let highIndex = currentQuestionData.correct;
        if (!isLucky) {
            let wrongAnswers = [0, 1, 2, 3].filter(i => i !== currentQuestionData.correct);
            highIndex = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        }

        let remainingPercent = 100;
        let highValue = 40 + Math.floor(Math.random() * 30); // 40-69%
        percentages[highIndex] = highValue;
        remainingPercent -= highValue;

        let otherIndices = [0, 1, 2, 3].filter(i => i !== highIndex);
        otherIndices.forEach((index, i) => {
            if (i < 2) {
                let randomPercent = 1 + Math.floor(Math.random() * (remainingPercent / 2));
                percentages[index] = randomPercent;
                remainingPercent -= randomPercent;
            } else {
                percentages[index] = remainingPercent;
            }
        });

        bars.forEach((bar, index) => {
            bar.style.height = `${percentages[index]}%`;
            bar.parentElement.querySelector('span').textContent = `${percentages[index]}%`;
        });

        setTimeout(() => { audienceChart.classList.add('hidden'); }, 4000);
    }

    function useFiftyFiftyJoker() {
        if (!jokers.fiftyFifty) return;
        jokers.fiftyFifty = false;
        updateJokerUI();

        const buttons = Array.from(answerButtonsContainer.querySelectorAll('.answer-btn'));
        let wrongAnswers = [];
        buttons.forEach((btn, index) => {
            if (index !== currentQuestionData.correct) {
                wrongAnswers.push(btn);
            }
        });

        wrongAnswers.sort(() => Math.random() - 0.5);
        wrongAnswers[0].classList.add('hidden-by-joker');
        wrongAnswers[1].classList.add('hidden-by-joker');
    }

    // Oyunu Başlat
    init();
});
