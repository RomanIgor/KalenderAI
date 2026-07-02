const assert = require('assert');
const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const app = fs.readFileSync('js/app.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

assert(index.includes('id="privacy-link"'), 'index should include a privacy link');
assert(index.includes('href="privacy.html"'), 'privacy link should point to privacy.html');
assert(css.includes('.privacy-footer'), 'privacy footer should be styled');
assert(app.includes('privacyLink'), 'privacy link label should be localized');
assert(sw.includes('/KalenderAI/privacy.html'), 'service worker should cache privacy.html');

console.log('privacy-link tests passed');
