const axios = require('axios');
const logger = require('../utils/logger');

const scrapeUrlWithAnakin = async (url) => {
  const apiUrl = process.env.ANAKIN_API_URL;
  const apiKey = process.env.ANAKIN_API_KEY;
  const useBrowser = process.env.ANAKIN_USE_BROWSER !== 'false';
  const outputFormat = process.env.ANAKIN_OUTPUT_FORMAT || 'markdown';

  if (!apiUrl || !apiKey) {
    return {
      success: false,
      error: 'Anakin scraper is not configured. Set ANAKIN_API_URL and ANAKIN_API_KEY.',
    };
  }

  try {
    const createResponse = await axios.post(
      apiUrl,
      {
        url,
        useBrowser,
        format: outputFormat,
      },
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const responseData = createResponse.data || {};
    const jobId = responseData.jobId || responseData.id || responseData.job_id;

    if (!jobId) {
      return {
        success: false,
        error: 'Anakin scraper response did not include a job ID.',
      };
    }

    const statusUrl = `${apiUrl.replace(/\/+$/, '')}/${jobId}`;
    const deadline = Date.now() + 30000;
    let jobResult = null;

    while (Date.now() < deadline) {
      const statusResponse = await axios.get(statusUrl, {
        headers: {
          'X-API-Key': apiKey,
        },
        timeout: 10000,
      });

      const statusData = statusResponse.data || {};
      const status = String(statusData.status || statusData.state || '').toLowerCase();

      if (['completed', 'done', 'success'].includes(status)) {
        jobResult = statusData;
        break;
      }

      if (['failed', 'error'].includes(status)) {
        return {
          success: false,
          error: statusData.error || statusData.message || 'Anakin scraper job failed.',
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!jobResult) {
      return {
        success: false,
        error: 'Anakin scraper job timed out waiting for completion.',
      };
    }

    const rawOutput = jobResult.output || jobResult.result || jobResult.data || jobResult;
    const text = typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput, null, 2);
    const headlineMatch = text.match(/^#\s+(.+)$/m);
    const headline = headlineMatch ? headlineMatch[1].trim() : '';
    const body = headlineMatch ? text.replace(headlineMatch[0], '').trim() : text.trim();

    return {
      success: true,
      data: {
        headline: headline.substring(0, 500),
        body: body.substring(0, 10000),
        author: null,
        publishedAt: null,
        language: 'en',
        url,
      },
    };
  } catch (error) {
    logger.error(`Anakin scraper error for ${url}: ${error.message}`);
    return {
      success: false,
      error: `Anakin scraper request failed: ${error.message}`,
    };
  }
};

module.exports = { scrapeUrlWithAnakin };