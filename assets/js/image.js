/**
 * Image Compression Utility
 * Resizes an image preserving aspect ratio to a max dimension (default 1600px)
 * and converts it to a WebP Blob (quality 0.8) using HTML Canvas / createImageBitmap.
 */

/**
 * Compresses an image file in the browser and converts it to WebP format.
 * @param {File|Blob} file - Original image file
 * @param {Object} [options] - Compression options
 * @param {number} [options.maxDimension=1600] - Max width or height in pixels
 * @param {number} [options.quality=0.8] - WebP quality rating (0.0 to 1.0)
 * @returns {Promise<Blob>} Compressed image as a WebP Blob
 */
export async function compressImage(file, options = {}) {
  const maxDimension = options.maxDimension || 1600;
  const quality = options.quality !== undefined ? options.quality : 0.8;

  // Load image bitmap from input file/blob
  const imageBitmap = await createImageBitmap(file);
  let width = imageBitmap.width;
  let height = imageBitmap.height;

  // Calculate scaling while preserving aspect ratio
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  // Draw image on canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  // Convert canvas to WebP Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Image compression to WebP failed.'));
        }
      },
      'image/webp',
      quality
    );
  });
}
