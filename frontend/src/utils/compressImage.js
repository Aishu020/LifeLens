export async function compressImage(
  blob,
  maxWidth = 1600,
  quality = 0.82,
  maxBytes = 1024 * 1024
) {
  const image = await createImage(URL.createObjectURL(blob));
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxWidth / image.width);
  canvas.width = image.width * scale;
  canvas.height = image.height * scale;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  let compressed = await toBlob(canvas, quality);
  let currentQuality = quality;

  while (compressed && compressed.size > maxBytes && currentQuality > 0.5) {
    currentQuality -= 0.08;
    compressed = await toBlob(canvas, currentQuality);
  }

  return compressed || blob;
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

function toBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}
