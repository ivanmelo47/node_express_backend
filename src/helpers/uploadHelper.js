const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploadMiddleware = (uploadPath) => {
  // Ensure upload directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  };

  return multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB limit
    }
  });
};

/**
      cb(new Error('¡No es una imagen! Por favor, sube una imagen.'), false);
    }
  };

  return multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5 // Límite de 5MB
    }
  });
};

/**
 * Maneja la subida de un solo archivo.
 * Puede aceptar una instancia de Multer existente o una cadena de ruta de destino.
 * Envuelve el middleware de Multer en una Promesa.
 * 
 * @param {Object|string} uploadOrPath - La instancia de Multer O una cadena de ruta de destino.
 * @param {string} fieldName - El nombre del campo en el form-data.
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 * @returns {Promise<void>}
 */
const createMemoryUploadMiddleware = () => {
  const storage = multer.memoryStorage();
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('¡No es una imagen! Por favor, sube una imagen.'), false);
    }
  };

  return multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5 // Límite de 5MB
    }
  });
};

/**
 * Función auxiliar para manejar la subida de un archivo a memoria dentro de un controlador o servicio.
 * Envuelve el middleware de Multer en una Promesa para usar async/await.
 * 
 * @param {string} fieldName - Nombre del campo del archivo en el form-data.
 * @param {Object} req - Objeto Request de Express.
 * @param {Object} res - Objeto Response de Express.
 * @returns {Promise<void>} - Resuelve si la subida es exitosa, rechaza si hay error.
 */
const handleMemoryUpload = (fieldName, req, res) => {
  const upload = createMemoryUploadMiddleware();
  return new Promise((resolve, reject) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const handleSingleUpload = (uploadOrPath, fieldName, req, res) => {
  let upload = uploadOrPath;

  if (typeof uploadOrPath === 'string') {
    upload = createUploadMiddleware(uploadOrPath);
  }

  return new Promise((resolve, reject) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = {
  handleSingleUpload,
  handleMemoryUpload
};
