import { Request, Response, NextFunction } from 'express';

export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="System Management"');
        return res.status(401).send('Authentication required');
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    const validUser = process.env.SYSTEM_USER;
    const validPass = process.env.SYSTEM_PASSWORD;

    if (user === validUser && pass === validPass) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="System Management"');
        return res.status(401).send('Invalid credentials');
    }
};
