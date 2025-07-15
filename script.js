document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ELEMENTLERİ TANIMLA ---
    const elements = {};
    const elementIds = [ 'intro-screen', 'game-screen', 'end-screen', 'start-button', 'restart-button', 'lang-tr', 'lang-en', 'country-select', 'gsm', 'legal-consent', 'attempts-left', 'score', 'timer', 'question-counter', 'progress-bar', 'question-text', 'answer-buttons', 'result-text', 'claim-reward-btn', 'joker-audience', 'joker-fifty', 'joker-double', 'joker-skip', 'audience-chart', 'end-title', 'final-score-text', 'firstName', 'lastName', 'email', 'social' ];
    elementIds.forEach(id => {
        const camelCaseId = id.replace(/-([a-z])/g, g => g[1].toUpperCase());
        elements[camelCaseId] = document.getElementById(id);
    });
    elements.consentLabel = document.querySelector('label[for="legal-consent"] span');
    elements.bkWebsiteLink = document.querySelector('[data-lang-key="bkWebsite"]');

    // --- 2. OYUN DURUMUNU VE SABİTLERİ TANIMLA ---
    const state = { allQuestions: {}, shuffledQuestionPools: {}, currentQuestionData: {}, totalQuestionIndex: 0, score: 0, currentLanguage: 'tr', isDoubleAnswerActive: false, timerInterval: null, jokers: { audience: true, fiftyFifty: false, double: false, skip: false } };
    const uiTexts = { tr: { title: "Kyrosil ile Bil Kazan", subtitle: "Supported by Burger King", rulesTitle: "Oyun Kuralları", rulesDesc: "20 soruluk tarih maratonuna hoş geldiniz! Zorluğu giderek artan soruları ve zaman sınırını aşarak kilometre taşlarına ulaşın, muhteşem ödüller kazanın. 4 farklı joker hakkınız stratejinize güç katacak!", prizesTitle: "Ödüller", prize5: "<b>5. Soru:</b> Burger King'den Whopper Menü!", prize10: "<b>10. Soru:</b> BK'da geçerli 1000 TL / 20€ Bakiye!", prize15: "<b>15. Soru:</b> BK'da geçerli 5000 TL / 120€ Bakiye!", prize20: "<b>20. Soru:</b> 20.000 TL / 500€ Nakit Ödül!", langNotice: "Türkiye'den katılan yarışmacıların <b>Türkçe</b>, Avrupa'dan katılanların ise <b>İngilizce</b> dilini seçmesi ödül kazanımı için zorunludur.", firstName: "Adınız", lastName: "Soyadınız", email: "E-posta", social: "Sosyal Medya (Instagram veya EU Portal)", gsmTr: "Tıkla Gelsin'e Kayıtlı GSM Numaranız", consentTr: '<a href="#" target="_blank">KVKK Aydınlatma Metni\'ni</a> okudum, anladım ve kişisel verilerimin işlenmesini onaylıyorum.', startButton: "OYUNU BAŞLAT", score: "Puan", question: "Soru", correct: "Doğru!", wrong: "Yanlış!", timeUp: "Süre Doldu!", jokerAudience: "Seyirci", jokerFifty: "Yarı Yarıya", jokerDouble: "Çift Cevap", jokerSkip: "Pas Geç", claimReward: "Ödülünü Al!", congrats: "Tebrikler!", finalScore: "Final Puanınız", restartButton: "Yeniden Başla", endGameLost: "Neredeyse Başarıyordun!", bkWebsite: "Burger King Türkiye", noAttempts: "HAKKINIZ BİTTİ", comeback: "Yarın tekrar bekleriz!", attemptsLeft: "Bugünkü Katılım Hakkın:" }, en: { title: "Know and Win with Kyrosil", subtitle: "Supported by Burger King", rulesTitle: "Game Rules", rulesDesc: "Welcome to the 20-question history marathon! Answer progressively harder questions correctly, pass milestones, and win amazing prizes. Your 4 different jokers will empower your strategy!", prizesTitle: "Prizes", prize5: "<b>Question 5:</b> A Whopper Menu from Burger King!", prize10: "<b>Question 10:</b> 1000 TL / 20€ Balance at BK!", prize15: "<b>Question 15:</b> 5000 TL / 120€ Balance at BK!", prize20: "<b>Question 20:</b> 20,000 TL / 500€ Cash Prize!", langNotice: "Participants from Turkey are required to select <b>Turkish</b>, and participants from Europe are required to select the <b>English</b> language to be eligible for prizes.", firstName: "First Name", lastName: "Last Name", email: "Email", social: "Social Media (Instagram or EU Portal)", gsmEn: "GSM Number Registered to Burger King App", consentEn: 'I have read and understood the <a href="#" target="_blank">GDPR Policy</a> and I consent to the processing of my personal data.', startButton: "START GAME", score: "Score", question: "Question", correct: "Correct!", wrong: "Wrong!", timeUp: "Time's Up!", jokerAudience: "Audience", jokerFifty: "50:50", jokerDouble: "Double Answer", jokerSkip: "Skip", claimReward: "Claim Your Prize!", congrats: "Congratulations!", finalScore: "Your Final Score", restartButton: "Restart Game", endGameLost: "Could Be Better!", bkWebsite: "Burger King Global", noAttempts: "NO ATTEMPTS LEFT", comeback: "Come back tomorrow!", attemptsLeft: "Attempts Left Today:" } };
    const europeanCountries = ["Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City"];

    // --- 3. FONKSİYONLARI TANIMLA ---
    
    function renderUIForLanguage(lang) {
        state.currentLanguage = lang;
        const texts = uiTexts[state.currentLanguage];
        elements.langTr.classList.toggle('active', lang === 'tr');
        elements.langEn.classList.toggle('active', lang === 'en');
        document.title = texts.title;
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            if(!el) return;
            const key = el.dataset.langKey;
            if (texts[key]) el.innerHTML = texts[key];
        });
        document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
            if(!el) return;
            const key = el.dataset.langPlaceholder;
            if (texts[key]) el.placeholder = texts[key];
        });
        elements.countrySelect.classList.toggle('hidden', lang !== 'en');
        elements.gsmInput.placeholder = lang === 'tr' ? texts.gsmTr : texts.gsmEn;
        elements.consentLabel.innerHTML = lang === 'tr' ? texts.consentTr : texts.consentEn;
        elements.bkWebsiteLink.href = lang === 'tr' ? "https://www.burgerking.com.tr/" : "https://www.bk.com/";
        checkDailyAttempts();
    }
    
    function checkDailyAttempts() {
        const today = new Date().toISOString().slice(0, 10);
        let attemptsData = JSON.parse(localStorage.getItem('kyrosilQuizData')) || { date: today, count: 0 };
        if (attemptsData.date !== today) {
            attemptsData = { date: today, count: 0 };
            localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
        }
        const attemptsLeft = 3 - attemptsData.count;
        const lang = state.currentLanguage;
        elements.attemptsLeftDisplay.textContent = `${uiTexts[lang].attemptsLeft} ${attemptsLeft}/3`;
        elements.startButton.disabled = attemptsLeft <= 0;
        if (attemptsLeft <= 0) {
            elements.startButton.textContent = uiTexts[lang].noAttempts;
            elements.attemptsLeftDisplay.textContent = uiTexts[lang].comeback;
        } else {
            elements.startButton.textContent = uiTexts[lang].startButton;
        }
    }

    function recordAttempt() {
        const today = new Date().toISOString().slice(0, 10);
        let attemptsData = JSON.parse(localStorage.getItem('kyrosilQuizData'));
        if (!attemptsData || attemptsData.date !== today) {
            attemptsData = { date: today, count: 0 };
        }
        attemptsData.count++;
        localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
        checkDailyAttempts();
    }

    function validateForm() {
        const inputs = [elements.firstName, elements.lastName, elements.email, elements.social, elements.gsmInput];
        if (state.currentLanguage === 'en' && !elements.countrySelect.value) {
            alert('Please select your country.');
            return false;
        }
        for (let input of inputs) {
            if (!input || !input.value.trim()) {
                alert(state.currentLanguage === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.');
                return false;
            }
        }
        if (!elements.legalConsentCheckbox.checked) {
            alert(state.currentLanguage === 'tr' ? 'Lütfen yasal koşulları onaylayın.' : 'Please accept the legal terms.');
            return false;
        }
        return true;
    }
    
    function shuffleAllPools() {
        state.shuffledQuestionPools = {};
        for (const levelKey in state.allQuestions) {
            const pool = state.allQuestions[levelKey]?.[state.currentLanguage];
            if (pool) {
                state.shuffledQuestionPools[levelKey] = [...pool].sort(() => Math.random() - 0.5);
            }
        }
    }
    
    function resetGameState() {
        state.score = 0;
        state.totalQuestionIndex = 0;
        state.jokers = { audience: true, fiftyFifty: false, double: false, skip: false };
        updateJokerUI();
    }

    function updateJokerUI() {
        elements.jokerAudienceBtn.disabled = !state.jokers.audience;
        elements.jokerFiftyBtn.disabled = !state.jokers.fiftyFifty;
        elements.jokerDoubleBtn.disabled = !state.jokers.double;
        elements.jokerSkipBtn.disabled = !state.jokers.skip;
    }

    function startGame() {
        if (elements.startButton.disabled) return;
        if (!validateForm()) return;
        recordAttempt();
        shuffleAllPools();
        elements.introScreen.classList.remove('active');
        elements.gameScreen.classList.add('active');
        resetGameState();
        loadNextQuestion();
    }
    
    function loadNextQuestion() {
        clearInterval(state.timerInterval);
        elements.claimRewardBtn.classList.add('hidden');
        state.isDoubleAnswerActive = false;
        const level = Math.floor(state.totalQuestionIndex / 5) + 1;
        const questionInLevelIndex = state.totalQuestionIndex % 5;
        const levelKey = `seviye${level}`;
        state.currentQuestionData = state.shuffledQuestionPools[levelKey]?.[questionInLevelIndex];
        if (!state.currentQuestionData) {
            endGame(state.totalQuestionIndex >= 20);
            return;
        }
        displayQuestion();
        updateHUD();
        startTimer();
    }

    function displayQuestion() {
        const { question, answers } = state.currentQuestionData;
        elements.questionTextDisplay.textContent = question;
        elements.answerButtonsContainer.innerHTML = '';
        elements.resultTextDisplay.textContent = '';
        elements.audienceChart.classList.add('hidden');
        answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.innerHTML = answer;
            button.classList.add('answer-btn');
            button.dataset.index = index;
            button.addEventListener('click', () => selectAnswer(index));
            elements.answerButtonsContainer.appendChild(button);
        });
    }

    function startTimer() {
        clearInterval(state.timerInterval);
        const level = Math.floor(state.totalQuestionIndex / 5);
        const timeMap = [60, 90, 120, 150];
        let timeLeft = timeMap[level];
        elements.timerDisplay.classList.remove('low-time');
        const updateTimerDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (timeLeft <= 10 && timeLeft > 0) {
                elements.timerDisplay.classList.add('low-time');
            } else {
                elements.timerDisplay.classList.remove('low-time');
            }
        };
        updateTimerDisplay();
        state.timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft < 0) {
                clearInterval(state.timerInterval);
                handleTimeUp();
            }
        }, 1000);
    }
    
    function handleTimeUp() {
        elements.resultTextDisplay.textContent = uiTexts[state.currentLanguage].timeUp;
        revealAnswers(-1);
        setTimeout(() => endGame(false), 2000);
    }

    function selectAnswer(selectedIndex) {
        clearInterval(state.timerInterval);
        const isCorrect = selectedIndex === state.currentQuestionData.correct;
        if (state.isDoubleAnswerActive) { handleSecondAnswer(selectedIndex); return; }
        if (state.jokers.double && !isCorrect) {
            state.isDoubleAnswerActive = true;
            state.jokers.double = false;
            updateJokerUI();
            const buttons = elements.answerButtonsContainer.querySelectorAll('.answer-btn');
            buttons[selectedIndex].classList.add('wrong');
            buttons[selectedIndex].disabled = true;
            return;
        }
        revealAnswers(selectedIndex);
        const lang = state.currentLanguage;
        elements.resultTextDisplay.textContent = isCorrect ? uiTexts[lang].correct : uiTexts[lang].wrong;
        if (isCorrect) state.score += 50;
        setTimeout(() => {
            if (isCorrect) { handleCorrectAnswerFlow(); } else { endGame(false); }
        }, 2000);
    }
    
    function handleSecondAnswer(selectedIndex) {
        const isCorrect = selectedIndex === state.currentQuestionData.correct;
        revealAnswers(selectedIndex);
        const lang = state.currentLanguage;
        elements.resultTextDisplay.textContent = isCorrect ? uiTexts[lang].correct : uiTexts[lang].wrong;
        if (isCorrect) state.score += 50;
        setTimeout(() => {
            if (isCorrect) { handleCorrectAnswerFlow(); } else { endGame(false); }
        }, 2000);
    }
    
    function revealAnswers(selectedIndex) {
        const buttons = elements.answerButtonsContainer.querySelectorAll('.answer-btn');
        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === state.currentQuestionData.correct) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex) {
                btn.classList.add('wrong');
            }
        });
    }

    function handleCorrectAnswerFlow() {
        state.totalQuestionIndex++;
        const milestone = state.totalQuestionIndex;
        if (milestone === 20) {
            elements.claimRewardBtn.classList.remove('hidden');
        } else if (milestone === 5 || milestone === 10 || milestone === 15) {
            if (milestone === 5) state.jokers.double = true;
            if (milestone === 10) state.jokers.fiftyFifty = true;
            if (milestone === 15) state.jokers.skip = true;
            updateJokerUI();
            elements.claimRewardBtn.classList.remove('hidden');
        } else {
            loadNextQuestion();
        }
    }

    function updateHUD() {
        const lang = state.currentLanguage;
        elements.scoreDisplay.textContent = `${uiTexts[lang].score}: ${state.score}`;
        elements.questionCounterDisplay.textContent = `${uiTexts[lang].question} ${Math.min(state.totalQuestionIndex + 1, 20)}/20`;
        elements.progressBar.style.width = `${((state.totalQuestionIndex) / 20) * 100}%`;
    }

    function endGame(isWinner) {
        clearInterval(state.timerInterval);
        elements.gameScreen.classList.remove('active');
        elements.endScreen.classList.add('active');
        const lang = state.currentLanguage;
        elements.endTitle.textContent = (state.totalQuestionIndex < 5 && !isWinner) ? uiTexts[lang].endGameLost : uiTexts[lang].congrats;
        elements.finalScoreText.textContent = `${uiTexts[lang].finalScore}: ${state.score}`;
    }

    function useAudienceJoker() {
        if (!state.jokers.audience) return;
        state.jokers.audience = false; updateJokerUI();
        elements.audienceChart.classList.remove('hidden');
        const bars = elements.audienceChart.querySelectorAll('.bar-container .bar');
        let percentages = [0, 0, 0, 0];
        const isLucky = Math.random() < 0.95;
        let highIndex = state.currentQuestionData.correct;
        if (!isLucky) {
            let wrongAnswers = [0, 1, 2, 3].filter(i => i !== state.currentQuestionData.correct);
            highIndex = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        }
        let remainingPercent = 100;
        let highValue = 40 + Math.floor(Math.random() * 30);
        percentages[highIndex] = highValue;
        remainingPercent -= highValue;
        let otherIndices = [0, 1, 2, 3].filter(i => i !== highIndex);
        otherIndices.sort(() => Math.random() - 0.5);
        percentages[otherIndices[0]] = Math.floor(Math.random() * remainingPercent);
        remainingPercent -= percentages[otherIndices[0]];
        percentages[otherIndices[1]] = Math.floor(Math.random() * remainingPercent);
        remainingPercent -= percentages[otherIndices[1]];
        percentages[otherIndices[2]] = remainingPercent;
        bars.forEach((bar, index) => {
            const barLabel = bar.parentElement.querySelector('span');
            bar.style.height = `0%`;
            setTimeout(() => {
                bar.style.height = `${percentages[index]}%`;
                if (barLabel) barLabel.textContent = `${percentages[index]}%`;
            }, 100);
        });
        setTimeout(() => { elements.audienceChart.classList.add('hidden'); }, 4000);
    }
    
    function useFiftyFiftyJoker() {
        if (!state.jokers.fiftyFifty) return;
        state.jokers.fiftyFifty = false; updateJokerUI();
        const buttons = Array.from(elements.answerButtonsContainer.querySelectorAll('.answer-btn'));
        let wrongAnswers = buttons.filter(btn => parseInt(btn.dataset.index) !== state.currentQuestionData.correct);
        wrongAnswers.sort(() => Math.random() - 0.5);
        wrongAnswers[0].classList.add('hidden-by-joker');
        wrongAnswers[1].classList.add('hidden-by-joker');
    }

    function useDoubleAnswerJoker() {
        if (!state.jokers.double) return;
        alert(uiTexts[state.currentLanguage].jokerDouble + ' hakkı aktif! İlk cevabınız yanlış ise bir hak daha verilecek.');
    }

    function useSkipJoker() {
        if (!state.jokers.skip) return;
        clearInterval(state.timerInterval);
        state.jokers.skip = false; updateJokerUI();
        state.score += 25;
        handleCorrectAnswerFlow();
    }

    function handleClaimReward() {
        const milestone = state.totalQuestionIndex;
        const prizeMap = { 5: "Whopper Menu", 10: "1000 TL / 20 Euro Balance", 15: "5000 TL / 120 Euro Balance", 20: "20.000 TL / 500 Euro Cash" };
        const prizeWon = prizeMap[milestone];
        const userData = {
            firstName: elements.firstName.value, lastName: elements.lastName.value,
            email: elements.email.value, social: elements.social.value,
            gsm: elements.gsmInput.value, country: state.currentLanguage === 'en' ? elements.countrySelect.value : 'Turkey'
        };
        const mailBody = `Kyrosil x Burger King Yarışması Ödül Talebi\n------------------------------------------\nUlaşılan Kilometre Taşı: Soru ${milestone}\nKazanılan Ödül: ${prizeWon}\n------------------------------------------\nKullanıcı Bilgileri:\nAd: ${userData.firstName}\nSoyad: ${userData.lastName}\nE-posta: ${userData.email}\nSosyal Medya: ${userData.social}\nÜlke: ${userData.country}\nGSM No: ${userData.gsm}\n------------------------------------------\nTalep Tarihi: ${new Date().toLocaleString()}`;
        const subject = "Kyrosil x Burger King Ödül Başvurusu";
        const mailtoLink = `mailto:bkgift@kyrosil.eu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
        window.location.href = mailtoLink;
        elements.claimRewardBtn.classList.add('hidden');
        if (state.totalQuestionIndex >= 20) {
            endGame(true);
        } else {
            loadNextQuestion();
        }
    }

    async function main() {
        cacheDOMElements();
        
        elements.langTr.addEventListener('click', () => renderUIForLanguage('tr'));
        elements.langEn.addEventListener('click', () => renderUIForLanguage('en'));
        elements.startButton.addEventListener('click', startGame);
        elements.restartButton.addEventListener('click', () => location.reload());
        elements.jokerAudienceBtn.addEventListener('click', useAudienceJoker);
        elements.jokerFiftyBtn.addEventListener('click', useFiftyFiftyJoker);
        elements.jokerDoubleBtn.addEventListener('click', useDoubleAnswerJoker);
        elements.jokerSkipBtn.addEventListener('click', useSkipJoker);
        elements.claimRewardBtn.addEventListener('click', handleClaimReward);
        
        europeanCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            elements.countrySelect.appendChild(option);
        });

        try {
            await loadQuestions();
            renderUIForLanguage('tr');
        } catch(error) {
            console.error("Uygulama başlatılamadı:", error);
            document.body.innerHTML = "Oyun başlatılırken kritik bir hata oluştu.";
        }
    }

    main();
});
