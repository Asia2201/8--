// State Management for Informatics 8th Grade Lab
const STATE = {
    studentLastName: '',
    studentFirstName: '',
    studentClass: '',

    sim1Count: 0,
    sim1Points: 0,

    sim2Value: 0,
    sim2Points: 0,

    pract1Points: 0,
    pract1Checked: false,

    pract2Points: 0,
    pract2Checked: false,

    quizScore: 0,
    quizChecked: false,

    completedPages: new Set()
};

const QUIZ_QUESTIONS = [
    {
        id: "q1",
        question: "1. Який віджет бібліотеки Tkinter використовується для створення перемикача?",
        options: ["Entry", "Checkbutton", "Label", "Button"],
        answer: 1,
        explain: "Checkbutton створює прапорець перемикача."
    },
    {
        id: "q2",
        question: "2. Спеціальна змінна IntVar() у Tkinter після вмикання перемикача отримує значение:",
        options: ["0", "1", "True", "None"],
        answer: 1,
        explain: "Значення 1 означає, що перемикач увімкнений."
    },
    {
        id: "q3",
        question: "3. Для чого призначена команда 'global' всередині функції в Python?",
        options: [
            "Створює нову локальну змінну",
            "Оголошує, що функція змінює глобальну змінну",
            "Видаляє змінну з пам'яті",
            "Завершує виконання функції"
        ],
        answer: 1,
        explain: "global дозволяє змінювати значення глобальної змінної всередині функції."
    },
    {
        id: "q4",
        question: "4. Визнач результат виконання коду: count = 5; def inc(): global count; count = count + 2; inc(); print(count)",
        options: ["5", "2", "7", "Помилка"],
        answer: 2,
        explain: "Початкове 5 + 2 = 7."
    },
    {
        id: "q5",
        question: "5. Чим Checkbutton відрізняється від звичайної кнопки Button?",
        options: [
            "Checkbutton зберігає стан (увімкнений/вимкнений)",
            "Button не можна натискати",
            "Checkbutton використовується тільки для виводу тексту",
            "Нічим не відрізняється"
        ],
        answer: 0,
        explain: "Перемикач зберігає вибраний стан у змінній."
    },
    {
        id: "q6",
        question: "6. Який параметр віджета Checkbutton пов'язує його зі змінною IntVar()?",
        options: ["text", "command", "variable", "value"],
        answer: 2,
        explain: "Параметр variable пов'язує перемикач зі змінною."
    },
    {
        id: "q7",
        question: "7. Де у програмі оголошується глобальна змінна?",
        options: [
            "Тільки у середині функції",
            "У основній програмі (поза межами функцій)",
            "У коментарях",
            "Глобальні змінні не можна створювати"
        ],
        answer: 1,
        explain: "Глобальні змінні створюються поза функціями у головному тілі програми."
    },
    {
        id: "q8",
        question: "8. Що станеться, якщо спробувати змінити глобальну змінну у функції БЕЗ ключового слова global?",
        options: [
            "Зміниться глобальна змінна",
            "Створиться нова локальна змінна з таким самим ім'ям",
            "Програма автоматично видалиться",
            "Змінна стане текстом"
        ],
        answer: 1,
        explain: "Без global Python створить окрему локальну змінну."
    }
];

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    bindEvents();
    renderQuiz();
    updateUI();
});

// LOAD & SAVE LOCALSTORAGE
function loadState() {
    const saved = localStorage.getItem('py_gui_lab_8klas_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(STATE, parsed);
            STATE.completedPages = new Set(parsed.completedPages || []);
        } catch(e) {
            console.error("Storage parse error", e);
        }
    }
}

function saveState() {
    const dataToSave = {
        ...STATE,
        completedPages: Array.from(STATE.completedPages)
    };
    localStorage.setItem('py_gui_lab_8klas_state', JSON.stringify(dataToSave));
}

// BIND EVENTS
function bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.getAttribute('data-tab');
            if (pageId) switchTab(pageId);
        });
    });

    // Next / Prev Navigation Buttons
    document.querySelectorAll('.nav-btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            const next = btn.getAttribute('data-next');
            if (next) switchTab(next);
        });
    });

    document.querySelectorAll('.nav-btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            const prev = btn.getAttribute('data-prev');
            if (prev) switchTab(prev);
        });
    });

    // Start Button
    document.getElementById('btnStart').addEventListener('click', handleStart);

    // Header Class Sync
    document.getElementById('headerStudentClass').addEventListener('input', (e) => {
        STATE.studentClass = e.target.value.trim();
        document.getElementById('inputClass').value = STATE.studentClass;
        saveState();
        updateUI();
    });

    // Sim 1 Actions
    document.getElementById('btnSim1Check').addEventListener('click', runSim1);
    document.getElementById('btnSim1Clear').addEventListener('click', clearSim1);

    // Sim 2 Actions
    document.getElementById('btnSim2Add1').addEventListener('click', () => updateSim2(1));
    document.getElementById('btnSim2Add5').addEventListener('click', () => updateSim2(5));
    document.getElementById('btnSim2Sub1').addEventListener('click', () => updateSim2(-1));
    document.getElementById('btnSim2Reset').addEventListener('click', () => updateSim2(0, true));

    // Pract 1 Check
    document.getElementById('btnCheckPract1').addEventListener('click', checkPract1);

    // Pract 2 Check
    document.getElementById('btnCheckPract2').addEventListener('click', checkPract2);

    // Quiz Check
    document.getElementById('btnCheckQuiz').addEventListener('click', checkQuiz);

    // Print & Reset
    document.getElementById('btnPrintReport').addEventListener('click', () => window.print());
    document.getElementById('btnResetAll').addEventListener('click', resetAll);
}

// SWITCH NAVIGATION TAB
function switchTab(pageId) {
    // Validation: Require Name before moving past Page 1
    if (pageId !== 'page1' && (!STATE.studentLastName || !STATE.studentFirstName)) {
        alert("Будь ласка, вкажи своє Прізвище та Ім'я на стартовій сторінці!");
        return;
    }

    document.querySelectorAll('.page-block').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    const targetTab = document.querySelector(`.tab-btn[data-tab="${pageId}"]`);
    if (targetTab) targetTab.classList.add('active');

    STATE.completedPages.add(pageId);
    saveState();
    updateUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// HANDLE START FORM
function handleStart() {
    const lName = document.getElementById('inputLastName').value.trim();
    const fName = document.getElementById('inputFirstName').value.trim();
    const pClass = document.getElementById('inputClass').value.trim();

    if (!lName || !fName) {
        alert("Будь ласка, заповни Прізвище та Ім'я!");
        return;
    }

    STATE.studentLastName = lName;
    STATE.studentFirstName = fName;
    STATE.studentClass = pClass;

    saveState();
    updateUI();
    switchTab('page2');
}

// SIMULATOR 1 (Checkbuttons)
function runSim1() {
    const checks = document.querySelectorAll('.sim1-checkbox');
    let count = 0;
    const selected = [];

    checks.forEach((chk, idx) => {
        if (chk.checked) {
            count++;
            selected.push(`Пункт ${idx + 1}`);
        }
    });

    STATE.sim1Count = count;
    STATE.sim1Points = count > 0 ? 2 : 0; // 2 points for condition

    const resBox = document.getElementById('sim1ResultBox');
    resBox.classList.remove('hidden');
    document.getElementById('sim1CountText').innerText = `Увімкнено перемикачів: ${count}`;
    document.getElementById('sim1ListText').innerText = count > 0 ? `Обрані пункти: ${selected.join(', ')}` : "Жодного пункту не обрано.";

    saveState();
    updateUI();
}

function clearSim1() {
    document.querySelectorAll('.sim1-checkbox').forEach(c => c.checked = false);
    STATE.sim1Count = 0;
    STATE.sim1Points = 0;
    document.getElementById('sim1ResultBox').classList.add('hidden');
    saveState();
    updateUI();
}

// SIMULATOR 2 (Global Variable Counter)
function updateSim2(delta, isReset = false) {
    if (isReset) {
        STATE.sim2Value = 0;
    } else {
        STATE.sim2Value += delta;
    }

    if (STATE.sim2Value === 10) {
        STATE.sim2Points = 2; // 2 points condition met
    }

    document.getElementById('sim2ScoreValue').innerText = STATE.sim2Value;
    document.getElementById('sim2LogBox').innerText = `Глобальна змінна score оновлена: ${STATE.sim2Value}`;

    saveState();
    updateUI();
}

// PRACTICAL PART 1 CHECK (8 pts)
function checkPract1() {
    let pts = 0;

    // Q1 (2 pts)
    const q1Val = getRadioVal('p1_q1');
    if (q1Val === 'Checkbutton') pts += 2;

    // Q2 (2 pts)
    const q2Val = getRadioVal('p1_q2');
    if (q2Val === 'IntVar') pts += 2;

    // Q3 (2 pts)
    const m1 = document.getElementById('p1_q3_m1').value;
    const m2 = document.getElementById('p1_q3_m2').value;
    const m3 = document.getElementById('p1_q3_m3').value;
    const m4 = document.getElementById('p1_q3_m4').value;
    if (m1 === 'create' && m2 === 'store' && m3 === 'bind' && m4 === 'get') pts += 2;

    // Q4 (2 pts)
    const q4Input = parseInt(document.getElementById('p1_q4_input').value) || 0;
    if (q4Input === STATE.sim1Count && STATE.sim1Count >= 0) pts += 2;

    STATE.pract1Points = pts;
    STATE.pract1Checked = true;

    const fb = document.getElementById('pract1Feedback');
    fb.className = "feedback-msg success";
    fb.innerText = `Практику №1 перевірено! Твій результат: ${pts} / 8 балів.`;

    saveState();
    updateUI();
}

// PRACTICAL PART 2 CHECK (8 pts)
function checkPract2() {
    let pts = 0;

    // Q1 (2 pts)
    const q1Val = getRadioVal('p2_q1');
    if (q1Val === 'global') pts += 2;

    // Q2 (2 pts)
    const q2Val = document.getElementById('p2_q2_input').value.trim().toLowerCase();
    if (q2Val === 'global') pts += 2;

    // Q3 (2 pts)
    const q3Val = getRadioVal('p2_q3');
    if (q3Val === '8') pts += 2;

    // Q4 (2 pts)
    const q4Val = parseInt(document.getElementById('p2_q4_input').value);
    if (q4Val === 10 && STATE.sim2Value === 10) pts += 2;

    STATE.pract2Points = pts;
    STATE.pract2Checked = true;

    const fb = document.getElementById('pract2Feedback');
    fb.className = "feedback-msg success";
    fb.innerText = `Практику №2 перевірено! Твій результат: ${pts} / 8 балів.`;

    saveState();
    updateUI();
}

// RENDER & CHECK QUIZ (16 pts)
function renderQuiz() {
    const area = document.getElementById('quizQuestionsArea');
    if (!area) return;

    area.innerHTML = QUIZ_QUESTIONS.map((q, idx) => `
        <div class="card task-card">
            <div class="task-header">
                <h4>${q.question}</h4>
                <span class="task-score-badge">2 бали</span>
            </div>
            <div class="options-list">
                ${q.options.map((opt, oIdx) => `
                    <label class="option-item">
                        <input type="radio" name="${q.id}" value="${oIdx}"> ${opt}
                    </label>
                `).join('')}
            </div>
            <div id="explain_${q.id}" class="note-box hidden">💡 ${q.explain}</div>
        </div>
    `).join('');
}

function checkQuiz() {
    let pts = 0;

    QUIZ_QUESTIONS.forEach(q => {
        const sel = getRadioVal(q.id);
        const expBox = document.getElementById(`explain_${q.id}`);
        if (expBox) expBox.classList.remove('hidden');

        if (sel !== null && parseInt(sel) === q.answer) {
            pts += 2;
        }
    });

    STATE.quizScore = pts;
    STATE.quizChecked = true;

    const fb = document.getElementById('quizFeedback');
    fb.className = "feedback-msg success";
    fb.innerText = `Підсумковий тест складено! Результат: ${pts} / 16 балів. Пояснення до запитань відкрито.`;

    saveState();
    updateUI();
}

// HELPER: GET RADIO VALUE
function getRadioVal(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
}

// UPDATE UI & TOTAL SCORE CALCULATIONS
function updateUI() {
    // Sync Name & Class
    const fullName = (STATE.studentLastName + ' ' + STATE.studentFirstName).trim() || "Не вказано";
    document.getElementById('headerStudentName').innerText = fullName;
    document.getElementById('headerStudentClass').value = STATE.studentClass || '';

    // Calculate Total Score (36 Max)
    const totalPoints = STATE.sim1Points + STATE.sim2Points + STATE.pract1Points + STATE.pract2Points + STATE.quizScore;
    document.getElementById('headerScore').innerText = `${totalPoints} / 36`;

    // Progress Bar %
    const percentProgress = Math.round((STATE.completedPages.size / 8) * 100);
    document.getElementById('progressBarFill').style.width = `${percentProgress}%`;

    // Sim Tags
    document.getElementById('sim1PointsTag').innerText = `${STATE.sim1Points} / 2`;
    document.getElementById('sim2PointsTag').innerText = `${STATE.sim2Points} / 2`;

    // Report Page Updates
    document.getElementById('repFullName').innerText = fullName;
    document.getElementById('repClass').innerText = STATE.studentClass || "8 клас";
    document.getElementById('repDate').innerText = new Date().toLocaleDateString('uk-UA');

    document.getElementById('repSim1Score').innerText = `${STATE.sim1Points} / 2 бали`;
    document.getElementById('repSim2Score').innerText = `${STATE.sim2Points} / 2 бали`;
    document.getElementById('repPract1Score').innerText = `${STATE.pract1Points} / 8 балів`;
    document.getElementById('repPract2Score').innerText = `${STATE.pract2Points} / 8 балів`;
    document.getElementById('repQuizScore').innerText = `${STATE.quizScore} / 16 балів`;

    document.getElementById('repTotalPoints').innerText = `${totalPoints} / 36 балів`;

    const percentTotal = Math.round((totalPoints / 36) * 100);
    document.getElementById('repPercent').innerText = `${percentTotal}%`;

    // 12-point Formula: Score / 36 * 12
    const grade12 = Math.round((totalPoints / 36) * 12);
    document.getElementById('repGrade12').innerText = `${grade12} балів`;
}

// RESET ALL DATA
function resetAll() {
    if (confirm("Ви дійсно бажаєте очистити всі відповіді та почати роботу знову?")) {
        localStorage.removeItem('py_gui_lab_8klas_state');
        location.reload();
    }
}
