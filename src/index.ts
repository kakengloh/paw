import yargs from 'yargs';
import puppeteer from 'puppeteer';
import { filterUrls } from './utils';
import { Scraper } from './lib/scraper';
import { IOManager } from './lib/io-manager';

const main = async () => {
  const argv = yargs(process.argv.slice(2)).boolean('metadata').parseSync();
  const urls = filterUrls(argv._ as string[]);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const ioManager = new IOManager();
  const scraper = new Scraper(browser, ioManager);

  // Run sites sequentially due to CPU and memory constraint
  for (const url of urls) {
    try {
      await scraper.fetch(url, argv.metadata);
    } catch (err) {
      console.error(`Failed to fetch page from "${url}":`, err);
    }
  }

  await browser.close();
};

main();
