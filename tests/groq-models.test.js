const assert = require('assert');
const fs = require('fs');

const activeFiles = [
  'README.md',
  'calendar-ai-groq.html',
];

const deprecatedModels = [
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'qwen/qwen3.6-27b',
];

for (const file of activeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const model of deprecatedModels) {
    assert(!content.includes(model), `${file} should not reference deprecated Groq model ${model}`);
  }
}

console.log('groq-model tests passed');
