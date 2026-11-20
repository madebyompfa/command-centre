// ===== UNIVERSITY =====
let modules = JSON.parse(localStorage.getItem("modules")) || [];

function saveModules() {
    localStorage.setItem("modules", JSON.stringify(modules));
}

// Works out the average so far and what you still need
function moduleStats(m) {
    let weightDone = 0;
    let points = 0;

    m.assessments.forEach(function (a) {
        if (a.mark !== null) {
            weightDone += a.weight;
            points += a.mark * a.weight / 100;
        }
    });

    const remaining = 100 - weightDone;

    return {
        average: weightDone > 0 ? (points / weightDone) * 100 : null,
        points: points,
        remaining: remaining,
        need: remaining > 0 ? ((m.target - points) / remaining) * 100 : null
    };
}

// Turns the numbers into a sentence
function needMessage(m, s) {
    if (s.average === null) {
        return "No marks yet. Add a mark to see your average.";
    }
    if (s.remaining <= 0) {
        return `Final mark: ${s.points.toFixed(1)}%.`;
    }
    if (s.need <= 0) {
        return `Target of ${m.target}% is already secured.`;
    }
    if (s.need > 100) {
        return `Target of ${m.target}% is out of reach. Best possible: ${(s.points + s.remaining).toFixed(1)}%.`;
    }
    return `You need ${s.need.toFixed(1)}% on the remaining ${s.remaining}% to hit ${m.target}%.`;
}

function showUniversity() {
    let cardsHTML = "";

    modules.forEach(function (m, mi) {
        const s = moduleStats(m);

        let colour = "";
        if (s.average !== null && s.average >= m.target) colour = "green";
        if (s.average !== null && s.average < 50) colour = "red";

        let rows = "";
        m.assessments.forEach(function (a, ai) {
            rows += `
                <li>
                    <span>${escapeHTML(a.name)}</span>
                    <span class="muted">${a.weight}%</span>
                    <input class="mark-input" type="number" min="0" max="100" step="0.1"
                           placeholder="Mark" value="${a.mark === null ? "" : a.mark}"
                           data-m="${mi}" data-a="${ai}">
                    <button class="x delete-assess" data-m="${mi}" data-a="${ai}">×</button>
                </li>`;
        });

        cardsHTML += `
            <div class="card">
                <div class="card-head">
                    <div>
                        <span class="code">${escapeHTML(m.code)}</span>
                        <h3>${escapeHTML(m.name)}</h3>
                    </div>
                    <button class="delete delete-module" data-m="${mi}">Delete</button>
                </div>

                <div class="mod-numbers">
                    <div>
                        <strong class="${colour}">${s.average === null ? "--" : s.average.toFixed(1) + "%"}</strong>
                        <span>Average</span>
                    </div>
                    <div>
                        <strong>${m.target}%</strong>
                        <span>Target</span>
                    </div>
                </div>

                <p class="need">${needMessage(m, s)}</p>

                <ul class="assess">${rows}</ul>

                <form class="add-form small assess-form" data-m="${mi}">
                    <input name="aname" placeholder="Assessment (e.g. POE Part 1)" required>
                    <input name="aweight" type="number" min="0" max="100" placeholder="Weight %" required>
                    <button type="submit">Add</button>
                </form>
            </div>`;
    });

    if (cardsHTML === "") {
        cardsHTML = `<p class="empty">No modules yet.</p>`;
    }

    main.innerHTML = `
        <h2>University</h2>
        <form id="module-form" class="add-form">
            <input id="mod-code" placeholder="Code (e.g. WEDE5020)" required>
            <input id="mod-name" placeholder="Module name" required>
            <input id="mod-target" type="number" min="0" max="100" placeholder="Target %" value="75" required>
            <button type="submit">Add module</button>
        </form>
        <div class="cards">${cardsHTML}</div>
    `;

    document.getElementById("module-form").addEventListener("submit", function (event) {
        event.preventDefault();
        modules.push({
            code: document.getElementById("mod-code").value,
            name: document.getElementById("mod-name").value,
            target: Number(document.getElementById("mod-target").value),
            assessments: []
        });
        saveModules();
        showUniversity();
    });

    document.querySelectorAll(".assess-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            modules[form.dataset.m].assessments.push({
                name: form.elements.aname.value,
                weight: Number(form.elements.aweight.value),
                mark: null
            });
            saveModules();
            showUniversity();
        });
    });

    document.querySelectorAll(".mark-input").forEach(function (input) {
        input.addEventListener("change", function () {
            const a = modules[input.dataset.m].assessments[input.dataset.a];
            a.mark = input.value === "" ? null : Number(input.value);
            saveModules();
            showUniversity();
        });
    });

    document.querySelectorAll(".delete-assess").forEach(function (btn) {
        btn.addEventListener("click", function () {
            modules[btn.dataset.m].assessments.splice(btn.dataset.a, 1);
            saveModules();
            showUniversity();
        });
    });

    document.querySelectorAll(".delete-module").forEach(function (btn) {
        btn.addEventListener("click", function () {
            modules.splice(btn.dataset.m, 1);
            saveModules();
            showUniversity();
        });
    });
}