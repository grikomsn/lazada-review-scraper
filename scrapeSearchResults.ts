import fs from 'fs'
import csv from 'papaparse'
import path from 'path'
import puppeteer, { DirectNavigationOptions } from 'puppeteer'
import qs from 'querystring'

import { CreateSearchUrlProps, SearchResult } from './types'

const CATEGORIES = ['beli-handphone']

const WORKER_SETTINGS: DirectNavigationOptions = {
  waitUntil: 'networkidle2',
}

////////////////////////////////////////////////////////////////

function createSearchUrl({
  category,
  ajax = true,
  page = 1,
}: CreateSearchUrlProps) {
  const withAjax = ajax ? { ajax: 1 } : {}
  const queries = { ...withAjax, rating: 1, page }
  const query = qs.encode(queries)

  const url = `https://www.lazada.co.id/${category}/?${query}`
  console.log(url)

  return url
}

////////////////////////////////////////////////////////////////

function extractSearchResult() {
  const { mods, mainInfo } = JSON.parse(document.body.innerText)
  const listItems = (mods.listItems as any[]) || []

  const items = listItems.map(item => {
    const extractedItem: SearchResult = {
      itemId: item.itemId,
      name: item.name,
      brandName: item.brandName,
      url: (item.productUrl as string).replace(/^\/\//, 'https://'),
      price: parseFloat(item.price),
      averageRating: parseInt(item.ratingScore),
      totalReviews: parseInt(item.review),
    }

    return extractedItem
  })

  const { totalResults: tr, pageSize: ps } = mainInfo

  const totalResult = parseInt(tr)
  const pageSize = parseInt(ps)

  const totalPage = Math.ceil(totalResult / pageSize)

  return { totalResult, pageSize, totalPage, items }
}

////////////////////////////////////////////////////////////////

function sortSearchResult(a: SearchResult, b: SearchResult) {
  if (a.itemId < b.itemId) {
    return -1
  }
  if (a.itemId > b.itemId) {
    return 1
  }
  return 0
}

////////////////////////////////////////////////////////////////

function datapath(...paths: string[]) {
  return path.join(__dirname, 'data', ...paths)
}

////////////////////////////////////////////////////////////////

async function scrapeSearchResults() {
  let allItems = [] as SearchResult[]

  const browser = await puppeteer.launch()
  const worker = await browser.newPage()

  for (const category of CATEGORIES) {
    await worker.goto(
      createSearchUrl({ category, ajax: false }),
      WORKER_SETTINGS
    )
    await worker.goto(createSearchUrl({ category }), WORKER_SETTINGS)

    const extracted = await worker.evaluate(extractSearchResult)
    const { items: firstItems, totalPage } = extracted
    allItems.push(...firstItems)

    for (let page = 2; page <= totalPage; page++) {
      await worker.goto(createSearchUrl({ category, page }), WORKER_SETTINGS)
      const { items } = await worker.evaluate(extractSearchResult)
      allItems.push(...items)
    }
  }

  await browser.close()

  allItems = allItems.sort(sortSearchResult)
  fs.writeFileSync(datapath('items.csv'), csv.unparse(allItems))
}

////////////////////////////////////////////////////////////////

scrapeSearchResults()
