import path from 'path';
import { Browser, Page } from 'puppeteer';
import { IOManager } from './io-manager';

export class Scraper {
  constructor(
    private readonly browser: Browser,
    private readonly ioManager: IOManager,
  ) {}

  async fetchAll(urls: string[], metadata = false) {
    return urls.map((url) => this.fetch(url, metadata));
  }

  async fetch(url: string, metadata = false) {
    const { origin, host } = new URL(url);

    const page = await this.browser.newPage();

    try {
      const assets = new Set<string>();

      // Record every request
      page.on('requestfinished', (e) => {
        const url = e.url();
        if (url.startsWith(origin)) {
          assets.add(url);
        }
      });

      // Wait until the network requests are finished
      await page.goto(url, { waitUntil: 'networkidle2' });

      const html = await page.content();

      await this.ioManager.saveFile(
        path.join(process.cwd(), host, 'index.html'),
        html,
      );

      if (metadata) {
        await this.processMetadata(page);
      }

      // Get all image elements `srcset` and `src`
      const images = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img[srcset]')).reduce(
          (acc: string[], curr) => {
            const srcs = new Set<string>();

            const src = curr.getAttribute('src');
            if (src) {
              srcs.add(origin + src);
            }

            const srcset = curr.getAttribute('srcset');
            if (srcset) {
              srcset
                .split('\n')
                .flatMap((src) => origin + src.split(' ')[0])
                .forEach((src) => srcs.add(src));
            }

            return [...acc, ...srcs];
          },
          [],
        ),
      );

      images.forEach((image) => assets.add(image));

      // Download all the assets in parallel
      await Promise.allSettled(
        Array.from(assets)
          .filter((url) => {
            // Ignore root (index.html)
            if (new URL(url).pathname === '/') {
              return false;
            }
            // Only local assets
            return url.startsWith(origin);
          })
          .map((url) =>
            this.ioManager.downloadFile(
              url,
              path.join(process.cwd(), host, new URL(url).pathname),
            ),
          ),
      );
    } catch (err) {
      console.error(`Failed to fetch page from "${url}":`, err);
    } finally {
      await page.close();
    }
  }

  private async processMetadata(page: Page) {
    const [site, numLinks, images] = await Promise.all([
      page.evaluate(() => document.location.host),
      page.evaluate(() => document.querySelectorAll('a').length),
      page.evaluate(() => document.querySelectorAll('img').length),
    ]);

    const lastFetch = new Date().toUTCString();

    console.info({
      site,
      numLinks,
      images,
      lastFetch,
    });
  }
}
