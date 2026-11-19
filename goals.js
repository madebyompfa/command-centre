// ===== GOALS & PROJECTS =====
let goals = JSON.parse(localStorage.getItem("goals")) || [];
let projects = JSON.parse(localStorage.getItem("projects")) || [];

function saveGoals() {
    localStorage.setItem("goals", JSON.stringify(goals));
}

function saveProjects() {
    localStorage.setItem("projects", JSON.stringify(projects));
}

// ----- SHARED HELPERS (used by both goals and projects) -----

// Percentage of checklist items ticked
function progress(items) {
    if (items.length === 0) return 0;
    let done = 0;
    items.forEach(function (it) {
        if (it.done) done++;
    });
    return Math.round((done / items.length) * 100);
}

// A progress bar
function barHTML(percent) {
    return `<div class="bar"><div class="bar-fill" style="width: ${percent}%"></div></div>`;
}

// A checklist with tick boxes, × buttons and an "add" box underneath
function checklistHTML(items, ownerIndex, placeholder) {
    let html = `<ul class="checklist">`;
    items.forEach(function (it, i) {
        html += `
            <li class="${it.done ? "done" : ""}">
                <label>
                    <input type="checkbox" class="step-check" data-o="${ownerIndex}" data-s="${i}" ${it.done ? "checked" : ""}>
                    <span>${it.text}</span>
                </label>
                <button class="x step-del" data-o="${ownerIndex}" data-s="${i}">×</button>
            </li>`;
    });
    html += `</ul>
        <form class="add-form small step-form" data-o="${ownerIndex}">
            <input name="text" placeholder="${placeholder}" required>
            <button type="submit">Add</button>
        </form>`;
    return html;
}

// Makes the checklist buttons work.
// list = goals or projects, key = "steps" or "tasks",
// save and redraw = the functions to call after a change
function wireChecklists(list, key, save, redraw) {
    document.querySelectorAll(".step-check").forEach(function (box) {
        box.addEventListener("change", function () {
            const item = list[box.dataset.o][key][box.dataset.s];
            item.done = !item.done;
            save();
            redraw();
        });
    });

    document.querySelectorAll(".step-del").forEach(function (btn) {
        btn.addEventListener("click", function () {
            list[btn.dataset.o][key].splice(btn.dataset.s, 1);
            save();
            redraw();
        });
    });

    document.querySelectorAll(".step-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            list[form.dataset.o][key].push({
                text: form.elements.text.value,
                done: false
            });
            save();
            redraw();
        });
    });
}

// ----- GOALS -----
function showGoals() {
    let cardsHTML = "";

    goals.forEach(function (g, gi) {
        const p = progress(g.steps);
        cardsHTML += `
            <div class="card">
                <div class="card-head">
                    <div>
                        <h3>${g.title}</h3>
                        <span class="muted">${g.due ? "By " + g.due + " · " : ""}${p}% done</span>
                    </div>
                    <button class="delete delete-goal" data-i="${gi}">Delete</button>
                </div>
                ${barHTML(p)}
                ${checklistHTML(g.steps, gi, "Add a step")}
            </div>`;
    });

    if (cardsHTML === "") {
        cardsHTML = `<p class="empty">No goals yet.</p>`;
    }

    main.innerHTML = `
        <h2>Goals</h2>
        <form id="goal-form" class="add-form">
            <input id="goal-title" placeholder="New goal (e.g. Finish first year with 75%)" required>
            <input id="goal-due" type="date">
            <button type="submit">Add goal</button>
        </form>
        <div class="cards">${cardsHTML}</div>
    `;

    document.getElementById("goal-form").addEventListener("submit", function (event) {
        event.preventDefault();
        goals.push({
            title: document.getElementById("goal-title").value,
            due: document.getElementById("goal-due").value,
            steps: []
        });
        saveGoals();
        showGoals();
    });

    document.querySelectorAll(".delete-goal").forEach(function (btn) {
        btn.addEventListener("click", function () {
            goals.splice(btn.dataset.i, 1);
            saveGoals();
            showGoals();
        });
    });

    wireChecklists(goals, "steps", saveGoals, showGoals);
}

// ----- PROJECTS -----
function showProjects() {
    const stages = [
        ["planning", "Planning"],
        ["active", "In progress"],
        ["shipped", "Shipped"]
    ];

    let columnsHTML = "";

    stages.forEach(function (stage) {
        let cards = "";

        projects.forEach(function (pr, pi) {
            if (pr.status !== stage[0]) {
                return; // this project belongs in a different column
            }

            const p = progress(pr.tasks);

            // dropdown to move the project between columns
            let options = "";
            stages.forEach(function (s) {
                options += `<option value="${s[0]}" ${s[0] === pr.status ? "selected" : ""}>${s[1]}</option>`;
            });

            cards += `
                <div class="card">
                    <div class="card-head">
                        <div>
                            <h3>${pr.name}</h3>
                            <span class="muted">${p}% done</span>
                        </div>
                        <button class="delete delete-project" data-i="${pi}">Delete</button>
                    </div>
                    <select class="status-select" data-i="${pi}">${options}</select>
                    ${barHTML(p)}
                    ${checklistHTML(pr.tasks, pi, "Add a task")}
                </div>`;
        });

        columnsHTML += `
            <div class="column">
                <h3 class="column-title">${stage[1]}</h3>
                ${cards || `<p class="empty">Nothing here.</p>`}
            </div>`;
    });

    main.innerHTML = `
        <h2>Projects</h2>
        <form id="project-form" class="add-form">
            <input id="project-name" placeholder="New project (e.g. Command Centre)" required>
            <button type="submit">Add project</button>
        </form>
        <div class="columns">${columnsHTML}</div>
    `;

    document.getElementById("project-form").addEventListener("submit", function (event) {
        event.preventDefault();
        projects.push({
            name: document.getElementById("project-name").value,
            status: "planning",
            tasks: []
        });
        saveProjects();
        showProjects();
    });

    document.querySelectorAll(".status-select").forEach(function (select) {
        select.addEventListener("change", function () {
            projects[select.dataset.i].status = select.value;
            saveProjects();
            showProjects();
        });
    });

    document.querySelectorAll(".delete-project").forEach(function (btn) {
        btn.addEventListener("click", function () {
            projects.splice(btn.dataset.i, 1);
            saveProjects();
            showProjects();
        });
    });

    wireChecklists(projects, "tasks", saveProjects, showProjects);
}