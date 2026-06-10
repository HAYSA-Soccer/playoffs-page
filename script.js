console.log("script.js loaded");

const SHEET_URL = "https://script.google.com/macros/s/AKfycbwaqSktudVfYj2RrdZNnO-NP0LXbVspLc1MND_DnpTs26A7xmsfaLOuyViBbYs3YFnC/exec";

async function loadTeams() {
  console.log("Fetching:", SHEET_URL);

  const res = await fetch(SHEET_URL);
  console.log("Response status:", res.status);

  const teams = await res.json();
  console.log("Teams returned:", teams);

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
