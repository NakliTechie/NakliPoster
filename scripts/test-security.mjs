import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

const attrsFor=id=>{
  const match=html.match(new RegExp(`<iframe\\s+id="${id}"([^>]*)>`));
  assert.ok(match,`${id} iframe exists`);
  return match[1];
};

for(const id of ['script-sandbox','res-preview-frame']){
  const attrs=attrsFor(id);
  assert.match(attrs,/sandbox="allow-scripts"/,`${id} allows scripts only`);
  assert.doesNotMatch(attrs,/allow-same-origin/,`${id} keeps an opaque origin`);
}

const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length,1,'single-file app retains one executable document script');
new vm.Script(scripts[0][1],{filename:'index.html'});

const runScriptBlock=html.slice(html.indexOf('async function runScript('),html.indexOf('// ── Collection variable helpers'));
assert.doesNotMatch(runScriptBlock,/new Function\s*\(/,'parent runScript never evaluates user code');
assert.match(html,/new MessageChannel\(\)/,'sandbox uses a private per-run channel');
assert.match(html,/postMessage\(\{type:'run',script,context\},'\*',\[channel\.port2\]\)/,'sandbox transfers a private port before user code starts');
assert.match(html,/function scriptWorkerBootstrap\(\)/,'user scripts execute in a dedicated worker');
assert.match(html,/default-src 'none';[^"]*connect-src 'none'/,'sandbox document has a deny-by-default network CSP');
assert.match(html,/'fetch','XMLHttpRequest','WebSocket'[^]*'postMessage'/,'worker removes ambient network and parent-message capabilities');
assert.match(html,/for\(let target=root;target;target=Object\.getPrototypeOf\(target\)\)/,'capabilities are erased across live prototype chains');
assert.match(html,/credentials:'omit'/,'script bridge omits ambient credentials');
assert.match(html,/await runScript\(tab\.preScript/,'pre-request scripts are awaited');
assert.match(html,/await runScript\(tab\.testScript/,'test scripts are awaited');
assert.match(html,/retState!==state/,'OAuth callback state remains verified');
assert.match(html,/e\.origin==='null'/,'developer message API rejects opaque origins');
assert.match(html,/e\.origin!==location\.origin/,'developer message API distinguishes cross-origin senders');
assert.match(html,/e\.source!==window\.opener/,'bookmarklet imports are limited to the opener');
assert.match(html,/function sanitizeSharedItems\(/,'shared collections pass through a script sanitizer');
assert.match(html,/const \{preScript,testScript,testResults,consoleLogs,_open,_collId,\.\.\.safe\}/,'shared executable fields are stripped');

console.log('NakliPoster security contracts: ok');
