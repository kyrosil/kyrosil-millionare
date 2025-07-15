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
    
    // HUD
    const scoreDisplay = document.getElementById('score');
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

    // Footer
    const bkWebsiteLink = document.querySelector('[data-lang-key="bkWebsite"]');

    // ---- OYUN DEĞİŞKENLERİ ---- //
    let allQuestions = {};
    let currentLevelPool = [];
    let currentQuestionData = {};
    let questionIndexInLevel = 0;
    let totalQuestionIndex = 0;
    let score = 0;
    let currentLanguage = 'tr';
    let doubleAnswerUsed = false;

    let jokers = {
        audience: true, fiftyFifty: false,
        double: false, skip: false
    };

    // ---- DİL VE METİN VERİLERİ ---- //
    const uiTexts = {
        tr: {
            title: "Kyrosil ile Bil Kazan", subtitle: "Supported by Burger King",
            rulesTitle: "Oyun Kuralları",
            rulesDesc: "20 soruluk tarih maratonuna hoş geldiniz! Zorluğu giderek artan soruları doğru yanıtlayın, kilometre taşlarını aşın ve muhteşem ödüller kazanın. 4 farklı joker hakkınız stratejinize güç katacak!",
            prizesTitle: "Ödüller",
            prize5: "<b>5. Soru:</b> Burger King'den Whopper Menü!",
            prize10: "<b>10. Soru:</b> BK'da geçerli 1000 TL / 20€ Bakiye!",
            prize15: "<b>15. Soru:</b> BK'da geçerli 5000 TL / 120€ Bakiye!",
            prize20: "<b>20. Soru:</b> 20.000 TL / 500€ Nakit Ödül!",
            langNotice: "Türkiye'den katılan yarışmacıların <b>Türkçe</b>, Avrupa'dan katılanların ise <b>İngilizce</b> dilini seçmesi ödül kazanımı için zorunludur.",
            firstName: "Adınız", lastName: "Soyadınız", email: "E-posta", social: "Sosyal Medya (Instagram vb.)",
            gsmTr: "Tıkla Gelsin'e Kayıtlı GSM Numaranız",
            consentTr: '<a href="#" target="_blank">KVKK Aydınlatma Metni\'ni</a> okudum, anladım ve kişisel verilerimin işlenmesini onaylıyorum.',
            startButton: "OYUNU BAŞLAT",
            score: "Puan", question: "Soru",
            correct: "Doğru!", wrong: "Yanlış!",
            jokerAudience: "Seyirci", jokerFifty: "Yarı Yarıya", jokerDouble: "Çift Cevap", jokerSkip: "Pas Geç",
            claimReward: "Ödülünü Al!",
            congrats: "Tebrikler!", finalScore: "Final Puanınız", restartButton: "Yeniden Başla",
            bkWebsite: "Burger King Türkiye"
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
            firstName: "First Name", lastName: "Last Name", email: "Email", social: "Social Media (e.g., Instagram)",
            gsmEn: "GSM Number Registered to Burger King App",
            consentEn: 'I have read and understood the <a href="#" target="_blank">GDPR Policy</a> and I consent to the processing of my personal data.',
            startButton: "START GAME",
            score: "Score", question: "Question",
            correct: "Correct!", wrong: "Wrong!",
            jokerAudience: "Audience", jokerFifty: "50:50", jokerDouble: "Double Answer", jokerSkip: "Skip",
            claimReward: "Claim Your Prize!",
            congrats: "Congratulations!", finalScore: "Your Final Score", restartButton: "Restart Game",
            bkWebsite: "Burger King Global"
        }
    };

    const europeanCountries = ["Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City"];

    // ---- ANA FONKSİYONLAR ---- //
    
    // Başlangıç
    async function init() {
        populateCountries();
        await loadQuestions();
        updateLanguageUI();
        addEventListeners();
    }

    // Event Listeners
    function addEventListeners() {
        langToggleButton.addEventListener('click', toggleLanguage);
        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', () => location.reload()); // En basit yeniden başlatma
        jokerAudienceBtn.addEventListener('click', useAudienceJoker);
        jokerFiftyBtn.addEventListener('click', useFiftyFiftyJoker);
        jokerDoubleBtn.addEventListener('click', useDoubleAnswerJoker);
        jokerSkipBtn.addEventListener('click', useSkipJoker);
        claimRewardBtn.addEventListener('click', handleClaimReward);
    }
    
    // Dil ve UI Güncellemeleri
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
        updateLanguageUI();
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

        // Dile özel form elemanları
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

    // Soru Yönetimi
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            allQuestions = await response.json();
        } catch (error) {
            console.error("Sorular yüklenemedi:", error);
        }
    }

    // Oyun Akışı
    function startGame() {
        if (!validateForm()) return;
        
        introScreen.classList.remove('active');
        gameScreen.classList.add('active');
        
        resetGameState();
        loadNextQuestion();
    }

    function validateForm() {
        const inputs = [
            document.getElementById('firstName'),
            document.getElementById('lastName'),
            document.getElementById('email'),
            document.getElementById('social'),
            gsmInput
        ];
        if (currentLanguage === 'en') {
            inputs.push(countrySelect);
        }
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
        questionIndexInLevel = 0;
        jokers = { audience: true, fiftyFifty: false, double: false, skip: false };
        updateJokerUI();
    }
    
    function loadNextQuestion() {
        claimRewardBtn.classList.add('hidden');
        doubleAnswerUsed = false;
        
        const level = Math.floor(totalQuestionIndex / 5) + 1;
        const levelKey = `seviye${level}`;
        
        if (!allQuestions[levelKey]) {
            endGame();
            return;
        }
        
        currentLevelPool = allQuestions[levelKey][currentLanguage];
        // Basitlik için seviye içindeki soruları sırayla alıyoruz, isterseniz burası rastgele yapılabilir.
        currentQuestionData = currentLevelPool[questionIndexInLevel];

        if (!currentQuestionData) {
            endGame(); // Seviyedeki sorular bittiyse oyunu bitir.
            return;
        }
        
        displayQuestion();
        updateHUD();
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
            button.addEventListener('click', () => selectAnswer(index));
            answerButtonsContainer.appendChild(button);
        });
    }

    function selectAnswer(selectedIndex) {
        if (doubleAnswerUsed) {
            handleSecondAnswer(selectedIndex);
            return;
        }

        const isCorrect = selectedIndex === currentQuestionData.correct;
        const buttons = answerButtonsContainer.querySelectorAll('.answer-btn');

        if (jokers.double && !isCorrect) {
            doubleAnswerUsed = true;
            buttons[selectedIndex].classList.add('wrong');
            buttons[selectedIndex].disabled = true;
            jokers.double = false; // Joker kullanıldı
            updateJokerUI();
            return; // İkinci cevabı bekle
        }

        revealAnswers(selectedIndex);
        
        if (isCorrect) {
            score += 50; // Her soru 50 puan
            resultTextDisplay.textContent = uiTexts[currentLanguage].correct;
            resultTextDisplay.classList.add('correct');
        } else {
            resultTextDisplay.textContent = uiTexts[currentLanguage].wrong;
            resultTextDisplay.classList.add('wrong');
        }

        setTimeout(() => {
            if (isCorrect) {
                handleCorrectAnswerFlow();
            } else {
                endGame(); // Yanlış cevapta oyun biter.
            }
        }, 2000);
    }

    function handleSecondAnswer(selectedIndex) {
        const isCorrect = selectedIndex === currentQuestionData.correct;
        revealAnswers(selectedIndex);
         if (isCorrect) {
            score += 50;
            resultTextDisplay.textContent = uiTexts[currentLanguage].correct;
            resultTextDisplay.classList.add('correct');
        } else {
            resultTextDisplay.textContent = uiTexts[currentLanguage].wrong;
            resultTextDisplay.classList.add('wrong');
        }
        setTimeout(() => {
             if (isCorrect) {
                handleCorrectAnswerFlow();
            } else {
                endGame();
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
        questionIndexInLevel++;
        
        // Milestone kontrolü
        const milestone = totalQuestionIndex;
        if (milestone === 5 || milestone === 10 || milestone === 15) {
            if (milestone === 5) jokers.double = true;
            if (milestone === 10) jokers.fiftyFifty = true;
            if (milestone === 15) jokers.skip = true;
            updateJokerUI();
            claimRewardBtn.classList.remove('hidden'); // Ödül butonunu göster
        }

        if (totalQuestionIndex % 5 === 0) {
            questionIndexInLevel = 0; // Yeni seviye için index'i sıfırla
        }
        
        // Ödül butonu gösteriliyorsa bekle, yoksa devam et
        if (!claimRewardBtn.classList.contains('hidden')) {
             // Kullanıcının butona basmasını bekliyoruz.
        } else {
            loadNextQuestion();
        }
    }
    
    function updateHUD() {
        scoreDisplay.textContent = `${uiTexts[currentLanguage].score}: ${score}`;
        questionCounterDisplay.textContent = `${uiTexts[currentLanguage].question} ${totalQuestionIndex + 1}/20`;
        progressBar.style.width = `${(totalQuestionIndex / 20) * 100}%`;
    }

    function endGame() {
        gameScreen.classList.remove('active');
        endScreen.classList.add('active');
        const finalScoreText = document.getElementById('final-score-text');
        finalScoreText.textContent = `${uiTexts[currentLanguage].finalScore}: ${score}`;
    }

    // Joker Fonksiyonları
    function updateJokerUI() {
        jokerAudienceBtn.disabled = !jokers.audience;
        jokerFiftyBtn.disabled = !jokers.fiftyFifty;
        jokerDoubleBtn.disabled = !jokers.double;
        jokerSkipBtn.disabled = !jokers.skip;
    }

    function useAudienceJoker() {
        if (!jokers.audience) return;
        jokers.audience = false;
        updateJokerUI();
        
        audienceChart.classList.remove('hidden');
        const bars = audienceChart.querySelectorAll('.bar');
        const percentages = [10, 10, 10, 10]; // Default percentages
        
        // 95% ihtimalle doğru cevaba yüksek yüzde ver
        const isLucky = Math.random() < 0.95;
        let remainingPercent = 90;
        if(isLucky) {
            percentages[currentQuestionData.correct] = 50 + Math.floor(Math.random() * 20); // 50-69%
            remainingPercent = 100 - percentages[currentQuestionData.correct];
        }

        for(let i=0; i<4; i++){
            if(i !== currentQuestionData.correct || !isLucky){
                const randomPercent = Math.floor(Math.random() * (remainingPercent / 2));
                percentages[i] = randomPercent;
                remainingPercent -= randomPercent;
            }
        }
        percentages[percentages.indexOf(Math.min(...percentages))] += remainingPercent; // Kalanı en düşüğe ekle


        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.height = `${percentages[index]}%`;
                bar.textContent = `${percentages[index]}%`;
            }, index * 100);
        });

        setTimeout(() => { audienceChart.classList.add('hidden'); }, 4000);
    }

    function useFiftyFiftyJoker() {
        if (!jokers.fiftyFifty) return;
        jokers.fiftyFifty = false;
        updateJokerUI();

        const buttons = answerButtonsContainer.querySelectorAll('.answer-btn');
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
    
    function useDoubleAnswerJoker() {
         if (!jokers.double) return;
         // Bu joker pasif olarak selectAnswer içinde kontrol ediliyor.
         // Butona basıldığında bir görsel efekt eklenebilir.
         alert("Çift Cevap hakkınız aktif! İlk yanlışınızda elenmeyeceksiniz.");
    }
    
    function useSkipJoker() {
        if (!jokers.skip) return;
        jokers.skip = false;
        updateJokerUI();
        
        score += 25; // Pas geçince az puan ver
        handleCorrectAnswerFlow();
    }
    
    function handleClaimReward() {
        const milestone = totalQuestionIndex;
        const prizeMap = {
            5: "Whopper Menu",
            10: "1000 TL / 20 Euro Balance",
            15: "5000 TL / 120 Euro Balance",
            20: "20.000 TL / 500 Euro Cash"
        };
        const prizeWon = prizeMap[milestone];
        
        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            social: document.getElementById('social').value,
            gsm: gsmInput.value,
            country: currentLanguage === 'en' ? countrySelect.value : 'Turkey'
        };

        const mailBody = `
        Kyrosil x Burger King Yarışması Ödül Talebi
        ------------------------------------------
        Ulaşılan Kilometre Taşı: Soru ${milestone}
        Kazanılan Ödül: ${prizeWon}
        ------------------------------------------
        Kullanıcı Bilgileri:
        Ad: ${userData.firstName}
        Soyad: ${userData.lastName}
        E-posta: ${userData.email}
        Sosyal Medya: ${userData.social}
        Ülke: ${userData.country}
        GSM No: ${userData.gsm}
        ------------------------------------------
        Talep Tarihi: ${new Date().toLocaleString()}
        `;

        const subject = "Kyrosil x Burger King Ödül Başvurusu";
        const mailtoLink = `mailto:bkgift@kyrosil.eu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
        
        window.location.href = mailtoLink;
        
        // Kullanıcı maili gönderdikten sonra oyuna devam etmeli
        claimRewardBtn.classList.add('hidden');
        loadNextQuestion();
    }


    // Oyunu Başlat
    init();
});
