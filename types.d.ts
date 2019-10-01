export interface CreateSearchUrlProps {
  category: string
  ajax?: boolean
  page?: number
}

export interface SearchResult {
  itemId: string
  name: string
  brandName: string
  url: string
  price: number
  averageRating: number
  totalReviews: number
}

export interface ReviewMetadataScores {
  5: number
  4: number
  3: number
  2: number
  1: number
}

export interface ReviewMetadata {
  itemId: number
  totalItems: number
  average: number
  rateCount: number
  reviewCount: number
  scores: ReviewMetadataScores
}

export interface Review {
  itemId: number
  type: string
  name: string
  rating: number
  originalRating: number
  reviewTitle: string
  reviewContent: string
  upVotes: number
  downVotes: number
  helpful: boolean
  relevanceScore: number
  boughtDate: string
  clientType: string
  os: string
  source: string
  terminal: string
  network: string
}
