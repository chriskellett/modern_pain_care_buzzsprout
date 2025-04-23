// cors.ts - CORS helpers for Deno API server

// Define CORS headers to allow cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "https://exact-structure-510787.framer.app/", // Change to specific origins in production
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 hours
};
