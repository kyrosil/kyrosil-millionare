document.addEventListener('DOMContentLoaded', () => {

    const App = {
        // Değişkenler ve sabitler burada tanımlanır
        elements: {},
        state: {
            allQuestions: {},
            shuffledQuestionPools: {},
            currentQuestionData: {},
            totalQuestionIndex: 0,
            score: 0,
            currentLanguage: 'tr',
            isDoubleAnswerActive: false,
            timerInterval: null,
            jokers: { audience: true, fiftyFifty: false, double: false, skip: false }
        },
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

        // ---- BAŞLATMA FONKSİYONU ---- //
        async init() {
            this.cacheDOMElements();
            this.addEventListeners();
            this.populateCountries();
            try {
                await this.loadQuestions();
                this.renderUIForLanguage('tr'); // Başlangıç dili
            } catch (error) {
                console.error("Initialization failed:", error);
                document.body.innerHTML = "Oyun başlatılırken kritik bir hata oluştu.";
            }
        },
        
        // GÜVENLİK GÜNCELLEMESİ: Elementler sadece ihtiyaç anında bulunur.
        cacheDOMElements() {
            const ids = [
                'intro-screen', 'game-screen', 'end-screen', 'start-button',
                'restart-button', 'lang-tr', 'lang-en', 'country-select', 'gsm',
                'legal-consent', 'attempts-left', 'score', 'timer',
                'question-counter', 'progress-bar', 'question-text',
                'answer-buttons', 'result-text', 'claim-reward-btn',
                'joker-audience', 'joker-fifty', 'joker-double', 'joker-skip',
                'audience-chart', 'end-title', 'final-score-text'
            ];
            ids.forEach(id => {
                // ID'yi camelCase'e çevir (örn: intro-screen -> introScreen)
                const camelCaseId = id.replace(/-([a-z])/g, g => g[1].toUpperCase());
                this.elements[camelCaseId] = document.getElementById(id);
            });
            // QuerySelector ile seçilenler
            this.elements.consentLabel = document.querySelector('label[for="legal-consent"] span');
            this.elements.bkWebsiteLink = document.querySelector('[data-lang-key="bkWebsite"]');
        },

        addEventListeners() {
            // GÜVENLİK GÜNCELLEMESİ: Listener'lar atanmadan önce elementin varlığı kontrol edilir.
            const addSafeListener = (id, event, handler) => {
                const element = this.elements[id];
                if (element) {
                    element.addEventListener(event, handler);
                } else {
                    console.error(`Hata: '${id}' ID'li element bulunamadı.`);
                }
            };
            
            addSafeListener('langTr', 'click', () => this.renderUIForLanguage('tr'));
            addSafeListener('langEn', 'click', () => this.renderUIForLanguage('en'));
            addSafeListener('startButton', 'click', () => this.startGame());
            addSafeListener('restartButton', 'click', () => location.reload());
            addSafeListener('jokerAudienceBtn', 'click', () => this.useAudienceJoker());
            addSafeListener('jokerFiftyBtn', 'click', () => this.useFiftyFiftyJoker());
            addSafeListener('jokerDoubleBtn', 'click', () => this.useDoubleAnswerJoker());
            addSafeListener('jokerSkipBtn', 'click', () => this.useSkipJoker());
            addSafeListener('claimRewardBtn', 'click', () => this.handleClaimReward());
        },
        
        async loadQuestions() {
            const response = await fetch('questions.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.state.allQuestions = await response.json();
        },

        populateCountries() {
            this.europeanCountries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                this.elements.countrySelect.appendChild(option);
            });
        },

        renderUIForLanguage(lang) {
            this.state.currentLanguage = lang;
            const texts = this.uiTexts[this.state.currentLanguage];
            this.elements.langTr.classList.toggle('active', lang === 'tr');
            this.elements.langEn.classList.toggle('active', lang === 'en');
            document.title = texts.title;
            document.querySelectorAll('[data-lang-key]').forEach(el => {
                const key = el.dataset.langKey;
                if (texts[key]) el.innerHTML = texts[key];
            });
            document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
                const key = el.dataset.langPlaceholder;
                if (texts[key]) el.placeholder = texts[key];
            });
            this.elements.countrySelect.classList.toggle('hidden', lang !== 'en');
            this.elements.gsmInput.placeholder = lang === 'tr' ? texts.gsmTr : texts.gsmEn;
            this.elements.consentLabel.innerHTML = lang === 'tr' ? texts.consentTr : texts.consentEn;
            this.elements.bkWebsiteLink.href = lang === 'tr' ? "https://www.burgerking.com.tr/" : "https://www.bk.com/";
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
            const lang = this.state.currentLanguage;
            this.elements.attemptsLeftDisplay.textContent = `${this.uiTexts[lang].attemptsLeft} ${attemptsLeft}/3`;
            this.elements.startButton.disabled = attemptsLeft <= 0;
            if (attemptsLeft <= 0) {
                this.elements.startButton.textContent = this.uiTexts[lang].noAttempts;
                this.elements.attemptsLeftDisplay.textContent = this.uiTexts[lang].comeback;
            } else {
                this.elements.startButton.textContent = this.uiTexts[lang].startButton;
            }
        },

        recordAttempt() {
            const today = new Date().toISOString().slice(0, 10);
            // GÜVENLİK GÜNCELLEMESİ: Veri okunmadan önce varlığı ve doğruluğu kontrol edilir.
            let attemptsData = JSON.parse(localStorage.getItem('kyrosilQuizData'));
            if (!attemptsData || attemptsData.date !== today) {
                attemptsData = { date: today, count: 0 };
            }
            attemptsData.count++;
            localStorage.setItem('kyrosilQuizData', JSON.stringify(attemptsData));
            this.checkDailyAttempts();
        },

        startGame() {
            if (this.elements.startButton.disabled) return;
            if (!this.validateForm()) return;
            this.recordAttempt();
            this.shuffleAllPools();
            this.elements.introScreen.classList.remove('active');
            this.elements.gameScreen.classList.add('active');
            this.resetGameState();
            this.loadNextQuestion();
        },
        
        // ...Diğer tüm fonksiyonlar aynı mantıkla devam eder...
        // Sadece global değişkenler yerine `this.elements` ve `this.state` kullanılır.
        
        shuffleAllPools() {
            this.state.shuffledQuestionPools = {};
            for (const levelKey in this.state.allQuestions) {
                if (this.state.allQuestions.hasOwnProperty(levelKey)) {
                    const pool = this.state.allQuestions[levelKey]?.[this.state.currentLanguage];
                    if (pool && Array.isArray(pool)) {
                        this.state.shuffledQuestionPools[levelKey] = [...pool].sort(() => Math.random() - 0.5);
                    }
                }
            }
        },

        resetGameState() {
            this.state.score = 0;
            this.state.totalQuestionIndex = 0;
            this.state.jokers = { audience: true, fiftyFifty: false, double: false, skip: false };
            this.updateJokerUI();
        },

        loadNextQuestion() {
            clearInterval(this.state.timerInterval);
            this.elements.claimRewardBtn.classList.add('hidden');
            this.state.isDoubleAnswerActive = false;
            const level = Math.floor(this.state.totalQuestionIndex / 5) + 1;
            const questionInLevelIndex = this.state.totalQuestionIndex % 5;
            const levelKey = `seviye${level}`;
            this.state.currentQuestionData = this.state.shuffledQuestionPools[levelKey]?.[questionInLevelIndex];
            if (!this.state.currentQuestionData) {
                this.endGame(this.state.totalQuestionIndex >= 20);
                return;
            }
            this.displayQuestion();
            this.updateHUD();
            this.startTimer();
        },

        displayQuestion() {
            const { question, answers } = this.state.currentQuestionData;
            this.elements.questionTextDisplay.textContent = question;
            this.elements.answerButtonsContainer.innerHTML = '';
            this.elements.resultTextDisplay.textContent = '';
            this.elements.audienceChart.classList.add('hidden');
            answers.forEach((answer, index) => {
                const button = document.createElement('button');
                button.innerHTML = answer;
                button.classList.add('answer-btn');
                button.dataset.index = index;
                button.addEventListener('click', () => this.selectAnswer(index));
                this.elements.answerButtonsContainer.appendChild(button);
            });
        },

        selectAnswer(selectedIndex) {
            clearInterval(this.state.timerInterval);
            const isCorrect = selectedIndex === this.state.currentQuestionData.correct;
            if (this.state.isDoubleAnswerActive) { this.handleSecondAnswer(selectedIndex); return; }
            if (this.state.jokers.double && !isCorrect) {
                this.state.isDoubleAnswerActive = true;
                this.state.jokers.double = false;
                this.updateJokerUI();
                const buttons = this.elements.answerButtonsContainer.querySelectorAll('.answer-btn');
                buttons[selectedIndex].classList.add('wrong');
                buttons[selectedIndex].disabled = true;
                return;
            }
            this.revealAnswers(selectedIndex);
            const lang = this.state.currentLanguage;
            this.elements.resultTextDisplay.textContent = isCorrect ? this.uiTexts[lang].correct : this.uiTexts[lang].wrong;
            if (isCorrect) this.state.score += 50;
            setTimeout(() => {
                if (isCorrect) { this.handleCorrectAnswerFlow(); } else { this.endGame(false); }
            }, 2000);
        },

        handleSecondAnswer(selectedIndex) {
            const isCorrect = selectedIndex === this.state.currentQuestionData.correct;
            this.revealAnswers(selectedIndex);
            const lang = this.state.currentLanguage;
            this.elements.resultTextDisplay.textContent = isCorrect ? this.uiTexts[lang].correct : this.uiTexts[lang].wrong;
            if (isCorrect) this.state.score += 50;
            setTimeout(() => {
                if (isCorrect) { this.handleCorrectAnswerFlow(); } else { this.endGame(false); }
            }, 2000);
        },

        revealAnswers(selectedIndex) {
            const buttons = this.elements.answerButtonsContainer.querySelectorAll('.answer-btn');
            buttons.forEach((btn, idx) => {
                btn.disabled = true;
                if (idx === this.state.currentQuestionData.correct) {
                    btn.classList.add('correct');
                } else if (idx === selectedIndex) {
                    btn.classList.add('wrong');
                }
            });
        },

        handleCorrectAnswerFlow() {
            this.state.totalQuestionIndex++;
            const milestone = this.state.totalQuestionIndex;
            if (milestone === 20) {
                this.elements.claimRewardBtn.classList.remove('hidden');
            } else if (milestone === 5 || milestone === 10 || milestone === 15) {
                if (milestone === 5) this.state.jokers.double = true;
                if (milestone === 10) this.state.jokers.fiftyFifty = true;
                if (milestone === 15) this.state.jokers.skip = true;
                this.updateJokerUI();
                this.elements.claimRewardBtn.classList.remove('hidden');
            } else {
                this.loadNextQuestion();
            }
        },

        updateHUD() {
            const lang = this.state.currentLanguage;
            this.elements.scoreDisplay.textContent = `${this.uiTexts[lang].score}: ${this.state.score}`;
            this.elements.questionCounterDisplay.textContent = `${this.uiTexts[lang].question} ${Math.min(this.state.totalQuestionIndex + 1, 20)}/20`;
            this.elements.progressBar.style.width = `${((this.state.totalQuestionIndex) / 20) * 100}%`;
        },

        endGame(isWinner) {
            clearInterval(this.state.timerInterval);
            this.elements.gameScreen.classList.remove('active');
            this.elements.endScreen.classList.add('active');
            const lang = this.state.currentLanguage;
            this.elements.endTitle.textContent = (this.state.totalQuestionIndex < 5 && !isWinner) ? this.uiTexts[lang].endGameLost : this.uiTexts[lang].congrats;
            this.elements.finalScoreText.textContent = `${this.uiTexts[lang].finalScore}: ${this.state.score}`;
        },

        updateJokerUI() {
            this.elements.jokerAudienceBtn.disabled = !this.state.jokers.audience;
            this.elements.jokerFiftyBtn.disabled = !this.state.jokers.fiftyFifty;
            this.elements.jokerDoubleBtn.disabled = !this.state.jokers.double;
            this.elements.jokerSkipBtn.disabled = !this.state.jokers.skip;
        },

        startTimer() {
            clearInterval(this.state.timerInterval);
            const level = Math.floor(this.state.totalQuestionIndex / 5);
            const timeMap = [60, 90, 120, 150];
            let timeLeft = timeMap[level];
            this.elements.timerDisplay.classList.remove('low-time');
            const updateTimerDisplay = () => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                this.elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                if (timeLeft <= 10 && timeLeft > 0) {
                    this.elements.timerDisplay.classList.add('low-time');
                } else {
                    this.elements.timerDisplay.classList.remove('low-time');
                }
            };
            updateTimerDisplay();
            this.state.timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft < 0) {
                    clearInterval(this.state.timerInterval);
                    this.handleTimeUp();
                }
            }, 1000);
        },

        handleTimeUp() {
            this.elements.resultTextDisplay.textContent = this.uiTexts[this.state.currentLanguage].timeUp;
            this.revealAnswers(-1);
            setTimeout(() => this.endGame(false), 2000);
        },

        useAudienceJoker() {
            if (!this.state.jokers.audience) return;
            this.state.jokers.audience = false; this.updateJokerUI();
            this.elements.audienceChart.classList.remove('hidden');
            const bars = this.elements.audienceChart.querySelectorAll('.bar-container .bar');
            let percentages = [0, 0, 0, 0];
            const isLucky = Math.random() < 0.95;
            let highIndex = this.state.currentQuestionData.correct;
            if (!isLucky) {
                let wrongAnswers = [0, 1, 2, 3].filter(i => i !== this.state.currentQuestionData.correct);
                highIndex = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
            }
            let remainingPercent = 100, highValue = 40 + Math.floor(Math.random() * 30);
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
            setTimeout(() => { this.elements.audienceChart.classList.add('hidden'); }, 4000);
        },
        
        useFiftyFiftyJoker() {
            if (!this.state.jokers.fiftyFifty) return;
            this.state.jokers.fiftyFifty = false; this.updateJokerUI();
            const buttons = Array.from(this.elements.answerButtonsContainer.querySelectorAll('.answer-btn'));
            let wrongAnswers = buttons.filter(btn => parseInt(btn.dataset.index) !== this.state.currentQuestionData.correct);
            wrongAnswers.sort(() => Math.random() - 0.5);
            wrongAnswers[0].classList.add('hidden-by-joker');
            wrongAnswers[1].classList.add('hidden-by-joker');
        },
    
        useDoubleAnswerJoker() {
            if (!this.state.jokers.double) return;
            alert(this.uiTexts[this.state.currentLanguage].jokerDouble + ' hakkı aktif! İlk cevabınız yanlış ise bir hak daha verilecek.');
        },
    
        useSkipJoker() {
            if (!this.state.jokers.skip) return;
            clearInterval(this.state.timerInterval);
            this.state.jokers.skip = false; this.updateJokerUI();
            this.state.score += 25;
            this.handleCorrectAnswerFlow();
        },
    
        handleClaimReward() {
            const milestone = this.state.totalQuestionIndex;
            const prizeMap = { 5: "Whopper Menu", 10: "1000 TL / 20 Euro Balance", 15: "5000 TL / 120 Euro Balance", 20: "20.000 TL / 500 Euro Cash" };
            const prizeWon = prizeMap[milestone];
            const userData = {
                firstName: this.elements.firstName.value, lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value, social: document.getElementById('social').value,
                gsm: this.elements.gsmInput.value, country: this.state.currentLanguage === 'en' ? this.elements.countrySelect.value : 'Turkey'
            };
            const mailBody = `Kyrosil x Burger King Yarışması Ödül Talebi\n------------------------------------------\nUlaşılan Kilometre Taşı: Soru ${milestone}\nKazanılan Ödül: ${prizeWon}\n------------------------------------------\nKullanıcı Bilgileri:\nAd: ${userData.firstName}\nSoyad: ${userData.lastName}\nE-posta: ${userData.email}\nSosyal Medya: ${userData.social}\nÜlke: ${userData.country}\nGSM No: ${userData.gsm}\n------------------------------------------\nTalep Tarihi: ${new Date().toLocaleString()}`;
            const subject = "Kyrosil x Burger King Ödül Başvurusu";
            const mailtoLink = `mailto:bkgift@kyrosil.eu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
            window.location.href = mailtoLink;
            this.elements.claimRewardBtn.classList.add('hidden');
            if (this.state.totalQuestionIndex >= 20) {
                this.endGame(true);
            } else {
                this.loadNextQuestion();
            }
        }
    };

    // ---- UYGULAMAYI BAŞLAT ---- //
    App.init();
});
