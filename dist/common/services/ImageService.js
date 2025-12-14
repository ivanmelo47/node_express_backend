"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ImageService {
    /**
     * Procesa y guarda la imagen de perfil en múltiples formatos.
     * @param {Buffer} buffer - Buffer de la imagen.
     * @param {string} destinationDir - Directorio donde se guardarán las imágenes.
     * @param {string} [filenameBase] - Nombre base opcional. Si no se da, se genera uno (no recomendado para actualizar).
     * @returns {Promise<Object>} - Objeto con los nombres de archivo generados.
     */
    static async processProfileImage(buffer, destinationDir, filenameBase = null) {
        if (!fs_1.default.existsSync(destinationDir)) {
            fs_1.default.mkdirSync(destinationDir, { recursive: true });
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const baseName = filenameBase || uniqueSuffix;
        // Configuración
        const maxWidth = 800; // Redimensionar imágenes grandes
        const pipeline = (0, sharp_1.default)(buffer).resize({
            width: maxWidth,
            withoutEnlargement: true
        });
        const filePaths = {
            jpg: path_1.default.join(destinationDir, `${baseName}.jpg`),
            png: path_1.default.join(destinationDir, `${baseName}.png`),
            webp: path_1.default.join(destinationDir, `${baseName}.webp`),
        };
        // Guardar todos los formatos en paralelo
        await Promise.all([
            pipeline.clone().jpeg({ quality: 80 }).toFile(filePaths.jpg),
            pipeline.clone().png({ quality: 80, compressionLevel: 8 }).toFile(filePaths.png),
            pipeline.clone().webp({ quality: 80 }).toFile(filePaths.webp)
        ]);
        return {
            baseName: baseName,
            jpg: `${baseName}.jpg`,
            png: `${baseName}.png`,
            webp: `${baseName}.webp`
        };
    }
    /**
     * Elimina todos los formatos de una imagen de perfil.
     * @param {string} destinationDir - Directorio donde están las imágenes.
     * @param {string} filenameBase - Nombre base (sin extensión) de la imagen a borrar.
     * @returns {void}
     */
    static deleteProfileImage(destinationDir, filenameBase) {
        if (!filenameBase)
            return;
        // Asumimos que la BD guarda solo el "filenameBase"
        // Limpiamos la extensión por si acaso
        const base = path_1.default.parse(filenameBase).name;
        const formats = ['jpg', 'png', 'webp'];
        formats.forEach(ext => {
            const filePath = path_1.default.join(destinationDir, `${base}.${ext}`);
            if (fs_1.default.existsSync(filePath)) {
                try {
                    fs_1.default.unlinkSync(filePath);
                }
                catch (err) {
                    console.error(`Error al borrar la imagen ${filePath}:`, err);
                }
            }
        });
    }
}
exports.default = ImageService;
