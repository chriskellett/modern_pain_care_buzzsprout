// main.ts - Minimal Buzzsprout API Server for Deno Deploy
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Your Buzzsprout credentials
const API_TOKEN = "7680875e1475229aabe7aef39fc78e59";
const PODCAST_ID = "2124284";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Serve the HTTP requests
serve(async (request) => {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // Health check endpoint
  if (path === "/api/health") {
    return new Response(
      JSON.stringify({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Minimal raw Buzzsprout endpoint - just return whatever we get
  if (path === "/api/raw") {
    try {
      // Simple request to Buzzsprout API
      const episodesUrl = `https://www.buzzsprout.com/api/${PODCAST_ID}/episodes.json`;
      
      const response = await fetch(episodesUrl, {
        method: "GET",
        headers: {
          "Authorization": `Token token=${API_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "Deno-Buzzsprout-API-Client/1.0"
        }
      });
      
      // Return whatever response we get, whether success or error
      const contentType = response.headers.get("Content-Type") || "application/json";
      const body = await response.text();
      
      return new Response(body, {
        status: response.status,
        headers: { 
          ...corsHeaders, 
          "Content-Type": contentType 
        }
      });
      
    } catch (error) {
      console.error("Error in /api/raw:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to connect to Buzzsprout API", 
          message: error.message,
          stack: error.stack
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  }

  // Alternative API token approach using query parameter
  if (path === "/api/alt") {
    try {
      // Use query parameter approach instead of Authorization header
      const episodesUrl = `https://www.buzzsprout.com/api/${PODCAST_ID}/episodes.json?api_token=${API_TOKEN}`;
      
      const response = await fetch(episodesUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Deno-Buzzsprout-API-Client/1.0"
        }
      });
      
      // Return whatever response we get, whether success or error
      const contentType = response.headers.get("Content-Type") || "application/json";
      const body = await response.text();
      
      return new Response(body, {
        status: response.status,
        headers: { 
          ...corsHeaders, 
          "Content-Type": contentType 
        }
      });
      
    } catch (error) {
      console.error("Error in /api/alt:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to connect to Buzzsprout API", 
          message: error.message,
          stack: error.stack
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  }

  // Not found
  return new Response("Not Found", { 
    status: 404, 
    headers: corsHeaders 
  });
});
