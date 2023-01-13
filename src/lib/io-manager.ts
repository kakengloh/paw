import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import got from 'got';
import { pipeline } from 'stream/promises';

export class IOManager {
  async downloadFile(url: string, destination: string) {
    const dir = destination.split('/').slice(0, -1).join('/');

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Pipe remote asset to file
    return pipeline(got.stream(url), createWriteStream(destination));
  }

  async saveFile(destination: string, content: string) {
    const dir = destination.split('/').slice(0, -1).join('/');

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    return writeFile(destination, content);
  }
}
