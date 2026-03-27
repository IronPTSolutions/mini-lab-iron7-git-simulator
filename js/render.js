// ============================================================
// IRON-7 Git Simulator — Visual Rendering
// ============================================================

function renderAll() {
  renderMissionBriefing();
  renderWorkingDir();
  renderStagingArea();
  renderCommitHistory();
  renderProgress();
}

// ---- Mission Briefing ----
function renderMissionBriefing() {
  var titleEl = document.getElementById('mission-title');
  var briefEl = document.getElementById('mission-briefing');
  var hintEl = document.getElementById('mission-hint');

  var mission = getCurrentMission();
  if (!mission) {
    titleEl.textContent = 'Todas las misiones completadas';
    briefEl.textContent = 'La estacion IRON-7 esta completamente operativa.';
    hintEl.textContent = '';
    return;
  }

  titleEl.textContent = 'Mision ' + mission.id + ': ' + mission.title;
  briefEl.textContent = mission.briefing;
  hintEl.textContent = mission.hint;
}

// ---- Working Directory ----
function renderWorkingDir() {
  var container = document.getElementById('workdir-files');
  var keys = Object.keys(gitRepo.workingDir);

  if (keys.length === 0) {
    container.innerHTML = '<p class="empty-msg">Repositorio no clonado</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < keys.length; i++) {
    var file = gitRepo.workingDir[keys[i]];
    var statusClass = file.status;
    var badge = '';

    if (file.status === 'new') badge = 'NEW';
    else if (file.status === 'modified') badge = 'MOD';
    else if (file.status === 'staged') badge = 'STAGED';

    var ext = keys[i].split('.').pop().toUpperCase();
    if (ext === 'JS') ext = 'JS';
    else if (ext === 'CONFIG') ext = 'CFG';

    html += '<div class="file-card ' + statusClass + '">';
    html += '<span class="file-icon">' + ext + '</span>';
    html += '<span class="file-name">' + keys[i] + '</span>';
    if (badge) html += '<span class="file-badge ' + statusClass + '">' + badge + '</span>';
    html += '</div>';
  }
  container.innerHTML = html;
}

// ---- Staging Area ----
function renderStagingArea() {
  var container = document.getElementById('staging-files');
  var keys = Object.keys(gitRepo.stagingArea);

  if (keys.length === 0) {
    container.innerHTML = '<p class="empty-msg">Staging area vacio</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < keys.length; i++) {
    var staged = gitRepo.stagingArea[keys[i]];
    var actionClass = staged.action;
    var badge = staged.action === 'add' ? 'ADD' : staged.action === 'delete' ? 'DEL' : 'MOD';

    var ext = keys[i].split('.').pop().toUpperCase();
    if (ext === 'JS') ext = 'JS';
    else if (ext === 'CONFIG') ext = 'CFG';

    html += '<div class="file-card staged-' + actionClass + '">';
    html += '<span class="file-icon">' + ext + '</span>';
    html += '<span class="file-name">' + keys[i] + '</span>';
    html += '<span class="file-badge staged-' + actionClass + '">' + badge + '</span>';
    html += '</div>';
  }
  container.innerHTML = html;
}

// ---- Commit History ----
function renderCommitHistory() {
  var container = document.getElementById('history-commits');

  if (gitRepo.commits.length === 0) {
    container.innerHTML = '<p class="empty-msg">Sin historial de commits</p>';
    return;
  }

  var html = '';
  // Newest first
  for (var i = gitRepo.commits.length - 1; i >= 0; i--) {
    var c = gitRepo.commits[i];
    var isPushed = gitRepo.remotePushed.indexOf(c.hash) !== -1;

    html += '<div class="commit-block">';
    html += '<div class="commit-header">';
    html += '<span class="commit-hash">' + c.hash + '</span>';
    html += '<span class="commit-badge ' + (isPushed ? 'pushed' : 'local') + '">' + (isPushed ? 'PUSHED' : 'LOCAL') + '</span>';
    html += '</div>';
    html += '<div class="commit-msg">' + escapeHtml(c.message) + '</div>';
    html += '<div class="commit-files">';
    var fkeys = Object.keys(c.files);
    for (var j = 0; j < fkeys.length; j++) {
      var action = c.files[fkeys[j]].action;
      var symbol = action === 'add' ? '+' : action === 'delete' ? '-' : '~';
      html += '<span class="commit-file-tag ' + action + '">' + symbol + ' ' + fkeys[j] + '</span>';
    }
    html += '</div>';
    html += '</div>';
  }
  container.innerHTML = html;
}

// ---- Progress ----
function renderProgress() {
  var dots = document.querySelectorAll('.progress-dot');
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('done', !!missionCompleted[i]);
  }

  var pctEl = document.getElementById('progress-pct');
  var completed = Object.keys(missionCompleted).length;
  pctEl.textContent = completed + '/' + missions.length;
}

// ---- Initialize ----
function init() {
  renderAll();
  initTerminal();
}

window.addEventListener('DOMContentLoaded', init);
