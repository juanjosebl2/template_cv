import http from 'http';
import handler from 'serve-handler';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const cvDir = join('c:', 'Users', 'juanjose', 'Desktop', 'CV');
const cvFile = 'CV-HTML.html';
const outputDir = join(__dirname, 'output');
const outputPdf = join(outputDir, 'Juan-Jose-Barrera-Linde.pdf');
const port = 3007;

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

// Static server to serve the CV folder
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: cvDir,
    cleanUrls: false,
    headers: [
      {
        source: '**/*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' }
        ]
      }
    ]
  });
});

async function run() {
  await new Promise((resolve) => server.listen(port, resolve));
  const url = `http://localhost:${port}/${cvFile}`;
  console.log('Serving CV from', url);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    deviceScaleFactor: 2,
    locale: 'es-ES'
  });

  const page = await context.newPage();

  // Go to the page and wait for network idle to ensure fonts/styles are loaded
  await page.goto(url, { waitUntil: 'networkidle' });

  // Prefer print CSS
  await page.emulateMedia({ media: 'print' });

  // Remove the download button before printing (if present)
  await page.evaluate(() => {
    const btn = document.querySelector('.download-btn');
    if (btn) btn.remove();
  });

  // Generate PDF with A4 and small margins to match your CSS @page
  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' }
  });

  await browser.close();
  server.close();

  console.log('PDF generado en:', outputPdf);
}

run().catch((err) => {
  console.error(err);
  server.close();
  process.exit(1);
});
