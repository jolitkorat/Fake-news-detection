const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const { scrapeUrlWithAnakin } = require('./anakinService');

/**
 * Scrape article content from a URL
 */
const scrapeUrl = async (url) => {
  const useAnakin = process.env.ANAKIN_API_KEY && process.env.ANAKIN_API_URL;

  if (useAnakin) {
    const scraped = await scrapeUrlWithAnakin(url);
    if (scraped.success) {
      return scraped;
    }
    logger.warn(`Anakin scraper failed, falling back to built-in scraper: ${scraped.error}`);
  }

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);

    // Remove noise elements
    $('script, style, nav, footer, header, .ad, .advertisement, #cookie-banner').remove();

    // Try to get headline
    const headline =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      '';

    // Try to get article body
    let body = '';
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.article-body',
      '.post-content',
      '.entry-content',
      '.story-body',
      'main',
    ];

    for (const selector of articleSelectors) {
      const content = $(selector).text().trim();
      if (content.length > 200) {
        body = content;
        break;
      }
    }

    if (!body) {
      body = $('p')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter((t) => t.length > 50)
        .join('\n\n');
    }

    // Get meta info
    const author =
      $('meta[name="author"]').attr('content') ||
      $('[rel="author"]').first().text().trim() ||
      null;

    const publishedAt =
      $('meta[property="article:published_time"]').attr('content') ||
      $('time[datetime]').first().attr('datetime') ||
      null;

    const language =
      $('html').attr('lang')?.substring(0, 2) || 'en';

    return {
      success: true,
      data: {
        headline: headline.substring(0, 500),
        body: body.substring(0, 10000), // Limit to 10k chars
        author,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        language,
        url,
      },
    };
  } catch (error) {
    logger.error(`URL scraping error for ${url}: ${error.message}`);
    return {
      success: false,
      error: `Failed to fetch URL: ${error.message}`,
    };
  }
};

/**
 * Cross-check with Google Fact Check API
 */
const googleFactCheck = async (query) => {
  const apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    return { success: false, data: [] };
  }

  try {
    const response = await axios.get(
      'https://factchecktools.googleapis.com/v1alpha1/claims:search',
      {
        params: {
          query: query.substring(0, 200),
          key: apiKey,
          pageSize: 5,
          languageCode: 'en',
        },
        timeout: 5000,
      }
    );

    const claims = response.data.claims || [];
    return {
      success: true,
      data: claims.map((claim) => ({
        claimText: claim.text,
        rating: claim.claimReview?.[0]?.textualRating || 'Unknown',
        source: claim.claimReview?.[0]?.publisher?.name || 'Unknown',
        url: claim.claimReview?.[0]?.url || null,
      })),
    };
  } catch (error) {
    logger.error(`Fact check API error: ${error.message}`);
    return { success: false, data: [] };
  }
};

/**
 * Search for related news via NewsAPI
 */
const searchRelatedNews = async (headline) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    return { success: false, data: [] };
  }

  try {
    const keywords = headline.split(' ').slice(0, 5).join(' ');
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: keywords,
        sortBy: 'relevancy',
        pageSize: 5,
        language: 'en',
        apiKey,
      },
      timeout: 5000,
    });

    return {
      success: true,
      data: (response.data.articles || []).map((a) => ({
        title: a.title,
        source: a.source.name,
        url: a.url,
        publishedAt: a.publishedAt,
      })),
    };
  } catch (error) {
    logger.error(`NewsAPI error: ${error.message}`);
    return { success: false, data: [] };
  }
};

module.exports = { scrapeUrl, googleFactCheck, searchRelatedNews };
