async function loadTeams() {
  const res = await fetch('data/teams.json');
  const teams = await res.json();
  const grid = document.getElementById('card-grid');

  const template = await fetch('template.html').then(r => r.text());

  teams
    .filter(t => t.active) // only show active teams
    .forEach(team => {
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
        .replace(/{{path_next}}/g, team.path_next || 'TBD')
        .replace(/{{path_then}}/g, team.path_then || 'TBD')
        .replace(/{{path_final}}/g, team.path_final || 'TBD');

      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      grid.appendChild(wrapper.firstElementChild);
    });
}

loadTeams();
