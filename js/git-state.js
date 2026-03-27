// ============================================================
// IRON-7 Git Simulator — Virtual Repository State Machine
// ============================================================

var REMOTE_FILES = {
  'navigation.js': {
    content: '// IRON-7 Navigation System\nconst heading = 270;\nconst speed = 0;\nconsole.log("Navigation offline");\n'
  },
  'life-support.js': {
    content: '// IRON-7 Life Support\nconst oxygenLevel = 98;\nconst tempCelsius = 21;\nconsole.log("Life support active");\n'
  },
  'shields.config': {
    content: '# Shield Configuration\nstatus=offline\npower=0\nauto_repair=false\n'
  }
};

function generateHash() {
  var chars = '0123456789abcdef';
  var hash = '';
  for (var i = 0; i < 7; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

window.gitRepo = {
  cloned: false,
  remoteUrl: 'https://github.com/iron-7/station-systems.git',
  workingDir: {},
  stagingArea: {},
  commits: [],
  remotePushed: [],
  head: null,
  _statusChecked: false,
  _diffChecked: false,
  _logChecked: false
};

// ---- Clone ----
function gitClone(url) {
  if (gitRepo.cloned) {
    return 'fatal: destination path \'station-systems\' already exists and is not an empty directory.';
  }
  if (url !== gitRepo.remoteUrl) {
    return 'fatal: repository \'' + url + '\' not found';
  }

  // Populate working directory
  var keys = Object.keys(REMOTE_FILES);
  for (var i = 0; i < keys.length; i++) {
    gitRepo.workingDir[keys[i]] = {
      content: REMOTE_FILES[keys[i]].content,
      status: 'unmodified'
    };
  }

  // Create initial commit
  var initialCommit = {
    hash: generateHash(),
    message: 'Initial commit — station systems baseline',
    timestamp: new Date(),
    files: {}
  };
  var fkeys = Object.keys(REMOTE_FILES);
  for (var j = 0; j < fkeys.length; j++) {
    initialCommit.files[fkeys[j]] = { content: REMOTE_FILES[fkeys[j]].content, action: 'add' };
  }

  gitRepo.commits.push(initialCommit);
  gitRepo.remotePushed.push(initialCommit.hash);
  gitRepo.head = initialCommit.hash;
  gitRepo.cloned = true;

  return 'Cloning into \'station-systems\'...\nremote: Enumerating objects: 5, done.\nremote: Counting objects: 100% (5/5), done.\nremote: Compressing objects: 100% (3/3), done.\nReceiving objects: 100% (5/5), done.\n' + keys.length + ' files received.';
}

// ---- Status ----
function gitStatus() {
  if (!gitRepo.cloned) return notARepo();
  gitRepo._statusChecked = true;

  var staged = [];
  var unstaged = [];
  var untracked = [];

  // Check staging area
  var skeys = Object.keys(gitRepo.stagingArea);
  for (var i = 0; i < skeys.length; i++) {
    var action = gitRepo.stagingArea[skeys[i]].action;
    staged.push({ file: skeys[i], action: action });
  }

  // Check working directory
  var wkeys = Object.keys(gitRepo.workingDir);
  for (var j = 0; j < wkeys.length; j++) {
    var st = gitRepo.workingDir[wkeys[j]].status;
    if (st === 'new' && !gitRepo.stagingArea[wkeys[j]]) {
      untracked.push(wkeys[j]);
    } else if (st === 'modified' && !gitRepo.stagingArea[wkeys[j]]) {
      unstaged.push({ file: wkeys[j], action: 'modified' });
    }
  }

  var output = 'On branch main\n';

  if (staged.length > 0) {
    output += '\nChanges to be committed:\n';
    output += '  (use "git restore --staged <file>..." to unstage)\n';
    for (var s = 0; s < staged.length; s++) {
      var label = staged[s].action === 'delete' ? 'deleted' : staged[s].action === 'add' ? 'new file' : 'modified';
      output += '        ' + label + ':   ' + staged[s].file + '\n';
    }
  }

  if (unstaged.length > 0) {
    output += '\nChanges not staged for commit:\n';
    output += '  (use "git add <file>..." to update what will be committed)\n';
    for (var u = 0; u < unstaged.length; u++) {
      output += '        modified:   ' + unstaged[u].file + '\n';
    }
  }

  if (untracked.length > 0) {
    output += '\nUntracked files:\n';
    output += '  (use "git add <file>..." to include in what will be committed)\n';
    for (var t = 0; t < untracked.length; t++) {
      output += '        ' + untracked[t] + '\n';
    }
  }

  if (staged.length === 0 && unstaged.length === 0 && untracked.length === 0) {
    output += 'nothing to commit, working tree clean';
  }

  return output;
}

// ---- Add ----
function gitAdd(filename) {
  if (!gitRepo.cloned) return notARepo();

  if (filename === '.') {
    var added = [];
    var wkeys = Object.keys(gitRepo.workingDir);
    for (var i = 0; i < wkeys.length; i++) {
      var st = gitRepo.workingDir[wkeys[i]].status;
      if (st === 'new' || st === 'modified') {
        var action = st === 'new' ? 'add' : 'modify';
        gitRepo.stagingArea[wkeys[i]] = {
          content: gitRepo.workingDir[wkeys[i]].content,
          action: action
        };
        gitRepo.workingDir[wkeys[i]].status = 'staged';
        added.push(wkeys[i]);
      }
    }
    if (added.length === 0) return 'Nothing to add.';
    return added.length + ' file(s) staged: ' + added.join(', ');
  }

  if (!gitRepo.workingDir[filename]) {
    return 'fatal: pathspec \'' + filename + '\' did not match any files';
  }

  var status = gitRepo.workingDir[filename].status;
  if (status === 'unmodified' || status === 'staged') {
    return 'Already up to date.';
  }

  var act = status === 'new' ? 'add' : 'modify';
  gitRepo.stagingArea[filename] = {
    content: gitRepo.workingDir[filename].content,
    action: act
  };
  gitRepo.workingDir[filename].status = 'staged';

  return 'Staged: ' + filename;
}

// ---- Rm ----
function gitRm(filename) {
  if (!gitRepo.cloned) return notARepo();

  if (!gitRepo.workingDir[filename]) {
    return 'fatal: pathspec \'' + filename + '\' did not match any files';
  }

  gitRepo.stagingArea[filename] = {
    content: '',
    action: 'delete'
  };
  delete gitRepo.workingDir[filename];

  return 'rm \'' + filename + '\'';
}

// ---- Restore ----
function gitRestore(filename, isStaged) {
  if (!gitRepo.cloned) return notARepo();

  // git restore --staged <file> — unstage
  if (isStaged) {
    if (!gitRepo.stagingArea[filename]) {
      return 'error: pathspec \'' + filename + '\' did not match any file(s) known to git';
    }
    var staged = gitRepo.stagingArea[filename];
    // Move back to working dir with appropriate status
    if (staged.action === 'add') {
      // Was a new file — back to "new" in workingDir
      if (gitRepo.workingDir[filename]) {
        gitRepo.workingDir[filename].status = 'new';
      }
    } else if (staged.action === 'modify') {
      if (gitRepo.workingDir[filename]) {
        gitRepo.workingDir[filename].status = 'modified';
      }
    } else if (staged.action === 'delete') {
      // Restore the file to working dir
      var lastContent = getLastCommittedContent(filename);
      gitRepo.workingDir[filename] = { content: lastContent, status: 'unmodified' };
    }
    delete gitRepo.stagingArea[filename];
    return 'Unstaged: ' + filename;
  }

  // git restore <file> — discard working dir changes
  if (!gitRepo.workingDir[filename]) {
    return 'error: pathspec \'' + filename + '\' did not match any file(s) known to git';
  }

  var st = gitRepo.workingDir[filename].status;
  if (st === 'unmodified' || st === 'staged') {
    return 'Already up to date.';
  }

  if (st === 'new') {
    // New file — restore means delete it (it didn't exist before)
    delete gitRepo.workingDir[filename];
    return 'Deleted untracked file: ' + filename;
  }

  // Modified — restore to last committed content
  var committed = getLastCommittedContent(filename);
  if (!committed && committed !== '') {
    return 'error: could not restore \'' + filename + '\'';
  }
  gitRepo.workingDir[filename].content = committed;
  gitRepo.workingDir[filename].status = 'unmodified';
  return 'Restored: ' + filename + ' (changes discarded)';
}

// ---- Diff ----
function gitDiff() {
  if (!gitRepo.cloned) return notARepo();
  gitRepo._diffChecked = true;

  var diffs = [];

  // Check staging area first
  var skeys = Object.keys(gitRepo.stagingArea);
  if (skeys.length > 0) {
    for (var i = 0; i < skeys.length; i++) {
      var staged = gitRepo.stagingArea[skeys[i]];
      var oldContent = getLastCommittedContent(skeys[i]);
      if (staged.action === 'delete') {
        diffs.push(buildDiff(skeys[i], oldContent, '', true));
      } else {
        diffs.push(buildDiff(skeys[i], oldContent, staged.content, false));
      }
    }
  }

  // Check unstaged modifications
  var wkeys = Object.keys(gitRepo.workingDir);
  for (var j = 0; j < wkeys.length; j++) {
    var st = gitRepo.workingDir[wkeys[j]].status;
    if (st === 'modified') {
      var old = getLastCommittedContent(wkeys[j]);
      diffs.push(buildDiff(wkeys[j], old, gitRepo.workingDir[wkeys[j]].content, false));
    }
  }

  if (diffs.length === 0) return 'No changes detected.';
  return diffs.join('\n');
}

function getLastCommittedContent(filename) {
  for (var i = gitRepo.commits.length - 1; i >= 0; i--) {
    if (gitRepo.commits[i].files[filename]) {
      return gitRepo.commits[i].files[filename].content;
    }
  }
  return '';
}

function buildDiff(filename, oldContent, newContent, isDelete) {
  var output = 'diff --git a/' + filename + ' b/' + filename + '\n';
  output += '--- a/' + filename + '\n';
  output += '+++ ' + (isDelete ? '/dev/null' : 'b/' + filename) + '\n';

  var oldLines = oldContent ? oldContent.split('\n') : [];
  var newLines = newContent ? newContent.split('\n') : [];

  for (var i = 0; i < oldLines.length; i++) {
    if (oldLines[i] && (!newLines[i] || oldLines[i] !== newLines[i])) {
      output += '<span class="diff-remove">- ' + escapeHtml(oldLines[i]) + '</span>\n';
    }
  }
  for (var j = 0; j < newLines.length; j++) {
    if (newLines[j] && (!oldLines[j] || newLines[j] !== oldLines[j])) {
      output += '<span class="diff-add">+ ' + escapeHtml(newLines[j]) + '</span>\n';
    }
  }

  return output;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- Commit ----
function gitCommit(message) {
  if (!gitRepo.cloned) return notARepo();

  if (Object.keys(gitRepo.stagingArea).length === 0) {
    return 'nothing to commit, working tree clean';
  }

  if (!message || message.trim() === '') {
    return 'Aborting commit due to empty commit message.';
  }

  var commit = {
    hash: generateHash(),
    message: message,
    timestamp: new Date(),
    files: {}
  };

  var skeys = Object.keys(gitRepo.stagingArea);
  for (var i = 0; i < skeys.length; i++) {
    commit.files[skeys[i]] = {
      content: gitRepo.stagingArea[skeys[i]].content,
      action: gitRepo.stagingArea[skeys[i]].action
    };
  }

  gitRepo.commits.push(commit);
  gitRepo.head = commit.hash;
  gitRepo.stagingArea = {};

  // Reset all staged files to unmodified
  var wkeys = Object.keys(gitRepo.workingDir);
  for (var j = 0; j < wkeys.length; j++) {
    if (gitRepo.workingDir[wkeys[j]].status === 'staged') {
      gitRepo.workingDir[wkeys[j]].status = 'unmodified';
    }
  }

  var fileCount = skeys.length;
  return '[main ' + commit.hash + '] ' + message + '\n ' + fileCount + ' file(s) changed';
}

// ---- Log ----
function gitLog() {
  if (!gitRepo.cloned) return notARepo();
  gitRepo._logChecked = true;

  if (gitRepo.commits.length === 0) {
    return 'fatal: your current branch \'main\' does not have any commits yet';
  }

  var output = '';
  for (var i = gitRepo.commits.length - 1; i >= 0; i--) {
    var c = gitRepo.commits[i];
    var isPushed = gitRepo.remotePushed.indexOf(c.hash) !== -1;
    output += '<span class="log-hash">commit ' + c.hash + '</span>';
    if (isPushed) output += ' <span class="log-pushed">(origin/main)</span>';
    output += '\n';
    output += 'Date:   ' + c.timestamp.toLocaleString() + '\n';
    output += '\n    ' + escapeHtml(c.message) + '\n\n';
  }

  return output;
}

// ---- Push ----
function gitPush(args) {
  if (!gitRepo.cloned) return notARepo();

  if (args !== 'origin main') {
    return 'error: you must specify the remote and branch.\nUsage: git push origin main';
  }

  var unpushed = [];
  for (var i = 0; i < gitRepo.commits.length; i++) {
    if (gitRepo.remotePushed.indexOf(gitRepo.commits[i].hash) === -1) {
      unpushed.push(gitRepo.commits[i].hash);
    }
  }

  if (unpushed.length === 0) {
    return 'Everything up-to-date';
  }

  for (var j = 0; j < unpushed.length; j++) {
    gitRepo.remotePushed.push(unpushed[j]);
  }

  return 'Enumerating objects: ' + (unpushed.length * 3) + ', done.\nCounting objects: 100%, done.\nDelta compression using up to 8 threads\nCompressing objects: 100%, done.\nWriting objects: 100%, done.\nTo ' + gitRepo.remoteUrl + '\n   ' + unpushed[0].substring(0, 7) + '..' + unpushed[unpushed.length - 1].substring(0, 7) + '  main -> main\n' + unpushed.length + ' commit(s) pushed.';
}

// ---- Helper ----
function notARepo() {
  return 'fatal: not a git repository (or any of the parent directories): .git';
}
