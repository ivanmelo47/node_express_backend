import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

class ImageService {
  /**
   * Procesa y guarda la imagen de perfil en múltiples formatos.
   * @param {Buffer} buffer - Buffer de la imagen.
   * @param {string} destinationDir - Directorio donde se guardarán las imágenes.
   * @param {string} [filenameBase] - Nombre base opcional. Si no se da, se genera uno (no recomendado para actualizar).
   * @returns {Promise<Object>} - Objeto con los nombres de archivo generados.
   */
  static async processProfileImage(buffer: Buffer, destinationDir: string, filenameBase: string | null = null): Promise<any> {
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const baseName = filenameBase || uniqueSuffix;
    
    // Configuración
    const maxWidth = 800; // Redimensionar imágenes grandes
    
    const pipeline = sharp(buffer).resize({ 
        width: maxWidth, 
        withoutEnlargement: true 
    });

    const filePaths = {
        jpg: path.join(destinationDir, `${baseName}.jpg`),
        png: path.join(destinationDir, `${baseName}.png`),
        webp: path.join(destinationDir, `${baseName}.webp`),
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
  static deleteProfileImage(destinationDir: string, filenameBase: string): void {
    if (!filenameBase) return;

    // Asumimos que la BD guarda solo el "filenameBase"
    // Limpiamos la extensión por si acaso
    const base = path.parse(filenameBase).name;

    const formats = ['jpg', 'png', 'webp'];
    formats.forEach(ext => {
        const filePath = path.join(destinationDir, `${base}.${ext}`);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Error al borrar la imagen ${filePath}:`, err);
            }
        }
    });
  }
}

export default ImageService;
