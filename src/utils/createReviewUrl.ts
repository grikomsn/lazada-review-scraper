import qs from 'querystring'

export default function createReviewUrl({ itemId }: { itemId: string }) {
  const queries = { itemId, pageSize: 999999, pageNo: 1 }
  const query = qs.encode(queries)

  return `https://my.lazada.co.id/pdp/review/getReviewList?${query}`
}
