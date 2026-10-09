import { INITIAL_RAG_DOCUMENTS } from '../data/mockData';
import { RAGDocument } from '../types/manufacturing';

export interface RetrievedChunk {
  docId: string;
  docTitle: string;
  fileName: string;
  category: string;
  page: number;
  section: string;
  content: string;
  relevanceScore: number;
}

export class RAGSearchService {
  private documents: RAGDocument[];

  constructor(initialDocs: RAGDocument[] = INITIAL_RAG_DOCUMENTS) {
    this.documents = [...initialDocs];
  }

  public getDocuments(): RAGDocument[] {
    return this.documents;
  }

  public addDocument(doc: RAGDocument): void {
    this.documents.unshift(doc);
  }

  public search(query: string, maxResults = 4): RetrievedChunk[] {
    if (!query || !query.trim()) return [];

    const queryTerms = query
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 2);

    const scoredChunks: RetrievedChunk[] = [];

    this.documents.forEach((doc) => {
      doc.chunks.forEach((chunk) => {
        let score = 0;
        const lowerContent = chunk.content.toLowerCase();
        const lowerSection = chunk.section.toLowerCase();
        const lowerTitle = doc.title.toLowerCase();

        queryTerms.forEach((term) => {
          // Exact term match in content
          const contentMatches = (lowerContent.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length;
          score += contentMatches * 3;

          // Partial term match
          if (lowerContent.includes(term)) {
            score += 1.5;
          }

          // Header/section match has high weight
          if (lowerSection.includes(term)) {
            score += 5;
          }

          // Document title match
          if (lowerTitle.includes(term)) {
            score += 4;
          }
        });

        // Boost for specific known identifiers
        if (query.toUpperCase().includes('SEN-2048') && (chunk.content.includes('SEN-2048') || doc.title.includes('SEN-2048'))) score += 15;
        if (query.toUpperCase().includes('MCU-110') && (chunk.content.includes('MCU-110') || chunk.content.includes('AURIX'))) score += 15;
        if (query.toUpperCase().includes('M-ASSY-03') && (chunk.content.includes('M-ASSY-03') || chunk.content.includes('SMT'))) score += 15;
        if (query.toUpperCase().includes('M-ROBOT-02') && (chunk.content.includes('M-ROBOT') || chunk.content.includes('Fanuc'))) score += 15;
        if (query.toUpperCase().includes('VIBRATION') && (chunk.content.includes('vibration') || chunk.content.includes('bearing'))) score += 10;
        if (query.toUpperCase().includes('SPARE') && (chunk.content.includes('spare') || chunk.content.includes('replacement'))) score += 8;

        if (score > 0) {
          scoredChunks.push({
            docId: doc.id,
            docTitle: doc.title,
            fileName: doc.fileName,
            category: doc.category,
            page: chunk.page,
            section: chunk.section,
            content: chunk.content,
            relevanceScore: Math.min(99, Math.round(score * 4 + 40))
          });
        }
      });
    });

    // Sort by relevance score descending
    return scoredChunks
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }
}

export const ragService = new RAGSearchService();
