// ============================================================
// IRON-7 Git Simulator — Command Parser
// ============================================================

function parseCommand(input) {
  var cmd = input.trim().replace(/\s+/g, ' ');
  if (!cmd) return { output: '', success: true, isHtml: false };

  // Help
  if (cmd === 'help') {
    return {
      output:
        'Available commands:\n' +
        '  git clone <url>        Clone a repository\n' +
        '  git status             Show working tree status\n' +
        '  git add <file>         Stage a file (use "." for all)\n' +
        '  git rm <file>          Remove a file\n' +
        '  git diff               Show changes\n' +
        '  git commit -m "msg"    Record changes\n' +
        '  git log                Show commit history\n' +
        '  git push               Push commits to remote\n' +
        '  clear                  Clear terminal\n' +
        '  help                   Show this help',
      success: true,
      isHtml: false
    };
  }

  // Clear
  if (cmd === 'clear') {
    return { output: '__CLEAR__', success: true, isHtml: false };
  }

  // git clone
  var cloneMatch = cmd.match(/^git clone (.+)$/);
  if (cloneMatch) {
    return { output: gitClone(cloneMatch[1].trim()), success: true, isHtml: false };
  }

  // git status
  if (cmd === 'git status') {
    return { output: gitStatus(), success: true, isHtml: false };
  }

  // git add
  var addMatch = cmd.match(/^git add (.+)$/);
  if (addMatch) {
    return { output: gitAdd(addMatch[1].trim()), success: true, isHtml: false };
  }

  // git rm
  var rmMatch = cmd.match(/^git rm (.+)$/);
  if (rmMatch) {
    return { output: gitRm(rmMatch[1].trim()), success: true, isHtml: false };
  }

  // git diff
  if (cmd === 'git diff') {
    return { output: gitDiff(), success: true, isHtml: true };
  }

  // git commit -m "message" or 'message'
  var commitMatch = cmd.match(/^git commit -m ["']([^"']+)["']$/);
  if (commitMatch) {
    return { output: gitCommit(commitMatch[1]), success: true, isHtml: false };
  }

  // git commit without -m
  if (cmd === 'git commit' || cmd.match(/^git commit\b/)) {
    if (cmd === 'git commit') {
      return { output: 'error: switch \'m\' requires a value\nUsage: git commit -m "your message"', success: false, isHtml: false };
    }
    // Has -m but bad format
    if (cmd.match(/^git commit -m$/)) {
      return { output: 'error: switch \'m\' requires a value', success: false, isHtml: false };
    }
    // Has -m but no quotes
    var noQuoteMatch = cmd.match(/^git commit -m\s+(.+)$/);
    if (noQuoteMatch && !noQuoteMatch[1].match(/^["']/)) {
      return { output: 'Tip: Wrap your message in quotes: git commit -m "' + noQuoteMatch[1] + '"', success: false, isHtml: false };
    }
    return { output: 'Usage: git commit -m "your message"', success: false, isHtml: false };
  }

  // git log
  if (cmd === 'git log') {
    return { output: gitLog(), success: true, isHtml: true };
  }

  // git push
  if (cmd === 'git push') {
    return { output: gitPush(), success: true, isHtml: false };
  }

  // ls (easter egg)
  if (cmd === 'ls') {
    if (!gitRepo.cloned) return { output: notARepo(), success: false, isHtml: false };
    var files = Object.keys(gitRepo.workingDir);
    return { output: files.length > 0 ? files.join('  ') : '(empty)', success: true, isHtml: false };
  }

  // Unknown git command
  if (cmd.match(/^git\b/)) {
    var subCmd = cmd.split(' ')[1] || '';
    return {
      output: 'git: \'' + subCmd + '\' is not a git command. See \'help\'.',
      success: false,
      isHtml: false
    };
  }

  // Unknown command
  return {
    output: 'Command not recognized: \'' + cmd + '\'. Type \'help\' for available commands.',
    success: false,
    isHtml: false
  };
}
