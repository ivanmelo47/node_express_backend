import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export class StorageController {
    static async getPrivateFile(req: Request, res: Response) {
        try {
            const filePath = req.params[0];

            // Prevent directory traversal attacks
            const sanitizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');

            // Define private storage root (mapped volume in Docker)
            const storageRoot = path.join(__dirname, '../../../../storage/private');
            const absolutePath = path.join(storageRoot, sanitizedPath);

            // Ensure the path is still within the storage root
            if (!absolutePath.startsWith(storageRoot)) {
                return res.status(403).send('Access Denied');
            }

            if (!fs.existsSync(absolutePath)) {
                return res.status(404).send('File not found');
            }

            // Optional: Set strict headers
            res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

            // Send file
            res.sendFile(absolutePath);
        } catch (error) {
            console.error('Storage Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
