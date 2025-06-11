const { chromium } = require('playwright');
const cheerio = require('cheerio');

const gsearch = async (query) => {
  const baseUrl = `https://cse.google.com/cse?cx=2584804e33cd94425#gsc.tab=0&gsc.q=${encodeURIComponent(query)}`;
  const maxPages = 1;
  let allResults = [];

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    for (let pageNum = 0; pageNum < maxPages; pageNum++) {
      const start = pageNum * 10;
      const url = `${baseUrl}&start=${start}`;
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

      const htmlContent = await page.content();
      const $ = cheerio.load(htmlContent);

      if (htmlContent.includes('g-recaptcha') || htmlContent.includes('id="captcha-form"')) {
        await page.close();
        continue;
      }

      const results = [];
      $('div.gsc-webResult.gsc-result').each((index, element) => {
        const title = $(element).find('a.gs-title').text().trim() || 'No title';
        const url = $(element).find('a.gs-title').attr('href') || 'No URL';
        const description = $(element).find('div.gs-snippet').text().trim() || 'No description';
        results.push({ title, url, description });
      });

      allResults = allResults.concat(results);
      await page.close();
    }

    return {
      query,
      timestamp: new Date().toISOString(),
      totalResults: allResults.length,
      results: allResults
    };

  } catch (error) {
    return {
      query,
      timestamp: new Date().toISOString(),
      totalResults: 0,
      results: [],
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = { gsearch };