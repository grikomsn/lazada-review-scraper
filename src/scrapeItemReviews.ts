import { Page } from 'puppeteer'

import { initialize, loadFromData, saveToData } from '.'
import { extractReviewMetadata } from './extractors'
import { Review, SearchResult } from './types'
import { createReviewUrl } from './utils'

async function scrapeItemReviews() {
  const { config, browser, workers, workerProps, date } = await initialize()

  const items: SearchResult[] = loadFromData(`${date}-items.csv`)

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
              worker.goto(url, workerProps).then(() => worker)
            )
          }
          return finished
        },
        [] as Promise<Page>[]
      )
    )

    await new Promise(resolve => setTimeout(resolve, config.REQUEST_DELAY))

    const extracted = await Promise.all(
      finishedWorkers.map(worker => worker.evaluate(extractReviewMetadata))
    )

    extracted.forEach(({ itemId, reviews }) => {
      saveToData(reviews, 'reviews', `${date}-${itemId}-reviews.csv`)
    })
  }

  await browser.close()

  const allReviews: Review[] = []

  console.log('Merging all reviews...')
  for (const { itemId } of items) {
    const reviews: Review[] = loadFromData(
      'reviews',
      `${date}-${itemId}-reviews.csv`
    )
    allReviews.push(...reviews)
  }

  saveToData(allReviews, `${date}-reviews.csv`)
}

scrapeItemReviews()
