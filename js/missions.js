// ============================================================
// IRON-7 Git Simulator — Mission Definitions
// ============================================================

var currentMission = 0;
var missionCompleted = {};

var missions = [
  {
    id: 1,
    title: 'Clonar el Repositorio',
    briefing: 'Los sistemas de la estacion IRON-7 estan almacenados en un repositorio remoto. Clona el repositorio para empezar las reparaciones.',
    hint: 'git clone https://github.com/iron-7/station-systems.git',
    validate: function () {
      return gitRepo.cloned === true;
    },
    onComplete: function () {
      // Auto-modify shields.config and create comms.js
      gitRepo.workingDir['shields.config'].content = '# Shield Configuration\nstatus=active\npower=100\nauto_repair=true\n';
      gitRepo.workingDir['shields.config'].status = 'modified';

      gitRepo.workingDir['comms.js'] = {
        content: '// IRON-7 Communications Module\nconst frequency = 7700;\nconst encryption = "AES-256";\nconsole.log("Comms online");\n',
        status: 'new'
      };

      return '[ORDENADOR DE LA ESTACION] El sistema de auto-reparacion ha actualizado shields.config y ha creado comms.js';
    }
  },
  {
    id: 2,
    title: 'Comprobar el Estado',
    briefing: 'Antes de hacer cambios, comprueba el estado actual del repositorio para ver que archivos han cambiado.',
    hint: 'git status',
    validate: function () {
      return gitRepo._statusChecked === true;
    },
    onComplete: function () {
      return null;
    }
  },
  {
    id: 3,
    title: 'Anadir Cambios al Staging',
    briefing: 'El sistema de auto-reparacion ha actualizado shields.config y creado comms.js. Anade estos cambios al staging area para prepararlos para el commit.',
    hint: 'git add . (o anade cada archivo individualmente)',
    validate: function () {
      return Object.keys(gitRepo.stagingArea).length >= 2;
    },
    onComplete: function () {
      return null;
    }
  },
  {
    id: 4,
    title: 'Ver las Diferencias',
    briefing: 'Antes de confirmar los cambios, revisa que ha cambiado exactamente en los archivos.',
    hint: 'git diff',
    validate: function () {
      return gitRepo._diffChecked === true;
    },
    onComplete: function () {
      return null;
    }
  },
  {
    id: 5,
    title: 'Hacer Commit',
    briefing: 'Los cambios estan listos. Haz un commit con un mensaje descriptivo para registrar las reparaciones.',
    hint: 'git commit -m "tu mensaje aqui"',
    validate: function () {
      return gitRepo.commits.length >= 2;
    },
    onComplete: function () {
      // Auto-modify navigation.js AND create a bad file
      gitRepo.workingDir['navigation.js'].content = '// IRON-7 Navigation System\nconst heading = 90;\nconst speed = 28000;\nconsole.log("Navigation online — course set");\n';
      gitRepo.workingDir['navigation.js'].status = 'modified';

      gitRepo.workingDir['debug.log'] = {
        content: '[ERROR] Core dump detected\n[WARN] Memory leak in sector 7\n',
        status: 'new'
      };

      // Auto-stage both (simulating a "git add ." accident)
      gitRepo.stagingArea['navigation.js'] = {
        content: gitRepo.workingDir['navigation.js'].content,
        action: 'modify'
      };
      gitRepo.workingDir['navigation.js'].status = 'staged';

      gitRepo.stagingArea['debug.log'] = {
        content: gitRepo.workingDir['debug.log'].content,
        action: 'add'
      };
      gitRepo.workingDir['debug.log'].status = 'staged';

      return '[ORDENADOR DE LA ESTACION] navigation.js actualizado y debug.log generado. ALERTA: alguien ha ejecutado "git add ." por error y ambos archivos estan en staging. debug.log NO debe subirse al repositorio. Usa git restore para corregir esto.';
    }
  },
  {
    id: 6,
    title: 'Deshacer Cambios con Restore',
    briefing: 'debug.log se ha anadido al staging por error — es un archivo temporal que no debe estar en el repositorio. Primero sacalo del staging con "git restore --staged", y luego descarta el archivo con "git restore". Despues haz commit solo con navigation.js.',
    hint: 'git restore --staged debug.log → git restore debug.log → git commit -m "..."',
    validate: function () {
      return (
        !gitRepo.stagingArea['debug.log'] &&
        !gitRepo.workingDir['debug.log'] &&
        gitRepo.commits.length >= 3
      );
    },
    onComplete: function () {
      return null;
    }
  },
  {
    id: 7,
    title: 'Ver el Historial (git log)',
    briefing: 'Comprueba el historial de commits para ver el registro de cambios del repositorio.',
    hint: 'git log',
    validate: function () {
      return gitRepo._logChecked === true;
    },
    onComplete: function () {
      // Create shields.js and prepare for rm of shields.config
      gitRepo.workingDir['shields.js'] = {
        content: '// IRON-7 Shield System v2\nclass ShieldManager {\n  constructor() {\n    this.power = 100;\n    this.status = "active";\n  }\n  activate() {\n    console.log("Shields online");\n  }\n}\n',
        status: 'new'
      };

      return '[ORDENADOR DE LA ESTACION] Se ha migrado el sistema de escudos a shields.js. El archivo shields.config esta obsoleto y debe eliminarse.';
    }
  },
  {
    id: 8,
    title: 'Eliminar Archivo y Commit',
    briefing: 'El archivo shields.config esta obsoleto — el sistema de escudos se ha migrado a shields.js. Elimina el archivo viejo, anade el nuevo, y haz commit.',
    hint: 'git rm shields.config → git add shields.js → git commit -m "..."',
    validate: function () {
      return gitRepo.commits.length >= 4 && !gitRepo.workingDir['shields.config'] && gitRepo.workingDir['shields.js'];
    },
    onComplete: function () {
      return null;
    }
  },
  {
    id: 9,
    title: 'Push al Remoto',
    briefing: 'Todas las reparaciones estan completas. Sube los cambios al servidor central para que el resto de la tripulacion pueda acceder a ellos.',
    hint: 'git push origin main',
    validate: function () {
      return gitRepo.remotePushed.length === gitRepo.commits.length;
    },
    onComplete: function () {
      return null;
    }
  }
];

function checkMission() {
  if (currentMission >= missions.length) return null;

  var mission = missions[currentMission];
  if (mission.validate()) {
    missionCompleted[currentMission] = true;
    var msg = mission.onComplete();
    currentMission++;
    return { completed: mission, message: msg, allDone: currentMission >= missions.length };
  }
  return null;
}

function getCurrentMission() {
  if (currentMission >= missions.length) return null;
  return missions[currentMission];
}
