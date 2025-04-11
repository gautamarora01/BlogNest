const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'blognest_images',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: (req, file) => `${Date.now()}-${req.user._id}-${file.originalname}`,
    },
});

const storageProfile = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'Profile_images',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: (req, file) => `${Date.now()}-${req.user._id}-${file.originalname}-Profile`,
    },
});

module.exports = {
    cloudinary,
    storage,
    storageProfile,
};
  