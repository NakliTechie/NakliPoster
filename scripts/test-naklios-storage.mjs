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
assert.match(html,/function installNakliOSSdk\(/,'NakliOS SDK is vendored inline');
assert.match(html,/useBackend:backend=>rpc\('naklios:fs:selectBackend'/,'SDK exposes explicit backend selection');
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
assert.match(html,/S\._nakliosBackend!==backendAtQueue/,
  'a queued workspace save is abandoned after a backend rebind');
assert.match(html,/Object\.assign\(\{backend:capabilities\.fsBackend\},data\)/,
  'filesystem operations carry backend affinity for host-side race rejection');

console.log('NakliPoster NakliOS storage contracts: ok');
