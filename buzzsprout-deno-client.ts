/**
 * Buzzsprout API Client for Deno
 * 
 * A Deno-compatible client for interacting with the Buzzsprout API to retrieve podcast metrics
 * including total downloads for a specific podcast.
 */

export class BuzzsproutClient {
  private apiToken: string;
  private podcastId: string;
  private baseUrl = 'https://www.buzzsprout.com/api';
  private apiVersion = 'v1';

  /**
   * Create a new Buzzsprout API client
   * 
   * @param apiToken - Your Buzzsprout API token
   * @param podcastId - Your Buzzsprout podcast ID
   */
  constructor(apiToken: string, podcastId: string) {
    this.apiToken = apiToken;
    this.podcastId = podcastId;
  }

  /**
   * Get the headers required for API requests
   * 
   * @returns Headers object with authorization
   */
  private getHeaders(): Headers {
    return new Headers({
      'Authorization': `Token token=${this.apiToken}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get all episodes for the podcast
   * 
   * @returns Array of episode objects
   */
  async getEpisodes(): Promise<any[]> {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.podcastId}/episodes`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching episodes:', error);
      throw error;
    }
  }

  /**
   * Get download statistics for all episodes
   * 
   * @returns Object containing download statistics
   */
  async getDownloadStats(): Promise<PodcastStats> {
    const episodes = await this.getEpisodes();
    let totalDownloads = 0;
    
    // Sum up the total downloads from all episodes
    episodes.forEach(episode => {
      totalDownloads += episode.total_plays || 0;
    });
    
    return {
      totalEpisodes: episodes.length,
      totalDownloads: totalDownloads,
      episodeStats: episodes.map(episode => ({
        id: episode.id,
        title: episode.title,
        publishedAt: episode.published_at,
        downloads: episode.total_plays || 0
      }))
    };
  }
}

// Type definitions
export interface EpisodeStat {
  id: number;
  title: string;
  publishedAt: string;
  downloads: number;
}

export interface PodcastStats {
  totalEpisodes: number;
  totalDownloads: number;
  episodeStats: EpisodeStat[];
}

/**
 * Helper function to get podcast stats
 * 
 * @param apiToken - Your Buzzsprout API token
 * @param podcastId - Your Buzzsprout podcast ID
 * @returns Podcast statistics
 */
export async function getPodcastStats(apiToken: string, podcastId: string): Promise<PodcastStats> {
  const client = new BuzzsproutClient(apiToken, podcastId);
  try {
    return await client.getDownloadStats();
  } catch (error) {
    console.error('Failed to get podcast stats:', error);
    throw error;
  }
}
