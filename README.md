# WordLens

**WordLens** scans printed pages using in-browser OCR and highlights uncommon words, showing their definitions, pronunciation, and synonyms. Capture or upload page images, and the app extracts the text, filters out common words, and lets user explore difficult vocabulary page by page.

---

## Features

- **Page scanner** — Capture pages with your camera or upload images (up to 20 pages per scan)
- **OCR text extraction** — In-browser OCR powered by tesseract.js
- **Uncommon word detection** — Automatically filters out common words and tracks rare words per page
- **Definitions & synonyms** — Fetches meaning, part of speech, phonetic, and synonyms via dictionary APIs
- **Word highlighting** — Highlights uncommon words directly on the page preview
- **User accounts** — Firebase Auth + Firestore to save analyses and unlock all words
- **Guest mode** — View limited words without signing in

---

## Tech Stack

| Category | Libraries |
|----------|-----------|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| OCR / Documents | tesseract.js, pdfjs-dist, mammoth, word-extractor |
| NLP | wink-lemmatizer, commonWords.json |
| Backend / Auth | Firebase 13 (Auth + Firestore) |
| UI Components | lucide-react, Radix UI primitives |
| Utilities | clsx, tailwind-merge |

---

## How It Works

1. **Scan** — Capture or upload page images.
2. **OCR** — Images are preprocessed (grayscale, contrast, resize) and sent to tesseract.js to extract text.
3. **Analyze** — Text is tokenized, noise (URLs, emails) is removed, and common words are filtered out using a lemmatizer and a built-in common-words list.
4. **Explore** — Tap any uncommon word to see its definition, phonetic, part of speech, and synonyms.
5. **Save** — Logged-in users can save analyses to Firestore; guests see a preview of the first two words.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/wordlens.git
cd wordlens

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Add your Firebase config to .env.local

# Run the development server
npm run dev

```

## Open http://localhost:3000 in your browser.

Environment Variables
Create a .env.local file with your Firebase configuration:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

## Project Structure

```text
src/
├── app/                 
│   ├── api/define/route.ts      
│   ├── api/doc/[id]/page.tsx    
│   ├── login/page.tsx          
│   ├── results/page.tsx        
│   ├── scan/page.tsx           
│   └── profile/page.tsx         
├── components/          
│   ├── ScanCard.tsx
│   ├── WordList.tsx
│   ├── WordDetail.tsx
│   ├── DefinitionView.tsx
│   └── UploadCard.tsx
├── context/           
├── lib/                 
│   ├── define.ts               
│   ├── saveAnalysis.ts        
│   ├── extract/ocr.ts          
│   ├── words/findUncommon.ts  
│   └── words/commonWords.json  
└── types/               

```

License
MIT License 


