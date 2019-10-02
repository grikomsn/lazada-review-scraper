export interface CreateSearchUrlProps {
  category: string
  ajax?: boolean
  page?: number
}

export interface SearchResult {
  itemId: string
  category?: string
  name: string
  brandName: string
  url: string
  price: number
  averageRating: number
  totalReviews: number
}

export interface Review {
  itemId: string
  category?: string
  type: string
  name: string
  rating: number
  originalRating: number
  reviewTitle: string
  reviewContent: string
  likeCount: number
  upVotes: number
  downVotes: number
  helpful: boolean
  relevanceScore: number
  boughtDate: string
  clientType: string
}

export interface ExtractReviewMetadataResult {
  itemId: number
  reviews: Review[]
}
