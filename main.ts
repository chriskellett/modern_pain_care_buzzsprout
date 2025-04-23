// main.ts - Basic Buzzsprout API Server for Deno Deploy
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
  const url = new URL(request.url);
  const path = url.pathname;
  
  console.log(`Received request for: ${path}`);

  // Health check endpoint
  if (path === "/api/health") {
    return new Response(
      JSON.stringify({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        message: "Health endpoint working correctly"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Raw endpoint
  if (path === "/api/raw") {
    return new Response(
      JSON.stringify({ 
        status: "endpoint_found",
        message: "Raw endpoint is defined correctly"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Alt endpoint
  if (path === "/api/alt") {
    return new Response(
      JSON.stringify({ 
        status: "endpoint_found",
        message: "Alt endpoint is defined correctly"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Stats endpoint stub
  if (path === "/api/stats") {
    return new Response(
      JSON.stringify({ 
        status: "endpoint_found",
        message: "Stats endpoint is defined correctly"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Episodes endpoint stub
  if (path === "/api/episodes") {
    return new Response(
      JSON.stringify({ 
        status: "endpoint_found",
        message: "Episodes endpoint is defined correctly"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Not found
  return new Response(
    JSON.stringify({
      status: "not_found",
      message: `Endpoint ${path} is not defined`,
      available_endpoints: [
        "/api/health",
        "/api/raw",
        "/api/alt",
        "/api/stats",
        "/api/episodes"
      ]
    }),
    { 
      status: 404, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
});
