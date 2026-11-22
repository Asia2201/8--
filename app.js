(function () {
  const STORAGE_KEY = "python_switches_globals_8grade_v2_state";
  const PAGES = ["start", "theory", "sim1", "sim2", "prac1", "prac2", "test", "report"];

  let state = loadState();

  function getDefaultState() {
    return {
      student: { lastName: "", firstName: "", className: "" },
      started: false,
      currentPage: "start",
      completedPages: {},
      sim1: { checked: { p1: false, p2: false, p3: false, p4: false, p5: false }, checkedOnce: false, bonusAwarded: false },
      sim2: { score: 0, lastAction: "init", bonusAwarded: false },
      prac1: { solved: {}, userAnswers: {} },
      prac2: { solved: {}, userAnswers: {} },
      test: { solved: {}, userAnswers: {}, attempts: {} }
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(getDefaultState(), parsed);
    } catch (_) {
      return getDefaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
    updateHeaderAndProgress();
  }

  function isStudentRegistered() {
    return Boolean(
      state.started &&
      state.student.lastName && state.student.lastName.trim().length > 0 &&
      state.student.firstName && state.student.firstName.trim().length > 0 &&
      state.student.className && state.student.className.trim().length > 0
    );
  }

  function calculateTotalBreakdown() {
    const p1Score = Object.values(state.prac1.solved).filter(Boolean).length * 2;
    const p2Score = Object.values(state.prac2.solved).filter(Boolean).length * 2;
    const testScore = Object.values(state.test.solved).filter(Boolean).length * 2;
    const s1Bonus = state.sim1.bonusAwarded ? 2 : 0;
    const s2Bonus = state.sim2.bonusAwarded ? 2 : 0;
    const bonusTotal = s1Bonus + s2Bonus;
    const total = Math.min(36, p1Score + p2Score + testScore + bonusTotal);
    const percent = Math.round((total / 36) * 100);
    const grade12 = Math.round((total / 36) * 12);
    return { p1Score, p2Score, testScore, s1Bonus, s2Bonus, bonusTotal, total, percent, grade12 };
  }

  function updateHeaderAndProgress() {
    const nameEl = document.getElementById("hdr-student-name");
    const classInput = document.getElementById("hdr-student-class");
    const fullName = `${state.student.lastName || ""} ${state.student.firstName || ""}`.trim();
    if (nameEl) nameEl.textContent = fullName || "Не вказано";
    if (classInput && document.activeElement !== classInput) {
      classInput.value = state.student.className || "";
    }

    const breakdown = calculateTotalBreakdown();
    const liveScoreEl = document.getElementById("live-score");
    if (liveScoreEl) liveScoreEl.textContent = String(breakdown.total);

    if (Object.keys(state.prac1.solved).filter((k) => state.prac1.solved[k]).length === 4) {
      state.completedPages.prac1 = true;
    }
    if (Object.keys(state.prac2.solved).filter((k) => state.prac2.solved[k]).length === 4) {
      state.completedPages.prac2 = true;
    }
    if (Object.keys(state.test.solved).filter((k) => state.test.solved[k]).length === 8) {
      state.completedPages.test = true;
    }

    const doneCount = PAGES.filter((p) => Boolean(state.completedPages[p])).length;
    const pct = Math.round((doneCount / PAGES.length) * 100);
    const pctEl = document.getElementById("progress-percent");
    const cntEl = document.getElementById("completed-count");
    const fillEl = document.getElementById("progress-fill");
    if (pctEl) pctEl.textContent = pct + "%";
    if (cntEl) cntEl.textContent = String(doneCount);
    if (fillEl) fillEl.style.width = pct + "%";

    document.querySelectorAll("#top-nav .nav-btn").forEach((btn) => {
      const p = btn.getAttribute("data-page");
      btn.classList.toggle("active", p === state.currentPage);
      btn.classList.toggle("completed", Boolean(state.completedPages[p]));
    });
  }

  function navigateTo(pageId) {
    if (pageId !== "start" && !isStudentRegistered()) {
      const err = document.getElementById("start-error");
      if (err) {
        err.textContent = "Спочатку введіть Прізвище, Ім'я та Клас і натисніть «Розпочати роботу».";
        err.style.display = "block";
      }
      pageId = "start";
    }

    if (pageId === "theory") state.completedPages.theory = true;
    if (pageId === "report") state.completedPages.report = true;

    state.currentPage = pageId;
    document.querySelectorAll(".page-section").forEach((sec) => {
      sec.classList.toggle("active", sec.id === "page-" + pageId);
    });

    if (pageId === "sim1") renderSim1();
    if (pageId === "sim2") renderSim2();
    if (pageId === "prac1") renderPractice1();
    if (pageId === "prac2") renderPractice2();
    if (pageId === "test") renderTest();
    if (pageId === "report") renderReport();

    saveState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initStartAndHeader() {
    const ln = document.getElementById("start-lastname");
    const fn = document.getElementById("start-firstname");
    const cl = document.getElementById("start-class");
    const hdrCl = document.getElementById("hdr-student-class");
    const err = document.getElementById("start-error");
    const startBtn = document.getElementById("btn-start-work");

    ln.value = state.student.lastName || "";
    fn.value = state.student.firstName || "";
    cl.value = state.student.className || "";

    hdrCl.oninput = () => {
      state.student.className = hdrCl.value.trim();
      cl.value = state.student.className;
      saveState();
      if (state.currentPage === "report") renderReport();
    };

    function handleStart() {
      const lastVal = ln.value.trim();
      const firstVal = fn.value.trim();
      const classVal = cl.value.trim();

      if (!lastVal || !firstVal || !classVal) {
        err.textContent = "Будь ласка, заповніть усі обов'язкові поля: Прізвище, Ім'я та Клас.";
        err.style.display = "block";
        if (!lastVal) ln.focus();
        else if (!firstVal) fn.focus();
        else cl.focus();
        return;
      }

      err.style.display = "none";
      state.student = { lastName: lastVal, firstName: firstVal, className: classVal };
      state.started = true;
      state.completedPages.start = true;
      saveState();
      navigateTo("theory");
    }

    startBtn.onclick = handleStart;
    [ln, fn, cl].forEach((inp) => {
      inp.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleStart();
        }
      };
    });

    document.querySelectorAll("#top-nav .nav-btn").forEach((btn) => {
      btn.onclick = () => navigateTo(btn.getAttribute("data-page"));
    });

    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.onclick = () => navigateTo(btn.getAttribute("data-nav"));
    });
  }

  function renderSim1() {
    const host = document.getElementById("sim1-checkboxes");
    const prefs = window.COURSE_DATA.preferences;

    host.innerHTML = prefs
      .map((item) => {
        const isChecked = Boolean(state.sim1.checked[item.id]);
        return `
          <label class="check-item">
            <input type="checkbox" data-pref="${item.id}" ${isChecked ? "checked" : ""} />
            <span style="font-weight:600;">${item.label}</span>
            <span style="margin-left:auto; font-family:monospace; font-size:0.85rem; color:#475569;">
              ${item.varName}.get() == ${isChecked ? 1 : 0}
            </span>
          </label>`;
      })
      .join("");

    host.querySelectorAll("input[type='checkbox']").forEach((chk) => {
      chk.onchange = () => {
        const id = chk.getAttribute("data-pref");
        state.sim1.checked[id] = chk.checked;
        saveState();
        renderSim1();
      };
    });

    updateSim1CodePreview();
    updateSim1StatusText();

    document.getElementById("sim1-check-btn").onclick = () => {
      const selected = prefs.filter((p) => state.sim1.checked[p.id]);
      const count = selected.length;
      state.sim1.checkedOnce = true;
      state.completedPages.sim1 = true;

      if (count >= 2 && !state.sim1.bonusAwarded) {
        state.sim1.bonusAwarded = true;
      }

      const out = document.getElementById("sim1-output");
      if (count === 0) {
        out.className = "feedback info";
        out.innerHTML = "Увімкнено перемикачів: <strong>0</strong>. Жоден пункт не обрано.";
      } else {
        out.className = "feedback ok";
        out.innerHTML = `Увімкнено перемикачів: <strong>${count}</strong> з 5.<br/>Обрані пункти: <strong>${selected.map((s) => s.label).join(", ")}</strong>.`;
      }
      saveState();
      updateSim1StatusText();
    };

    document.getElementById("sim1-clear-btn").onclick = () => {
      prefs.forEach((p) => {
        state.sim1.checked[p.id] = false;
      });
      const out = document.getElementById("sim1-output");
      out.className = "feedback info";
      out.innerHTML = "Вибір очищено. Усі перемикачі мають значення <strong>0</strong>.";
      saveState();
      renderSim1();
    };
  }

  function updateSim1StatusText() {
    const st = document.getElementById("sim1-bonus-status");
    if (!st) return;
    st.textContent = state.sim1.bonusAwarded
      ? "✅ Контрольну умову Симулятора №1 виконано! Нараховано +2 бали."
      : "ℹ️ Увімкніть щонайменше 2 перемикачі та натисніть «Перевірити», щоб отримати +2 бали.";
  }

  function updateSim1CodePreview() {
    const prefs = window.COURSE_DATA.preferences;
    const varsDecl = prefs.map((p) => `${p.varName} = IntVar(value=${state.sim1.checked[p.id] ? 1 : 0})`).join("\n");
    const sumExpr = prefs.map((p) => `${p.varName}.get()`).join(" + ");
    const codeEl = document.getElementById("sim1-live-code");
    if (codeEl) {
      codeEl.textContent = `from tkinter import *

root = Tk()
root.title("Мої вподобання")

${varsDecl}

def check_choices():
    total = ${sumExpr}
    print("Увімкнено перемикачів:", total)`;
    }
  }

  function renderSim2() {
    const scoreEl = document.getElementById("sim2-score-val");
    if (scoreEl) scoreEl.textContent = String(state.sim2.score);
    updateSim2CodeAndStatus();

    function applyChange(delta, resetFlag, actionLabel, funcName) {
      if (resetFlag) state.sim2.score = 0;
      else state.sim2.score += delta;
      state.sim2.lastAction = funcName;
      state.completedPages.sim2 = true;
      if (state.sim2.score === 10 && !state.sim2.bonusAwarded) {
        state.sim2.bonusAwarded = true;
      }
      const logEl = document.getElementById("sim2-action-log");
      logEl.className = "feedback ok";
      logEl.innerHTML = `Виконано дію: <strong>${actionLabel}</strong> (виклик <code>${funcName}()</code>). Поточне значення глобальної змінної: <strong>score = ${state.sim2.score}</strong>.`;
      saveState();
      renderSim2();
    }

    document.getElementById("sim2-add1").onclick = () => applyChange(1, false, "Додати 1 бал", "add_1");
    document.getElementById("sim2-add5").onclick = () => applyChange(5, false, "Додати 5 балів", "add_5");
    document.getElementById("sim2-sub1").onclick = () => applyChange(-1, false, "Відняти 1 бал", "sub_1");
    document.getElementById("sim2-reset").onclick = () => applyChange(0, true, "Скинути", "reset_score");
  }

  function updateSim2CodeAndStatus() {
    const st = document.getElementById("sim2-bonus-status");
    if (st) {
      st.textContent = state.sim2.bonusAwarded
        ? "✅ Контрольну умову Симулятора №2 виконано (досягнуто score = 10)! Нараховано +2 бали."
        : "ℹ️ Змініть значення лічильника до 10 за допомогою кнопок, щоб отримати +2 бали.";
    }
    const codeEl = document.getElementById("sim2-live-code");
    if (codeEl) {
      codeEl.textContent = `score = ${state.sim2.score}  # глобальна змінна (спільна для всіх функцій)

def add_1():
    global score
    score = score + 1

def add_5():
    global score
    score = score + 5

def sub_1():
    global score
    score = score - 1

def reset_score():
    global score
    score = 0`;
    }
  }

  function renderPractice1() {
    const host = document.getElementById("prac1-container");
    const tasks = window.COURSE_DATA.practice1;

    host.innerHTML = tasks
      .map((t) => {
        const isSolved = Boolean(state.prac1.solved[t.id]);
        const saved = state.prac1.userAnswers[t.id];
        let body = "";

        if (t.type === "single") {
          body = t.options
            .map(
              (opt, idx) => `
              <label class="option-label">
                <input type="radio" name="${t.id}" value="${idx}" ${Number(saved) === idx ? "checked" : ""} ${isSolved ? "disabled" : ""} />
                <span>${opt}</span>
              </label>`
            )
            .join("");
        } else if (t.type === "select_code") {
          body = `
            <div class="code-block">
              ${t.codeBefore}<select id="inp_${t.id}" class="select-input" style="width:auto; display:inline-block; padding:4px 8px;" ${isSolved ? "disabled" : ""}>
                <option value="">-- обери --</option>
                ${t.options.map((o) => `<option value="${o}" ${saved === o ? "selected" : ""}>${o}</option>`).join("")}
              </select>${escapeHtml(t.codeAfter)}
            </div>`;
        } else if (t.type === "matching") {
          const mapSaved = typeof saved === "object" && saved !== null ? saved : {};
          body = t.pairs
            .map(
              (pair, idx) => `
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:center; margin-bottom:8px;">
                <div style="background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-weight:700;"><code>${pair.left}</code></div>
                <select class="select-input" data-match="${t.id}" data-idx="${idx}" ${isSolved ? "disabled" : ""}>
                  <option value="">-- оберіть значення --</option>
                  ${t.rightOptions.map((ro) => `<option value="${ro}" ${mapSaved[idx] === ro ? "selected" : ""}>${ro}</option>`).join("")}
                </select>
              </div>`
            )
            .join("");
        } else if (t.type === "sim1_count") {
          body = `
            <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
              <input id="inp_${t.id}" class="text-input" style="max-width:180px;" type="number" min="0" max="5" placeholder="0–5" value="${saved !== undefined ? saved : ""}" ${isSolved ? "disabled" : ""} />
              <button type="button" class="btn btn-outline" data-nav="sim1">Перейти до Симулятора №1</button>
            </div>`;
        }

        return `
          <div class="card">
            <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:10px;">
              <strong>${t.question}</strong>
              <span style="white-space:nowrap; font-size:0.85rem; font-weight:700; color:${isSolved ? "#166534" : "#6d28d9"};">
                ${isSolved ? "✅ +2 / 2 бали" : "2 бали"}
              </span>
            </div>
            ${body}
            <div style="margin-top:10px;">
              <button type="button" class="btn btn-primary" data-check-p1="${t.id}" ${isSolved ? "disabled" : ""}>Перевірити завдання</button>
            </div>
            <div id="fb_${t.id}" class="feedback ${isSolved ? "ok" : ""}" style="${isSolved ? "" : "display:none;"}">
              ${isSolved ? "Правильно! Зараховано 2 бали." : ""}
            </div>
          </div>`;
      })
      .join("");

    host.querySelectorAll("[data-nav]").forEach((b) => {
      b.onclick = () => navigateTo(b.getAttribute("data-nav"));
    });

    host.querySelectorAll("[data-check-p1]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-check-p1");
        if (state.prac1.solved[id]) return;
        const task = tasks.find((x) => x.id === id);
        const fb = document.getElementById("fb_" + id);
        let ok = false;

        if (task.type === "single") {
          const sel = host.querySelector(`input[name="${id}"]:checked`);
          if (!sel) { showFb(fb, "err", "Оберіть варіант відповіді."); return; }
          state.prac1.userAnswers[id] = Number(sel.value);
          ok = Number(sel.value) === task.correct;
        } else if (task.type === "select_code") {
          const val = document.getElementById("inp_" + id).value;
          if (!val) { showFb(fb, "err", "Оберіть пропущене слово зі списку."); return; }
          state.prac1.userAnswers[id] = val;
          ok = val === task.correct;
        } else if (task.type === "matching") {
          const map = {};
          let allChosen = true;
          host.querySelectorAll(`select[data-match="${id}"]`).forEach((s) => {
            const idx = s.getAttribute("data-idx");
            if (!s.value) allChosen = false;
            map[idx] = s.value;
          });
          if (!allChosen) { showFb(fb, "err", "Встановіть відповідність для всіх чотирьох пунктів."); return; }
          state.prac1.userAnswers[id] = map;
          ok = task.pairs.every((p, idx) => map[idx] === p.right);
        } else if (task.type === "sim1_count") {
          const raw = document.getElementById("inp_" + id).value.trim();
          if (raw === "") { showFb(fb, "err", "Введіть кількість увімкнених перемикачів із Симулятора №1."); return; }
          const num = Number(raw);
          state.prac1.userAnswers[id] = num;
          const realActive = Object.values(state.sim1.checked).filter(Boolean).length;
          if (realActive === 0) {
            showFb(fb, "err", "У Симуляторі №1 зараз не увімкнено жодного перемикача. Увімкніть хоча б 1 перемикач у Симуляторі №1 і вкажіть їх кількість.");
            return;
          }
          ok = num === realActive;
        }

        if (ok) {
          state.prac1.solved[id] = true;
          saveState();
          renderPractice1();
        } else {
          saveState();
          showFb(fb, "err", "Спробуй ще раз. Перевірте умову завдання.");
        }
      };
    });
  }

  function renderPractice2() {
    const host = document.getElementById("prac2-container");
    const tasks = window.COURSE_DATA.practice2;

    host.innerHTML = tasks
      .map((t) => {
        const isSolved = Boolean(state.prac2.solved[t.id]);
        const saved = state.prac2.userAnswers[t.id];
        let body = "";

        if (t.type === "single") {
          body = t.options
            .map(
              (opt, idx) => `
              <label class="option-label">
                <input type="radio" name="${t.id}" value="${idx}" ${Number(saved) === idx ? "checked" : ""} ${isSolved ? "disabled" : ""} />
                <span><code>${opt}</code></span>
              </label>`
            )
            .join("");
        } else if (t.type === "input_word") {
          body = `
            <pre class="code-block">${escapeHtml(t.codeSnippet)}</pre>
            <input id="inp_${t.id}" class="text-input" style="max-width:260px;" type="text" placeholder="Впишіть ключове слово" value="${saved || ""}" ${isSolved ? "disabled" : ""} />`;
        } else if (t.type === "input_number") {
          body = `
            <pre class="code-block">${escapeHtml(t.codeSnippet)}</pre>
            <input id="inp_${t.id}" class="text-input" style="max-width:220px;" type="number" placeholder="Введіть число" value="${saved !== undefined ? saved : ""}" ${isSolved ? "disabled" : ""} />`;
        } else if (t.type === "sim2_target") {
          body = `
            <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
              <input id="inp_${t.id}" class="text-input" style="max-width:200px;" type="number" placeholder="Отримане значення" value="${saved !== undefined ? saved : ""}" ${isSolved ? "disabled" : ""} />
              <button type="button" class="btn btn-outline" data-nav="sim2">Перейти до Симулятора №2</button>
            </div>`;
        }

        return `
          <div class="card">
            <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:10px;">
              <strong>${t.question}</strong>
              <span style="white-space:nowrap; font-size:0.85rem; font-weight:700; color:${isSolved ? "#166534" : "#0d9488"};">
                ${isSolved ? "✅ +2 / 2 бали" : "2 бали"}
              </span>
            </div>
            ${body}
            <div style="margin-top:10px;">
              <button type="button" class="btn btn-teal" data-check-p2="${t.id}" ${isSolved ? "disabled" : ""}>Перевірити завдання</button>
            </div>
            <div id="fb_${t.id}" class="feedback ${isSolved ? "ok" : ""}" style="${isSolved ? "" : "display:none;"}">
              ${isSolved ? "Правильно! Зараховано 2 бали." : ""}
            </div>
          </div>`;
      })
      .join("");

    host.querySelectorAll("[data-nav]").forEach((b) => {
      b.onclick = () => navigateTo(b.getAttribute("data-nav"));
    });

    host.querySelectorAll("[data-check-p2]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-check-p2");
        if (state.prac2.solved[id]) return;
        const task = tasks.find((x) => x.id === id);
        const fb = document.getElementById("fb_" + id);
        let ok = false;

        if (task.type === "single") {
          const sel = host.querySelector(`input[name="${id}"]:checked`);
          if (!sel) { showFb(fb, "err", "Оберіть варіант відповіді."); return; }
          state.prac2.userAnswers[id] = Number(sel.value);
          ok = Number(sel.value) === task.correct;
        } else if (task.type === "input_word") {
          const val = document.getElementById("inp_" + id).value.trim();
          if (!val) { showFb(fb, "err", "Введіть пропущене слово."); return; }
          state.prac2.userAnswers[id] = val;
          ok = val === task.correct;
        } else if (task.type === "input_number") {
          const raw = document.getElementById("inp_" + id).value.trim();
          if (raw === "") { showFb(fb, "err", "Введіть числове значення."); return; }
          state.prac2.userAnswers[id] = Number(raw);
          ok = Number(raw) === task.correct;
        } else if (task.type === "sim2_target") {
          const raw = document.getElementById("inp_" + id).value.trim();
          if (raw === "") { showFb(fb, "err", "Введіть значення лічильника із Симулятора №2."); return; }
          const num = Number(raw);
          state.prac2.userAnswers[id] = num;
          if (state.sim2.score !== 10) {
            showFb(fb, "err", "Спочатку в Симуляторі №2 доведіть значення глобальної змінної score до 10, а потім введіть 10 у це поле.");
            return;
          }
          ok = num === 10 && state.sim2.score === 10;
        }

        if (ok) {
          state.prac2.solved[id] = true;
          saveState();
          renderPractice2();
        } else {
          saveState();
          showFb(fb, "err", "Спробуй ще раз.");
        }
      };
    });
  }

  function renderTest() {
    const host = document.getElementById("test-container");
    const questions = window.COURSE_DATA.finalTest;
    const allCompleted = questions.every((q) => Boolean(state.test.solved[q.id]));

    host.innerHTML = questions
      .map((q) => {
        const isSolved = Boolean(state.test.solved[q.id]);
        const saved = state.test.userAnswers[q.id];
        return `
          <div class="card">
            <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start; margin-bottom:10px;">
              <div style="white-space:pre-line; font-weight:700;">${escapeHtml(q.question)}</div>
              <span style="white-space:nowrap; font-size:0.85rem; font-weight:700; color:${isSolved ? "#166534" : "#1d4ed8"};">
                ${isSolved ? "✅ +2 / 2 бали" : "2 бали"}
              </span>
            </div>
            <div>
              ${q.options
                .map(
                  (opt, idx) => `
                  <label class="option-label">
                    <input type="radio" name="${q.id}" value="${idx}" ${Number(saved) === idx ? "checked" : ""} ${isSolved ? "disabled" : ""} />
                    <span>${escapeHtml(opt)}</span>
                  </label>`
                )
                .join("")}
            </div>
            <div style="margin-top:10px;">
              <button type="button" class="btn btn-primary" data-check-test="${q.id}" ${isSolved ? "disabled" : ""}>Відповісти</button>
            </div>
            <div id="fb_${q.id}" class="feedback ${isSolved ? "ok" : ""}" style="${isSolved ? "" : "display:none;"}">
              ${isSolved ? "Правильно!" + (allCompleted ? " " + escapeHtml(q.explanation) : "") : ""}
            </div>
          </div>`;
      })
      .join("");

    host.querySelectorAll("[data-check-test]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-check-test");
        if (state.test.solved[id]) return;
        const q = questions.find((x) => x.id === id);
        const fb = document.getElementById("fb_" + id);
        const sel = host.querySelector(`input[name="${id}"]:checked`);

        if (!sel) { showFb(fb, "err", "Оберіть один із варіантів відповіді."); return; }

        const chosen = Number(sel.value);
        state.test.userAnswers[id] = chosen;
        state.test.attempts[id] = (state.test.attempts[id] || 0) + 1;

        if (chosen === q.correct) {
          state.test.solved[id] = true;
          saveState();
          renderTest();
        } else {
          saveState();
          showFb(fb, "err", "Спробуй ще раз");
        }
      };
    });
  }

  function renderReport() {
    const b = calculateTotalBreakdown();
    const fullName = `${state.student.lastName || ""} ${state.student.firstName || ""}`.trim() || "Не вказано";
    const classStr = state.student.className || "8";
    const today = new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });

    document.getElementById("rep-class-top").textContent = classStr;
    document.getElementById("rep-student-fullname").textContent = fullName;
    document.getElementById("rep-student-class").textContent = classStr;
    document.getElementById("rep-date").textContent = today;
    document.getElementById("rep-sig-student").textContent = fullName;

    let statusText = "Роботу розпочато";
    if (b.total >= 30) statusText = "Відмінно виконано";
    else if (b.total >= 20) statusText = "Виконано успішно";
    else if (b.total > 0) statusText = "Виконано частково";
    document.getElementById("rep-status").textContent = statusText;

    document.getElementById("rep-prac1").textContent = String(b.p1Score);
    document.getElementById("rep-prac2").textContent = String(b.p2Score);
    document.getElementById("rep-test").textContent = String(b.testScore);
    document.getElementById("rep-s1").textContent = String(b.s1Bonus);
    document.getElementById("rep-s2").textContent = String(b.s2Bonus);
    document.getElementById("rep-bonus").textContent = String(b.bonusTotal);
    document.getElementById("rep-total").textContent = String(b.total);
    document.getElementById("rep-total-box").textContent = String(b.total);
    document.getElementById("rep-percent").textContent = b.percent + "%";
    document.getElementById("rep-grade12").textContent = String(b.grade12);

    document.getElementById("btn-print-report").onclick = () => window.print();

    document.getElementById("btn-reset-all").onclick = () => {
      if (window.confirm("Очистити всі збережені відповіді та розпочати практикум заново?")) {
        localStorage.removeItem(STORAGE_KEY);
        state = getDefaultState();
        saveState();
        initStartAndHeader();
        navigateTo("start");
      }
    };
  }

  function showFb(el, cls, msg) {
    if (!el) return;
    el.className = "feedback " + cls;
    el.textContent = msg;
    el.style.display = "block";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function bootstrap() {
    initStartAndHeader();
    updateHeaderAndProgress();
    if (isStudentRegistered() && state.currentPage && state.currentPage !== "start") {
      navigateTo(state.currentPage);
    } else {
      navigateTo("start");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
