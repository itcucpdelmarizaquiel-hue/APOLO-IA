# APOLO IA

## Running locally on Replit

- Install dependencies with `npm install`.
- Start the development server with `npm run dev`.
- The Replit workflow is named `Start application` and serves the app on port `5000`.
- Create a production build with `npm run build`, then run it with `npm start`.

## Image generation

The image studio works with local fallbacks, but Gemini-powered prompt refinement and image generation require `GEMINI_API_KEY` to be configured in Replit Secrets. The app reads it only on the server.