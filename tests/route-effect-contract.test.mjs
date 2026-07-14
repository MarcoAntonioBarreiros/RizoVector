import fs from 'node:fs';
import assert from 'node:assert/strict';

const route=fs.readFileSync(new URL('../src/systems/RouteSystem.js', import.meta.url),'utf8');
const effects=fs.readFileSync(new URL('../src/systems/EffectsSystem.js', import.meta.url),'utf8');

const calls=[...route.matchAll(/effects\.([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]);
for(const name of calls){
  assert.match(effects,new RegExp(`\\b${name}\\s*\\(`),`EffectsSystem must implement ${name}()`);
}
assert.match(effects,/rootSpark\s*\(/,'rootSpark must exist');
assert.doesNotMatch(route,/p\.vy=Math\.min\(p\.vy,-520\)/,'fast lane must not hard-lock vertical velocity');
console.log('route/effects contract ok');
