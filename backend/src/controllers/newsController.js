const logger = require('../utils/logger');
const { searchWithAnakin, filterRelevantResults } = require('../services/anakinSearchService');
const { analyzeFakeNews } = require('../services/fakeNewsAnalyzerService');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

/**
 * POST /api/news/check-fake-news
 * Main endpoint to check if news content is fake
 */
const checkFakeNews = async (req, res) => {
  const startTime = Date.now();

  try {
    const { text, headline, searchQuery } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'News text is required and must be at least 20 characters long',
      });
    }

    // Use searchQuery if provided, otherwise use headline or first 100 chars of text
    const query = searchQuery || headline || text.substring(0, 100);

    // Search for related news using Anakin
    logger.info(`Searching for: ${query}`);
    const searchResult = await searchWithAnakin(query, 5);
    const searchSources = searchResult.success ? filterRelevantResults(searchResult.results || [], query) : [];

    // Analyze fake news
    const analysis = analyzeFakeNews(text, headline || '', searchSources);

    if (!analysis.success) {
      return res.status(400).json({
        success: false,
        error: analysis.error,
      });
    }

    const processingTime = Date.now() - startTime;

    // Save analysis to database
    const analysisRecord = await Analysis.create({
      userId: req.user?._id || null,
      apiKeyId: req.apiKey?._id || null,
      inputType: 'text',
      originalContent: {
        headline: headline || '',
        body: text,
        url: null,
      },
      verdict: analysis.data.verdict,
      confidence: analysis.data.confidence,
      reasoning: analysis.data.reasoning,
      nlpAnalysis: {
        sentiment: { label: 'neutral', score: 0 },
        entities: [],
        propagandaScore: analysis.data.indicators.propaganda.count * 15,
        clickbaitScore: analysis.data.scores.fakeScore * 0.6,
        biasScore: 35,
        headlineConsistency: headline ? 75 : 100,
      },
      factCheckResults: searchSources.map(source => ({
        claimText: source.title,
        rating: 'Related',
        source: extractDomain(source.url),
        url: source.url,
      })),
      processingTime,
      model: 'anakin-fake-news-detector',
      customMetadata: {
        fakeScore: analysis.data.scores.fakeScore,
        sourceCredibilityScore: analysis.data.scores.sourceCredibilityScore,
        searchQueryUsed: query,
        sourcesAnalyzed: searchSources.length,
      },
    });

    // Update user analysis count
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { analysisCount: 1, monthlyAnalysisCount: 1 },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: analysisRecord._id,
        verdict: analysis.data.verdict,
        confidence: analysis.data.confidence,
        reasoning: analysis.data.reasoning,
        scores: analysis.data.scores,
        indicators: analysis.data.indicators,
        sourceAnalysis: analysis.data.sourceAnalysis,
        processingTime,
        searchQuery: query,
        analyzedAt: analysisRecord.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Fake news check error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze news content',
    });
  }
};

/**
 * POST /api/news/batch-check
 * Batch check multiple news items
 */
const batchCheckFakeNews = async (req, res) => {
  try {
    const { articles } = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Provide an array of articles with "text" field',
      });
    }

    const maxBatch = req.user?.plan === 'enterprise' ? 50 : 10;
    if (articles.length > maxBatch) {
      return res.status(400).json({
        success: false,
        error: `Batch size exceeds limit (max: ${maxBatch})`,
      });
    }

    const results = [];

    for (const article of articles) {
      try {
        if (!article.text || article.text.trim().length < 20) {
          results.push({
            id: article.id,
            error: 'Text too short (minimum 20 characters)',
          });
          continue;
        }

        const searchResult = await searchWithAnakin(article.headline || article.text.substring(0, 100), 3);
        const searchSources = searchResult.success ? filterRelevantResults(searchResult.results || [], article.headline || '') : [];

        const analysis = analyzeFakeNews(article.text, article.headline || '', searchSources);

        if (analysis.success) {
          results.push({
            id: article.id || Math.random().toString(36).substr(2, 9),
            verdict: analysis.data.verdict,
            confidence: analysis.data.confidence,
            scores: analysis.data.scores,
          });
        } else {
          results.push({
            id: article.id,
            error: analysis.error,
          });
        }
      } catch (itemError) {
        logger.error(`Batch item error: ${itemError.message}`);
        results.push({
          id: article.id,
          error: 'Analysis failed for this item',
        });
      }
    }

    res.json({
      success: true,
      data: {
        total: articles.length,
        processed: results.filter(r => !r.error).length,
        results,
      },
    });
  } catch (error) {
    logger.error(`Batch check error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Batch analysis failed',
    });
  }
};

/**
 * GET /api/news/trusted-domains
 * Get list of trusted news domains
 */
const getTrustedDomains = async (req, res) => {
  try {
    const { TRUSTED_DOMAINS } = require('../services/fakeNewsAnalyzerService');

    res.json({
      success: true,
      data: {
        count: TRUSTED_DOMAINS.length,
        domains: TRUSTED_DOMAINS,
      },
    });
  } catch (error) {
    logger.error(`Get trusted domains error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trusted domains',
    });
  }
};

/**
 * Helper function to extract domain from URL
 */
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Unknown';
  }
};

module.exports = {
  checkFakeNews,
  batchCheckFakeNews,
  getTrustedDomains,
};
