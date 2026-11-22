window.COURSE_DATA = {
  preferences: [
    { id: "p1", label: "Мені подобається програмування", varName: "var_prog" },
    { id: "p2", label: "Я люблю математику", varName: "var_math" },
    { id: "p3", label: "Я цікавлюся комп'ютерними іграми", varName: "var_games" },
    { id: "p4", label: "Я люблю читати", varName: "var_read" },
    { id: "p5", label: "Я хочу створювати власні програми", varName: "var_apps" }
  ],
  practice1: [
    {
      id: "pr1_q1",
      type: "single",
      points: 2,
      question: "Завдання 1. Обери правильну відповідь: Який елемент Tkinter створює перемикач?",
      options: ["Entry", "Checkbutton", "Label", "Button"],
      correct: 1
    },
    {
      id: "pr1_q2",
      type: "select_code",
      points: 2,
      question: "Завдання 2. Встав пропущене слово в коді:",
      codeBefore: "var1 = ",
      codeAfter: "()\n\ncheck = Checkbutton(\n    root,\n    text=\"Навчання\",\n    variable=var1\n)",
      options: ["IntVar", "Label", "Button"],
      correct: "IntVar"
    },
    {
      id: "pr1_q3",
      type: "matching",
      points: 2,
      question: "Завдання 3. Встанови відповідність між елементом та його призначенням:",
      pairs: [
        { left: "Checkbutton", right: "створює перемикач" },
        { left: "IntVar()", right: "зберігає ціле значення" },
        { left: "variable", right: "пов'язує перемикач зі змінною" },
        { left: "get()", right: "отримує значення змінної" }
      ],
      rightOptions: [
        "створює перемикач",
        "зберігає ціле значення",
        "пов'язує перемикач зі змінною",
        "отримує значення змінної"
      ]
    },
    {
      id: "pr1_q4",
      type: "sim1_count",
      points: 2,
      question: "Завдання 4. Практичне завдання: перейдіть у Симулятор №1, увімкніть бажану кількість перемикачів (від 1 до 5), натисніть «Перевірити», а потім введіть у поле нижче точну кількість увімкнених зараз перемикачів:"
    }
  ],
  practice2: [
    {
      id: "pr2_q1",
      type: "single",
      points: 2,
      question: "Завдання 1. Обери правильну відповідь: Яке ключове слово використовується для зміни глобальної змінної всередині функції?",
      options: ["local", "global", "def", "int"],
      correct: 1
    },
    {
      id: "pr2_q2",
      type: "input_word",
      points: 2,
      question: "Завдання 2. Доповни код (впиши пропущене ключове слово):",
      codeSnippet: "score = 10\n\ndef change_score():\n    ______ score\n    score = score + 5",
      correct: "global"
    },
    {
      id: "pr2_q3",
      type: "input_number",
      points: 2,
      question: "Завдання 3. Визнач результат виконання коду (впиши число, яке виведе програма):",
      codeSnippet: "number = 4\n\ndef change():\n    global number\n    number = number * 2\n\nchange()\nprint(number)",
      correct: 8
    },
    {
      id: "pr2_q4",
      type: "sim2_target",
      points: 2,
      question: "Завдання 4. Практичне завдання: за допомогою кнопок Симулятора №2 змініть значення лічильника глобальної змінної так, щоб воно дорівнювало 10, а потім введіть отримане значення у поле відповіді нижче:"
    }
  ],
  finalTest: [
    {
      id: "ft_1",
      points: 2,
      question: "1. Які два значення за замовчуванням повертає змінна IntVar(), пов'язана з віджетом Checkbutton?",
      options: ["True або False у вигляді тексту", "1 (увімкнено) або 0 (вимкнено)", "10 або 20", "-1 або 1"],
      correct: 1,
      explanation: "Змінна типу IntVar() для Checkbutton набуває значення 1, коли прапорець встановлено, та 0, коли знято."
    },
    {
      id: "ft_2",
      points: 2,
      question: "2. За допомогою якого параметра віджета Checkbutton встановлюється зв'язок зі змінною стану?",
      options: ["command", "textvariable", "variable", "value"],
      correct: 2,
      explanation: "Параметр variable=var1 пов'язує стан перемикача зі змінною керування IntVar()."
    },
    {
      id: "ft_3",
      points: 2,
      question: "3. Як зчитати поточне значення зі змінної flag = IntVar()?",
      options: ["flag.read()", "flag.get()", "flag.text()", "get(flag)"],
      correct: 1,
      explanation: "Метод .get() повертає поточне ціле число (0 або 1), збережене у змінній IntVar()."
    },
    {
      id: "ft_4",
      points: 2,
      question: "4. У чому полягає головна відмінність перемикача Checkbutton від звичайної кнопки Button?",
      options: [
        "Checkbutton не можна розмістити у вікні Tk()",
        "Button зберігає стан 0 або 1, а Checkbutton — ні",
        "Checkbutton зберігає стан вибору (увімкнено/вимкнено) і дозволяє обирати кілька варіантів одночасно",
        "Checkbutton працює лише без бібліотеки tkinter"
      ],
      correct: 2,
      explanation: "Перемикач фіксує стан прапорця, тоді як звичайна кнопка лише запускає дію в момент натискання."
    },
    {
      id: "ft_5",
      points: 2,
      question: "5. Де оголошується глобальна змінна у програмі на мові Python?",
      options: [
        "У основному тілі програми (поза межами функцій)",
        "Тільки всередині циклу while",
        "Тільки після команди return",
        "У назві вікна root.title()"
      ],
      correct: 0,
      explanation: "Змінна, створена на верхньому рівні модуля поза функціями, є глобальною."
    },
    {
      id: "ft_6",
      points: 2,
      question: "6. Що станеться, якщо всередині функції спробувати змінити глобальну змінну x = x + 1 без оголошення global x?",
      options: [
        "Програма автоматично створить новий файл",
        "Виникне помилка UnboundLocalError (звернення до локальної змінної до її присвоєння)",
        "Змінна x обнулиться без помилок",
        "Функція виконається двічі"
      ],
      correct: 1,
      explanation: "Без ключового слова global Python вважає x локальною змінною функції та видає помилку UnboundLocalError."
    },
    {
      id: "ft_7",
      points: 2,
      question: "7. Проаналізуйте фрагмент коду. Що буде виведено на екран?\n\npoints = 3\ndef bonus():\n    global points\n    points += 4\n\nbonus()\nbonus()\nprint(points)",
      options: ["3", "7", "11", "8"],
      correct: 2,
      explanation: "Початкове значення 3. Перший виклик bonus() робить points = 7, другий виклик — points = 11."
    },
    {
      id: "ft_8",
      points: 2,
      question: "8. У програмі створено 3 перемикачі: v1.get() == 1, v2.get() == 0, v3.get() == 1. Чому дорівнює вираз v1.get() + v2.get() + v3.get()?",
      options: ["1", "2", "3", "101"],
      correct: 1,
      explanation: "Оскільки значення мають цілий тип (IntVar), їх сума дорівнює 1 + 0 + 1 = 2."
    }
  ]
};
