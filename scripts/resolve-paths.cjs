'use strict';
/**
 * Resolve Hands home and Cache at runtime.
 *
 * Home: HANDS_HOME, else CPC_ROOT or cpc_root (back-compat), else
 * %LOCALAPPDATA%\AIWander\Hands (platform user-data dir when LOCALAPPDATA is unset).
 * Cache: CPC_CACHE or cpc_cache if set, else <home>/cache.
 * No machine-specific fallback.
 *
 * Claude plugin userConfig is also read from CLAUDE_PLUGIN_OPTION_<KEY>
 * (hook processes and the environment mapping in .mcp.json).
 */
const os = require('os');
const path = require('path');

function nonempty(name) {
  const raw = process.env[name];
  if (raw == null) return '';
  return String(raw).trim();
}

function expandEnv(input) {
  let unresolved = false;
  const expand = (name) => {
    const value = process.env[name];
    if (value == null || String(value).trim() === '') {
      unresolved = true;
      return '';
    }
    return String(value).trim();
  };
  const out = String(input)
    .replace(/%([^%]+)%/g, (_, name) => expand(name))
    .replace(/\$\{([^}]+)\}/g, (_, name) => expand(name))
    .replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => expand(name));
  if (unresolved) return '';
  return out.trim();
}

function firstResolved(names) {
  for (const name of names) {
    const value = expandEnv(nonempty(name));
    if (value) return path.resolve(value);
  }
  return '';
}

function defaultHandsHome() {
  const local = nonempty('LOCALAPPDATA');
  if (local) return path.join(local, 'AIWander', 'Hands');
  if (process.platform === 'win32') {
    return path.join(os.homedir(), 'AppData', 'Local', 'AIWander', 'Hands');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'AIWander', 'Hands');
  }
  const xdg = nonempty('XDG_DATA_HOME');
  const base = xdg || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'AIWander', 'Hands');
}

function resolveHome() {
  const hands = firstResolved(['HANDS_HOME', 'CLAUDE_PLUGIN_OPTION_HANDS_HOME']);
  if (hands) return { path: hands, source: 'HANDS_HOME' };
  const root = firstResolved(['CPC_ROOT', 'cpc_root', 'CLAUDE_PLUGIN_OPTION_CPC_ROOT']);
  if (root) return { path: root, source: 'CPC_ROOT' };
  return { path: path.resolve(defaultHandsHome()), source: 'default' };
}

function resolveToolbeltPaths() {
  const home = resolveHome();
  const cacheEnv = firstResolved(['CPC_CACHE', 'cpc_cache', 'CLAUDE_PLUGIN_OPTION_CPC_CACHE']);
  const cache = cacheEnv
    ? { path: cacheEnv, source: 'CPC_CACHE' }
    : { path: path.join(home.path, 'cache'), source: 'default' };
  const serversDir = path.join(home.path, 'servers');
  return {
    home,
    cache,
    serversDir,
    handsExe: path.join(serversDir, 'hands.exe'),
  };
}

module.exports = { resolveToolbeltPaths, defaultHandsHome };

if (require.main === module) {
  process.stdout.write(JSON.stringify(resolveToolbeltPaths(), null, 2) + '\n');
}
