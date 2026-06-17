console.log("script.js loaded");

const SHEET_URL = "https://script.google.com/macros/s/AKfycbwaqSktudVfYj2RrdZNnO-NP0LXbVspLc1MND_DnpTs26A7xmsfaLOuyViBbYs3YFnC/exec";

/* -------------------------------------------------------
   Pretty Date Formatter (YYYY-MM-DD → "Thursday, June 18th, 2026")
------------------------------------------------------- */
function formatPrettyDate(raw) {
  if (!raw || raw === "TBD") return raw;

  // raw is already "YYYY-MM-DD" from Apps Script
  const d = new Date(raw + "T00:00:00"); // force local date, no timezone shift
  if (isNaN(d)) return raw;

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const dayName = days[d.getDay()];
  const monthName = months[d.getMonth()];
  const dateNum = d.getDate();
  const year = d.getFullYear();

  const suffix =
    dateNum % 10 === 1 && dateNum !== 11 ? "st" :
    dateNum % 10 === 2 && dateNum !== 12 ? "nd" :
    dateNum % 10 === 3 && dateNum !== 13 ? "rd" : "th";

  return `${dayName}, ${monthName} ${dateNum}${suffix}, ${year}`;
}



/* -------------------------------------------------------
   Build Today’s Games Bar
   (Now safe because date is always YYYY-MM-DD)
------------------------------------------------------- */
function buildTodaysGames(teams) {
  const el = document.getElementById("today-games");
  if (!el) return;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const todaysGames = teams.filter(t => {
    if (!t.date || t.date === "TBD") return false;
    return t.date === today; // direct string compare — no timezone issues
  });

  if (todaysGames.length === 0) {
    el.classList.remove("hay-today-games-active");
    el.classList.add("hay-today-games-empty");

    el.innerHTML = `
      <div class="hay-today-games-title">Today’s Playoff Games</div>
      <div>No playoff games scheduled today.</div>
    `;
    return;
  }

  // Hype mode
  el.classList.remove("hay-today-games-empty");
  el.classList.add("hay-today-games-active");

  let html = `<div class="hay-today-games-title">🔥 Today’s Games</div>`;
  todaysGames.forEach(t => {
    html += `
      <div class="hay-today-game-item">
        🕒 ${t.time || 'TBD'} — ${t.division} (${t.coach})
        vs ${t.opponent || 'TBD'} — ${t.field || 'TBD'}
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

  // Insert season title + last updated
  document.getElementById("season-title").textContent = data.season_title;
  document.getElementById("last-updated").textContent = "Last updated: " + data.updated;

  // Insert hype text
  document.getElementById("hype-text").innerHTML =
     data.hype_text
       .replace(/\|\|/g, "<br>")
       .replace(/\n/g, "<br>");

  // Build Today’s Games bar
  buildTodaysGames(data.teams);

  const teams = data.teams;
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
        .replace(/{{date}}/g, formatPrettyDate(team.date))
        .replace(/{{time}}/g, team.time) // already formatted by Apps Script
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
