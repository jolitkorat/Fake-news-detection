const logger = require('../utils/logger');

// Trusted news domains
const TRUSTED_DOMAINS = [
  'bbc.com',
  'reuters.com',
  'apnews.com',
  'nasa.gov',
  'who.int',
  'theguardian.com',
  'nytimes.com',
  'wsj.com',
  'ft.com',
  'economist.com',
  'bbc.co.uk',
  'bbc.co.jp',
  'aljazeera.com',
];

// Sensational keywords that indicate fake news
const SENSATIONAL_KEYWORDS = [
  'shocking',
  'explosive',
  'secret',
  "they don't want",
  'breaking',
  'urgent',
  'must read',
  "you won't believe",
  'cover-up',
  'hidden truth',
  'exclusive',
  'scientists banned',
  'massive conspiracy',
  'miracle cure',
  'world leaders are lying',
  'government cover-up',
  'big pharma',
  'alien',
  'mind-blowing',
  'absolutely stunning',
  'unbelievable',
  'this will shock you',
  "they don't want you to know",
];

// Propaganda and conspiracy language
const PROPAGANDA_KEYWORDS = [
  'hoax',
  'conspiracy',
  'deep state',
  'illuminati',
  'reptilians',
  'shadow government',
  'new world order',
  'false flag',
  'crisis actors',
  'globalist',
  'awakening',
  'red pill',
  'sheeple',
  'wake up',
  'do your own research',
  'mainstream media lies',
  'controlled opposition',
];

// Misinformation indicators
const MISINFORMATION_KEYWORDS = [
  'fake news',
  'fabricated',
  'made up',
  'never happened',
  'no evidence',
  'debunked',
  'rumor',
  'unverified',
  'unconfirmed',
];

// Credibility keywords
const CREDIBLE_KEYWORDS = [
  'according to',
  'researchers',
  'study',
  'official',
  'confirmed',
  'report',
  'data',
  'evidence',
  'peer-reviewed',
  'published',
  'journal',
  'scientists',
  'medical experts',
  'investigation',
  'verified',
  'fact-checked',
];

/**
 * Check if text contains any keywords from a list
 * @param {string} text - The text to check
 * @param {Array<string>} keywords - The keywords to search for
 * @returns {Object} - { found: boolean, count: number, matches: [] }
 */
const findKeywords = (text, keywords) => {
  const lowerText = text.toLowerCase();
  const matches = [];
  let count = 0;

  keywords.forEach(keyword => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    const matches_found = lowerText.match(regex);
    if (matches_found) {
      count += matches_found.length;
      matches.push(keyword);
    }
  });

  return {
    found: count > 0,
    count,
    matches,
  };
};

/**
 * Analyze text for fake news indicators
 * @param {string} text - The text to analyze
 * @param {string} headline - The headline (optional)
 * @returns {Object} - Analysis scores and indicators
 */
const analyzeTextContent = (text, headline = '') => {
  const combinedText = `${headline} ${text}`;

  const sensational = findKeywords(combinedText, SENSATIONAL_KEYWORDS);
  const propaganda = findKeywords(combinedText, PROPAGANDA_KEYWORDS);
  const misinformation = findKeywords(combinedText, MISINFORMATION_KEYWORDS);
  const credible = findKeywords(combinedText, CREDIBLE_KEYWORDS);

  // Calculate scores (0-100)
  let fakeScore = 0;
  let credibilityScore = 50; // Start neutral

  // Sensational language increases fake score
  fakeScore += Math.min(sensational.count * 8, 30);

  // Propaganda language significantly increases fake score
  fakeScore += Math.min(propaganda.count * 15, 40);

  // Misinformation language significantly increases fake score
  fakeScore += Math.min(misinformation.count * 12, 35);

  // Credible language decreases fake score
  credibilityScore += Math.min(credible.count * 5, 30);

  // Additional indicators
  const hasAllCaps = /\b[A-Z]{4,}\b/.test(headline);
  const hasMultipleExclamation = /!!!/.test(combinedText);
  const hasQuestionHeadline = /\?/.test(headline) && !credible.found;
  const urlMentioned = /https?:\/\//.test(combinedText);

  if (hasAllCaps) fakeScore += 10;
  if (hasMultipleExclamation) fakeScore += 10;
  if (hasQuestionHeadline) fakeScore += 8;
  if (!urlMentioned && !credible.found) fakeScore += 5;

  fakeScore = Math.min(fakeScore, 100);
  credibilityScore = Math.max(Math.min(credibilityScore, 100), 0);

  return {
    fakeScore,
    credibilityScore,
    sensational,
    propaganda,
    misinformation,
    credible,
    indicators: {
      hasAllCaps,
      hasMultipleExclamation,
      hasQuestionHeadline,
      urlMentioned,
    },
  };
};

/**
 * Analyze sources for credibility
 * @param {Array<Object>} sources - Array of sources with url and title
 * @returns {Object} - Source analysis
 */
const analyzeSourceCredibility = (sources = []) => {
  if (!Array.isArray(sources) || sources.length === 0) {
    return {
      trustedSourceCount: 0,
      untrustedSourceCount: 0,
      sources: [],
      averageCredibility: 0,
    };
  }

  const analyzed = sources.map(source => {
    const url = source.url || '';
    const domain = extractDomain(url);
    const isTrusted = TRUSTED_DOMAINS.some(td => domain.includes(td));

    return {
      url,
      domain,
      title: source.title || 'Unknown',
      isTrusted,
      credibilityScore: isTrusted ? 85 : 40,
    };
  });

  const trustedSourceCount = analyzed.filter(s => s.isTrusted).length;
  const averageCredibility = analyzed.reduce((sum, s) => sum + s.credibilityScore, 0) / analyzed.length;

  return {
    trustedSourceCount,
    untrustedSourceCount: analyzed.length - trustedSourceCount,
    sources: analyzed,
    averageCredibility: Math.round(averageCredibility),
  };
};

/**
 * Extract domain from URL
 * @param {string} url - The URL
 * @returns {string} - The domain
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
 * Generate reasoning for the verdict
 * @param {Object} analysis - Text content analysis
 * @param {Object} sourceAnalysis - Source credibility analysis
 * @param {string} verdict - The verdict
 * @returns {Array<string>} - Array of reasoning strings
 */
const generateReasoning = (analysis, sourceAnalysis, verdict) => {
  const reasoning = [];

  if (analysis.sensational.found) {
    reasoning.push(`Detected ${analysis.sensational.count} sensational keywords: ${analysis.sensational.matches.slice(0, 3).join(', ')}.`);
  }

  if (analysis.propaganda.found) {
    reasoning.push(`Found propaganda language patterns: ${analysis.propaganda.matches.slice(0, 2).join(', ')}.`);
  }

  if (analysis.misinformation.found) {
    reasoning.push(`Detected misinformation indicators: ${analysis.misinformation.matches.slice(0, 2).join(', ')}.`);
  }

  if (sourceAnalysis.trustedSourceCount > 0) {
    reasoning.push(`${sourceAnalysis.trustedSourceCount} trusted source(s) referenced in search results.`);
  } else {
    reasoning.push('No trusted news sources found in search results.');
  }

  if (analysis.credible.found) {
    reasoning.push(`Contains credible reporting language: ${analysis.credible.matches.slice(0, 2).join(', ')}.`);
  } else {
    reasoning.push('Lacks citations from authoritative sources.');
  }

  if (analysis.indicators.hasAllCaps) {
    reasoning.push('Headline contains excessive capitalization, typical of sensationalized content.');
  }

  if (analysis.indicators.hasQuestionHeadline) {
    reasoning.push('Uses manipulative question headline without supporting evidence.');
  }

  return reasoning.length > 0 ? reasoning : ['Content analysis completed.'];
};

/**
 * Determine verdict based on fake score
 * @param {number} fakeScore - The fake score (0-100)
 * @param {Object} sourceAnalysis - Source credibility analysis
 * @returns {Object} - { verdict, confidence }
 */
const determineVerdict = (fakeScore, sourceAnalysis) => {
  let verdict, confidence;

  if (fakeScore >= 75) {
    verdict = 'Fake';
    confidence = Math.min(95, 70 + (fakeScore - 75) * 2);
  } else if (fakeScore >= 55) {
    verdict = 'Misleading';
    confidence = Math.min(90, 60 + (fakeScore - 55) * 1.5);
  } else if (fakeScore >= 35) {
    verdict = 'Partially True';
    confidence = Math.min(85, 55 + (fakeScore - 35) * 0.75);
  } else if (sourceAnalysis.trustedSourceCount >= 2) {
    verdict = 'Verified';
    confidence = Math.min(92, 65 + sourceAnalysis.trustedSourceCount * 10);
  } else {
    verdict = 'Unverifiable';
    confidence = 45;
  }

  return {
    verdict,
    confidence: Math.round(confidence),
  };
};

/**
 * Main function to analyze news for fake news indicators
 * @param {string} newsText - The news text to analyze
 * @param {string} headline - The headline (optional)
 * @param {Array<Object>} sources - Search results from Anakin (optional)
 * @returns {Object} - Complete analysis result
 */
const analyzeFakeNews = (newsText, headline = '', sources = []) => {
  try {
    // Validate input
    if (!newsText || typeof newsText !== 'string' || newsText.trim().length < 20) {
      return {
        success: false,
        error: 'News text must be at least 20 characters long',
      };
    }

    // Analyze text content
    const textAnalysis = analyzeTextContent(newsText, headline);

    // Analyze source credibility
    const sourceAnalysis = analyzeSourceCredibility(sources);

    // Combine scores
    const combinedFakeScore = Math.round((textAnalysis.fakeScore * 0.6) + ((100 - sourceAnalysis.averageCredibility) * 0.4));

    // Determine verdict
    const { verdict, confidence } = determineVerdict(combinedFakeScore, sourceAnalysis);

    // Generate reasoning
    const reasoning = generateReasoning(textAnalysis, sourceAnalysis, verdict);

    return {
      success: true,
      data: {
        verdict,
        confidence,
        reasoning,
        scores: {
          fakeScore: textAnalysis.fakeScore,
          credibilityScore: textAnalysis.credibilityScore,
          combinedScore: combinedFakeScore,
          sourceCredibilityScore: sourceAnalysis.averageCredibility,
        },
        indicators: {
          sensational: textAnalysis.sensational,
          propaganda: textAnalysis.propaganda,
          misinformation: textAnalysis.misinformation,
          credible: textAnalysis.credible,
          contentIndicators: textAnalysis.indicators,
        },
        sourceAnalysis: {
          trustedSourceCount: sourceAnalysis.trustedSourceCount,
          untrustedSourceCount: sourceAnalysis.untrustedSourceCount,
          sources: sourceAnalysis.sources,
        },
      },
    };
  } catch (error) {
    logger.error(`Fake news analysis error: ${error.message}`);
    return {
      success: false,
      error: `Analysis failed: ${error.message}`,
    };
  }
};

module.exports = {
  analyzeFakeNews,
  analyzeTextContent,
  analyzeSourceCredibility,
  findKeywords,
  determineVerdict,
  generateReasoning,
  TRUSTED_DOMAINS,
  SENSATIONAL_KEYWORDS,
  PROPAGANDA_KEYWORDS,
};
