# ReviewHub-System

ReviewHub is a frontend learning and assessment platform developed as a partial requirement for ITS MAP and E104. It includes study modules, dashboard views, mock exams, AI reviewer flows, and certificate tracking.

## Tech Stack
- React
- Vite
- TypeScript
- Tailwind CSS

## Run locally

Prerequisites:
- Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```
3. Open the app in your browser at:
   ```text
   http://localhost:3000
   ```

## Build for production

```bash
npm run build
```

## Deployment
This project is configured for GitHub Pages deployment via the GitHub Actions workflow in `.github/workflows/deploy.yml`.

Push to the `main` branch to trigger deployment.
