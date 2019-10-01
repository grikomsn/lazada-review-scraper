import fs from 'fs'
import csv, { ParseConfig } from 'papaparse'
import path from 'path'
import puppeteer, { DirectNavigationOptions, Page } from 'puppeteer'
import qs from 'querystring'

import { Review, SearchResult } from './types'

const NUMBER_OF_WORKERS = 5
const REQUEST_DELAY = 7000

const CSV_CONFIGS: ParseConfig = {
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true,
}

const WORKER_SETTINGS: DirectNavigationOptions = {
  waitUntil: 'networkidle2',
}

////////////////////////////////////////////////////////////////

function createReviewUrl({ itemId }: { itemId: string }) {
  const queries = { itemId, pageSize: 123456, pageNo: 1 }
  const query = qs.encode(queries)

  return `https://my.lazada.co.id/pdp/review/getReviewList?${query}`
}

////////////////////////////////////////////////////////////////

function extractReviewMetadata() {
  const lineBreakRegex = /(\r?\n|\r)+/g

  const { model } = JSON.parse(document.body.innerText)

  const reviews = (model.items as any[]).map(item => {
    const reviewTitle = `${item.reviewTitle}`
      .replace(lineBreakRegex, ' ')
      .trim()
    const reviewContent = `${item.reviewContent}`
      .replace(lineBreakRegex, ' ')
      .trim()

    const review: Review = {
      itemId: item.itemId,
      type: item.reviewType,
      name: item.buyerName,
      rating: item.rating,
      originalRating: item.originalRating,
      reviewTitle,
      reviewContent,
      likeCount: item.likeCount,
      upVotes: item.upVotes,
      downVotes: item.downVotes,
      helpful: item.helpful,
      relevanceScore: item.relevanceScore,
      boughtDate: item.boughtDate,
      clientType: item.clientType,
      ...item.submitInfo,
    }
    return review
  })

  const itemId = model.item
    ? model.item.itemId
    : reviews.length > 0
    ? reviews[0].itemId
    : null

  return { itemId, reviews }
}

////////////////////////////////////////////////////////////////

function datapath(...paths: string[]) {
  return path.join(__dirname, 'data', ...paths)
}

////////////////////////////////////////////////////////////////

interface SaveExtractedProps {
  itemId: number
  reviews: Review[]
}

function saveExtracted({ itemId, reviews }: SaveExtractedProps) {
  fs.writeFileSync(
    datapath('reviews', `${itemId}-reviews.csv`),
    csv.unparse(reviews)
  )
}

////////////////////////////////////////////////////////////////

async function scrapeItemReviews() {
  const { data } = csv.parse(
    fs.readFileSync(datapath('items.csv'), 'utf8'),
    CSV_CONFIGS
  )

  const items = data as SearchResult[]

  const browser = await puppeteer.launch({ headless: false })
  const workers = await Promise.all(
    Array(NUMBER_OF_WORKERS)
      .fill(undefined)
      .map(() => browser.newPage())
  )

  let index = 0
  while (index < items.length) {
    const finishedWorkers = await Promise.all(
      workers.reduce(
        (finished, worker) => {
          if (index < items.length) {
            const { itemId } = items[index++]
            const url = createReviewUrl({ itemId })

            console.log(`(${index}/${items.length}) ${url}`)
            return finished.concat(
              worker.goto(url, WORKER_SETTINGS).then(() => worker)
            )
          }
          return finished
        },
        [] as Promise<Page>[]
      )
    )

    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY))

    const extracted = await Promise.all(
      finishedWorkers.map(worker => worker.evaluate(extractReviewMetadata))
    )

    extracted.forEach(saveExtracted)
  }

  await browser.close()

  const reviews = [] as Review[]

  console.log('Merging all metadatas and reviews...')
  for (const { itemId } of items) {
    const { data } = csv.parse(
      fs.readFileSync(datapath('reviews', `${itemId}-reviews.csv`), 'utf8'),
      CSV_CONFIGS
    )
    reviews.push(...data)
  }

  fs.writeFileSync(datapath('reviews.csv'), csv.unparse(reviews))
}

scrapeItemReviews()
