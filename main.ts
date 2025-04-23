// main.ts - Updated Buzzsprout API Server for Deno Deploy
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Your Buzzsprout credentials
const API_TOKEN = "7680875e1475229aabe7aef39fc78e59"; // Replace with your actual Buzzsprout API token
const PODCAST_ID = "2124284"; // Replace with your actual podcast ID

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
      
      // Important: Append .json to the URL as required by Buzzsprout API
      const episodesUrl = `https://www.buzzsprout.com/api/v1/${PODCAST_ID}/episodes.json`;
      
      const headers = {
        "Authorization": `Token token=${API_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Deno-Buzzsprout-API-Client/1.0" // Adding User-Agent as recommended
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
            details: errorText
          }),
          { 
            status: response.status, // Return the actual error code
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
      // Important: Append .json to the URL as required by Buzzsprout API
      const episodesUrl = `https://www.buzzsprout.com/api/v1/${PODCAST_ID}/episodes.json`;
      
      const response = await fetch(episodesUrl, {
        method: "GET",
        headers: {
          "Authorization": `Token token=${API_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "Deno-Buzzsprout-API-Client/1.0" // Adding User-Agent as recommended
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status}, ${errorText}`);
        return new Response(
          JSON.stringify({ 
            error: "Buzzsprout API request failed", 
            status: response.status,
            details: errorText
          }),
          { 
            status: response.status, // Return the actual error code
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
          message: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  }

  // Alternative episode endpoint that allows passing token and ID as query parameters
  if (path === "/api/episodes-alt") {
    try {
      // Get API token and podcast ID from query parameters
      const queryParams = url.searchParams;
      const tokenFromQuery = queryParams.get("api_token");
      const podcastIdFromQuery = queryParams.get("podcast_id");
      
      // Use provided parameters or fall back to environment values
      const token = tokenFromQuery || API_TOKEN;
      const podcastId = podcastIdFromQuery || PODCAST_ID;
      
      if (!token || !podcastId) {
        return new Response(
          JSON.stringify({ 
            error: "Missing credentials", 
            message: "API token and podcast ID are required" 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Important: Append .json to the URL as required by Buzzsprout API
      const episodesUrl = `https://www.buzzsprout.com/api/v1/${podcastId}/episodes.json?api_token=${token}`;
      
      const response = await fetch(episodesUrl, {
        method: "GET",
        headers: {
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
            details: errorText
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
      console.error("Error in /api/episodes-alt:", error);
      return new Response(
        JSON.stringify({ 
          error: "Internal server error", 
          message: error.message 
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
