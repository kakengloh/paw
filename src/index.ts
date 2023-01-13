import yargs from 'yargs';
import puppeteer from 'puppeteer';
import { filterUrls } from './utils';
import { Scraper } from './lib/srcaper';
import { IOManager } from './lib/io-manager';

const main = async () => {
  const argv = yargs(process.argv.slice(2)).boolean('metadata').parseSync();
  const urls = filterUrls(argv._ as string[]);

  const browser = await puppeteer.launch();
  const ioManager = new IOManager();
  const scraper = new Scraper(browser, ioManager);

  try {
    await scraper.fetchAll(urls, argv.metadata);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
};

main();
