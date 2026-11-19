# Command Centre

A personal dashboard for university life. Modules and marks, deadlines, goals, habits, budget, fitness, reading and projects, all in one place.

**Live site:** https://madebyompfa.github.io/command-centre/

## Features

- **Overview**: a home screen that pulls the key numbers from every section
- **University**: add modules and weighted assessments, see your average and the mark you need on the rest to hit your target
- **Deadlines**: sorted by due date, tick them off when submitted
- **Habits**: a weekly tick grid with streaks
- **Budget**: income, spending and money left this month
- **Goals and Projects**: checklists with progress bars; projects move between Planning, In progress and Shipped
- **Fitness**: workout log, a weekly view and lift progress
- **Reading**: a reading list with page progress

## Built with

- HTML, CSS and vanilla JavaScript (no frameworks)
- `localStorage` to save data in the browser
- GitHub Pages for hosting

## How it works

Each section follows the same pattern:

1. Data lives in an array (for example `deadlines`)
2. Every change updates the array
3. The array is saved to `localStorage`
4. The section re-draws itself from the array

Each larger section has its own file (`university.js`, `goals.js`, `fitness-reading.js`, `overview.js`), and `app.js` handles navigation.

## Run it locally

1. Clone this repo
2. Open `index.html` in a browser, or use the Live Server extension in VS Code

## Planned improvements

- Escape user input to prevent HTML injection (XSS)
- Edit existing items, not just add and delete
- Export and import a backup of your data
- Sync between devices

## Note on data

Everything is stored in your own browser, so nothing is sent to a server. Data on one device won't show up on another.