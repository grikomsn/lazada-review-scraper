import { ExtractReviewMetadataResult, Review } from '../types'

export default function extractReviewMetadata() {
  const lineBreakRegex = /(\r?\n|\r)+/g

  const { model } = JSON.parse(document.body.innerText)

  const reviews = (model.items as any[]).map(item => {
    const reviewTitle = `${item.reviewTitle}`
      .replace(lineBreakRegex, ' ')
      .trim()
    const reviewContent = `${item.reviewContent}`
      .replace(lineBreakRegex, ' ')
      .trim()

    const review: Review = {
      itemId: item.itemId,
      type: item.reviewType,
      name: item.buyerName,
      rating: item.rating,
      originalRating: item.originalRating,
      reviewTitle,
      reviewContent,
      likeCount: item.likeCount,
      upVotes: item.upVotes,
      downVotes: item.downVotes,
      helpful: item.helpful,
      relevanceScore: item.relevanceScore,
      boughtDate: item.boughtDate,
      clientType: item.clientType,
    }
    return review
  })

  const itemId: number = model.item
    ? model.item.itemId
    : reviews.length > 0
    ? reviews[0].itemId
    : null

  return { itemId, reviews } as ExtractReviewMetadataResult
}
