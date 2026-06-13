const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const match = html.match(/<script\s+type="module">([\s\S]*?)<\/script>/);

if (!match) {
  throw new Error('Could not find inline module game script in index.html');
}

new vm.SourceTextModule(match[1], { identifier: htmlPath });
console.log('index.html inline script parses successfully');
