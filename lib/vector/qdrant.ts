import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION_NAME = 'neural_salvage_assets';
const VECTOR_SIZE = 1536; // text-embedding-3-small dimension

class QdrantService {
  private client: QdrantClient;
  private initialized: boolean = false;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (col) => col.name === COLLECTION_NAME
      );

      if (!exists) {
        // Create collection
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
          },
        });
        console.log('Qdrant collection created');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Qdrant initialization error:', error);
      throw error;
    }
  }

  async upsertVector(
    assetId: string,
    embedding: number[],
    metadata: {
      userId: string;
      type: string;
      tags: string[];
      caption?: string;
      forSale?: boolean;
    }
  ) {
    await this.initialize();

    try {
      await this.client.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: assetId,
            vector: embedding,
            payload: metadata,
          },
        ],
      });
    } catch (error) {
      console.error('Vector upsert error:', error);
      throw error;
    }
  }

  async search(
    queryEmbedding: number[],
    filters?: {
      userId?: string;
      type?: string[];
      tags?: string[];
      forSale?: boolean;
    },
    limit: number = 20
  ) {
    await this.initialize();

    try {
      const filter: any = {};

      if (filters) {
        const must: any[] = [];

        if (filters.userId) {
          must.push({
            key: 'userId',
            match: { value: filters.userId },
          });
        }

        if (filters.type && filters.type.length > 0) {
          must.push({
            key: 'type',
            match: { any: filters.type },
          });
        }

        if (filters.tags && filters.tags.length > 0) {
          must.push({
            key: 'tags',
            match: { any: filters.tags },
          });
        }

        if (filters.forSale !== undefined) {
          must.push({
            key: 'forSale',
            match: { value: filters.forSale },
          });
        }

        if (must.length > 0) {
          filter.must = must;
        }
      }

      const results = await this.client.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        limit,
        with_payload: true,
      });

      return results.map((result) => ({
        assetId: result.id as string,
        score: result.score,
        metadata: result.payload,
      }));
    } catch (error) {
      console.error('Vector search error:', error);
      throw error;
    }
  }

  async deleteVector(assetId: string) {
    await this.initialize();

    try {
      await this.client.delete(COLLECTION_NAME, {
        wait: true,
        points: [assetId],
      });
    } catch (error) {
      console.error('Vector delete error:', error);
      throw error;
    }
  }

  async getSimilar(assetId: string, limit: number = 10) {
    await this.initialize();

    try {
      const results = await this.client.recommend(COLLECTION_NAME, {
        positive: [assetId],
        limit,
        with_payload: true,
      });

      return results.map((result) => ({
        assetId: result.id as string,
        score: result.score,
        metadata: result.payload,
      }));
    } catch (error) {
      console.error('Similar search error:', error);
      throw error;
    }
  }
}

export const qdrantService = new QdrantService();