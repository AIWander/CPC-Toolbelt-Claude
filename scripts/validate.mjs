#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawnSync } from 'child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const errors = [];
const warnings = [];

function mustExist(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) errors.push('missing: ' + rel);
  return p;
}

function readJson(rel) {
  const p = mustExist(rel);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    errors.push('invalid JSON ' + rel + ': ' + e.message);
    return null;
  }
}

mustExist('README.md');
mustExist('LICENSE');
mustExist('RELATIONSHIP.md');
mustExist('SUBMISSION.md');
mustExist('mcp.optionals.example.json');
mustExist('scripts/resolve-paths.cjs');
mustExist('.mcp.json');

const sharedHttpExample = ['mcp.shared-', 'http.example.json'].join('');
if (fs.existsSync(path.join(root, sharedHttpExample))) {
  errors.push(sharedHttpExample + ' must not exist');
}

const plugin = readJson('.claude-plugin/plugin.json');
if (plugin) {
  if (plugin.name !== 'aiwander-cpc-toolbelt') errors.push('plugin name must be aiwander-cpc-toolbelt');
  if (plugin.version !== '0.1.0') errors.push('plugin version must be 0.1.0');
  if (plugin.author?.name !== 'AIwander') errors.push('author must be AIwander');
  if (plugin.repository !== 'https://github.com/AIWander/CPC-Toolbelt-Claude') {
    errors.push('repository must be https://github.com/AIWander/CPC-Toolbelt-Claude');
  }
  const kw = plugin.keywords || [];
  for (const k of ['cpc', 'hands', 'toolbelt', 'aiwander']) {
    if (!kw.includes(k)) errors.push('missing keyword: ' + k);
  }
  const userConfig = plugin.userConfig || {};
  for (const key of ['HANDS_HOME', 'CPC_ROOT', 'CPC_CACHE']) {
    const prop = userConfig[key];
    if (!prop) errors.push(key + ' userConfig required');
  }
  for (const [key, prop] of Object.entries(userConfig)) {
    if (!prop || typeof prop !== 'object') {
      errors.push('userConfig.' + key + ' is not an object');
      continue;
    }
    const def = prop.default;
    if (def != null && String(def).trim() !== '') {
      errors.push(key + ' must not ship a default path; resolve it at runtime');
    }
    if (prop.required === true) {
      errors.push(key + ' must not be required; an empty value resolves at runtime');
    }
  }
}

const installTimeVar =
  /\$\{(?:user_config\.(?:HANDS_HOME|CPC_ROOT|cpc_root|CPC_CACHE|cpc_cache)|HANDS_HOME|CPC_ROOT|CPC_CACHE|CLAUDE_PLUGIN_ROOT)\}/;

function isAbsolutePath(value) {
  return /^[A-Za-z]:[\\/]/.test(value) || value.startsWith('/') || value.startsWith('\\\\');
}

function assertStdioServers(rel, doc) {
  if (!doc) return;
  const servers = doc.mcpServers || {};
  for (const [name, spec] of Object.entries(servers)) {
    if (!spec || typeof spec !== 'object') {
      errors.push(rel + ' ' + name + ' is not an object');
      continue;
    }
    if (spec.url) errors.push(rel + ' ' + name + ' must be stdio, not a url');
    if (spec.type !== 'stdio') errors.push(rel + ' ' + name + ' must set type "stdio"');
    const cmd = String(spec.command || '');
    const args = Array.isArray(spec.args) ? spec.args.map(String) : [];
    if (!cmd) {
      errors.push(rel + ' ' + name + ' missing command');
      continue;
    }
    const pieces = [cmd, ...args];
    for (const piece of pieces) {
      if (isAbsolutePath(piece)) errors.push(rel + ' ' + name + ' uses an absolute path');
    }
    if (!pieces.some((piece) => installTimeVar.test(piece))) {
      errors.push(rel + ' ' + name + ' command must use ${CLAUDE_PLUGIN_ROOT} or an install-time path');
    }
  }
}

const mcp = readJson('.mcp.json');
if (mcp) {
  const keys = Object.keys(mcp.mcpServers || {});
  if (!keys.includes('cpc-hands')) errors.push('.mcp.json missing cpc-hands');
  if (keys.includes('cpc-cache')) errors.push('.mcp.json must NOT include cpc-cache in v1');
  if (keys.includes('cpc-programmer')) errors.push('.mcp.json must not include programmer by default');
  if (keys.length !== 1 || keys[0] !== 'cpc-hands') {
    errors.push('.mcp.json must contain only cpc-hands');
  }
  assertStdioServers('.mcp.json', mcp);
}

const optionals = readJson('mcp.optionals.example.json');
if (optionals) {
  const keys = Object.keys(optionals.mcpServers || {});
  for (const name of ['cpc-voice', 'cpc-workflow', 'cpc-manager']) {
    if (!keys.includes(name)) errors.push('mcp.optionals.example.json missing ' + name);
  }
  if (keys.includes('cpc-programmer') || keys.includes('cpc-cache')) {
    errors.push('mcp.optionals.example.json must not include programmer or cache');
  }
  assertStdioServers('mcp.optionals.example.json', optionals);
}

for (const skill of ['getting-started', 'toolbelt-setup', 'hands-getting-started']) {
  const sk = mustExist('skills/' + skill + '/SKILL.md');
  if (fs.existsSync(sk)) {
    const t = fs.readFileSync(sk, 'utf8');
    if (!t.startsWith('---')) errors.push(skill + ' SKILL.md missing frontmatter');
    if (!t.includes('name: ' + skill)) errors.push(skill + ' frontmatter name mismatch');
  }
}

const gettingStarted = path.join(root, 'skills', 'getting-started', 'SKILL.md');
if (fs.existsSync(gettingStarted)) {
  const t = fs.readFileSync(gettingStarted, 'utf8');
  if (!t.includes('hands_setup_status')) {
    errors.push('getting-started skill must tell the agent to call hands_setup_status first');
  }
  if (!/Tailscale/i.test(t)) errors.push('getting-started skill must walk through a private tunnel');
  if (!/never store/i.test(t)) errors.push('getting-started skill must say never store keys');
  if (!/public/i.test(t)) errors.push('getting-started skill must refuse a public link by default');
  if (!t.includes('hands-getting-started')) {
    errors.push('getting-started skill must keep the hands-getting-started tour separate');
  }
}

const readme = fs.existsSync(path.join(root, 'README.md'))
  ? fs.readFileSync(path.join(root, 'README.md'), 'utf8')
  : '';
if (readme) {
  if (!/autonomous/i.test(readme)) warnings.push('README should mention not branding as autonomous');
  if (!/CPC_CACHE/.test(readme)) warnings.push('README should mention CPC_CACHE');
  if (!/HANDS_HOME/.test(readme)) errors.push('README must document HANDS_HOME');
  if (!/stdio/i.test(readme)) errors.push('README must describe stdio MCP');
  if (!/CLAUDE_PLUGIN_ROOT/.test(readme)) {
    errors.push('README must document ${CLAUDE_PLUGIN_ROOT} for plugin-local files');
  }
  if (!/user_config\.HANDS_HOME/.test(readme)) {
    errors.push('README must document the install-time Hands home variable');
  }
}

const skipScan = new Set([path.normalize('scripts/validate.mjs')]);
const scanExt = new Set(['.md', '.mdc', '.js', '.mjs', '.cjs', '.json', '.svg', '.txt', '.yml', '.yaml']);

// Patterns are split so this file does not contain the literals it rejects.
const machineRes = [
  new RegExp('C:[\\\\/]+' + 'CPC\\b', 'i'),
  new RegExp('suite_' + 'attempts', 'i'),
  new RegExp('\\b' + String.fromCharCode(66, 69, 69) + '\\b'),
  new RegExp('Jose' + 'p'),
  new RegExp('\\b' + ['p', 'a', 'l'].join('') + '\\b', 'i'),
  new RegExp('tail' + '7263d4', 'i'),
  new RegExp('cursor-' + '20260924', 'i'),
  new RegExp('shared-' + 'http', 'i'),
  new RegExp('\\b100\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b'),
  new RegExp('[A-Za-z]:\\\\Users\\\\', 'i'),
  /\b777[1-9]\b/,
];

function textHitsMachine(text) {
  return machineRes.some((re) => re.test(text));
}

const badSamples = [
  'C:\\' + 'CPC',
  'C:/' + 'CPC/cache',
  'suite_' + 'attempts',
  String.fromCharCode(66, 69, 69),
  'Jose' + 'p',
  ' ' + ['p', 'a', 'l'].join('') + ' ',
  'tail' + '7263d4',
  'cursor-' + '20260924',
  'shared-' + 'http',
  '100.' + '64.0.1',
  'C:\\' + 'Users\\someone',
  '777' + '1',
  '777' + '9',
];
for (const sample of badSamples) {
  if (!textHitsMachine(sample)) errors.push('validator pattern missed a forbidden sample');
}
const goodSamples = [
  '%LOCALAPPDATA%\\AIWander\\Hands',
  '${CLAUDE_PLUGIN_ROOT}/scripts/resolve-paths.cjs',
  '${user_config.HANDS_HOME}/servers/hands.exe',
  'Tailscale',
  '100.x',
  '777' + '0',
];
for (const sample of goodSamples) {
  if (textHitsMachine(sample)) errors.push('validator pattern flagged a portable sample: ' + sample);
}

function walk(dir, relBase) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const abs = path.join(dir, name);
    const rel = relBase ? relBase + '/' + name : name;
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      walk(abs, rel);
      continue;
    }
    if (!scanExt.has(path.extname(name))) continue;
    if (skipScan.has(path.normalize(rel))) continue;
    const text = fs.readFileSync(abs, 'utf8');
    for (const re of machineRes) {
      if (re.test(text)) errors.push('hard-coded machine path or host detail in ' + rel + ' (' + re + ')');
    }
  }
}
walk(root, '');

function withEnv(extra, fn) {
  const keys = [
    'HANDS_HOME',
    'CPC_ROOT',
    'cpc_root',
    'CPC_CACHE',
    'cpc_cache',
    'LOCALAPPDATA',
    'XDG_DATA_HOME',
    'CLAUDE_PLUGIN_OPTION_HANDS_HOME',
    'CLAUDE_PLUGIN_OPTION_CPC_ROOT',
    'CLAUDE_PLUGIN_OPTION_CPC_CACHE',
  ];
  const prev = {};
  for (const key of keys) {
    prev[key] = process.env[key];
    delete process.env[key];
  }
  Object.assign(process.env, extra);
  try {
    return fn();
  } finally {
    for (const key of keys) {
      if (prev[key] === undefined) delete process.env[key];
      else process.env[key] = prev[key];
    }
  }
}

const { resolveToolbeltPaths } = require(path.join(root, 'scripts', 'resolve-paths.cjs'));

{
  const os = await import('os');
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'toolbelt-paths-'));
  const handsHome = path.join(fixture, 'hands-home');
  const cpcRoot = path.join(fixture, 'cpc-root');
  const cacheDir = path.join(fixture, 'cache-override');
  const local = path.join(fixture, 'local');

  const preferHands = withEnv(
    { HANDS_HOME: handsHome, CPC_ROOT: cpcRoot, cpc_root: path.join(fixture, 'legacy'), CPC_CACHE: cacheDir },
    () => resolveToolbeltPaths(),
  );
  if (preferHands.home.source !== 'HANDS_HOME' || preferHands.home.path !== path.resolve(handsHome)) {
    errors.push('HANDS_HOME must win over CPC_ROOT and cpc_root');
  }
  if (preferHands.cache.source !== 'CPC_CACHE' || preferHands.cache.path !== path.resolve(cacheDir)) {
    errors.push('CPC_CACHE must override <Hands home>/cache');
  }
  if (preferHands.handsExe !== path.join(path.resolve(handsHome), 'servers', 'hands.exe')) {
    errors.push('hands.exe must stay under the resolved home');
  }

  const fromRoot = withEnv({ CPC_ROOT: cpcRoot, cpc_root: path.join(fixture, 'legacy') }, () => resolveToolbeltPaths());
  if (fromRoot.home.source !== 'CPC_ROOT' || fromRoot.home.path !== path.resolve(cpcRoot)) {
    errors.push('CPC_ROOT should override the default Hands home when HANDS_HOME is unset');
  }

  const fromLegacy = withEnv({ cpc_root: cpcRoot }, () => resolveToolbeltPaths());
  if (fromLegacy.home.source !== 'CPC_ROOT' || fromLegacy.home.path !== path.resolve(cpcRoot)) {
    errors.push('cpc_root must remain a back-compat alias for CPC_ROOT');
  }

  const fromPlugin = withEnv(
    { CLAUDE_PLUGIN_OPTION_HANDS_HOME: handsHome, CLAUDE_PLUGIN_OPTION_CPC_ROOT: cpcRoot },
    () => resolveToolbeltPaths(),
  );
  if (fromPlugin.home.source !== 'HANDS_HOME' || fromPlugin.home.path !== path.resolve(handsHome)) {
    errors.push('CLAUDE_PLUGIN_OPTION_HANDS_HOME must resolve as HANDS_HOME');
  }

  const emptyHands = withEnv({ HANDS_HOME: '   ', CPC_ROOT: cpcRoot }, () => resolveToolbeltPaths());
  if (emptyHands.home.source !== 'CPC_ROOT') {
    errors.push('an empty HANDS_HOME must fall through to CPC_ROOT');
  }

  const unresolved = withEnv({ HANDS_HOME: '${NOT_A_REAL_VAR}', CPC_ROOT: cpcRoot }, () => resolveToolbeltPaths());
  if (unresolved.home.source !== 'CPC_ROOT') {
    errors.push('an unresolved HANDS_HOME must fall through to CPC_ROOT');
  }

  const defaults = withEnv({ LOCALAPPDATA: local, cpc_cache: cacheDir }, () => resolveToolbeltPaths());
  const expectedHome = path.join(local, 'AIWander', 'Hands');
  if (defaults.home.source !== 'default' || defaults.home.path !== expectedHome) {
    errors.push('default Hands home must be %LOCALAPPDATA%/AIWander/Hands');
  }
  if (defaults.cache.path !== path.resolve(cacheDir)) {
    errors.push('cpc_cache must remain a back-compat alias for CPC_CACHE');
  }

  const defaultCache = withEnv({ LOCALAPPDATA: local }, () => resolveToolbeltPaths());
  if (defaultCache.cache.source !== 'default' || defaultCache.cache.path !== path.join(expectedHome, 'cache')) {
    errors.push('default Cache must be <Hands home>/cache');
  }
  if (textHitsMachine(JSON.stringify(defaultCache))) {
    errors.push('default resolution emitted a machine-specific path');
  }

  const cli = spawnSync(process.execPath, [path.join(root, 'scripts', 'resolve-paths.cjs')], {
    encoding: 'utf8',
    env: { ...process.env, HANDS_HOME: '', CPC_ROOT: '', cpc_root: '', CPC_CACHE: '', cpc_cache: '', LOCALAPPDATA: local },
  });
  if (cli.status !== 0) errors.push('resolve-paths.cjs exited ' + cli.status);
  try {
    const cliJson = JSON.parse((cli.stdout || '').trim());
    if (cliJson.home?.source !== 'default' || cliJson.home?.path !== expectedHome) {
      errors.push('resolve-paths.cjs CLI must print the runtime default home');
    }
    if (textHitsMachine(cli.stdout || '')) errors.push('resolve-paths.cjs CLI emitted a machine-specific path');
  } catch {
    errors.push('resolve-paths.cjs CLI did not emit JSON');
  }

  fs.rmSync(fixture, { recursive: true, force: true });
}

const result = { root, errors, warnings, ok: errors.length === 0 };
console.log(JSON.stringify(result, null, 2));
process.exit(errors.length ? 1 : 0);
