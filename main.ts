// main.js
Deno.serve(async (req) => {
  // Your Buzzsprout credentials
  const API_TOKEN = "7680875e1475229aabe7aef39fc78e59";
  const PODCAST_ID = "2124284";

  // Handle CORS for browser-based requests
  const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*", // Allow all origins
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Authorization",
  };

  try {
    // Make GET request to Buzzsprout API for episodes
    const response = await fetch(
      `https://www.buzzsprout.com/api/${PODCAST_ID}/episodes.json?api_token=${API_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Token token=${API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch data from Buzzsprout" }),
        { status: response.status, headers }
      );
    }

    const episodes = await response.json();

    // Calculate total plays and total episodes
    const totalPlays = episodes.reduce((sum, episode) => sum + (episode.total_plays || 0), 0);
    const totalEpisodes = episodes.length;

    // Return the result as JSON
    return new Response(
      JSON.stringify({ totalPlays, totalEpisodes }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error: " + error.message }),
      { status: 500, headers }
    );
  }
});
