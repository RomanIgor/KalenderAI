(function (root) {
  const DEFAULT_IMAGE_OPTIONS = {
    maxPixels: 2048 * 2048,
    maxEdge: 2048,
    maxSourceBytes: 50 * 1024 * 1024,
    quality: 0.86,
    mimeType: 'image/jpeg',
  };

  function imageError(message, code) {
    const err = new Error(message);
    err.code = code;
    return err;
  }

  function validateSourceImageFile(file, options) {
    const opts = Object.assign({}, DEFAULT_IMAGE_OPTIONS, options || {});
    if (!file) throw imageError('No image selected', 'IMAGE_FILE_MISSING');
    if (file.size > opts.maxSourceBytes) {
      throw imageError('Image file is too large', 'IMAGE_FILE_TOO_LARGE');
    }
  }

  function calculateTargetDimensions(width, height, options) {
    const opts = Object.assign({}, DEFAULT_IMAGE_OPTIONS, options || {});
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error('Invalid image dimensions');
    }

    const edgeScale = Math.min(1, opts.maxEdge / Math.max(width, height));
    const pixelScale = Math.min(1, Math.sqrt(opts.maxPixels / (width * height)));
    const scale = Math.min(edgeScale, pixelScale);

    return {
      width: Math.max(1, Math.round(width * scale)),
      height: Math.max(1, Math.round(height * scale)),
    };
  }

  function isJpeg(buffer) {
    const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 2));
    return bytes.length === 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
  }

  function getJpegDimensions(buffer) {
    const view = new DataView(buffer);
    if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;

    let offset = 2;
    while (offset + 9 < view.byteLength) {
      if (view.getUint8(offset) !== 0xff) return null;

      const marker = view.getUint8(offset + 1);
      offset += 2;

      if (marker === 0xd8 || marker === 0xd9) continue;
      if (marker === 0xda) return null;
      if (offset + 2 > view.byteLength) return null;

      const length = view.getUint16(offset);
      if (length < 2 || offset + length > view.byteLength) return null;

      const isSof =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);

      if (isSof) {
        return {
          width: view.getUint16(offset + 5),
          height: view.getUint16(offset + 3),
        };
      }

      offset += length;
    }

    return null;
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image could not be loaded'));
      };
      img.src = url;
    });
  }

  async function getImageDimensions(file) {
    const head = await file.slice(0, 128 * 1024).arrayBuffer();
    if (isJpeg(head)) {
      const jpegSize = getJpegDimensions(head);
      if (jpegSize) return jpegSize;
    }

    const img = await loadImage(file);
    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      image: img,
    };
  }

  async function createResizedBitmap(file, size) {
    if (typeof createImageBitmap !== 'function') return null;
    try {
      return await createImageBitmap(file, {
        resizeWidth: size.width,
        resizeHeight: size.height,
        resizeQuality: 'high',
      });
    } catch (err) {
      return null;
    }
  }

  async function resizeImageFile(file, options) {
    const opts = Object.assign({}, DEFAULT_IMAGE_OPTIONS, options || {});
    validateSourceImageFile(file, opts);
    const source = await getImageDimensions(file);
    const size = calculateTargetDimensions(source.width, source.height, opts);
    const bitmap = await createResizedBitmap(file, size);
    const drawable = bitmap || source.image || await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;

    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(drawable, 0, 0, size.width, size.height);
    if (bitmap && typeof bitmap.close === 'function') bitmap.close();

    const dataUrl = canvas.toDataURL(opts.mimeType, opts.quality);
    return {
      dataUrl,
      base64: dataUrl.split(',')[1],
      mimeType: opts.mimeType,
      width: size.width,
      height: size.height,
    };
  }

  const api = {
    DEFAULT_IMAGE_OPTIONS,
    calculateTargetDimensions,
    getJpegDimensions,
    validateSourceImageFile,
    resizeImageFile,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.ImageUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
