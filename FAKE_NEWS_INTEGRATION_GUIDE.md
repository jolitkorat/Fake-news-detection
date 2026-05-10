# Fake News Detection Platform - Complete Backend Integration Guide

## Overview

This is a complete backend integration for fake news detection using the Anakin Search API. The system analyzes news content for sensational keywords, propaganda language, and cross-references with trusted news sources.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                   │
│              FakeNewsChecker.jsx                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  Backend API                        │
│  ┌────────────────────────────────────────────────┐ │
│  │         newsController.js                      │ │
│  │  - checkFakeNews()                             │ │
│  │  - batchCheckFakeNews()                        │ │
│  │  - getTrustedDomains()                         │ │
│  └─────────┬──────────────────┬────────────────────┘ │
│            │                  │                      │
│            ▼                  ▼                      │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │ anakinSearchService  │  │ fakeNewsAnalyzer    │  │
│  │ - searchWithAnakin() │  │ - analyzeFakeNews() │  │
│  │ - filterResults()    │  │ - analyzeText()     │  │
│  └──────────┬───────────┘  │ - analyzeSource()   │  │
│             │              └─────────────────────┘  │
│             ▼                                        │
│  ┌──────────────────────────────────────────────┐  │
│  │    Anakin Search API                         │  │
│  │  https://api.anakin.io/v1/search             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Files Created

### 1. Service Files

#### `src/services/anakinSearchService.js`
- Handles all Anakin Search API communication
- Functions:
  - `searchWithAnakin(query, limit)` - Search for content
  - `extractDomain(url)` - Extract domain from URL
  - `filterRelevantResults(results, query)` - Filter and rank results

#### `src/services/fakeNewsAnalyzerService.js`
- Core analysis logic for fake news detection
- Key features:
  - Sensational keyword detection
  - Propaganda language analysis
  - Misinformation indicators
  - Trusted domain verification
  - Credibility scoring
- Trusted domains: BBC, Reuters, AP News, NASA, WHO
- Functions:
  - `analyzeFakeNews(text, headline, sources)` - Main analysis function
  - `analyzeTextContent(text, headline)` - Analyze text for indicators
  - `analyzeSourceCredibility(sources)` - Check source credibility
  - `findKeywords(text, keywords)` - Find keywords in text
  - `determineVerdict(score, sources)` - Generate verdict
  - `generateReasoning(analysis, sources, verdict)` - Create reasoning

### 2. Controller Files

#### `src/controllers/newsController.js`
- Express controller for news endpoints
- Endpoints:
  - `POST /api/news/check-fake-news` - Single news analysis
  - `POST /api/news/batch-check` - Batch analysis (up to 50 items)
  - `GET /api/news/trusted-domains` - List trusted domains

### 3. Route Files

#### `src/routes/news.js`
- Express routes for news analysis endpoints
- All endpoints require authentication (JWT or API Key)
- Endpoints use rate limiting middleware

### 4. Frontend Integration

#### `src/pages/FakeNewsChecker.jsx`
- Complete React component for fake news detection UI
- Features:
  - Headline input (optional)
  - News content textarea
  - Real-time character count
  - Result visualization with color-coded verdicts
  - Detailed analysis breakdown
  - Source credibility display

## Environment Variables

Add these to `backend/.env`:

```env
# Required: Anakin Search API
ANAKIN_API_KEY=your-anakin-api-key-here

# Optional: Override default Anakin endpoint
ANAKIN_SEARCH_URL=https://api.anakin.io/v1/search

# Standard configuration
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/truthlens
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### 1. Check Single News Item

**Endpoint:** `POST /api/news/check-fake-news`

**Authentication:** JWT or API Key (Required)

**Request Body:**
```json
{
  "text": "Full news article content...",
  "headline": "Article headline (optional)",
  "searchQuery": "Override search query (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "63385e99-3ef5-4667-84a7-e7b398ec8e06",
    "verdict": "Fake | Misleading | Partially True | Verified | Unverifiable",
    "confidence": 85,
    "reasoning": [
      "Detected 3 sensational keywords: shocking, explosive, secret",
      "Found propaganda language patterns: deep state, hoax",
      "No trusted news sources found in search results",
      "Lacks citations from authoritative sources"
    ],
    "scores": {
      "fakeScore": 82,
      "credibilityScore": 25,
      "combinedScore": 78,
      "sourceCredibilityScore": 40
    },
    "indicators": {
      "sensational": {
        "found": true,
        "count": 3,
        "matches": ["shocking", "explosive", "secret"]
      },
      "propaganda": {
        "found": true,
        "count": 2,
        "matches": ["deep state", "hoax"]
      },
      "misinformation": {
        "found": false,
        "count": 0,
        "matches": []
      },
      "credible": {
        "found": false,
        "count": 0,
        "matches": []
      },
      "contentIndicators": {
        "hasAllCaps": false,
        "hasMultipleExclamation": false,
        "hasQuestionHeadline": false,
        "urlMentioned": false
      }
    },
    "sourceAnalysis": {
      "trustedSourceCount": 0,
      "untrustedSourceCount": 2,
      "sources": [
        {
          "url": "https://example.com/article",
          "domain": "example.com",
          "title": "Article Title",
          "isTrusted": false,
          "credibilityScore": 40
        }
      ]
    },
    "processingTime": 2340,
    "searchQuery": "Article headline",
    "analyzedAt": "2025-01-15T10:30:00Z"
  }
}
```

### 2. Batch Check Multiple News Items

**Endpoint:** `POST /api/news/batch-check`

**Authentication:** JWT or API Key (Required)

**Request Body:**
```json
{
  "articles": [
    {
      "id": "article-1",
      "text": "News content...",
      "headline": "Headline..."
    },
    {
      "id": "article-2",
      "text": "More news content...",
      "headline": "Another headline..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "processed": 2,
    "results": [
      {
        "id": "article-1",
        "verdict": "Fake",
        "confidence": 85,
        "scores": {
          "fakeScore": 82,
          "credibilityScore": 25,
          "combinedScore": 78,
          "sourceCredibilityScore": 40
        }
      },
      {
        "id": "article-2",
        "verdict": "Verified",
        "confidence": 78,
        "scores": {
          "fakeScore": 22,
          "credibilityScore": 80,
          "combinedScore": 45,
          "sourceCredibilityScore": 85
        }
      }
    ]
  }
}
```

### 3. Get Trusted Domains

**Endpoint:** `GET /api/news/trusted-domains`

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 13,
    "domains": [
      "bbc.com",
      "reuters.com",
      "apnews.com",
      "nasa.gov",
      "who.int",
      "theguardian.com",
      "nytimes.com",
      "wsj.com",
      "ft.com",
      "economist.com",
      "bbc.co.uk",
      "bbc.co.jp",
      "aljazeera.com"
    ]
  }
}
```

## Scoring Logic

### Fake Score Calculation (0-100)

1. **Sensational Keywords** (+8 per occurrence, max 30)
   - shocking, explosive, secret, breaking, urgent, etc.

2. **Propaganda Language** (+15 per occurrence, max 40)
   - hoax, conspiracy, deep state, illuminati, etc.

3. **Misinformation Indicators** (+12 per occurrence, max 35)
   - fake news, fabricated, debunked, etc.

4. **Content Indicators** (+8-10 each)
   - Excessive capitalization
   - Multiple exclamation marks
   - Question headline without evidence
   - No URLs or sources

### Credibility Score Calculation (0-100)

1. **Credible Keywords** (+5 per occurrence, max 30)
   - according to, researchers, study, peer-reviewed, etc.

2. **Trusted Sources** (+10-85 based on domain)
   - Trusted domains: 85 points
   - Other sources: 40 points

3. **Source Distribution**
   - Multiple trusted sources: increases confidence
   - No trusted sources: significantly increases fake score

### Verdict Determination

- **Fake** (75+): Clearly fabricated or conspiratorial content
- **Misleading** (55-74): Mixed sensationalism with some credibility
- **Partially True** (35-54): Some credible elements mixed with false claims
- **Verified** (35 or less + 2+ trusted sources): Evidence-based content from credible sources
- **Unverifiable** (35 or less, no trusted sources): Insufficient evidence for verification

## Usage Examples

### cURL Example

```bash
curl -X POST http://localhost:5000/api/news/check-fake-news \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Scientists have discovered a shocking new cure that pharmaceutical companies dont want you to know about. This explosive breakthrough proves everything mainstream media told you was a lie.",
    "headline": "BREAKING: Hidden Cure Discovered!"
  }'
```

### JavaScript/Fetch Example

```javascript
const response = await fetch('/api/news/check-fake-news', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    text: 'Your news content here...',
    headline: 'Optional headline'
  })
})

const result = await response.json()
console.log(result.data.verdict)
```

### Batch Analysis Example

```javascript
const response = await fetch('/api/news/batch-check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    articles: [
      { id: '1', text: 'First article...', headline: 'Headline 1' },
      { id: '2', text: 'Second article...', headline: 'Headline 2' },
      { id: '3', text: 'Third article...', headline: 'Headline 3' }
    ]
  })
})

const result = await response.json()
console.log(`Processed: ${result.data.processed}/${result.data.total}`)
result.data.results.forEach(r => {
  console.log(`Article ${r.id}: ${r.verdict} (${r.confidence}%)`)
})
```

## Error Handling

### Common Errors

**400 - Invalid Input**
```json
{
  "success": false,
  "error": "News text is required and must be at least 20 characters long"
}
```

**401 - Unauthorized**
```json
{
  "success": false,
  "error": "Unauthorized - JWT token required"
}
```

**429 - Rate Limited**
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "error": "Failed to analyze news content"
}
```

## Testing

### 1. Using Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/news/check-fake-news`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN`
   - `Content-Type: application/json`
4. Body (JSON):
```json
{
  "text": "Your test content here",
  "headline": "Test Headline"
}
```

### 2. Using Thunder Client

Same as Postman but available directly in VS Code

### 3. Using API Gateway

Test with the built-in API testing in the app

## Performance Considerations

- **Response Time**: Typically 2-5 seconds (includes Anakin Search API latency)
- **Concurrent Requests**: Supported with rate limiting (100 requests per 15 minutes)
- **Batch Size**: Maximum 50 articles per request
- **Caching**: Search results are not cached (fresh analysis every time)

## Database Schema

Analysis results are saved in MongoDB with the following structure:

```javascript
{
  userId: ObjectId,
  inputType: 'text',
  originalContent: {
    headline: String,
    body: String,
    url: Null
  },
  verdict: String,
  confidence: Number,
  reasoning: [String],
  nlpAnalysis: Object,
  customMetadata: {
    fakeScore: Number,
    sourceCredibilityScore: Number,
    searchQueryUsed: String,
    sourcesAnalyzed: Number
  },
  processingTime: Number,
  model: String,
  createdAt: Date
}
```

## Integration with Frontend

1. Add the `FakeNewsChecker.jsx` component to your React app
2. Import it in your main router
3. Add route: `/fake-news-checker` (or your preferred path)
4. Ensure user is authenticated before accessing
5. Component handles all API calls and displays results

## Troubleshooting

### Issue: ANAKIN_API_KEY not configured

**Solution:** Add `ANAKIN_API_KEY` to your `.env` file

### Issue: Search results not returning

**Solution:** Check that your ANAKIN_API_KEY is valid and has quota

### Issue: Analysis takes too long

**Solution:** This is normal for the first request; results are saved in MongoDB for future reference

### Issue: Verdict seems incorrect

**Solution:** Review the `reasoning` array and `indicators` to understand the analysis; you may need to adjust sensitivity in `fakeNewsAnalyzerService.js`

## Future Enhancements

- [ ] Add support for image-based fake news detection
- [ ] Implement ML model for better classification
- [ ] Add source reputation database
- [ ] Create user feedback loop for model improvement
- [ ] Add email alerts for flagged content
- [ ] Implement caching for common searches

## Security Notes

- All endpoints require authentication
- Rate limiting prevents abuse
- Input sanitization with mongo-sanitize
- API keys are hashed in database
- CORS is configured for your frontend domain
- All requests are logged

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the error response message
3. Check backend logs in `logs/` directory
4. Contact support with error details and request body

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** Production Ready
