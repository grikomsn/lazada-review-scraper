import puppeteer from 'puppeteer'

import { initialize, saveToData } from './'
import { extractSearchResult } from './extractors'
import { SearchResult } from './types'
import { createSearchUrl } from './utils'

async function scrapeSearchResults() {
  const { config, workerProps, date } = await initialize({ useBrowser: false })

  const browser = await puppeteer.launch()
  const worker = await browser.newPage()

  let allItems: SearchResult[] = []

  for (const category of config.CATEGORIES) {
    let url = createSearchUrl({ category, ajax: false })
    console.log(`Loading cookies... ${url}`)
    await worker.goto(url, workerProps)

    url = createSearchUrl({ category })
    console.log(`(1/???) ${url}`)
    await worker.goto(url, workerProps)

    const extracted = await worker.evaluate(extractSearchResult)
    const { items: firstItems, totalPage } = extracted
    allItems.push(...firstItems)

    for (let page = 2; page <= totalPage; page++) {
      url = createSearchUrl({ category, page })
      console.log(`(${page}/${totalPage}) ${url}`)
      await worker.goto(url, workerProps)

      const { items } = await worker.evaluate(extractSearchResult)
      allItems.push(...items)
    }

    allItems = allItems.sort(({ itemId: a }, { itemId: b }) =>
      a < b ? -1 : a > b ? 1 : 0
    )

    console.log(`Saving '${category}' results...`)
    saveToData(allItems, `${date}-${category}-items.csv`)
  }
  await browser.close()
}

scrapeSearchResults()
