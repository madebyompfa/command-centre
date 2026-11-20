// ===== FITNESS & READING =====
let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let lifts = JSON.parse(localStorage.getItem("lifts")) || [];
let books = JSON.parse(localStorage.getItem("books")) || [];

function saveFitness() {
    localStorage.setItem("workouts", JSON.stringify(workouts));
    localStorage.setItem("lifts", JSON.stringify(lifts));
}

function saveBooks() {
    localStorage.setItem("books", JSON.stringify(books));
}

// ----- FITNESS -----
function showFitness() {
    const todayKey = dateKey(new Date());
    const thisMonth = todayKey.slice(0, 7);
    const letters = ["M", "T", "W", "T", "F", "S", "S"];

    const weekKeys = [];
    thisWeek().forEach(function (d) {
        weekKeys.push(dateKey(d));
    });

    let weekCount = 0;
    let monthCount = 0;
    workouts.forEach(function (w) {
        if (weekKeys.includes(w.date)) weekCount++;
        if (w.date.slice(0, 7) === thisMonth) monthCount++;
    });

    let stripHTML = "";
    weekKeys.forEach(function (key, i) {
        const w = workouts.find(function (x) {
            return x.date === key;
        });
        stripHTML += `
            <div class="wd ${w ? "on" : ""} ${key === todayKey ? "today" : ""}">
                <small>${letters[i]}</small>
                <span>${w ? escapeHTML(w.type) : "Rest"}</span>
            </div>`;
    });

    workouts.sort(function (a, b) {
        return b.date.localeCompare(a.date);
    });

    let recentHTML = "";
    workouts.forEach(function (w, index) {
        if (index >= 10) return;
        recentHTML += `
            <li class="item">
                <div class="item-text">
                    <strong>${escapeHTML(w.type)}</strong>
                    <span>${escapeHTML(w.date)}</span>
                </div>
                <button class="delete delete-workout" data-i="${index}">Delete</button>
            </li>`;
    });
    if (recentHTML === "") {
        recentHTML = `<li class="empty">No workouts logged yet.</li>`;
    }

    let liftsHTML = "";
    lifts.forEach(function (l, li) {
        let info = "No entries yet";

        if (l.entries.length > 0) {
            const first = l.entries[0].kg;
            const latest = l.entries[l.entries.length - 1].kg;
            let best = 0;
            l.entries.forEach(function (e) {
                if (e.kg > best) best = e.kg;
            });
            const change = latest - first;
            info = `Latest ${latest} kg · Best ${best} kg · ${change >= 0 ? "+" : ""}${change} kg since start`;
        }

        liftsHTML += `
            <li class="item lift">
                <div class="item-text">
                    <strong>${escapeHTML(l.name)}</strong>
                    <span>${info}</span>
                </div>
                <form class="add-form small lift-form" data-i="${li}">
                    <input name="kg" type="number" step="0.5" min="0" placeholder="kg" required>
                    <button type="submit">Log</button>
                </form>
                <button class="delete delete-lift" data-i="${li}">Delete</button>
            </li>`;
    });
    if (liftsHTML === "") {
        liftsHTML = `<li class="empty">No lifts tracked yet.</li>`;
    }

    main.innerHTML = `
        <h2>Fitness</h2>

        <div class="stats">
            <div class="stat"><span>This week</span><strong>${weekCount}</strong></div>
            <div class="stat"><span>This month</span><strong>${monthCount}</strong></div>
            <div class="stat"><span>Total logged</span><strong>${workouts.length}</strong></div>
        </div>

        <div class="weekstrip">${stripHTML}</div>

        <h3 class="section-title">Log a workout</h3>
        <form id="workout-form" class="add-form">
            <input id="w-type" placeholder="Session (e.g. Push, Legs)" required>
            <input id="w-date" type="date" value="${todayKey}" required>
            <button type="submit">Log workout</button>
        </form>
        <ul class="list">${recentHTML}</ul>

        <h3 class="section-title">Lift progress</h3>
        <form id="lift-form" class="add-form">
            <input id="lift-name" placeholder="Exercise (e.g. Bench press)" required>
            <button type="submit">Add lift</button>
        </form>
        <ul class="list">${liftsHTML}</ul>
    `;

    document.getElementById("workout-form").addEventListener("submit", function (event) {
        event.preventDefault();
        workouts.push({
            type: document.getElementById("w-type").value,
            date: document.getElementById("w-date").value
        });
        saveFitness();
        showFitness();
    });

    document.querySelectorAll(".delete-workout").forEach(function (btn) {
        btn.addEventListener("click", function () {
            workouts.splice(btn.dataset.i, 1);
            saveFitness();
            showFitness();
        });
    });

    document.getElementById("lift-form").addEventListener("submit", function (event) {
        event.preventDefault();
        lifts.push({
            name: document.getElementById("lift-name").value,
            entries: []
        });
        saveFitness();
        showFitness();
    });

    document.querySelectorAll(".lift-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            lifts[form.dataset.i].entries.push({
                date: todayKey,
                kg: Number(form.elements.kg.value)
            });
            saveFitness();
            showFitness();
        });
    });

    document.querySelectorAll(".delete-lift").forEach(function (btn) {
        btn.addEventListener("click", function () {
            lifts.splice(btn.dataset.i, 1);
            saveFitness();
            showFitness();
        });
    });
}

// ----- READING -----
function showReading() {
    const stages = [
        ["reading", "Reading now"],
        ["queue", "Up next"],
        ["done", "Finished"]
    ];

    let columnsHTML = "";

    stages.forEach(function (stage) {
        let cards = "";

        books.forEach(function (b, bi) {
            if (b.status !== stage[0]) return;

            const percent = b.pages ? Math.round((b.page / b.pages) * 100) : 0;
            let extra = "";

            if (b.status === "reading") {
                extra = `
                    ${barHTML(percent)}
                    <div class="book-row">
                        <span class="muted">Page ${b.page} of ${b.pages}</span>
                        <button class="small-btn add-pages" data-i="${bi}">+10 pages</button>
                    </div>`;
            } else if (b.status === "queue") {
                extra = `<button class="small-btn start-book" data-i="${bi}">Start reading</button>`;
            }

            cards += `
                <div class="card">
                    <div class="card-head">
                        <div>
                            <h3>${escapeHTML(b.title)}</h3>
                            <span class="muted">${escapeHTML(b.author)}</span>
                        </div>
                        <button class="delete delete-book" data-i="${bi}">Delete</button>
                    </div>
                    ${extra}
                </div>`;
        });

        columnsHTML += `
            <div class="column">
                <h3 class="column-title">${stage[1]}</h3>
                ${cards || `<p class="empty">Nothing here.</p>`}
            </div>`;
    });

    main.innerHTML = `
        <h2>Reading</h2>
        <form id="book-form" class="add-form">
            <input id="b-title" placeholder="Title" required>
            <input id="b-author" placeholder="Author">
            <input id="b-pages" type="number" min="1" placeholder="Total pages" required>
            <button type="submit">Add book</button>
        </form>
        <div class="columns">${columnsHTML}</div>
    `;

    document.getElementById("book-form").addEventListener("submit", function (event) {
        event.preventDefault();
        books.push({
            title: document.getElementById("b-title").value,
            author: document.getElementById("b-author").value,
            pages: Number(document.getElementById("b-pages").value),
            page: 0,
            status: "queue"
        });
        saveBooks();
        showReading();
    });

    document.querySelectorAll(".start-book").forEach(function (btn) {
        btn.addEventListener("click", function () {
            books[btn.dataset.i].status = "reading";
            saveBooks();
            showReading();
        });
    });

    document.querySelectorAll(".add-pages").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const b = books[btn.dataset.i];
            b.page = Math.min(b.pages, b.page + 10);
            if (b.page >= b.pages) {
                b.status = "done";
            }
            saveBooks();
            showReading();
        });
    });

    document.querySelectorAll(".delete-book").forEach(function (btn) {
        btn.addEventListener("click", function () {
            books.splice(btn.dataset.i, 1);
            saveBooks();
            showReading();
        });
    });
}