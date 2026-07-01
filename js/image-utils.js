(function (root) {
  const DEFAULT_IMAGE_OPTIONS = {
    maxPixels: 2048 * 2048,
    maxEdge: 2048,
    quality: 0.86,
    mimeType: 'image/jpeg',
  };

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

  async function resizeImageFile(file, options) {
    const opts = Object.assign({}, DEFAULT_IMAGE_OPTIONS, options || {});
    const img = await loadImage(file);
    const size = calculateTargetDimensions(img.naturalWidth || img.width, img.naturalHeight || img.height, opts);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;

    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size.width, size.height);

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
    resizeImageFile,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.ImageUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
