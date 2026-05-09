# Receipt Parser

A small full-stack application that allows users to upload receipt images, extract structured receipt data using an LLM, review and correct extracted fields inline, and save the corrected result locally.

---

# Stack

- Frontend: React + Vite
- Backend: Express + TypeScript
- Storage: JSON file persistence
- LLM: Google Gemini (`gemini-3-flash-preview` / free tier compatible)

---

# Features

- Upload JPG/PNG receipt images
- Extract:
  - Merchant name
  - Date
  - Line items
  - Total amount
- Inline editing for corrections
- Save corrected receipts locally
- Persistent receipt storage using a JSON file

---

# Run Locally

## 1. Install dependencies

```bash
npm install
npm run install-all
````

## 2. Configure environment variables

Create:

```bash
server/.env
```

Add:

```env
GEMINI_API_KEY=your_api_key_here
```

---

## 3. Start the app

```bash
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:3001
```

---

# Parsing Approach

The backend sends uploaded receipt images to Google Gemini Vision for OCR and structured extraction.

Expected response schema:

```json
{
  "merchant": "string",
  "date": "string",
  "items": [
    {
      "name": "string",
      "amount": 0
    }
  ],
  "total": 0
}
```

The correction flow is intentionally central to the product experience. Users can edit any extracted field before saving.

---

# Tradeoffs

## 1. JSON File Persistence Instead of SQLite

I chose JSON-file persistence to reduce setup complexity and keep the app runnable with minimal configuration. For the assignment scope, durability and querying requirements were limited.

## 2. Fast Multimodal Model Over Maximum Accuracy

I used Gemini Flash because it provides fast multimodal OCR performance with a generous free tier. Since the user reviews and corrects extracted data, low latency felt more valuable than maximizing extraction accuracy.

## 3. Simplified Line Item Definition

I treated purchased products as line items while excluding taxes, subtotals, discounts, and tips. This keeps the UI simpler and matches the most common use case for receipt review.

---

# LLM Usage

* Used Google Gemini Vision API for OCR and structured extraction
* Prompted the model to return strict JSON only
* Added response cleanup for malformed markdown-wrapped JSON
* Used manual correction UI as the primary recovery path for extraction mistakes

---

# Error Handling

* Handles missing uploads
* Handles malformed model responses
* Cleans markdown code fences returned by Gemini
* Returns server errors gracefully when parsing fails

---

# What I Would Do With Another Week

* Confidence highlighting for uncertain fields
* Receipt image preview with field annotations
* Drag-and-drop uploads
* SQLite or Postgres persistence
* Search/filter saved receipts
* Background parsing jobs
* Better validation and retry logic
* Mobile-responsive UI improvements
* Unit/integration tests

---

# PM Pushback

Given the scope of the assignment, I would likely push back on separating the frontend and backend into independent applications unless there was a clear scaling, organizational, or multi-platform requirement that justified the additional complexity.

For this type of product, I think a unified Next.js architecture using Server Actions or Route Handlers would likely be the most pragmatic choice:
- one runtime,
- one deployment target,
- simpler local development,
- no CORS setup,
- and faster iteration speed.

Even for a multi-user application, I would still prefer starting with a full-stack Next.js architecture unless there was a concrete need for independently scaled services, multiple clients (mobile/public APIs), or heavy background processing workloads.

My general bias is to avoid introducing service boundaries before they solve a real problem. For an AI-assisted CRUD workflow like receipt parsing, a monolithic full-stack architecture is likely sufficient for a long time while keeping operational overhead low.

I would also want clarification on expected latency and UX requirements around receipt parsing. Vision model response times can vary depending on image quality and provider load, which affects whether the product should use synchronous uploads, async jobs, retry queues, or optimistic loading states.

---