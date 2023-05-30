const puppeteer = require('puppeteer');

async function pdfBuild(html, cssStyles) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Inject the CSS styles into the page
  const styleTag = `<style>${cssStyles}</style>`;
  const modifiedHTML = `${styleTag}${html}`;

  await page.setContent(modifiedHTML, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { pdfBuild };
