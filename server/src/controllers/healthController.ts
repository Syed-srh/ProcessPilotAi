import { Request, Response } from 'express';

export class HealthController {
  public static check(req: Request, res: Response) {
    res.status(200).json({
      status: 'ok',
      service: 'ProcessPilot AI Backend API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  }
}
