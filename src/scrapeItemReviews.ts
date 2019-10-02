import { Page } from 'puppeteer'

import { initialize, loadFromData, saveToData } from '.'
import { extractReviewMetadata } from './extractors'
import { ExtractReviewMetadataResult, Review, SearchResult } from './types'
import { createReviewUrl, sleep } from './utils'

async function scrapeItemReviews() {
  const { config, browser, workers, workerProps, date } = await initialize()
  const { categories, requestDelay } = config

  for (const category of categories) {
    const items: SearchResult[] = loadFromData(`${date}-${category}-items.csv`)

    let index = 0
    while (index < items.length) {
      const finishedWorkers = await Promise.all(
        workers.reduce(
          (finished, worker, i) => {
            if (index < items.length) {
              const { itemId } = items[index++]
              const url = createReviewUrl({ itemId })

              console.log(
                `(${index}/${items.length}) (worker #${i + 1}) ${url}`
              )
              return finished.concat(
                worker.goto(url, workerProps).then(() => worker)
              )
            }
            return finished
          },
          [] as Promise<Page>[]
        )
      )

      await sleep(requestDelay)

      type EvaluateType = Promise<ExtractReviewMetadataResult>
      const extracted = await Promise.all(
        finishedWorkers.map(async function evaluate(worker, i): EvaluateType {
          try {
            return worker.evaluate(extractReviewMetadata)
          } catch (e) {
            console.warn(
              `Extraction failed on worker #${i + 1}, reloading page...`
            )

            await worker.reload(workerProps)
            await sleep(requestDelay)
            return evaluate(worker, i)
          }
        })
      )

      extracted.forEach(({ itemId, reviews }) => {
        saveToData(reviews, 'reviews', `${date}-${itemId}-reviews.csv`)
      })
    }

    const allReviews: Review[] = []

    console.log(`Merging '${category}' reviews...`)
    for (const { itemId } of items) {
      const reviews: Review[] = loadFromData(
        'reviews',
        `${date}-${itemId}-reviews.csv`
      )
      allReviews.push(...reviews)
    }

    saveToData(allReviews, `${date}-${category}-reviews.csv`)
  }

  await browser.close()

  console.log('Merging all reviews...')
  const reviews = categories.reduce(
    (reviews, category) => {
      const data: Review[] = loadFromData(`${date}-${category}-reviews.csv`)
      const currentReviews = data.map(({ itemId, ...review }) => {
        return { itemId, category, ...review }
      })
      return reviews.concat(...currentReviews)
    },
    [] as Review[]
  )
  saveToData(reviews, `${date}-reviews.csv`)
}

scrapeItemReviews()
