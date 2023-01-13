# TS Scraper

## Quickstart

1. Build Docker Image
```bash
docker build -t ts-scraper .
```

2. Run Docker Container
```bash
docker run -it -p 3000:3000 ts-scraper
```

## Examples
### Amazon
1. Fetch web page along with static assets
```bash
fetch --metadata https://amazon.com
```
> All the files will be stored under an `amazon.com` directory

2. Serving `amazon.com` offline
```bash
serve ./amazon.com
```
> The site will be served under port **3000**. Visit http://localhost:3000 on your **host machine** to visit the site.
