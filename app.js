// ===== DATA =====
let deadlines = JSON.parse(localStorage.getItem("deadlines")) || [];
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveDeadlines() {
    localStorage.setItem("deadlines", JSON.stringify(deadlines));
}

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ===== HELPERS =====
// Makes user text safe to put inside HTML
function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
// Turns a date into "2026-11-19"
function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Returns the 7 days of this week, Monday to Sunday
function thisWeek() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
    }
    return days;
}

// Days in a row a habit was done, counting back from today
function streak(habit) {
    let count = 0;
    const day = new Date();
    if (!habit.log[dateKey(day)]) {
        day.setDate(day.getDate() - 1);
    }
    while (habit.log[dateKey(day)]) {
        count++;
        day.setDate(day.getDate() - 1);
    }
    return count;
}

// Turns 1234.5 into "R1234.50"
function money(amount) {
    return "R" + amount.toFixed(2);
}

// ===== PAGE ELEMENTS =====
const links = document.querySelectorAll(".nav-link");
const main = document.getElementById("main");

// ===== SECTIONS =====
function showSection(name) {
    if (name === "Overview") {
        showOverview();
    } else if (name === "Deadlines") {        
        showDeadlines();
    } else if (name === "Habits") {
        showHabits();
    } else if (name === "Budget") {
        showBudget();
    } else if (name === "University") {
        showUniversity();
    } else if (name === "Goals") {
        showGoals();
    } else if (name === "Projects") {
        showProjects();
    } else if (name === "Fitness") {
        showFitness();
    } else if (name === "Reading") {
        showReading();
    } else {
        main.innerHTML = `<h2>${name}</h2><p>Coming soon.</p>`;
    }
}

// ----- DEADLINES -----
function showDeadlines() {
    deadlines.sort(function (a, b) {
        return a.due.localeCompare(b.due);
    });

    let listHTML = "";
    deadlines.forEach(function (d, index) {
        listHTML += `
            <li class="item ${d.done ? "done" : ""}">
                <input type="checkbox" class="tick" data-index="${index}" ${d.done ? "checked" : ""}>
                <div class="item-text">
                    <strong>${escapeHTML(d.title)}</strong>
                    <span>${d.module ? escapeHTML(d.module) + " · " : ""}due ${escapeHTML(d.due)}</span>
                </div>
                <button class="delete" data-index="${index}">Delete</button>
            </li>`;
    });

    if (listHTML === "") {
        listHTML = `<li class="empty">No deadlines yet.</li>`;
    }

    main.innerHTML = `
        <h2>Deadlines</h2>
        <form id="deadline-form" class="add-form">
            <input id="title" placeholder="What's due?" required>
            <input id="module" placeholder="Module (e.g. WEDE5020)">
            <input id="due" type="date" required>
            <button type="submit">Add</button>
        </form>
        <ul class="list">${listHTML}</ul>
    `;

    document.getElementById("deadline-form").addEventListener("submit", function (event) {
        event.preventDefault();
        deadlines.push({
            title: document.getElementById("title").value,
            module: document.getElementById("module").value,
            due: document.getElementById("due").value,
            done: false
        });
        saveDeadlines();
        showDeadlines();
    });

    document.querySelectorAll(".tick").forEach(function (box) {
        box.addEventListener("change", function () {
            const d = deadlines[box.dataset.index];
            d.done = !d.done;
            saveDeadlines();
            showDeadlines();
        });
    });

    document.querySelectorAll(".delete").forEach(function (btn) {
        btn.addEventListener("click", function () {
            deadlines.splice(btn.dataset.index, 1);
            saveDeadlines();
            showDeadlines();
        });
    });
}

// ----- HABITS -----
function showHabits() {
    const todayKey = dateKey(new Date());
    const days = thisWeek();
    const letters = ["M", "T", "W", "T", "F", "S", "S"];

    let listHTML = "";
    habits.forEach(function (h, index) {
        let dayButtons = "";
        days.forEach(function (day, i) {
            const key = dateKey(day);
            dayButtons += `
                <button class="day ${h.log[key] ? "on" : ""} ${key === todayKey ? "today" : ""}"
                        data-index="${index}" data-date="${key}"
                        ${key > todayKey ? "disabled" : ""}>
                    <small>${letters[i]}</small>${day.getDate()}
                </button>`;
        });

        listHTML += `
            <li class="item habit">
                <div class="item-text">
                    <strong>${escapeHTML(h.name)}</strong>
                    <span>${streak(h)} day streak</span>
                </div>
                <div class="days">${dayButtons}</div>
                <button class="delete" data-index="${index}">Delete</button>
            </li>`;
    });

    if (listHTML === "") {
        listHTML = `<li class="empty">No habits yet.</li>`;
    }

    main.innerHTML = `
        <h2>Habits</h2>
        <form id="habit-form" class="add-form">
            <input id="habit-name" placeholder="New habit (e.g. Read 20 pages)" required>
            <button type="submit">Add</button>
        </form>
        <ul class="list">${listHTML}</ul>
    `;

    document.getElementById("habit-form").addEventListener("submit", function (event) {
        event.preventDefault();
        habits.push({
            name: document.getElementById("habit-name").value,
            log: {}
        });
        saveHabits();
        showHabits();
    });

    document.querySelectorAll(".day").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const h = habits[btn.dataset.index];
            const date = btn.dataset.date;
            if (h.log[date]) {
                delete h.log[date];
            } else {
                h.log[date] = true;
            }
            saveHabits();
            showHabits();
        });
    });

    document.querySelectorAll(".delete").forEach(function (btn) {
        btn.addEventListener("click", function () {
            habits.splice(btn.dataset.index, 1);
            saveHabits();
            showHabits();
        });
    });
}

// ----- BUDGET -----
function showBudget() {
    const today = new Date();
    const thisMonth = dateKey(today).slice(0, 7);   // e.g. "2026-11"
    const monthName = today.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

    // Newest first
    transactions.sort(function (a, b) {
        return b.date.localeCompare(a.date);
    });

    // Add up this month only, and build the list
    let income = 0;
    let spent = 0;
    let listHTML = "";

    transactions.forEach(function (t, index) {
        if (t.date.slice(0, 7) !== thisMonth) {
            return; // skip other months
        }

        if (t.type === "in") {
            income += t.amount;
        } else {
            spent += t.amount;
        }

        listHTML += `
            <li class="item">
                <div class="item-text">
                    <strong>${escapeHTML(t.desc)}</strong>
                    <span>${t.date}</span>
                </div>
                <span class="amount ${t.type === "in" ? "green" : ""}">
                    ${t.type === "in" ? "+" : "-"}${money(t.amount)}
                </span>
                <button class="delete" data-index="${index}">Delete</button>
            </li>`;
    });

    if (listHTML === "") {
        listHTML = `<li class="empty">Nothing recorded this month.</li>`;
    }

    const left = income - spent;

    main.innerHTML = `
        <h2>Budget: ${monthName}</h2>

        <div class="stats">
            <div class="stat">
                <span>Income</span>
                <strong class="green">${money(income)}</strong>
            </div>
            <div class="stat">
                <span>Spent</span>
                <strong>${money(spent)}</strong>
            </div>
            <div class="stat">
                <span>Left</span>
                <strong class="${left < 0 ? "red" : ""}">${money(left)}</strong>
            </div>
        </div>

        <form id="budget-form" class="add-form">
            <input id="tx-desc" placeholder="Description (e.g. Groceries)" required>
            <input id="tx-amount" type="number" step="0.01" min="0" placeholder="Amount (R)" required>
            <select id="tx-type">
                <option value="out">Expense</option>
                <option value="in">Income</option>
            </select>
            <input id="tx-date" type="date" value="${dateKey(today)}" required>
            <button type="submit">Add</button>
        </form>

        <ul class="list">${listHTML}</ul>
    `;

    document.getElementById("budget-form").addEventListener("submit", function (event) {
        event.preventDefault();
        transactions.push({
            desc: document.getElementById("tx-desc").value,
            amount: Number(document.getElementById("tx-amount").value),
            type: document.getElementById("tx-type").value,
            date: document.getElementById("tx-date").value
        });
        saveTransactions();
        showBudget();
    });

    document.querySelectorAll(".delete").forEach(function (btn) {
        btn.addEventListener("click", function () {
            transactions.splice(btn.dataset.index, 1);
            saveTransactions();
            showBudget();
        });
    });
}

// ===== NAVIGATION =====
links.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        links.forEach(function (l) {
            l.classList.remove("active");
        });
        link.classList.add("active");
        showSection(link.textContent);
    });
});

// Show the overview when the page first loads
showOverview();