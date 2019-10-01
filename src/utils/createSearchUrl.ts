import qs from 'querystring'

import { CreateSearchUrlProps } from '../types'

export default function createSearchUrl({
  category,
  ajax = true,
  page = 1,
}: CreateSearchUrlProps) {
  const withAjax = ajax ? { ajax: 1 } : {}
  const queries = { ...withAjax, rating: 1, page }
  const query = qs.encode(queries)

  return `https://www.lazada.co.id/${category}/?${query}`
}
