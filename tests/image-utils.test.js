const assert = require('assert');
const { calculateTargetDimensions } = require('../js/image-utils.js');

function pixels(size) {
  return size.width * size.height;
}

const large = calculateTargetDimensions(8000, 6000, {
  maxPixels: 2048 * 2048,
  maxEdge: 2048,
});

assert(large.width <= 2048, 'large image width should fit max edge');
assert(large.height <= 2048, 'large image height should fit max edge');
assert(pixels(large) <= 2048 * 2048, 'large image should fit max pixels');
assert.strictEqual(large.width / large.height, 4 / 3, 'large image should keep aspect ratio');

const small = calculateTargetDimensions(1200, 900, {
  maxPixels: 2048 * 2048,
  maxEdge: 2048,
});

assert.deepStrictEqual(small, { width: 1200, height: 900 }, 'small images should not be upscaled');

console.log('image-utils tests passed');
