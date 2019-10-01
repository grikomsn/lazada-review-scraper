<!-- markdownlint-disable MD033 -->

<div align='center'>

# Lazada Review Scraper

🚀 _Scrape product reviews from Lazada based on categories_ 🏄‍

![cat scraping](https://media2.giphy.com/media/lnCggcJbfrY8E/source.gif)

</div>

## Features ✨

- Based on [Amazon Cell Phones Reviews dataset project](https://github.com/grikomsn/amazon-cell-phones-reviews)
- Scrapes basic metadata with ratings and reviews
- Use multiple Puppeteer pages as _workers_
- Configurable timeout for adjusting server rate limits (defaults to 5 seconds)

## Download Data 📫

You can download pre-scraped datasets at the [releases page](./releases) or also at [Kaggle datasets (Lazada Reviews)](https://kaggle.com/grikomsn/lazada-reviews).

## Manual Scrape 🔧

### Requirements 📃

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/lang/en/) (optional)

### Packages Used 📦

- [`puppeteer`](https://pptr.dev/) for browser-based scraping
- [`prettier`](https://prettier.io/) for formatting source codes
- [`ts-node`](https://github.com/TypeStrong/ts-node) for running TypeScript scripts

### Steps 👨‍🔬

#### Preparation

- Make sure the dependencies are downloaded by running `npm install` or `yarn`.
- (Optional) Copy `config.default.ts` (this file is ignored with git) to `config.ts` and customize config variables on `config.ts`.

#### Using Visual Studio Code

- Open the project directory in Visual Studio Code.
- Select and execute **Scrape Search Results** in the launch options on the Debug tab (exported to `./data/yyyymmdd-results.csv`).
- Then select and execute **Scrape Item Reviews** (exported to `./data/yyyymmdd-reviews.csv`).

#### Using Command Line

- Run `npm run scrape:items` or `yarn scrape:items` first to scrape initial item results (exported to `./data/yyyymmdd-results.csv`).
- Then run `npm run scrape:reviews` or `yarn scrape:reviews` to scrape item reviews (exported to `./data/yyyymmdd-reviews.csv`).

## Available Scripts 📝

- `scrape:items`

  Scrapes and saves entry results for review scraping.

- `scrape:reviews`

  Scrapes and saves entry reviews based on `scrape:items` data.

- `format`

  Format all `.ts` files.

- `format:data`

  Format `.json` files in `/data`.

## License 👮‍♂️

[CC0 1.0 Universal](./LICENSE)
