import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];

assert.equal(scripts.length,1,'NakliPoster remains a single-file app with one script');
new vm.Script(scripts[0][1],{filename:'index.html'});
assert.match(html,/\/\* naklios-sdk:begin ver=\d+ sha256=[0-9a-f]{64}/,'the canonical NakliOS SDK is vendored inline through the marker splice');
assert.match(html,/useBackend: function \(backend\)\s*\{ return rpc\('naklios:fs:selectBackend'/,'SDK exposes explicit backend selection');
assert.match(html,/autosave: function \(opts\)/,'the vendored SDK carries the autosave primitive');
assert.match(html,/const HOSTED_WORKSPACE_FILE='nakliposter-workspace\.json'/,
  'hosted workspace uses an app-scoped document');
assert.match(html,/collections:S\.collections,[\s\S]*environments:S\.environments,[\s\S]*globals:S\.globals/,
  'hosted document covers collections and variable stores');
assert.match(html,/if\(S\.storageMode==='naklios'\) scheduleHostedWorkspaceSave\(\)/,
  'hosted saves do not write collection state to localStorage');
assert.match(html,/Each location has its own collections and environments\./,
  'storage UI explains location isolation');
assert.match(html,/Nothing was copied or deleted\./,'backend switching confirms non-migration');
assert.match(html,/applyWorkspaceData\(localWorkspaceData\(\)\)/,
  'browser fallback is reloaded instead of merging hosted state');
assert.match(html,/async function openDirectWorkspace\(\)/,
  'standalone File System Access workspace remains available');
assert.match(html,/if\(S\.storageMode==='naklios'\)\{[\s\S]*scheduleHostedWorkspaceSave\(\);[\s\S]*return;/,
  'collection file saves route back to the hosted workspace');
assert.match(html,/function cancelScheduledHostedWorkspaceSave\(\)\{\n  if\(!_hostedSaver\) return;\n  _hostedSaver\.dispose\(\);\n  _hostedSaver=null;/,
  'a queued workspace save is abandoned after a backend rebind');
assert.match(html,/Object\.assign\(\{ backend: capabilities\.fsBackend \}, data \|\| \{\}\)/,
  'filesystem operations carry backend affinity for host-side race rejection');

// DUR (2026-09-24): the SDK owns save timing. beforeunload cannot await, so app code (outside the
// vendored SDK block) must not try to save there; the hosted workspace rides the SDK's autosave.
const appCode=html.replace(/\/\* naklios-sdk:begin[\s\S]*?naklios-sdk:end \*\//,'');
assert.notEqual(appCode,html,'the vendored SDK block was found and stripped');
assert.doesNotMatch(appCode,/addEventListener\(\s*['"]beforeunload['"]|onbeforeunload/,'no app-level beforeunload handler (a save there cannot complete)');
assert.match(appCode,/function scheduleHostedWorkspaceSave\(\)\{ hostedSaver\(\)\.markDirty\(\); \}/,'every hosted change reaches the autosave');
assert.match(appCode,/naklios\.fs\.autosave\(\{\n    save:\(\)=>\{\n      if\(S\.storageMode!=='naklios'\) return;\n      return naklios\.fs\.write\(HOSTED_WORKSPACE_FILE,/,
  'the snapshot is taken and the write issued in one call (the write carries its backend)');

console.log('NakliPoster NakliOS storage contracts: ok');
