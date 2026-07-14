import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/systems/UISystem.js',import.meta.url),'utf8');
if (/this\.toast\s*=/.test(source)) throw new Error('UISystem.toast foi novamente sobrescrito por uma propriedade.');
if (!/this\.toastElement\s*=/.test(source)) throw new Error('Elemento visual do toast não está isolado em toastElement.');
console.log('OK: método toast não é sombreado pelo elemento DOM.');
