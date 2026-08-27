import { Request, Response, NextFunction } from 'express';
import { RAGService } from '../services/ragService';
import { sendSuccess, sendError } from '../utils/errors';

/**
 * POST /api/knowledge/documents - Upload or replace refund policy document
 */
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return sendError(res, 400, 'Document content is required and cannot be empty');
    }

    const result = await RAGService.uploadPolicyDocument(
      title || 'Company Refund Policy',
      content.trim()
    );

    return sendSuccess(res, 201, result, 'Refund policy document uploaded and indexed into RAG vector store successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/knowledge/documents/current - Get current refund policy document metadata
 */
export const getCurrentDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RAGService.getCurrentPolicyDocument();

    if (!doc) {
      return sendSuccess(res, 200, { active: false, document: null }, 'No policy document currently uploaded');
    }

    return sendSuccess(res, 200, { active: true, document: doc }, 'Current refund policy retrieved successfully');
  } catch (error) {
    next(error);
  }
};
