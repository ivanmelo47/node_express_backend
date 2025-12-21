import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  // Log error to file
  const fs = require('fs');
  const path = require('path');
  const logFile = path.join(__dirname, '../../logs/system.log');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ERROR: ${err.stack}\n`;

  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((e: any) => e.message)
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'Conflict error',
      errors: err.errors.map((e: any) => e.message)
    });
  }

  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};

export default errorHandler;
