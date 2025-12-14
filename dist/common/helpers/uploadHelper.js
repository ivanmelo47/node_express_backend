"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSingleUpload = exports.handleMemoryUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createUploadMiddleware = (uploadPath) => {
    // Ensure upload directory exists
    if (!fs_1.default.existsSync(uploadPath)) {
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
    }
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
        }
    });
    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    };
    return (0, multer_1.default)({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 1024 * 1024 * 5 // 5MB limit
        }
    });
};
const createMemoryUploadMiddleware = () => {
    const storage = multer_1.default.memoryStorage();
    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('¡No es una imagen! Por favor, sube una imagen.'), false);
        }
    };
    return (0, multer_1.default)({
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
        // @ts-ignore
        upload.single(fieldName)(req, res, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.handleMemoryUpload = handleMemoryUpload;
const handleSingleUpload = (uploadOrPath, fieldName, req, res) => {
    let upload = uploadOrPath;
    if (typeof uploadOrPath === 'string') {
        upload = createUploadMiddleware(uploadOrPath);
    }
    return new Promise((resolve, reject) => {
        // @ts-ignore
        upload.single(fieldName)(req, res, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.handleSingleUpload = handleSingleUpload;
