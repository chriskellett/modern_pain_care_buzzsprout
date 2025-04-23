// main.ts - Fixed Buzzsprout API Server for Deno Deploy
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Your Buzzsprout credentials
const API_TOKEN = "YOUR_API_TOKEN"; // Replace with your actual Buzzsprout API token
const PODCAST_ID = "YOUR_PODCAST_ID"; // Replace with your actual podcast ID

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
        message: "Buzzsprout API server is running"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Stats endpoint
  if (path === "/api/stats") {
    try {
      console.log("Fetching podcast stats...");
      
      // Using the exact URL format from the Buzzsprout documentation
      const episodesUrl = `https://www.buzzsprout.com/api/${PODCAST_ID}/episodes.json`;
      
      const headers = {
        "Authorization": `Token token=${API_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Deno-Buzzsprout-API-Client/1.0"
      };
      
      console.log(`Requesting from: ${episodesUrl}`);
      
      const response = await fetch(episodesUrl, {
        method: "GET",
        headers: headers
      });
      
      // Log response status for debugging
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status}, ${errorText}`);
        return new Response(
          JSON.stringify({ 
            error: "Buzzsprout API request failed", 
            status: response.status,
            details: errorText,
            url: episodesUrl
          }),
          { 
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      const episodes = await response.json();
      console.log(`Received ${episodes.length} episodes`);
      
      // Calculate total downloads
      let totalDownloads = 0;
      const episodeStats = [];
      
      for (const episode of episodes) {
        const downloads = episode.total_plays || 0;
        totalDownloads += downloads;
        
        episodeStats.push({
          id: episode.id,
          title: episode.title,
          publishedAt: episode.published_at,
          downloads: downloads
        });
      }
      
      const stats = {
        totalEpisodes: episodes.length,
        totalDownloads: totalDownloads,
        episodeStats: episodeStats
      };
      
      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error("Error in /api/stats:", error);
      return new Response(
        JSON.stringify({ 
          error: "Internal server error", 
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

  // Episode endpoint
  if (path === "/api/episodes") {
    try {
      // Using the exact URL format from the Buzzsprout documentation
      const episodesUrl = `https://www.buzzsprout.com/api/${PODCAST_ID}/episodes.json`;
      
      const response = await fetch(episodesUrl, {
        method: "GET",
        headers: {
          "Authorization": `Token token=${API_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "Deno-Buzzsprout-API-Client/1.0"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status}, ${errorText}`);
        return new Response(
          JSON.stringify({ 
            error: "Buzzsprout API request failed", 
            status: response.status,
            details: errorText,
            url: episodesUrl
          }),
          { 
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      const episodes = await response.json();
      return new Response(
        JSON.stringify(episodes),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error("Error in /api/episodes:", error);
      return new Response(
        JSON.stringify({ 
          error: "Internal server error", 
          message: error.message,
          stack: error.stack,
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  }

  // Debug endpoint to verify API credentials
  if (path === "/api/debug") {
    return new Response(
      JSON.stringify({
        message: "Debug information (credentials masked for security)",
        api_token_length: API_TOKEN ? API_TOKEN.length : 0,
        podcast_id: PODCAST_ID,
        api_url: `https://www.buzzsprout.com/api/${PODCAST_ID}/episodes.json`,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Not found
  return new Response("Not Found", { 
    status: 404, 
    headers: corsHeaders 
  });
});
