import axios from 'axios';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { Chunker, TextChunk } from '../utils/chunker';

export interface ScoredChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

export class RAGService {
  /**
   * Generate vector embedding for a given text via Google Gemini embedding API or fallback term-vector.
   */
  public static async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return new Array(768).fill(0);
    }

    if (env.GEMINI_API_KEY) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${env.GEMINI_API_KEY}`;
        const response = await axios.post(
          url,
          {
            model: 'models/text-embedding-004',
            content: {
              parts: [{ text: text.substring(0, 2048) }],
            },
          },
          { timeout: 8000 }
        );

        if (response.data?.embedding?.values) {
          return response.data.embedding.values;
        }
      } catch (err: any) {
        console.warn(`[RAGService] Gemini Embedding API call failed: ${err.message}. Using deterministic fallback vector.`);
      }
    }

    // Deterministic fallback vector representation (768-dim normalized term frequency hash)
    return this.createFallbackVector(text);
  }

  /**
   * Upload / replace single Refund Policy document, chunk text, generate embeddings, and persist in DB.
   */
  public static async uploadPolicyDocument(title: string, content: string): Promise<{ documentId: string; chunkCount: number }> {
    if (!content || content.trim().length === 0) {
      throw new Error('Document content cannot be empty');
    }

    // Clean up previous refund policy documents to keep a single active policy on file
    try {
      await prisma.knowledgeDocument.deleteMany({});
    } catch (e) {
      // Ignore if table was empty
    }

    const doc = await prisma.knowledgeDocument.create({
      data: {
        title: title || 'Company Refund Policy',
        content,
        mimeType: 'text/plain',
      },
    });

    // Chunk text
    const textChunks: TextChunk[] = Chunker.chunkText(content, 500, 100);

    // Generate embeddings for each chunk
    for (const chunk of textChunks) {
      const embedding = await this.generateEmbedding(chunk.content);

      await prisma.knowledgeChunk.create({
        data: {
          documentId: doc.id,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          embedding: embedding as any,
        },
      });
    }

    return {
      documentId: doc.id,
      chunkCount: textChunks.length,
    };
  }

  /**
   * Search for top N most relevant policy chunks using Cosine Similarity.
   */
  public static async searchSimilarChunks(queryText: string, limit: number = 3): Promise<ScoredChunk[]> {
    const chunks = await prisma.knowledgeChunk.findMany();

    if (!chunks || chunks.length === 0) {
      return [];
    }

    const queryEmbedding = await this.generateEmbedding(queryText);

    const scoredChunks: ScoredChunk[] = chunks.map((chunk) => {
      const chunkEmbedding: number[] = Array.isArray(chunk.embedding)
        ? (chunk.embedding as number[])
        : this.createFallbackVector(chunk.content);

      const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding);

      return {
        id: chunk.id,
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        similarity,
      };
    });

    // Sort descending by similarity score
    scoredChunks.sort((a, b) => b.similarity - a.similarity);

    return scoredChunks.slice(0, limit);
  }

  /**
   * Fetch active policy document metadata and chunk count.
   */
  public static async getCurrentPolicyDocument() {
    const doc = await prisma.knowledgeDocument.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });

    if (!doc) return null;

    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      chunkCount: doc._count.chunks,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Compute Cosine Similarity between two numerical vectors.
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Deterministic 768-dim normalized term-vector for fallback similarity calculation.
   */
  private static createFallbackVector(text: string): number[] {
    const vector = new Array(768).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % 768;
      vector[idx] += 1;
    }

    // Normalize vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < 768; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }
}
