const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configurar storage para multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nameWithoutExt = path.basename(file.originalname, extension);
    
    let resourceType = 'auto';
    
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else {
      resourceType = 'raw';
    }

    return {
      folder: 'taskmanager',
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname}`,
      use_filename: false,
      unique_filename: false,
      overwrite: false,
      invalidate: true,
      // Solo aplicar transformación a imágenes
      transformation: file.mimetype.startsWith('image/') ? [
        { 
          width: 1920, 
          height: 1080, 
          crop: 'limit',
          quality: 'auto:good'
        }
      ] : undefined
    };
  }
});

// Crear middleware de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
  }
});

// Función para eliminar archivo de Cloudinary
const deleteFile = async (publicId) => {
  try {
    let result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
    
    console.log(`✅ Archivo eliminado de Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Error al eliminar archivo:', error);
    throw error;
  }
};

// Función para verificar la conexión
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary conectado correctamente:', result);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión con Cloudinary:', error.message);
    return false;
  }
};

module.exports = {
  cloudinary,
  upload,
  deleteFile,
  testConnection
};
