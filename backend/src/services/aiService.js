const OpenAI = require('openai');
const logger = require('../utils/logger');

let openaiClient = null;

const getClient = () => {
  if (!openaiClient) {
    const config = {
      apiKey: process.env.OPENAI_API_KEY,
    };

    if (process.env.OPENAI_BASE_URL && process.env.OPENAI_BASE_URL.trim()) {
      config.apiBase = process.env.OPENAI_BASE_URL.trim();
    }

    openaiClient = new OpenAI(config);
  }
  return openaiClient;
};

/**
 * Main AI analysis function
 * @param {Object} content - { headline, body, url }
 * @returns {Object} - Analysis result
 */
const analyzeContent = async (content) => {
  const client = getClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  const systemPrompt = `You are TruthLens AI, an advanced fake news detection system. 
Your role is to analyze news content and determine its authenticity with high accuracy.
You must analyze:
1. Factual accuracy of claims
2. Source credibility signals
3. Headline vs content consistency
4. Propaganda and manipulation patterns
5. Emotional language and bias indicators
6. Logical coherence
7. Missing context or selective reporting

If the content is sensational and lacks credible evidence, classify it as Fake rather than Misleading.
Use Fake when the article is clearly fabricated, conspiratorial, or lacks authoritative sourcing.
Use Misleading only when the piece contains some truthful information mixed with false or distorted claims.
Always respond with a valid JSON object in the exact format specified.`;

  const userPrompt = `Analyze this news content for authenticity:

${content.headline ? `HEADLINE: ${content.headline}\n` : ''}
${content.url ? `SOURCE URL: ${content.url}\n` : ''}
CONTENT:
${content.body}

Provide your analysis as a JSON object with these exact fields:
{
  "verdict": "Fake" | "Misleading" | "Partially True" | "Verified" | "Unverifiable",
  "confidence": <number 0-100>,
  "reasoning": [<array of 3-6 specific reasoning strings>],
  "trusted_sources": [{"name": <string>, "url": <string>, "relevance": <number 0-1>}],
  "nlp_analysis": {
    "sentiment": {"label": "positive"|"negative"|"neutral", "score": <-1 to 1>},
    "entities": [{"text": <string>, "type": "PERSON"|"ORG"|"LOCATION"|"DATE"|"OTHER", "salience": <0-1>}],
    "propaganda_score": <0-100>,
    "clickbait_score": <0-100>,
    "bias_score": <0-100>,
    "headline_consistency": <0-100>
  },
  "summary": "<one paragraph summary of findings>"
}

Be precise and objective. Use clear evidence-based reasoning, and default to Fake when the text is highly sensational and unsupported.`;

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      success: true,
      data: result,
      tokens: response.usage,
    };
  } catch (error) {
    logger.error(`OpenAI analysis error: ${error.message}`);
    logger.warn('Falling back to demo mode analysis');
    return getMockAnalysis(content);
  }
};

/**
 * Mock analysis for demo mode (when no API key is configured)
 */
const getMockAnalysis = (content) => {
  const bodyText = `${content.headline || ''} ${content.body || ''}`;
  const hasAlarmingWords = /shocking|explosive|secret|they don'?t want|breaking|urgent|must read|you won'?t believe|cover-up|hidden truth|exclusive|scientists banned|massive conspiracy|miracle cure|world leaders are lying|government cover-up|big pharma|alien|mind-blowing/i.test(bodyText);
  const hasFakePhrases = /fake news|hoax|conspiracy|scam|fabricated|made up|lies?|never happened|no evidence|totally false|debunked|rumor|rumours|clickbait/i.test(bodyText);
  const hasCredibleWords = /according to|researchers|study|official|confirmed|report|data|evidence|peer-reviewed|published|source says|investigation|journal|scientists|medical experts/i.test(bodyText);
  const hasAllCaps = /\b[A-Z]{4,}\b/.test(content.headline || '') || /!!!/.test(bodyText);
  const hasQuestionHeadline = /\?/.test(content.headline || '');

  let verdict = 'Unverifiable';
  let confidence = 45;
  const reasoning = [];

  if (hasFakePhrases || (hasAlarmingWords && !hasCredibleWords) || (hasAllCaps && !hasCredibleWords) || (hasQuestionHeadline && !hasCredibleWords)) {
    verdict = 'Fake';
    confidence = hasFakePhrases ? 88 : 80;
    reasoning.push('The content contains fabricated or conspiratorial language inconsistent with reliable reporting.');
  }

  if (verdict === 'Unverifiable' && hasAlarmingWords && hasCredibleWords) {
    verdict = 'Partially True';
    confidence = 58;
    reasoning.push('The article mixes sensational claims with some credible terminology, indicating partial truth.');
  }

  if (verdict === 'Unverifiable' && hasCredibleWords && !hasAlarmingWords) {
    verdict = 'Verified';
    confidence = 72;
    reasoning.push('The content includes evidence-based language and credible source indicators.');
  }

  if (verdict === 'Unverifiable' && !hasCredibleWords && !hasAlarmingWords) {
    verdict = 'Unverifiable';
    confidence = 45;
    reasoning.push('The content does not provide enough evidence to verify its claims.');
  }

  if (!reasoning.length) {
    reasoning.push('The content requires more concrete evidence for an accurate classification.');
  }

  reasoning.push(hasAlarmingWords ? 'Detected sensational and emotionally charged language patterns.' : 'Language appears restrained and informational.');
  reasoning.push(hasCredibleWords ? 'Detected references to studies, officials, or research.' : 'No clear authoritative sources were referenced.');

  return {
    success: true,
    data: {
      verdict,
      confidence,
      reasoning,
      trusted_sources: [
        { name: 'Reuters Fact Check', url: 'https://www.reuters.com/fact-check', relevance: 0.8 },
        { name: 'Snopes', url: 'https://www.snopes.com', relevance: 0.7 },
        { name: 'FactCheck.org', url: 'https://www.factcheck.org', relevance: 0.75 },
      ],
      nlp_analysis: {
        sentiment: {
          label: hasAlarmingWords ? 'negative' : 'neutral',
          score: hasAlarmingWords ? -0.6 : 0.15,
        },
        entities: extractSimpleEntities(bodyText),
        propaganda_score: hasFakePhrases ? 82 : hasAlarmingWords ? 65 : 12,
        clickbait_score: hasAllCaps || hasAlarmingWords ? 75 : 18,
        bias_score: hasFakePhrases ? 72 : hasAlarmingWords ? 56 : 25,
        headline_consistency: content.headline ? (hasAllCaps ? 60 : 85) : 100,
      },
      summary: `Content analysis completed in demo mode. ${verdict === 'Fake' ? 'The article appears to be fabricated or heavily sensationalized.' : verdict === 'Partially True' ? 'The article contains some truthful information but also misleading or exaggerated claims.' : verdict === 'Verified' ? 'The article shows credible signals and is likely trustworthy.' : 'The content cannot be conclusively verified with the available information.'} Configure an OpenAI API key for comprehensive AI-powered analysis.`,
    },
    tokens: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  };
};

const extractSimpleEntities = (text) => {
  const entities = [];
  // Very basic entity extraction for demo
  const words = text.split(/\s+/);
  const capitalizedWords = words.filter(w => /^[A-Z][a-z]{2,}/.test(w));
  const seen = new Set();
  capitalizedWords.slice(0, 5).forEach(word => {
    if (!seen.has(word)) {
      seen.add(word);
      entities.push({ text: word, type: 'OTHER', salience: 0.3 });
    }
  });
  return entities;
};

module.exports = { analyzeContent };
