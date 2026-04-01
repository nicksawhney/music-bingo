#!/usr/bin/env node

/**
 * BingoBaker automation — creates bingo cards from a newline-separated text file.
 *
 * Usage:
 *   node scripts/bingobaker.js create "Round 1 - Pop Divas" playlists/0401/round1_pop_divas.txt
 *   node scripts/bingobaker.js create "Round 3 - Guilty Pleasures" playlists/0401/round3_guilty_pleasures.txt --pages 10 --per-page 4
 *
 * Options:
 *   --pages N       Number of pages to print (default: 10)
 *   --per-page N    Cards per page: 1, 2, or 4 (default: 4)
 *   --no-title      Don't show bingo title on printed cards
 *   --no-free-space Don't use a free space in the center
 *   --visibility V  public, hidden, or private (default: hidden)
 *   --download      Download PDF instead of opening print dialog
 *
 * Config: reads BingoBaker credentials from ./bingobaker-config.json
 *         { "email": "...", "password": "..." }
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../bingobaker-config.json');

function parseArgs(args) {
  const opts = {
    title: args[0],
    file: args[1],
    pages: 10,
    perPage: 4,
    showTitle: true,
    freeSpace: true,
    visibility: 'hidden',
    download: false,
  };

  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '--pages': opts.pages = parseInt(args[++i]); break;
      case '--per-page': opts.perPage = parseInt(args[++i]); break;
      case '--no-title': opts.showTitle = false; break;
      case '--no-free-space': opts.freeSpace = false; break;
      case '--visibility': opts.visibility = args[++i]; break;
      case '--download': opts.download = true; break;
    }
  }

  return opts;
}

function loadItems(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('BINGO') && !l.startsWith('SPOTIFY'));
}

async function login(page, config) {
  console.log('Logging in to BingoBaker...');
  await page.goto('https://bingobaker.com/account/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="username"]', config.email);
  await page.type('input[type="password"]', config.password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]'),
  ]);

  if (!page.url().includes('/account/home')) {
    throw new Error('Login failed — check your credentials in bingobaker-config.json');
  }
  console.log('Logged in.');
}

async function createCard(page, opts, items) {
  console.log(`\nCreating card: "${opts.title}" with ${items.length} items`);

  // Navigate to card creation form
  await page.goto('https://bingobaker.com', { waitUntil: 'networkidle2' });

  // Set title
  await page.$eval('#name', el => el.value = '');
  await page.type('#name', opts.title);

  // Set grid size to 5x5
  await page.select('#id_size', '5');
  await new Promise(r => setTimeout(r, 500));

  // Set free space
  const freeSpaceChecked = await page.$eval('#id_has_free_space', el => el.checked);
  if (opts.freeSpace && !freeSpaceChecked) {
    await page.click('#id_has_free_space');
  } else if (!opts.freeSpace && freeSpaceChecked) {
    await page.click('#id_has_free_space');
  }

  // Click "Paste in a list of words" to reveal the textarea
  await page.click('#more-link');
  await new Promise(r => setTimeout(r, 300));

  // Paste all items into extra_words (one per line)
  const itemsText = items.join('\n');
  await page.$eval('#id_extra_words', el => el.value = '');
  await page.type('#id_extra_words', itemsText);

  // Set visibility
  const visMap = { public: '#id_visibility_0', hidden: '#id_visibility_1', private: '#id_visibility_2' };
  await page.click(visMap[opts.visibility] || visMap.hidden);

  // Submit
  console.log('Generating card...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
    page.click('#submit'),
  ]);

  const cardUrl = page.url();
  const cardId = cardUrl.split('/').pop();
  console.log(`Card created: ${cardUrl}`);

  return { cardUrl, cardId };
}

async function downloadPdf(browser, page, cardId, opts) {
  console.log(`\nPreparing PDF: ${opts.pages} pages, ${opts.perPage} cards/page, show title: ${opts.showTitle}`);

  // Set up the print form
  await page.$eval('#pages', (el, val) => el.value = val, String(opts.pages));
  await page.select('#per-page', String(opts.perPage));

  // Show title checkbox
  if (opts.showTitle) {
    const checked = await page.$eval('input[name="show_name"]', el => el.checked);
    if (!checked) await page.click('input[name="show_name"]');
  }

  // Get cookies and CSRF info for direct fetch
  const cookies = await page.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  const pdfUrl = `https://bingobaker.com/pdf/${cardId}`;

  // Build form data
  const formData = new URLSearchParams();
  formData.append('pages', String(opts.pages));
  formData.append('grid', String(opts.perPage));
  if (opts.showTitle) formData.append('show_name', '1');
  formData.append('call_sheet', '1');
  formData.append('submit', 'Download');

  // First POST kicks off PDF generation
  console.log('  Starting PDF generation...');
  await fetch(pdfUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieStr,
      'Referer': `https://bingobaker.com/view/${cardId}`,
    },
    body: formData.toString(),
  });

  // Poll with GET until the PDF is ready (the retry page auto-refreshes via GET)
  let pdfBuffer;
  const maxAttempts = 20;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, 4000));

    const response = await fetch(pdfUrl, {
      headers: { 'Cookie': cookieStr },
    });

    const contentType = response.headers.get('content-type') || '';
    const buf = Buffer.from(await response.arrayBuffer());

    if (contentType.includes('pdf') || buf.slice(0, 5).toString() === '%PDF-') {
      pdfBuffer = buf;
      break;
    }

    console.log(`  PDF generating... (attempt ${attempt}/${maxAttempts})`);
  }

  if (!pdfBuffer) {
    throw new Error('PDF generation timed out');
  }
  const safeName = opts.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const pdfPath = path.join(__dirname, '..', 'cards', `${safeName}.pdf`);

  // Ensure cards directory exists
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  fs.writeFileSync(pdfPath, pdfBuffer);

  console.log(`PDF saved: ${pdfPath} (${(pdfBuffer.length / 1024).toFixed(0)} KB)`);
  return pdfPath;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command !== 'create' || args.length < 3) {
    console.log(`BingoBaker Card Generator

Usage:
  node scripts/bingobaker.js create "Title" path/to/items.txt [options]

Options:
  --pages N          Number of pages (default: 10)
  --per-page N       Cards per page: 1, 2, or 4 (default: 4)
  --no-title         Don't show title on cards
  --no-free-space    No free space in center
  --visibility V     public, hidden, or private (default: hidden)
  --download         Download PDF (default: print/download)`);
    process.exit(1);
  }

  const opts = parseArgs(args.slice(1));
  const items = loadItems(opts.file);

  if (items.length < 24) {
    console.error(`Error: Need at least 24 items for a 5x5 card with free space. Got ${items.length}.`);
    process.exit(1);
  }

  console.log(`Items loaded: ${items.length} from ${opts.file}`);

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await login(page, config);
    const { cardUrl, cardId } = await createCard(page, opts, items);
    const pdfPath = await downloadPdf(browser, page, cardId, opts);

    console.log(`\n✓ Done!`);
    console.log(`  Card URL: ${cardUrl}`);
    console.log(`  PDF: ${pdfPath}`);
    console.log(`  ${opts.pages} pages × ${opts.perPage} cards = ${opts.pages * opts.perPage} unique cards`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
