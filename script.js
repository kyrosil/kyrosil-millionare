document.addEventListener('DOMContentLoaded', () => {
    // App nesnesi tüm oyun mantığını ve değişkenleri yönetecek
    const App = {
        // ---- HTML ELEMENTLERİ ---- //
        introScreen: null, gameScreen: null, endScreen: null, startButton: null,
        restartButton: null, langBtnTr: null, langBtnEn: null, countrySelect: null,
        gsmInput: null, legalConsentCheckbox: null, consentLabel: null,
        attemptsLeftDisplay: null, scoreDisplay: null, timerDisplay: null,
        questionCounterDisplay: null, progressBar: null, questionTextDisplay: null,
        answerButtonsContainer: null, resultTextDisplay: null, claimRewardBtn: null,
        jokerAudienceBtn: null, jokerFiftyBtn: null, jokerDoubleBtn: null, jokerSkipBtn: null,
        audienceChart: null, endTitle: null, finalScoreText: null, bkWebsiteLink: null,

        // ---- OYUN DEĞİŞKENLERİ ---- //
        allQuestions: {}, shuffledQuestionPools: {}, currentQuestionData: {},
        totalQuestionIndex: 0, score: 0, currentLanguage: 'tr',
        isDoubleAnswerActive: false, timerInterval: null,
        jokers: { audience: true, fiftyFifty: false, double: false, skip: false },

        // ---- METİN VE VERİLER ---- //
        uiTexts: {
            tr: {
                title: "Kyrosil ile Bil Kazan", subtitle: "Supported by Burger King", rulesTitle: "Oyun Kuralları",
                rulesDesc: "20 soruluk tarih maratonuna hoş geldiniz! Zorluğu giderek artan soruları ve zaman sınırını aşarak kilometre taşlarına ulaşın, muhteşem ödüller kazanın. 4 farklı joker hakkınız stratejinize güç katacak!",
                prizesTitle: "Ödüller", prize5: "<b>5. Soru:</b> Burger King'den Whopper Menü!", prize10: "<b>10. Soru:</b> BK'da geçerli 1000 TL / 20€ Bakiye!",
                prize15: "<b>15. Soru:</b> BK'da geçerli 5000 TL / 120€ Bakiye!", prize20: "<b>20. Soru:</b> 20.000 TL / 500€ Nakit Ödül!",
                langNotice: "Türkiye'den katılan yarışmacıların <b>Türkçe</b>, Avrupa'dan katılanların ise <b>İngilizce</b> dilini seçmesi ödül kazanımı için zorunludur.",
                firstName: "Adınız", lastName: "Soyadınız", email: "E-posta", social: "Sosyal Medya (Instagram veya EU Portal)",
                gsmTr: "Tıkla Gelsin'e Kayıtlı GSM Numaranız",
                consentTr: '<a href="#" target="_blank">KVKK Aydınlatma Metni\'ni</a> okudum, anladım ve kişisel verilerimin işlenmesini onaylıyorum.',
                startButton: "OYUNU BAŞLAT", score: "Puan", question: "Soru", correct: "Doğru!", wrong: "Yanlış!", timeUp: "Süre Doldu!",
                jokerAudience: "Seyirci", jokerFifty: "Yarı Yarıya", jokerDouble: "Çift Cevap", jokerSkip: "Pas Geç",
                claimReward: "Ödülünü Al!", congrats: "Tebrikler!", finalScore: "Final Puanınız", restartButton: "Yeniden Başla",
                endGameLost: "Neredeyse Başarıyordun!", bkWebsite: "Burger King Türkiye", noAttempts: "HAKKINIZ BİTTİ",
                comeback: "Yarın tekrar bekleriz!", attemptsLeft: "Bugünkü Katılım Hakkın:"
            },
            en: {
                title: "Know and Win with Kyrosil", subtitle: "Supported by Burger King", rulesTitle: "Game Rules",
                rulesDesc: "Welcome to the 20-question history marathon! Answer progressively harder questions correctly, pass milestones, and win amazing prizes. Your 4 different jokers will empower your strategy!",
                prizesTitle: "Prizes", prize5: "<b>Question 5:</b> A Whopper Menu from Burger King!", prize10: "<b>Question 10:</b> 1000 TL / 20€ Balance at BK!",
                prize15: "<b>Question 15:</b> 5000 TL / 120€ Balance at BK!", prize20: "<b>Question 20:</b> 20,000 TL / 500€ Cash Prize!",
                langNotice: "Participants from Turkey are required to select <b>Turkish</b>, and participants from Europe are required to select the <b>English</b> language to be eligible for prizes.",
                firstName: "First Name", lastName: "Last Name", email: "Email", social: "Social Media (Instagram or EU Portal)",
                gsmEn: "GSM Number Registered to Burger King App",
                consentEn: 'I have read and understood the <a href="#" target="_blank">GDPR Policy</a> and I consent to the processing of my personal data.',
                startButton: "START GAME", score: "Score", question: "Question", correct: "Correct!", wrong: "Wrong!", timeUp: "Time's Up!",
                jokerAudience: "Audience", jokerFifty: "50:50", jokerDouble: "Double Answer", jokerSkip: "Skip",
                claimReward: "Claim Your Prize!", congrats: "Congratulations!", finalScore: "Your Final Score", restartButton: "Restart Game",
                endGameLost: "Could Be Better!", bkWebsite: "Burger King Global", noAttempts: "NO ATTEMPTS LEFT",
                comeback: "Come back tomorrow!", attemptsLeft: "Attempts Left Today:"
            }
        },
        europeanCountries: ["Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City"],

        // ---- BAŞLATMA FONKSİYONU---- //
        async init() {
            this.cacheDOMElements();
            this.addEventListeners();
            this.populateCountries();
            try {
                await this.loadQuestions();
                this.renderUIForLanguage('tr');
            } catch (error) {
                console.error("Initialization failed:", error);
                document.body.innerHTML = "Oyun başlatılırken kritik bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
            }
        },

        cacheDOMElements() {
            this.introScreen = document.getElementById('intro-screen');
            this.gameScreen = document.getElementById('game-screen');
            this.endScreen = document.getElementById('end-screen');
            this.startButton = document.getElementById('start-button');
            this.restartButton = document.getElementById('restart-button');
            this.langBtnTr = document.getElementById('lang-tr');
            this.langBtnEn = document.getElementById('lang-en');
            this.countrySelect = document.getElementById('country-select');
            this.gsmInput = document.getElementById('gsm');
            this.legalConsentCheckbox = document.getElementById('legal-consent');
            this.consentLabel = document.querySelector('label[for="legal-consent"] span');
            this.attemptsLeftDisplay = document.getElementById('attempts-left');
            this.scoreDisplay = document.getElementById('score');
            this.timerDisplay = document.getElementById('timer');
            this.questionCounterDisplay = document.getElementById('question-counter');
            this.progressBar = document.getElementById('progress-bar');
            this.questionTextDisplay = document.getElementById('question-text');
            this.answerButtonsContainer = document.getElementById('answer-buttons');
            this.resultTextDisplay = document.getElementById('result-text');
            this.claimRewardBtn = document.getElementById('claim-reward-btn');
            this.jokerAudienceBtn = document.getElementById('joker-audience');
            this.jokerFiftyBtn = document.getElementById('joker-fifty');
            this.jokerDoubleBtn = document.getElementById('joker-double');
            this.jokerSkipBtn = document.getElementById('joker-skip');
            this.audienceChart = document.getElementById('audience-chart');
            this.endTitle = document.getElementById('end-title');
            this.finalScoreText = document.getElementById('final-score-text');
            this.bkWebsiteLink = document.querySelector('[data-lang-key="bkWebsite"]');
        },

        addEventListeners() {
            this.langBtnTr.addEventListener('click', () => this.renderUIForLanguage('tr'));
            this.langBtnEn.addEventListener('click', () => this.renderUIForLanguage('en'));
            this.startButton.addEventListener('click', () => this.startGame());
            this.restartButton.addEventListener('click', () => location.reload());
            this.jokerAudienceBtn.addEventListener('click', () => this.useAudienceJoker());
            this.jokerFiftyBtn.addEventListener('click', () => this.useFiftyFiftyJoker());
            this.jokerDoubleBtn.addEventListener('click', () => this.useDoubleAnswerJoker());
            this.jokerSkipBtn.addEventListener('click', () => this.useSkipJoker());
            this.claimRewardBtn.addEventListener('click', () => this.handleClaimReward());
        },
        
        async loadQuestions() {
            const response = await fetch('questions.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.allQuestions = await response.json();
        },

        populateCountries() {
            this.europeanCountries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                this.countrySelect.appendChild(option);
            });
        },

        renderUIForLanguage(lang) {
            this.currentLanguage = lang;
            const texts = this.uiTexts[this.currentLanguage];
            this.langBtnTr.classList.toggle('active', lang === 'tr');
            this.langBtnEn.classList.toggle('active', lang === 'en');
            document.title = texts.title;
            document.querySelectorAll('[data-lang-key]').forEach(el => {
                const key = el.dataset.langKey;
                if (texts[key]) el.innerHTML = texts[key];
            });
            document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
                const key = el.dataset.langPlaceholder;
                if (texts[key]) el.placeholder = texts[key];
            });
            this.countrySelect.classList.toggle('hidden', lang !== 'en');
            this.gsmInput.placeholder = lang === 'tr' ? texts.gsmTr : texts.gsmEn;
            this.consentLabel.innerHTML = lang === 'tr' ? texts.consentTr : texts.consentEn;
            this.bkWebsiteLink.href = lang === 'tr' ? "https://www.burgerking.com.tr/" : "https://www.bk.com/";
            this.checkDailyAttempts();
        },
        
        checkDailyAttempts() {
            const today = new Date().toISOString().slice(0, 10);
            let attemptsData = JSON.parse(localStorage.getItem('kyrosilQuizData')) || { date: today, count: 0 };
            if (attemptsData.date !== today) {
                attemptsData = { date: today, count: 0 };
                localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
            }
            const attemptsLeft = 3 - attemptsData.count;
            this.attemptsLeftDisplay.textContent = `${this.uiTexts[this.currentLanguage].attemptsLeft} ${attemptsLeft}/3`;
            this.startButton.disabled = attemptsLeft <= 0;
            if (attemptsLeft <= 0) {
                this.startButton.textContent = this.uiTexts[this.currentLanguage].noAttempts;
                this.attemptsLeftDisplay.textContent = this.uiTexts[this.currentLanguage].comeback;
            } else {
                this.startButton.textContent = this.uiTexts[this.currentLanguage].startButton;
            }
        },

        startGame() {
            if (this.startButton.disabled) return;
            if (!this.validateForm()) return;
            this.recordAttempt();
            this.shuffleAllPools();
            this.introScreen.classList.remove('active');
            this.gameScreen.classList.add('active');
            this.resetGameState();
            this.loadNextQuestion();
        },
        
        validateForm() {
            const inputs = [document.getElementById('firstName'), document.getElementById('lastName'), document.getElementById('email'), document.getElementById('social'), this.gsmInput];
            if (this.currentLanguage === 'en' && !this.countrySelect.value) {
                alert('Please select your country.');
                return false;
            }
            for (let input of inputs) {
                if (!input.value.trim()) {
                    alert(this.currentLanguage === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.');
                    return false;
                }
            }
            if (!this.legalConsentCheckbox.checked) {
                alert(this.currentLanguage === 'tr' ? 'Lütfen yasal koşulları onaylayın.' : 'Please accept the legal terms.');
                return false;
            }
            return true;
        },

        recordAttempt() {
            let attemptsData = JSON.parse(localStorage.getItem('kyrosilQuizData'));
            attemptsData.count++;
            localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
            this.checkDailyAttempts();
        },
        
        shuffleAllPools() {
            this.shuffledQuestionPools = {};
            for (const levelKey in this.allQuestions) {
                if (this.allQuestions.hasOwnProperty(levelKey)) {
                    const pool = this.allQuestions[levelKey]?.[this.currentLanguage];
                    if (pool && Array.isArray(pool)) {
                        this.shuffledQuestionPools[levelKey] = [...pool].sort(() => Math.random() - 0.5);
                    }
                }
            }
        },
        
        resetGameState() {
            this.score = 0;
            this.totalQuestionIndex = 0;
            this.jokers = { audience: true, fiftyFifty: false, double: false, skip: false };
            this.updateJokerUI();
        },

        loadNextQuestion() {
            clearInterval(this.timerInterval);
            this.claimRewardBtn.classList.add('hidden');
            this.isDoubleAnswerActive = false;
            const level = Math.floor(this.totalQuestionIndex / 5) + 1;
            const questionInLevelIndex = this.totalQuestionIndex % 5;
            const levelKey = `seviye${level}`;
            this.currentQuestionData = this.shuffledQuestionPools[levelKey]?.[questionInLevelIndex];
            if (!this.currentQuestionData) {
                this.endGame(this.totalQuestionIndex >= 20);
                return;
            }
            this.displayQuestion();
            this.updateHUD();
            this.startTimer();
        },
        
        displayQuestion() {
            this.questionTextDisplay.textContent = this.currentQuestionData.question;
            this.answerButtonsContainer.innerHTML = '';
            this.resultTextDisplay.textContent = '';
            this.audienceChart.classList.add('hidden');
            this.currentQuestionData.answers.forEach((answer, index) => {
                const button = document.createElement('button');
                button.innerHTML = answer;
                button.classList.add('answer-btn');
                button.dataset.index = index;
                button.addEventListener('click', () => this.selectAnswer(parseInt(button.dataset.index)));
                this.answerButtonsContainer.appendChild(button);
            });
        },
        
        selectAnswer(selectedIndex) {
            clearInterval(this.timerInterval);
            const isCorrect = selectedIndex === this.currentQuestionData.correct;
            if (this.isDoubleAnswerActive) { this.handleSecondAnswer(selectedIndex); return; }
            if (this.jokers.double && !isCorrect) {
                this.isDoubleAnswerActive = true;
                this.jokers.double = false;
                this.updateJokerUI();
                const buttons = this.answerButtonsContainer.querySelectorAll('.answer-btn');
                buttons[selectedIndex].classList.add('wrong');
                buttons[selectedIndex].disabled = true;
                return;
            }
            this.revealAnswers(selectedIndex);
            this.resultTextDisplay.textContent = isCorrect ? this.uiTexts[this.currentLanguage].correct : this.uiTexts[this.currentLanguage].wrong;
            if (isCorrect) this.score += 50;
            setTimeout(() => {
                if (isCorrect) { this.handleCorrectAnswerFlow(); } else { this.endGame(false); }
            }, 2000);
        },
        
        handleSecondAnswer(selectedIndex) {
            const isCorrect = selectedIndex === this.currentQuestionData.correct;
            this.revealAnswers(selectedIndex);
            this.resultTextDisplay.textContent = isCorrect ? this.uiTexts[this.currentLanguage].correct : this.uiTexts[this.currentLanguage].wrong;
            if (isCorrect) this.score += 50;
            setTimeout(() => {
                if (isCorrect) { this.handleCorrectAnswerFlow(); } else { this.endGame(false); }
            }, 2000);
        },

        revealAnswers(selectedIndex) {
            const buttons = this.answerButtonsContainer.querySelectorAll('.answer-btn');
            buttons.forEach((btn, idx) => {
                btn.disabled = true;
                if (idx === this.currentQuestionData.correct) {
                    btn.classList.add('correct');
                } else if (idx === selectedIndex) {
                    btn.classList.add('wrong');
                }
            });
        },

        handleCorrectAnswerFlow() {
            this.totalQuestionIndex++;
            const milestone = this.totalQuestionIndex;
            if (milestone === 20) {
                this.claimRewardBtn.classList.remove('hidden');
            } else if (milestone === 5 || milestone === 10 || milestone === 15) {
                if (milestone === 5) this.jokers.double = true;
                if (milestone === 10) this.jokers.fiftyFifty = true;
                if (milestone === 15) this.jokers.skip = true;
                this.updateJokerUI();
                this.claimRewardBtn.classList.remove('hidden');
            } else {
                this.loadNextQuestion();
            }
        },
        
        updateHUD() {
            this.scoreDisplay.textContent = `${this.uiTexts[this.currentLanguage].score}: ${this.score}`;
            this.questionCounterDisplay.textContent = `${this.uiTexts[this.currentLanguage].question} ${Math.min(this.totalQuestionIndex + 1, 20)}/20`;
            this.progressBar.style.width = `${((this.totalQuestionIndex) / 20) * 100}%`;
        },

        endGame(isWinner) {
            clearInterval(this.timerInterval);
            this.gameScreen.classList.remove('active');
            this.endScreen.classList.add('active');
            this.endTitle.textContent = (this.totalQuestionIndex < 5 && !isWinner) ? this.uiTexts[this.currentLanguage].endGameLost : this.uiTexts[this.currentLanguage].congrats;
            this.finalScoreText.textContent = `${this.uiTexts[this.currentLanguage].finalScore}: ${this.score}`;
        },

        updateJokerUI() {
            this.jokerAudienceBtn.disabled = !this.jokers.audience;
            this.jokerFiftyBtn.disabled = !this.jokers.fiftyFifty;
            this.jokerDoubleBtn.disabled = !this.jokers.double;
            this.jokerSkipBtn.disabled = !this.jokers.skip;
        },
        
        startTimer() {
            clearInterval(this.timerInterval);
            const level = Math.floor(this.totalQuestionIndex / 5);
            const timeMap = [60, 90, 120, 150];
            let timeLeft = timeMap[level];
            this.timerDisplay.classList.remove('low-time');
            const updateTimerDisplay = () => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                if (timeLeft <= 10 && timeLeft > 0) {
                    this.timerDisplay.classList.add('low-time');
                } else {
                    this.timerDisplay.classList.remove('low-time');
                }
            };
            updateTimerDisplay();
            this.timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft < 0) {
                    clearInterval(this.timerInterval);
                    this.handleTimeUp();
                }
            }, 1000);
        },
        
        handleTimeUp() {
            this.resultTextDisplay.textContent = this.uiTexts[this.currentLanguage].timeUp;
            this.revealAnswers(-1);
            setTimeout(() => this.endGame(false), 2000);
        },

        useAudienceJoker() {
            if (!this.jokers.audience) return;
            this.jokers.audience = false; this.updateJokerUI();
            this.audienceChart.classList.remove('hidden');
            const bars = this.audienceChart.querySelectorAll('.bar-container .bar');
            let percentages = [0, 0, 0, 0];
            const isLucky = Math.random() < 0.95;
            let highIndex = this.currentQuestionData.correct;
            if (!isLucky) {
                let wrongAnswers = [0, 1, 2, 3].filter(i => i !== this.currentQuestionData.correct);
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
            setTimeout(() => { this.audienceChart.classList.add('hidden'); }, 4000);
        },
        
        useFiftyFiftyJoker() {
            if (!this.jokers.fiftyFifty) return;
            this.jokers.fiftyFifty = false; this.updateJokerUI();
            const buttons = Array.from(this.answerButtonsContainer.querySelectorAll('.answer-btn'));
            let wrongAnswers = [];
            buttons.forEach((btn) => {
                if (parseInt(btn.dataset.index) !== this.currentQuestionData.correct) {
                    wrongAnswers.push(btn);
                }
            });
            wrongAnswers.sort(() => Math.random() - 0.5);
            wrongAnswers[0].classList.add('hidden-by-joker');
            wrongAnswers[1].classList.add('hidden-by-joker');
        },
    
        useDoubleAnswerJoker() {
            if (!this.jokers.double) return;
            alert(this.currentLanguage === 'tr' ? 'Çift Cevap hakkı aktif! İlk cevabınız yanlış ise bir hak daha verilecek.' : 'Double Answer joker is active! If your first answer is wrong, you will get a second chance.');
        },
    
        useSkipJoker() {
            if (!this.jokers.skip) return;
            clearInterval(this.timerInterval);
            this.jokers.skip = false; this.updateJokerUI();
            this.score += 25;
            this.handleCorrectAnswerFlow();
        },
    
        handleClaimReward() {
            const milestone = this.totalQuestionIndex;
            const prizeMap = { 5: "Whopper Menu", 10: "1000 TL / 20 Euro Balance", 15: "5000 TL / 120 Euro Balance", 20: "20.000 TL / 500 Euro Cash" };
            const prizeWon = prizeMap[milestone];
            const userData = {
                firstName: document.getElementById('firstName').value, lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value, social: document.getElementById('social').value,
                gsm: this.gsmInput.value, country: this.currentLanguage === 'en' ? this.countrySelect.value : 'Turkey'
            };
            const mailBody = `Kyrosil x Burger King Yarışması Ödül Talebi\n------------------------------------------\nUlaşılan Kilometre Taşı: Soru ${milestone}\nKazanılan Ödül: ${prizeWon}\n------------------------------------------\nKullanıcı Bilgileri:\nAd: ${userData.firstName}\nSoyad: ${userData.lastName}\nE-posta: ${userData.email}\nSosyal Medya: ${userData.social}\nÜlke: ${userData.country}\nGSM No: ${userData.gsm}\n------------------------------------------\nTalep Tarihi: ${new Date().toLocaleString()}`;
            const subject = "Kyrosil x Burger King Ödül Başvurusu";
            const mailtoLink = `mailto:bkgift@kyrosil.eu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
            window.location.href = mailtoLink;
            this.claimRewardBtn.classList.add('hidden');
            if (this.totalQuestionIndex >= 20) {
                this.endGame(true);
            } else {
                this.loadNextQuestion();
            }
        }
    };

    // ---- UYGULAMAYI BAŞLAT ---- //
    App.init();
});
