const assert = require('assert');
const { calculateTargetDimensions, getJpegDimensions } = require('../js/image-utils.js');

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

const jpegWithSof0 = new Uint8Array([
  0xff, 0xd8,
  0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00,
  0xff, 0xc0, 0x00, 0x11, 0x08, 0x17, 0x70, 0x1f, 0x40, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
  0xff, 0xd9,
]).buffer;

assert.deepStrictEqual(getJpegDimensions(jpegWithSof0), { width: 8000, height: 6000 }, 'JPEG dimensions should be read from SOF marker');

console.log('image-utils tests passed');
