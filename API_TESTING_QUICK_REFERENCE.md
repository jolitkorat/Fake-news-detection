# Quick Reference - API Testing Guide

## Setup

### 1. Get Authentication Token

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'

# Login (use returned token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

Save the `token` from response.

## API Testing

### 1. Check Single News Item

```bash
# Example with sensational content (should return "Fake")
curl -X POST http://localhost:5000/api/news/check-fake-news \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Scientists have discovered a shocking new cure that pharmaceutical companies dont want you to know about. This explosive breakthrough proves everything mainstream media told you was a lie. The government is covering up this massive conspiracy. Wake up sheeple!",
    "headline": "BREAKING: Hidden Cure Discovered!"
  }'
```

**Expected Result:** `verdict: "Fake"`, `confidence: 85+`

---

```bash
# Example with credible content (should return "Verified" or "Partially True")
curl -X POST http://localhost:5000/api/news/check-fake-news \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "According to a peer-reviewed study published in the journal Nature, researchers have confirmed the existence of a newly discovered species in the Amazon rainforest. The findings were verified by multiple independent laboratories and have been accepted by the scientific community.",
    "headline": "Scientists Discover New Species in Amazon"
  }'
```

**Expected Result:** `verdict: "Verified" or "Partially True"`, `confidence: 70+`

---

### 2. Batch Check Multiple News Items

```bash
curl -X POST http://localhost:5000/api/news/batch-check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "articles": [
      {
        "id": "1",
        "text": "Official government report confirms that the vaccine has gone through all required safety testing. The data shows it is 95% effective.",
        "headline": "Vaccine Safety Report Released"
      },
      {
        "id": "2",
        "text": "SHOCKING revelation: The government is secretly using 5G to control your mind! Wake up! This is what they don't want you to know!",
        "headline": "URGENT: 5G MIND CONTROL CONSPIRACY EXPOSED!"
      },
      {
        "id": "3",
        "text": "Local weather forecast predicts rain tomorrow with temperatures around 70 degrees Fahrenheit.",
        "headline": "Tomorrow's Weather Forecast"
      }
    ]
  }'
```

**Expected Results:**
- Article 1: `Verified` or `Partially True`
- Article 2: `Fake`
- Article 3: `Unverifiable`

---

### 3. Get Trusted Domains List

```bash
curl -X GET http://localhost:5000/api/news/trusted-domains \
  -H "Content-Type: application/json"
```

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
      ...
    ]
  }
}
```

---

## Response Examples

### Fake News Response

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "verdict": "Fake",
    "confidence": 87,
    "reasoning": [
      "Detected 4 sensational keywords: shocking, explosive, secret, conspiracy",
      "Found propaganda language patterns: deep state, wake up, sheeple",
      "No trusted news sources found in search results",
      "Lacks citations from authoritative sources",
      "Headline contains excessive capitalization, typical of sensationalized content"
    ],
    "scores": {
      "fakeScore": 85,
      "credibilityScore": 15,
      "combinedScore": 82,
      "sourceCredibilityScore": 30
    },
    "indicators": {
      "sensational": {
        "found": true,
        "count": 4,
        "matches": ["shocking", "explosive", "secret", "conspiracy"]
      },
      "propaganda": {
        "found": true,
        "count": 3,
        "matches": ["deep state", "wake up", "sheeple"]
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
        "hasAllCaps": true,
        "hasMultipleExclamation": true,
        "hasQuestionHeadline": false,
        "urlMentioned": false
      }
    },
    "sourceAnalysis": {
      "trustedSourceCount": 0,
      "untrustedSourceCount": 0,
      "sources": []
    },
    "processingTime": 2341,
    "searchQuery": "BREAKING: Hidden Cure Discovered!",
    "analyzedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### Verified News Response

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "verdict": "Verified",
    "confidence": 92,
    "reasoning": [
      "Contains credible reporting language: according to, peer-reviewed, published, researchers",
      "2 trusted source(s) referenced in search results",
      "Contains multiple credible keywords that indicate authoritative content"
    ],
    "scores": {
      "fakeScore": 18,
      "credibilityScore": 88,
      "combinedScore": 22,
      "sourceCredibilityScore": 95
    },
    "indicators": {
      "sensational": {
        "found": false,
        "count": 0,
        "matches": []
      },
      "propaganda": {
        "found": false,
        "count": 0,
        "matches": []
      },
      "misinformation": {
        "found": false,
        "count": 0,
        "matches": []
      },
      "credible": {
        "found": true,
        "count": 4,
        "matches": ["according to", "peer-reviewed", "published", "researchers"]
      },
      "contentIndicators": {
        "hasAllCaps": false,
        "hasMultipleExclamation": false,
        "hasQuestionHeadline": false,
        "urlMentioned": false
      }
    },
    "sourceAnalysis": {
      "trustedSourceCount": 2,
      "untrustedSourceCount": 1,
      "sources": [
        {
          "url": "https://www.bbc.com/news/science_environment",
          "domain": "bbc.com",
          "title": "Scientists Discover New Species",
          "isTrusted": true,
          "credibilityScore": 85
        },
        {
          "url": "https://www.reuters.com/science/",
          "domain": "reuters.com",
          "title": "Nature Journal Reports New Findings",
          "isTrusted": true,
          "credibilityScore": 85
        }
      ]
    },
    "processingTime": 2145,
    "searchQuery": "Scientists Discover New Species",
    "analyzedAt": "2025-01-15T10:35:00Z"
  }
}
```

---

## Postman Collection

### Import into Postman

Create a new collection with these requests:

```json
{
  "info": {
    "name": "Fake News Detection API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"SecurePassword123!\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"SecurePassword123!\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Check Fake News",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"text\": \"Scientists have discovered a shocking new cure that pharmaceutical companies dont want you to know about. This explosive breakthrough proves everything mainstream media told you was a lie. The government is covering up this massive conspiracy.\",\n  \"headline\": \"BREAKING: Hidden Cure Discovered!\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/news/check-fake-news",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "news", "check-fake-news"]
        }
      }
    },
    {
      "name": "Batch Check",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"articles\": [\n    {\n      \"id\": \"1\",\n      \"text\": \"Official government report confirms vaccine safety.\",\n      \"headline\": \"Vaccine Report\"\n    },\n    {\n      \"id\": \"2\",\n      \"text\": \"SHOCKING: 5G mind control conspiracy EXPOSED!\",\n      \"headline\": \"URGENT!\"\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/news/batch-check",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "news", "batch-check"]
        }
      }
    },
    {
      "name": "Get Trusted Domains",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/news/trusted-domains",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "news", "trusted-domains"]
        }
      }
    }
  ]
}
```

---

## JavaScript/Axios Examples

### Check News

```javascript
import axios from 'axios'

const checkNews = async (token, text, headline) => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/news/check-fake-news',
      { text, headline },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

// Usage
const result = await checkNews(
  'YOUR_TOKEN',
  'Your news text here...',
  'Optional headline'
)
console.log(result.data.verdict)
```

---

### Batch Check

```javascript
const batchCheck = async (token, articles) => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/news/batch-check',
      { articles },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

// Usage
const articles = [
  { id: '1', text: 'Article 1...', headline: 'Headline 1' },
  { id: '2', text: 'Article 2...', headline: 'Headline 2' }
]

const result = await batchCheck('YOUR_TOKEN', articles)
result.data.results.forEach(r => {
  console.log(`${r.id}: ${r.verdict} (${r.confidence}%)`)
})
```

---

## Troubleshooting

### Error: "Unauthorized - JWT token required"

**Solution:** Make sure you:
1. Logged in successfully
2. Copied the correct token
3. Added `Authorization: Bearer YOUR_TOKEN` header

### Error: "News text is required and must be at least 20 characters long"

**Solution:** Ensure your `text` field has at least 20 characters

### Error: "Batch size exceeds limit (max: 10)"

**Solution:** For non-enterprise users, maximum batch size is 10. Split into multiple requests or upgrade.

### Slow Response (5+ seconds)

**Solution:** This is expected on first request as Anakin Search API is queried. Responses cache in MongoDB after.

---

## Tips

1. **Save Token:** Store token in a variable after login for reuse
2. **Use Environment Variables:** In Postman, set `{{token}}` and `{{baseURL}}`
3. **Monitor Rate Limits:** Check response headers for rate limit info
4. **Test Progressive:** Start with single check, then move to batch
5. **Review Reasoning:** Always check the `reasoning` array to understand verdicts

---

**Last Updated:** January 2025
