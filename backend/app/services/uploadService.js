const path = require("path");
const fs = require("fs");
const { nanoid } = require("nanoid");
const cloudinary = require("cloudinary").v2;

const uploadsDir = path.join(__dirname, "..", "..", "uploads");

function cloudinaryEnabled() {
  return !!process.env.CLOUDINARY_URL || !!process.env.CLOUDINARY_CLOUD_NAME;
}

function configureCloudinary() {
  if (!cloudinaryEnabled()) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function uploadToCloudinary(buffer, filename) {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "lifelens",
        public_id: filename.replace(/\.[^/.]+$/, ""),
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function saveLocal(buffer, originalName) {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const ext = path.extname(originalName) || ".jpg";
  const filename = `${Date.now()}-${nanoid(6)}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

async function handleUpload(file) {
  if (!file || !file.buffer) return null;
  const safeName = file.originalname.replace(/\s+/g, "-");
  if (cloudinaryEnabled()) {
    return uploadToCloudinary(file.buffer, safeName);
  }
  return saveLocal(file.buffer, safeName);
}

module.exports = { handleUpload };

