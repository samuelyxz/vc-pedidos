// Image proxy to bypass hotlink protection and CORS issues
export const proxyImage = (url, size = 240) => {
  if (!url) return '';
  // wsrv.nl: server-side image proxy + resizing
  const stripped = url.replace(/^https?:\/\//, '');
  return `https://wsrv.nl/?url=${stripped}&w=${size}&output=png`;
};

// Compress an uploaded image file to a small square-ish PNG data URL (~50-80KB)
export function compressImage(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        // Scale down so the largest side is maxSize
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // White background (products are usually on white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG for smaller size
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = /** @type {string} */ (e.target.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
