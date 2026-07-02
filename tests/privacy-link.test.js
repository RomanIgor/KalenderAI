const assert = require('assert');
const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const app = fs.readFileSync('js/app.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const privacy = fs.readFileSync('privacy.html', 'utf8');
const datenschutz = fs.existsSync('datenschutz.html') ? fs.readFileSync('datenschutz.html', 'utf8') : '';
const datenschutzExists = fs.existsSync('datenschutz.html');

assert(index.includes('id="privacy-link"'), 'index should include a privacy link');
assert(index.includes('href="datenschutz.html"'), 'default privacy link should point to German privacy page');
assert(css.includes('.privacy-footer'), 'privacy footer should be styled');
assert(app.includes('privacyLink'), 'privacy link label should be localized');
assert(app.includes('privacyHref'), 'privacy link href should be localized');
assert(sw.includes('/KalenderAI/privacy.html'), 'service worker should cache privacy.html');
assert(sw.includes('/KalenderAI/datenschutz.html'), 'service worker should cache datenschutz.html');
assert(datenschutzExists, 'German privacy page should exist');
assert(privacy.includes('href="datenschutz.html"'), 'English privacy page should link to German version');
assert(datenschutz.includes('href="privacy.html"'), 'German privacy page should link to English version');
assert(!privacy.includes('30 days'), 'English privacy page should not promise a fixed 30-day provider retention period');
assert(!datenschutz.includes('30 Tagen'), 'German privacy page should not promise a fixed 30-day provider retention period');

console.log('privacy-link tests passed');
