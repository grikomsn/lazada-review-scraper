import { SearchResult } from '../types'

export default function extractSearchResult() {
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
