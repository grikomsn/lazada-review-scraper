import puppeteer from 'puppeteer'

import { initialize, saveToData } from './'
import { extractSearchResult } from './extractors'
import loadFromData from './loadFromData'
import { SearchResult } from './types'
import { createSearchUrl } from './utils'

async function scrapeSearchResults() {
  const { config, workerProps, date } = await initialize({ useBrowser: false })
  const { categories } = config

  const browser = await puppeteer.launch()
  const worker = await browser.newPage()

  for (const category of categories) {
    let categoryItems: SearchResult[] = []

    let url = createSearchUrl({ category, ajax: false })
    console.log(`Loading cookies... ${url}`)
    await worker.goto(url, workerProps)

    url = createSearchUrl({ category })
    console.log(`(1/???) ${url}`)
    await worker.goto(url, workerProps)

    const extracted = await worker.evaluate(extractSearchResult)
    const { items: firstItems, totalPage } = extracted
    categoryItems.push(...firstItems)

    for (let page = 2; page <= totalPage; page++) {
      url = createSearchUrl({ category, page })
      console.log(`(${page}/${totalPage}) ${url}`)
      await worker.goto(url, workerProps)

      const { items } = await worker.evaluate(extractSearchResult)
      categoryItems.push(...items)
    }

    categoryItems = categoryItems.sort(({ itemId: a }, { itemId: b }) =>
      a < b ? -1 : a > b ? 1 : 0
    )

    console.log(`Saving '${category}' results...`)
    saveToData(categoryItems, `${date}-${category}-items.csv`)
  }

  await browser.close()

  console.log('Merging all results...')
  const items = categories.reduce(
    (items, category) => {
      const data: SearchResult[] = loadFromData(`${date}-${category}-items.csv`)
      const currentItems = data.map(({ itemId, ...item }) => {
        return { itemId, category, ...item }
      })
      return items.concat(...currentItems)
    },
    [] as SearchResult[]
  )
  saveToData(items, `${date}-items.csv`)
}

scrapeSearchResults()
