// ============================================================
// IRON-7 Git Simulator — Terminal UI
// ============================================================

var commandHistory = [];
var historyIndex = -1;

function getPrompt() {
  return gitRepo.cloned ? 'iron-7:station-systems $' : 'iron-7:~ $';
}

function initTerminal() {
  var input = document.getElementById('terminal-input');
  var promptEl = document.getElementById('terminal-prompt');

  // Welcome message
  appendOutput('', '=== IRON-7 GIT MISSION CONTROL ===\nTerminal de reparacion activado.\nEscribe \'help\' para ver los comandos disponibles.\n', false);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var cmd = input.value;
      if (!cmd.trim()) return;

      // Add to history
      commandHistory.push(cmd);
      historyIndex = commandHistory.length;

      // Show command in output
      appendCommand(getPrompt() + ' ' + cmd);

      // Parse and execute
      var result = parseCommand(cmd);

      if (result.output === '__CLEAR__') {
        document.getElementById('terminal-output').innerHTML = '';
      } else if (result.output) {
        appendOutput(cmd, result.output, result.isHtml);
      }

      // Clear input
      input.value = '';

      // Update prompt
      promptEl.textContent = getPrompt();

      // Check mission completion
      var missionResult = checkMission();
      if (missionResult) {
        if (missionResult.message) {
          appendSystemMessage(missionResult.message);
        }

        if (missionResult.allDone) {
          appendOutput('', '\n<span class="term-success">=== TODAS LAS MISIONES COMPLETADAS ===</span>\n<span class="term-success">La estacion IRON-7 esta completamente operativa. Buen trabajo, ingeniero.</span>\n', true);
          document.body.classList.add('mission-complete');
        }
      }

      // Re-render visual panels
      renderAll();

      // Scroll to bottom
      var outputEl = document.getElementById('terminal-output');
      outputEl.scrollTop = outputEl.scrollHeight;
    }

    // Command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = '';
      }
    }
  });

  // Focus input on click anywhere in terminal
  document.querySelector('.terminal').addEventListener('click', function () {
    input.focus();
  });

  // Auto-focus
  input.focus();
}

function appendCommand(text) {
  var el = document.createElement('div');
  el.className = 'term-cmd-line';
  el.textContent = text;
  document.getElementById('terminal-output').appendChild(el);
}

function appendOutput(cmd, text, isHtml) {
  var el = document.createElement('pre');
  el.className = 'term-output';
  if (isHtml) {
    el.innerHTML = text;
  } else {
    el.textContent = text;
  }
  document.getElementById('terminal-output').appendChild(el);
}

function appendSystemMessage(text) {
  var el = document.createElement('div');
  el.className = 'term-system';
  el.textContent = text;
  document.getElementById('terminal-output').appendChild(el);
}
