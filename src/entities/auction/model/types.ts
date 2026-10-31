export type AuctionStatusState =
  'LOADING' | 'NONMEMBER' | 'VIEW_ONLY' | 'ACTIVE' | 'COMPLETED' | 'UNAVAILABLE';

export interface AuctionDetails {
  bidderCount?: number;
  biddingEndsAt?: string;
  memberBidAmount?: number;
  winnerBidAmount?: number;
  priceBidAmount?: number;
}

export interface AuctionConfig {
  host: string;
  productId: string;
  viewOnlyEnabled?: boolean;
  viewOnlyToastHtml?: string;
  auctionNotAvailableHtml?: string;
  unauthorizedHtml?: string;
  notLoggedInHtml?: string;
  bidAcceptedHtml?: string;
  bidNotAcceptedHtml?: string;
  incorrectBidValueHtml?: string;
  bidWithdrawnHtml?: string;
  bidConnectionLostHtml?: string;
  alreadyBidHtml?: string;
  placeAdditionalBidHtml?: string;
  bidNote?: string;
  viewOnlyWindow?: string;
  viewOnlyTitle?: string;
  viewOnlyBody?: string;
}
