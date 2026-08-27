/**
 * Simple, robust paragraph and fixed-window text chunker for policy documents.
 */

export interface TextChunk {
  chunkIndex: number;
  content: string;
}

export class Chunker {
  /**
   * Split document content into chunks based on paragraphs or max character length with overlap.
   */
  public static chunkText(
    text: string,
    maxChunkLength: number = 500,
    overlap: number = 100
  ): TextChunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const cleanedText = text.replace(/\r\n/g, '\n').trim();

    // 1. Try paragraph-based splitting first
    const paragraphs = cleanedText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + '\n\n' + paragraph).length <= maxChunkLength) {
        currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }

        // If single paragraph is longer than maxChunkLength, sliding window fallback
        if (paragraph.length > maxChunkLength) {
          let start = 0;
          while (start < paragraph.length) {
            const end = Math.min(start + maxChunkLength, paragraph.length);
            chunks.push(paragraph.substring(start, end).trim());
            if (end === paragraph.length) break;
            start += maxChunkLength - overlap;
          }
          currentChunk = '';
        } else {
          currentChunk = paragraph;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.map((content, index) => ({
      chunkIndex: index,
      content,
    }));
  }
}
