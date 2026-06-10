console.log("script.js loaded");

const SHEET_URL = "https://script.google.com/macros/s/AKfycbwaqSktudVfYj2RrdZNnO-NP0LXbVspLc1MND_DnpTs26A7xmsfaLOuyViBbYs3YFnC/exec";

/* -------------------------------------------------------
   Build Today’s Games Bar (Option A: ALL games today)
------------------------------------------------------- */
function buildTodaysGames(teams) {
  const el = document.getElementById("today-games");
  if (!el) return;

  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  const todaysGames = teams.filter(t => {
    if (!t.time) return false;
    return String(t.time).slice(0, 10) === today;
  });

  if (todaysGames.length === 0) {
    el.innerHTML = `
      <div class="hay-today-games-title">🔥 Today’s Games</div>
      <div>No games scheduled today.</div>
    `;
    return;
  }

  let html = `<div class="hay-today-games-title">🔥 Today’s Games</div>`;
  todaysGames.forEach(t => {
    html += `
      <div class="hay-today-game-item">
        🕒 ${t.time} — ${t.division} (${t.coach}) vs ${t.opponent || 'TBD'} — ${t.field || 'TBD'}
      </div>
    `;
  });

  el.innerHTML = html;
}

/* -------------------------------------------------------
   Main Loader
------------------------------------------------------- */
async function loadTeams() {
  console.log("Fetching:", SHEET_URL);

  const res = await fetch(SHEET_URL);
  console.log("Response status:", res.status);

  const data = await res.json();
  console.log("Data returned:", data);

  // NEW: Insert season title + last updated
  document.getElementById("season-title").textContent = data.season_title;
  document.getElementById("last-updated").textContent = "Last updated: " + data.updated;

  // NEW: Build Today’s Games bar
  buildTodaysGames(data.teams);

  const teams = data.teams; // your old array, unchanged
  const grid = document.getElementById('card-grid');

  const template = await fetch('template.html').then(r => r.text());
  console.log("Template loaded");

  teams
    .filter(t => String(t.active).trim().toUpperCase() === "YES")
    .forEach(team => {
      console.log("Rendering team:", team);

      let html = template
        .replace(/{{division}}/g, team.division)
        .replace(/{{team}}/g, team.team)
        .replace(/{{coach}}/g, team.coach)
        .replace(/{{record}}/g, team.record)
        .replace(/{{seed}}/g, team.seed)
        .replace(/{{status}}/g, team.status)
        .replace(/{{round}}/g, team.round)
        .replace(/{{opponent}}/g, team.opponent)
        .replace(/{{time}}/g, team.time)
        .replace(/{{field}}/g, team.field)
        .replace(/{{path_next}}/g, team.path_next)
        .replace(/{{path_then}}/g, team.path_then)
        .replace(/{{path_final}}/g, team.path_final);

      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      grid.appendChild(wrapper.firstElementChild);
    });
}

loadTeams();
