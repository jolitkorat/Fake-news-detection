const axios = require('axios');
const logger = require('../utils/logger');

const getAnakinConfig = () => ({
  apiUrl: process.env.ANAKIN_SEARCH_URL || process.env.ANAKIN_API_URL || 'https://api.anakin.io/v1/search',
  apiKey: process.env.ANAKIN_API_KEY,
});

/**
 * Search for content using Anakin Search API
 * @param {string} searchQuery - The search query
 * @param {number} limit - Number of results to return (default: 5)
 * @returns {Object} - Search results with id and results array
 */
const searchWithAnakin = async (searchQuery, limit = 5) => {
  const { apiUrl, apiKey } = getAnakinConfig();

  if (!apiKey || apiKey.includes('your-')) {
    logger.warn('ANAKIN_API_KEY is not configured');
    return {
      success: false,
      error: 'Anakin Search API key not configured',
      results: [],
    };
  }

  try {
    const payload = {
      prompt: searchQuery,
      limit: Math.min(limit, 10), // Cap at 10 results
    };

    const response = await axios.post(apiUrl, payload, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    if (!response.data || !Array.isArray(response.data.results)) {
      logger.error('Unexpected Anakin Search API response format');
      return {
        success: false,
        error: 'Invalid API response format',
        results: [],
      };
    }

    return {
      success: true,
      data: response.data,
      results: response.data.results || [],
    };
  } catch (error) {
    logger.error(`Anakin Search API error: ${error.message}`);
    return {
      success: false,
      error: `Search failed: ${error.message}`,
      results: [],
    };
  }
};

/**
 * Extract and validate domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} - The domain name
 */
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
};

/**
 * Get top results from search that contain the original query terms
 * @param {Array} results - Search results
 * @param {string} originalQuery - Original search query
 * @returns {Array} - Filtered and ranked results
 */
const filterRelevantResults = (results, originalQuery) => {
  if (!Array.isArray(results) || results.length === 0) {
    return [];
  }

  const queryTerms = originalQuery.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  const scored = results.map((result) => {
    const text = `${(result.title || '').toLowerCase()} ${(result.snippet || '').toLowerCase()}`;
    const matchCount = queryTerms.filter(term => text.includes(term)).length;
    return { ...result, relevanceScore: matchCount };
  });

  return scored
    .filter(r => r.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
};

module.exports = {
  searchWithAnakin,
  extractDomain,
  filterRelevantResults,
};
