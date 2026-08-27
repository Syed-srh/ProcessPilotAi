import { describe, it, expect, beforeEach } from 'vitest';
import { Chunker } from '../../src/utils/chunker';
import { RAGService } from '../../src/services/ragService';
import { DecisionAgent } from '../../src/agents/decisionAgent';
import { prisma } from '../../src/config/prisma';

describe('Phase 8 Step 2: Refund Policy Grounding RAG Pipeline Suite', () => {
  beforeEach(async () => {
    RAGService.clearInMemoryStore();
    try {
      if (prisma.knowledgeDocument && prisma.knowledgeDocument.deleteMany) {
        await prisma.knowledgeDocument.deleteMany({});
      }
    } catch (e) {
      // Ignore if database connection is not available in unit environment
    }
  });

  describe('1. Chunker Utility', () => {
    it('should split long refund policy text into paragraph chunks with correct indices', () => {
      const samplePolicy = `Paragraph 1: Refunds requested within 30 days are eligible for auto-approval up to ₹5,000.
      
Paragraph 2: Return requests exceeding ₹5,000 require explicit manager authorization and approval.

Paragraph 3: Customized products and final sale items are strictly non-refundable under any circumstances.`;

      const chunks = Chunker.chunkText(samplePolicy, 500, 50);

      expect(chunks.length).toBeGreaterThanOrEqual(1);
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].content).toContain('Paragraph 1');
    });

    it('should return empty array for empty input text', () => {
      const chunks = Chunker.chunkText('');
      expect(chunks).toEqual([]);
    });
  });

  describe('2. RAGService Vector Cosine Similarity', () => {
    it('should calculate identical vectors cosine similarity as 1.0', () => {
      const vecA = [0.5, 0.5, 0.5, 0.5];
      const vecB = [0.5, 0.5, 0.5, 0.5];
      const similarity = RAGService.cosineSimilarity(vecA, vecB);
      expect(similarity).toBeCloseTo(1.0, 4);
    });

    it('should calculate orthogonal vectors cosine similarity as 0.0', () => {
      const vecA = [1, 0, 0, 0];
      const vecB = [0, 1, 0, 0];
      const similarity = RAGService.cosineSimilarity(vecA, vecB);
      expect(similarity).toBeCloseTo(0.0, 4);
    });
  });

  describe('3. DecisionAgent RAG Grounding & Fallback Integration', () => {
    it('should return HARDCODED_FALLBACK when no policy document is uploaded', async () => {
      const result = await DecisionAgent.evaluateDecision(
        'Check refund policy compliance',
        { orderId: 'ORD-999', refundAmount: 7500, daysSinceDelivery: 10 }
      );

      expect(result.ragStatus).toBe('HARDCODED_FALLBACK');
      expect(result.decision).toBe('REQUIRE_APPROVAL');
      expect(result.reasoning).toContain('[HARDCODED_FALLBACK]');
      expect(result.citedClause).toBeUndefined();
    });

    it('should return RAG_GROUNDED with cited policy clause when policy document is uploaded', async () => {
      // 1. Upload sample policy document
      const samplePolicy = `Standard Company Refund Policy:
Clause A: Return requests submitted within 30 days of delivery for standard items under ₹5,000 are auto-approved.
Clause B: Refund requests exceeding ₹5,000 threshold limit require explicit human manager approval.
Clause C: Digital items are non-refundable.`;

      await RAGService.uploadPolicyDocument('Company Refund Policy', samplePolicy);

      // 2. Evaluate refund decision
      const result = await DecisionAgent.evaluateDecision(
        'Check refund policy compliance',
        { orderId: 'ORD-888', refundAmount: 7500, daysSinceDelivery: 15, reason: 'Defective item' }
      );

      // 3. Verify grounded decision and cited clause
      expect(result.ragStatus).toBe('RAG_GROUNDED');
      expect(result.decision).toBe('REQUIRE_APPROVAL');
      expect(result.reasoning).toContain('[RAG_GROUNDED]');
      expect(result.citedClause).toBeDefined();
      expect(result.citedChunkIds).toBeDefined();
      expect(result.citedChunkIds!.length).toBeGreaterThan(0);
    });
  });
});
