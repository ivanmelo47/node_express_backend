import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

const createUploadMiddleware = (uploadPath: string) => {
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

  const fileFilter = (req: any, file: any, cb: any) => {
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

const createMemoryUploadMiddleware = () => {
  const storage = multer.memoryStorage();
  
  const fileFilter = (req: any, file: any, cb: any) => {
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
export const handleMemoryUpload = (fieldName: string, req: Request, res: Response): Promise<void> => {
  const upload = createMemoryUploadMiddleware();
  return new Promise((resolve, reject) => {
    // @ts-ignore
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const handleSingleUpload = (uploadOrPath: any, fieldName: string, req: Request, res: Response): Promise<void> => {
  let upload = uploadOrPath;

  if (typeof uploadOrPath === 'string') {
    upload = createUploadMiddleware(uploadOrPath);
  }

  return new Promise((resolve, reject) => {
    // @ts-ignore
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
