'use strict';

const { spawn } = require('node:child_process');
const { resolveToolbeltPaths } = require('./resolve-paths.cjs');

const { handsExe } = resolveToolbeltPaths();
const hands = spawn(handsExe, [], { stdio: 'inherit', windowsHide: true });

hands.once('error', (error) => {
  console.error(`CPC Toolbelt could not start Hands at "${handsExe}": ${error.message}`);
  process.exitCode = 1;
});
hands.once('exit', (code) => {
  process.exitCode = code ?? 1;
});
