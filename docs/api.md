# API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

All API endpoints (except public marketplace endpoints) require Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Upload API

#### POST /api/upload
Upload a new media file.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: File (required)
  - `userId`: string (required)
  - `visibility`: 'private' | 'public' (optional, default: 'private')

**Response:**
```json
{
  "success": true,
  "asset": {
    "id": "asset-id",
    "userId": "user-id",
    "filename": "sanitized-filename.jpg",
    "originalFilename": "original.jpg",
    "type": "image",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "https://storage.url/path",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "uploadedAt": "2025-01-01T00:00:00.000Z",
    "visibility": "private",
    "forSale": false
  },
  "jobId": "job-id"
}
```

**Error Responses:**
- 400: Missing required fields or file too large
- 500: Upload failed

---

### AI Analysis API

#### POST /api/ai/analyze
Analyze a media asset with AI.

**Request:**
```json
{
  "assetId": "asset-id",
  "userId": "user-id",
  "imageUrl": "https://storage.url/image.jpg",
  "type": "image"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "caption": "A beautiful sunset over mountains",
    "tags": ["sunset", "mountains", "nature", "landscape"],
    "colors": ["#FF6B35", "#F7931E", "#FDC830"],
    "nsfw": false,
    "nsfwScore": 0.02,
    "ocr": "Extracted text from image",
    "embedding": [0.123, 0.456, ...],
    "analyzedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Supported Types:**
- `image`: Caption, tags, NSFW, OCR, colors, embedding
- `video`: Tags, keyframes, embedding
- `audio`: Transcription, tags, embedding

**Error Responses:**
- 400: Missing required fields
- 403: Unauthorized (not asset owner)
- 404: Asset not found
- 500: Analysis failed

---

### Search API

#### POST /api/search
Search assets using natural language and filters.

**Request:**
```json
{
  "query": "sunset over mountains",
  "userId": "user-id",
  "limit": 20,
  "filters": {
    "type": ["image", "video"],
    "tags": ["nature"],
    "colors": ["#FF6B35"],
    "dateRange": {
      "start": "2025-01-01",
      "end": "2025-12-31"
    },
    "forSale": true,
    "priceRange": {
      "min": 10,
      "max": 100
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "asset": {
        "id": "asset-id",
        "filename": "sunset.jpg",
        "type": "image",
        "url": "https://storage.url/sunset.jpg",
        "aiAnalysis": {
          "caption": "Beautiful sunset",
          "tags": ["sunset", "nature"]
        }
      },
      "score": 0.95,
      "highlights": ["Beautiful sunset", "nature", "landscape"]
    }
  ],
  "total": 15
}
```

**Search Features:**
- Vector similarity search using embeddings
- Keyword fallback for better coverage
- Multiple filter combinations
- Relevance scoring

**Error Responses:**
- 400: Query is required
- 500: Search failed

---

### Assets API

#### GET /api/assets
Get user's assets with pagination.

**Query Parameters:**
- `userId`: string (required)
- `limit`: number (default: 20)
- `offset`: number (default: 0)
- `orderBy`: 'uploadedAt' | 'filename' | 'size' (default: 'uploadedAt')
- `order`: 'asc' | 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "assets": [...],
  "total": 150,
  "hasMore": true
}
```

#### GET /api/assets/:id
Get a specific asset by ID.

**Response:**
```json
{
  "success": true,
  "asset": {...}
}
```

#### PATCH /api/assets/:id
Update an asset.

**Request:**
```json
{
  "filename": "new-name.jpg",
  "tags": ["tag1", "tag2"],
  "visibility": "public",
  "forSale": true,
  "price": 29.99,
  "license": "commercial"
}
```

#### DELETE /api/assets/:id
Delete an asset.

**Response:**
```json
{
  "success": true,
  "message": "Asset deleted"
}
```

---

### Collections API

#### GET /api/collections
Get user's collections.

**Query Parameters:**
- `userId`: string (required)

**Response:**
```json
{
  "success": true,
  "collections": [
    {
      "id": "collection-id",
      "name": "My Collection",
      "description": "Description",
      "coverImageId": "asset-id",
      "assetIds": ["asset-1", "asset-2"],
      "visibility": "private",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/collections
Create a new collection.

**Request:**
```json
{
  "userId": "user-id",
  "name": "My Collection",
  "description": "Optional description",
  "visibility": "private"
}
```

#### PATCH /api/collections/:id
Update a collection.

**Request:**
```json
{
  "name": "Updated Name",
  "assetIds": ["asset-1", "asset-2", "asset-3"],
  "coverImageId": "asset-1"
}
```

#### DELETE /api/collections/:id
Delete a collection (assets are not deleted).

---

### Marketplace API

#### GET /api/marketplace
Get public marketplace listings.

**Query Parameters:**
- `limit`: number (default: 20)
- `offset`: number (default: 0)
- `type`: 'image' | 'video' | 'audio' | 'document'
- `minPrice`: number
- `maxPrice`: number
- `tags`: string (comma-separated)

**Response:**
```json
{
  "success": true,
  "listings": [...],
  "total": 50
}
```

#### POST /api/marketplace/checkout
Create a checkout session for purchasing an asset.

**Request:**
```json
{
  "assetId": "asset-id",
  "buyerId": "buyer-id"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "session-id"
}
```

#### POST /api/marketplace/connect
Initiate Stripe Connect onboarding.

**Request:**
```json
{
  "userId": "user-id"
}
```

**Response:**
```json
{
  "success": true,
  "onboardingUrl": "https://connect.stripe.com/..."
}
```

---

### Webhooks

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

**Events Handled:**
- `payment_intent.succeeded`: Complete sale, deliver asset
- `account.updated`: Update seller account status
- `charge.refunded`: Process refund

**Request:**
- Headers:
  - `stripe-signature`: Webhook signature
- Body: Stripe event object

**Response:**
```json
{
  "received": true
}
```

---

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common Error Codes
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- Upload: 10 files per minute
- AI Analysis: 100 requests per hour (free), unlimited (pro)
- Search: 60 requests per minute
- Marketplace: 120 requests per minute

## Best Practices

### Uploading Files
1. Validate file size client-side before upload
2. Show progress feedback to users
3. Handle upload failures gracefully
4. Implement retry logic for failed uploads

### AI Processing
1. Queue AI jobs for background processing
2. Poll job status for completion
3. Handle AI provider fallbacks
4. Respect usage limits

### Search
1. Debounce search input
2. Cache search results client-side
3. Use filters to narrow results
4. Implement infinite scroll for large result sets

### Marketplace
1. Verify Stripe Connect status before listing
2. Handle webhook events idempotently
3. Implement proper error handling for payments
4. Provide clear user feedback throughout checkout

## SDK Examples

### JavaScript/TypeScript

```typescript
// Upload a file
const formData = new FormData();
formData.append('file', file);
formData.append('userId', userId);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();

// Search assets
const searchResponse = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'sunset mountains',
    userId: userId,
    filters: { type: ['image'] }
  }),
});

const searchData = await searchResponse.json();
```

## Versioning

Current API Version: v1

Future versions will be namespaced: `/api/v2/...`