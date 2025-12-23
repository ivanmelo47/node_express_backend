import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export class SystemFileController {

    // Root directory is the project root
    private static readonly ROOT_DIR = path.resolve(process.cwd());

    // --- VIEW METHODS ---

    static async viewFileManager(req: Request, res: Response) {
        res.sendFile(path.join(__dirname, '../views/files.html'));
    }

    // --- API METHODS ---

    static async listFiles(req: Request, res: Response) {
        try {
            const relPath = req.query.path as string || '';
            // Security: Prevent path traversal
            if (relPath.includes('..')) {
                return res.status(403).json({ success: false, message: 'Invalid path' });
            }

            const fullPath = path.join(SystemFileController.ROOT_DIR, relPath);

            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ success: false, message: 'Path not found' });
            }

            const stats = fs.statSync(fullPath);
            if (!stats.isDirectory()) {
                return res.status(400).json({ success: false, message: 'Not a directory' });
            }

            const items = fs.readdirSync(fullPath).map(name => {
                const itemPath = path.join(fullPath, name);
                let itemStats;
                try {
                    itemStats = fs.statSync(itemPath);
                } catch (e) {
                    return null; // Skip invalid/inaccessible files
                }

                if (!itemStats) return null;

                return {
                    name,
                    path: path.join(relPath, name).replace(/\\/g, '/'), // Normalize for frontend
                    type: itemStats.isDirectory() ? 'folder' : 'file',
                    size: itemStats.size,
                    modified: itemStats.mtime
                };
            }).filter(item => item !== null);

            // Sort: Folders first, then files
            items.sort((a: any, b: any) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });

            return res.json({ success: true, path: relPath, items });

        } catch (error: any) {
            console.error('List files error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async readFile(req: Request, res: Response) {
        try {
            const relPath = req.query.path as string;
            if (!relPath || relPath.includes('..')) {
                return res.status(403).json({ success: false, message: 'Invalid path' });
            }

            const fullPath = path.join(SystemFileController.ROOT_DIR, relPath);

            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ success: false, message: 'File not found' });
            }

            // Check if binary or too large? For now just read text
            const content = fs.readFileSync(fullPath, 'utf8');

            return res.json({ success: true, content });

        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async saveFile(req: Request, res: Response) {
        try {
            const { path: relPath, content } = req.body;
            if (!relPath || relPath.includes('..')) {
                return res.status(403).json({ success: false, message: 'Invalid path' });
            }

            const fullPath = path.join(SystemFileController.ROOT_DIR, relPath);

            // Security: Don't allow creating new files outside known structures if strict? 
            // For now, allow saving to existing or new files within root.

            fs.writeFileSync(fullPath, content, 'utf8');

            return res.json({ success: true, message: 'File saved successfully' });

        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async createFolder(req: Request, res: Response) {
        try {
            const { path: relPath, name } = req.body;
            if (!relPath || relPath.includes('..') || !name) {
                return res.status(403).json({ success: false, message: 'Invalid data' });
            }

            const newFolderPath = path.join(SystemFileController.ROOT_DIR, relPath, name);

            if (fs.existsSync(newFolderPath)) {
                return res.status(400).json({ success: false, message: 'Folder already exists' });
            }

            fs.mkdirSync(newFolderPath);

            return res.json({ success: true, message: 'Folder created' });

        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteItem(req: Request, res: Response) {
        try {
            const relPath = req.query.path as string;
            if (!relPath || relPath.includes('..')) {
                return res.status(403).json({ success: false, message: 'Invalid path' });
            }

            // Protect critical paths
            if (relPath === '' || relPath === '/' || relPath === 'src' || relPath === '.env') {
                // Maybe allow .env if user really wants, but root deletion is bad.
                if (relPath === '' || relPath === '/') {
                    return res.status(403).json({ success: false, message: 'Cannot delete root' });
                }
            }

            const fullPath = path.join(SystemFileController.ROOT_DIR, relPath);

            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }

            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(fullPath);
            }

            return res.json({ success: true, message: 'Item deleted' });

        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
