import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION_NAME = 'neural_salvage_assets';
const VECTOR_SIZE = 1536; // text-embedding-3-small dimension

class QdrantService {
  private client: QdrantClient | null = null;
  private initialized: boolean = false;
  private initializationFailed: boolean = false;

  constructor() {
    // Only create client if environment variables are set
    if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
      try {
        this.client = new QdrantClient({
          url: process.env.QDRANT_URL,
          apiKey: process.env.QDRANT_API_KEY,
        });
        console.log('✅ [QDRANT] Client created');
      } catch (error) {
        console.warn('⚠️ [QDRANT] Failed to create client:', error);
        this.initializationFailed = true;
      }
    } else {
      console.log('ℹ️ [QDRANT] Not configured (QDRANT_URL or QDRANT_API_KEY missing)');
      this.initializationFailed = true;
    }
  }

  async initialize() {
    if (this.initialized) return true;
    if (this.initializationFailed || !this.client) return false;

    try {
      console.log('🔄 [QDRANT] Initializing...');
      
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (col) => col.name === COLLECTION_NAME
      );

      if (!exists) {
        console.log('📦 [QDRANT] Creating collection...');
        // Create collection
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
          },
        });
        console.log('✅ [QDRANT] Collection created successfully');
      } else {
        console.log('✅ [QDRANT] Collection already exists');
      }

      this.initialized = true;
      return true;
    } catch (error: any) {
      console.error('❌ [QDRANT] Initialization failed:', error.message);
      this.initializationFailed = true;
      return false;
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
    const initialized = await this.initialize();
    if (!initialized || !this.client) {
      console.log('ℹ️ [QDRANT] Skipping upsert - not initialized');
      return;
    }

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
      console.log('✅ [QDRANT] Vector upserted');
    } catch (error: any) {
      console.error('❌ [QDRANT] Upsert error:', error.message);
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
    const initialized = await this.initialize();
    if (!initialized || !this.client) {
      console.log('ℹ️ [QDRANT] Skipping search - not initialized');
      return [];
    }

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
    } catch (error: any) {
      console.error('❌ [QDRANT] Search error:', error.message);
      throw error;
    }
  }

  async deleteVector(assetId: string) {
    const initialized = await this.initialize();
    if (!initialized || !this.client) {
      console.log('ℹ️ [QDRANT] Skipping delete - not initialized');
      return;
    }

    try {
      await this.client.delete(COLLECTION_NAME, {
        wait: true,
        points: [assetId],
      });
      console.log('✅ [QDRANT] Vector deleted');
    } catch (error: any) {
      console.error('❌ [QDRANT] Delete error:', error.message);
      throw error;
    }
  }

  async getSimilar(assetId: string, limit: number = 10) {
    const initialized = await this.initialize();
    if (!initialized || !this.client) {
      console.log('ℹ️ [QDRANT] Skipping similar search - not initialized');
      return [];
    }

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
    } catch (error: any) {
      console.error('❌ [QDRANT] Similar search error:', error.message);
      throw error;
    }
  }
}

export const qdrantService = new QdrantService();