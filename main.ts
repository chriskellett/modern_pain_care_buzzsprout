// main.ts - Buzzsprout API Server for Deno Deploy
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { BuzzsproutClient, getPodcastStats } from "./buzzsprout-deno-client.ts";
import { corsHeaders } from "./cors.ts";

// Your Buzzsprout credentials
const API_TOKEN = "7680875e1475229aabe7aef39fc78e59"; // Replace with your actual Buzzsprout API token
const PODCAST_ID = "2124284"; // Replace with your actual podcast ID

// Define endpoints and handlers
const routes = {
  "/api/stats": handleStats,
  "/api/episodes": handleEpisodes,
  "/api/health": handleHealth,
};

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  // Route to appropriate handler or return 404
  const handler = routes[path];
  if (handler) {
    try {
      return await handler(request);
    } catch (error) {
      console.error(`Error handling ${path}:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }
  }
  
  return new Response("Not Found", { status: 404, headers: corsHeaders });
}

async function handleStats(request: Request): Promise<Response> {
  // Verify method
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Get podcast statistics using the hardcoded API credentials
    const stats = await getPodcastStats(API_TOKEN, PODCAST_ID);
    
    // Return the stats as JSON
    return new Response(JSON.stringify(stats), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching podcast stats:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch podcast statistics", 
        details: error.message 
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function handleEpisodes(request: Request): Promise<Response> {
  // Verify method
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Create Buzzsprout client with hardcoded credentials
    const client = new BuzzsproutClient(API_TOKEN, PODCAST_ID);
    
    // Get episodes
    const episodes = await client.getEpisodes();
    
    // Return the episodes as JSON
    return new Response(JSON.stringify(episodes), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch episodes", 
        details: error.message 
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function handleHealth(_request: Request): Promise<Response> {
  return new Response(
    JSON.stringify({ 
      status: "ok", 
      service: "buzzsprout-api",
      timestamp: new Date().toISOString() 
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

// Start the server
console.log("Starting Buzzsprout API server...");
serve(handleRequest);
