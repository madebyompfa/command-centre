// ===== OVERVIEW =====
const MY_NAME = "Asande";

// How many days from today until a date (negative = overdue)
function daysUntil(dateString) {
    const today = new Date(dateKey(new Date()));
    const due = new Date(dateString);
    return Math.round((due - today) / 86400000);
}

// Jumps to another section, as if you clicked it in the sidebar
function goTo(name) {
    document.querySelectorAll(".nav-link").forEach(function (link) {
        if (link.textContent === name) {
            link.click();
        }
    });
}

function showOverview() {
    const now = new Date();
    const todayKey = dateKey(now);

    const hour = now.getHours();
    let greeting = "Good evening";
    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour >= 12 && hour < 18) {
        greeting = "Good afternoon";
    }
    const dateText = now.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });

    // ----- Deadlines -----
    const open = deadlines.filter(function (d) {
        return !d.done;
    });
    open.sort(function (a, b) {
        return a.due.localeCompare(b.due);
    });

    let dueSoon = 0;
    let overdue = 0;
    open.forEach(function (d) {
        const n = daysUntil(d.due);
        if (n < 0) overdue++;
        else if (n <= 7) dueSoon++;
    });

    let nextHTML = "";
    open.slice(0, 5).forEach(function (d) {
        const n = daysUntil(d.due);
        let label = n + " days";
        let colour = "";
        if (n < 0) {
            label = -n + " days overdue";
            colour = "red";
        } else if (n === 0) {
            label = "Today";
            colour = "amber";
        } else if (n === 1) {
            label = "Tomorrow";
            colour = "amber";
        } else if (n <= 3) {
            colour = "amber";
        }
        nextHTML += `
            <li class="item">
                <div class="item-text">
                    <strong>${escapeHTML(d.title)}</strong>
                    <span>${d.module ? escapeHTML(d.module) + " · " : ""}${escapeHTML(d.due)}</span>
                </div>
                <span class="pill ${colour}">${label}</span>
            </li>`;
    });
    if (nextHTML === "") {
        nextHTML = `<li class="empty">No open deadlines.</li>`;
    }

    // ----- Habits today -----
    let habitsDone = 0;
    let habitsHTML = "";
    habits.forEach(function (h, i) {
        const done = h.log[todayKey] === true;
        if (done) habitsDone++;
        habitsHTML += `
            <button class="habit-chip ${done ? "on" : ""}" data-i="${i}">
                <span class="box">${done ? "✓" : ""}</span>
                <span class="hname">${escapeHTML(h.name)}</span>
                <em>${streak(h)} day streak</em>
            </button>`;
    });
    if (habitsHTML === "") {
        habitsHTML = `<p class="empty">No habits yet.</p>`;
    }

    // ----- Budget this month -----
    const thisMonth = todayKey.slice(0, 7);
    let income = 0;
    let spent = 0;
    transactions.forEach(function (t) {
        if (t.date.slice(0, 7) !== thisMonth) return;
        if (t.type === "in") income += t.amount;
        else spent += t.amount;
    });
    const left = income - spent;

    // ----- Workouts this week -----
    const weekKeys = [];
    thisWeek().forEach(function (d) {
        weekKeys.push(dateKey(d));
    });
    let workoutsThisWeek = 0;
    workouts.forEach(function (w) {
        if (weekKeys.includes(w.date)) workoutsThisWeek++;
    });

    // ----- Modules -----
    let modulesHTML = "";
    modules.forEach(function (m) {
        const s = moduleStats(m);
        modulesHTML += `
            <li class="mod-row">
                <span class="code">${escapeHTML(m.code)}</span>
                ${barHTML(s.average === null ? 0 : s.average)}
                <span class="mod-avg">${s.average === null ? "--" : Math.round(s.average) + "%"}</span>
            </li>`;
    });
    if (modulesHTML === "") {
        modulesHTML = `<li class="empty">No modules yet.</li>`;
    }

    // ----- Goals -----
    let goalsHTML = "";
    goals.forEach(function (g) {
        const p = progress(g.steps);
        goalsHTML += `
            <div class="goal-row">
                <div class="row-top"><span>${escapeHTML(g.title)}</span><span class="muted">${p}%</span></div>
                ${barHTML(p)}
            </div>`;
    });
    if (goalsHTML === "") {
        goalsHTML = `<p class="empty">No goals yet.</p>`;
    }

    main.innerHTML = `
        <p class="muted">${dateText}</p>
        <h2 class="greeting">${greeting}, ${MY_NAME}</h2>

        <div class="tiles">
            <button class="stat tile" data-go="Deadlines">
                <span>Due in 7 days</span>
                <strong>${dueSoon}</strong>
                <small class="${overdue ? "red" : "muted"}">${overdue ? overdue + " overdue" : "Nothing overdue"}</small>
            </button>
            <button class="stat tile" data-go="Habits">
                <span>Habits today</span>
                <strong>${habitsDone}/${habits.length}</strong>
                <small class="muted">${habits.length - habitsDone} to go</small>
            </button>
            <button class="stat tile" data-go="Budget">
                <span>Left this month</span>
                <strong class="${left < 0 ? "red" : ""}">${money(left)}</strong>
                <small class="muted">${money(spent)} spent</small>
            </button>
            <button class="stat tile" data-go="Fitness">
                <span>Workouts this week</span>
                <strong>${workoutsThisWeek}</strong>
                <small class="muted">Keep it going</small>
            </button>
        </div>

        <div class="overview-grid">
            <section class="panel">
                <div class="panel-head"><h3>Next up</h3><button class="link" data-go="Deadlines">All deadlines</button></div>
                <ul class="list">${nextHTML}</ul>
            </section>

            <section class="panel">
                <div class="panel-head"><h3>Today's habits</h3><button class="link" data-go="Habits">Week view</button></div>
                <div class="habit-chips">${habitsHTML}</div>
            </section>

            <section class="panel">
                <div class="panel-head"><h3>Module standing</h3><button class="link" data-go="University">Marks</button></div>
                <ul class="mod-list">${modulesHTML}</ul>
            </section>

            <section class="panel">
                <div class="panel-head"><h3>Goals</h3><button class="link" data-go="Goals">All goals</button></div>
                ${goalsHTML}
            </section>
        </div>
    `;

    document.querySelectorAll("[data-go]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            goTo(btn.dataset.go);
        });
    });

    document.querySelectorAll(".habit-chip").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const h = habits[btn.dataset.i];
            if (h.log[todayKey]) {
                delete h.log[todayKey];
            } else {
                h.log[todayKey] = true;
            }
            saveHabits();
            showOverview();
        });
    });
}