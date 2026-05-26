# TalentDash Client API Guide

Use the same REST JSON API from **web**, **mobile web**, **Android**, and **iOS**.

**Base URL:** `https://your-api.example.com` (local: `http://localhost:8000`)

## Quick links

| Resource | URL |
|----------|-----|
| Web app | `/app` |
| OpenAPI docs | `/docs` |
| API info | `GET /api/v1/info` |
| Search salaries | `GET /api/v1/salaries` |
| Platform stats | `GET /api/v1/stats` |

## Authentication

- **Read API (`/api/v1/*`):** Public, no auth required
- **Ingest API (`POST /api/ingest-salary`):** Requires `X-API-Key` header

## Core endpoints

### List salaries (paginated)

```
GET /api/v1/salaries?company=google&role=engineer&location=bangalore&level=l5&page=1&page_size=20
```

**Response:**
```json
{
  "data": [{
    "id": "uuid",
    "company": "google",
    "role": "Software Engineer",
    "level": "l5",
    "location": "bangalore",
    "experience_years": 6,
    "base_salary_inr": 3500000,
    "base_salary_lpa": 35.0,
    "total_compensation_inr": 5000000,
    "total_compensation_lpa": 50.0,
    "confidence_score": 0.85,
    "source": "ambitionbox",
    "created_at": "2024-05-01T12:00:00Z"
  }],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Get single record

```
GET /api/v1/salaries/{id}
```

### Compare offers (batch, 1–3 IDs)

Fetch multiple records in one request for side-by-side compare UIs. IDs are deduplicated; response order matches the request order.

```
GET /api/v1/salaries/compare?ids={id1},{id2},{id3}
```

**Response:**
```json
{
  "data": [ { "id": "...", "company": "google", "total_compensation_lpa": 50.0 } ],
  "missing_ids": []
}
```

- **422** if no IDs, or more than 3 unique IDs
- `missing_ids` lists IDs that were not found (partial success is OK)

Shareable web links: `/compare?ids=id1,id2` (session storage optional).

### Company summaries

```
GET /api/v1/companies?page=1&page_size=20
GET /api/v1/companies/{company}/salaries
```

### Filter options (for dropdowns)

```
GET /api/v1/filters
```

### Platform stats

```
GET /api/v1/stats
```

## Platform integration

### Web (React / Vue / Angular)

```javascript
const API = "http://localhost:8000";
const res = await fetch(`${API}/api/v1/salaries?company=flipkart&page=1`);
const { data, meta } = await res.json();
```

CORS is enabled by default (`CORS_ORIGINS=*`). Set `CORS_ORIGINS=https://yourapp.com` in production.

### Android (Kotlin + Retrofit)

```kotlin
interface TalentDashApi {
    @GET("api/v1/salaries")
    suspend fun getSalaries(
        @Query("company") company: String? = null,
        @Query("page") page: Int = 1
    ): SalaryListResponse
}
// Base URL: https://your-api.example.com/
```

### iOS (Swift + URLSession)

```swift
let url = URL(string: "https://your-api.example.com/api/v1/salaries?company=google")!
let (data, _) = try await URLSession.shared.data(from: url)
let response = try JSONDecoder().decode(SalaryListResponse.self, from: data)
```

### React Native / Flutter

Use the same REST endpoints. Display `total_compensation_lpa` for Indian users.

```dart
// Flutter example
final response = await http.get(
  Uri.parse('$baseUrl/api/v1/salaries?location=bangalore&page=1'),
);
final json = jsonDecode(response.body);
final salaries = json['data'] as List;
```

### Mobile WebView (Android / iOS shell apps)

Load the built-in web app in a WebView:

- **Android:** `webView.loadUrl("https://your-api.example.com/app")`
- **iOS:** `wkWebView.load(URLRequest(url: URL(string: "https://your-api.example.com/app")!))`

## Amount fields

| Field | Description |
|-------|-------------|
| `*_inr` | Indian Rupees (annual) |
| `*_lpa` | Lakhs Per Annum (INR ÷ 100,000) |

Use `*_lpa` for display in India; use `*_inr` for calculations.

## Error handling

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 404 | Record not found |
| 422 | Validation error |
| 401 | Invalid API key (ingest only) |

## OpenAPI

Generate native client SDKs from `/openapi.json`:

```bash
# TypeScript
npx openapi-typescript http://localhost:8000/openapi.json -o ./types/api.ts

# Kotlin (Android)
openapi-generator generate -i http://localhost:8000/openapi.json -g kotlin -o ./android-sdk
```
