const Analysis = require('../models/Analysis');
const { analyzeContent } = require('../services/aiService');
const { scrapeUrl, googleFactCheck } = require('../services/factCheckService');
const { deliverWebhook } = require('../services/webhookService');
const User = require('../models/User');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/analyze
 * Single article analysis
 */
const analyze = async (req, res) => {
  const startTime = Date.now();

  try {
    const { text, url, headline } = req.body;

    let content = {};

    // Input: URL
    if (url) {
      const scraped = await scrapeUrl(url);
      if (!scraped.success) {
        return res.status(400).json({ success: false, error: scraped.error });
      }
      content = scraped.data;
      if (headline) content.headline = headline;
    } else if (text) {
      // Input: Direct text
      content = {
        headline: headline || '',
        body: text,
        url: null,
      };
    } else {
      return res.status(400).json({ success: false, error: 'Provide either "text" or "url"' });
    }

    // Validate content length
    if (content.body.length < 50) {
      return res.status(400).json({ success: false, error: 'Content too short for analysis (minimum 50 characters)' });
    }

    // Run AI analysis
    const aiResult = await analyzeContent(content);
    if (!aiResult.success) {
      return res.status(500).json({ success: false, error: 'AI analysis failed' });
    }

    const aiData = aiResult.data;

    // Run fact-check in parallel
    const factCheckQuery = content.headline || content.body.substring(0, 200);
    const factCheckResult = await googleFactCheck(factCheckQuery);

    const processingTime = Date.now() - startTime;

    // Save to database
    const analysis = await Analysis.create({
      userId: req.user?._id || null,
      apiKeyId: req.apiKey?._id || null,
      inputType: url ? 'url' : 'text',
      originalContent: {
        headline: content.headline || '',
        body: content.body,
        url: content.url,
        author: content.author,
        publishedAt: content.publishedAt,
        language: content.language || 'en',
      },
      verdict: aiData.verdict,
      confidence: aiData.confidence,
      reasoning: aiData.reasoning || [],
      trustedSources: (aiData.trusted_sources || []).map((s) => ({
        name: s.name,
        url: s.url,
        relevance: s.relevance || 0.5,
      })),
      nlpAnalysis: {
        sentiment: aiData.nlp_analysis?.sentiment || { label: 'neutral', score: 0 },
        entities: aiData.nlp_analysis?.entities || [],
        propagandaScore: aiData.nlp_analysis?.propaganda_score || 0,
        clickbaitScore: aiData.nlp_analysis?.clickbait_score || 0,
        biasScore: aiData.nlp_analysis?.bias_score || 0,
        headlineConsistency: aiData.nlp_analysis?.headline_consistency || 100,
      },
      factCheckResults: factCheckResult.data || [],
      processingTime,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    });

    // Update user analysis count
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { analysisCount: 1, monthlyAnalysisCount: 1 },
      });
    }

    // Deliver webhook
    if (req.user) {
      deliverWebhook(req.user._id, 'analysis.completed', {
        id: analysis._id,
        verdict: analysis.verdict,
        confidence: analysis.confidence,
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      data: {
        id: analysis._id,
        status: analysis.verdict,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        trusted_sources: analysis.trustedSources,
        nlp_analysis: analysis.nlpAnalysis,
        fact_checks: analysis.factCheckResults,
        summary: aiData.summary,
        processing_time_ms: processingTime,
        analyzed_at: analysis.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Analyze error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Analysis failed. Please try again.' });
  }
};

/**
 * POST /api/scrape
 * Scrape article content from a URL
 */
const scrapeData = async (req, res) => {
  try {
    const { url, headline } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'Provide a "url" to scrape' });
    }

    const scraped = await scrapeUrl(url);
    if (!scraped.success) {
      return res.status(400).json({ success: false, error: scraped.error });
    }

    const article = scraped.data;
    if (headline) article.headline = headline;

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    logger.error(`Scrape error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to scrape article data' });
  }
};

/**
 * POST /api/bulk-analyze
 * Batch analysis (API key only)
 */
const bulkAnalyze = async (req, res) => {
  try {
    const { articles } = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ success: false, error: 'Provide an array of articles' });
    }

    const maxBatch = req.user?.plan === 'enterprise' ? 100 : 10;
    if (articles.length > maxBatch) {
      return res.status(400).json({
        success: false,
        error: `Batch size exceeds limit (max: ${maxBatch})`,
      });
    }

    const jobId = uuidv4();
    const results = [];

    for (const article of articles) {
      try {
        const content = {
          headline: article.headline || '',
          body: article.text || '',
          url: article.url || null,
        };

        if (content.body.length < 20 && !content.url) {
          results.push({ id: article.id, error: 'Content too short' });
          continue;
        }

        const aiResult = await analyzeContent(content);
        if (aiResult.success) {
          const saved = await Analysis.create({
            userId: req.user?._id,
            apiKeyId: req.apiKey?._id,
            inputType: 'api',
            originalContent: content,
            verdict: aiResult.data.verdict,
            confidence: aiResult.data.confidence,
            reasoning: aiResult.data.reasoning || [],
            trustedSources: (aiResult.data.trusted_sources || []).map((s) => ({
              name: s.name,
              url: s.url,
              relevance: s.relevance || 0.5,
            })),
            nlpAnalysis: {
              sentiment: aiResult.data.nlp_analysis?.sentiment || {},
              entities: aiResult.data.nlp_analysis?.entities || [],
              propagandaScore: aiResult.data.nlp_analysis?.propaganda_score || 0,
              clickbaitScore: aiResult.data.nlp_analysis?.clickbait_score || 0,
              biasScore: aiResult.data.nlp_analysis?.bias_score || 0,
              headlineConsistency: aiResult.data.nlp_analysis?.headline_consistency || 100,
            },
            isBulk: true,
            bulkJobId: jobId,
          });

          results.push({
            id: article.id || saved._id,
            report_id: saved._id,
            status: saved.verdict,
            confidence: saved.confidence,
          });
        }
      } catch (itemError) {
        results.push({ id: article.id, error: 'Analysis failed for this item' });
      }
    }

    if (req.user) {
      deliverWebhook(req.user._id, 'bulk.completed', { job_id: jobId, total: results.length }).catch(() => {});
    }

    res.json({
      success: true,
      data: {
        job_id: jobId,
        total: articles.length,
        processed: results.length,
        results,
      },
    });
  } catch (error) {
    logger.error(`Bulk analyze error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Bulk analysis failed' });
  }
};

/**
 * GET /api/report/:id
 */
const getReport = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).populate('userId', 'name email');

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Check ownership (unless admin or api key user)
    if (req.user && req.user.role !== 'admin' && req.authMethod === 'jwt') {
      if (analysis.userId && analysis.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error(`Get report error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve report' });
  }
};

/**
 * GET /api/history
 */
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const verdict = req.query.verdict;

    const query = { userId: req.user._id };
    if (verdict) query.verdict = verdict;

    const [analyses, total] = await Promise.all([
      Analysis.find(query)
        .select('verdict confidence originalContent.headline originalContent.url inputType createdAt processingTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Analysis.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`History error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve history' });
  }
};

/**
 * GET /api/stats
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [verdictStats, recent, totalCount] = await Promise.all([
      Analysis.aggregate([
        { $match: { userId } },
        { $group: { _id: '$verdict', count: { $sum: 1 } } },
      ]),
      Analysis.find({ userId })
        .select('verdict confidence createdAt originalContent.headline')
        .sort({ createdAt: -1 })
        .limit(7),
      Analysis.countDocuments({ userId }),
    ]);

    // Build verdict distribution
    const distribution = { Fake: 0, Misleading: 0, 'Partially True': 0, Verified: 0, Unverifiable: 0 };
    verdictStats.forEach((s) => { distribution[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        total: totalCount,
        distribution,
        recentAnalyses: recent,
      },
    });
  } catch (error) {
    logger.error(`Stats error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve stats' });
  }
};

module.exports = { analyze, scrapeData, bulkAnalyze, getReport, getHistory, getStats };
