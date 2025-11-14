/**
 * Auction Item TypeScript types for frontend application
 */

export enum AuctionType {
  LIVE = 'live',
  SILENT = 'silent',
}

export enum ItemStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD = 'sold',
  WITHDRAWN = 'withdrawn',
}

export interface AuctionItemBase {
  title: string;
  description: string;
  auction_type: AuctionType;
  starting_bid: number;
  donor_value?: number | null;
  cost?: number | null;
  buy_now_price?: number | null;
  buy_now_enabled: boolean;
  quantity_available: number;
  donated_by?: string | null;
  sponsor_id?: string | null;
  item_webpage?: string | null;
  display_priority?: number | null;
}

export interface AuctionItem extends AuctionItemBase {
  id: string;
  event_id: string;
  bid_number: number;
  status: ItemStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuctionItemDetail extends AuctionItem {
  // Media will be added when we implement media management
  // Sponsor will be added when we integrate sponsor display
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuctionItemCreate extends AuctionItemBase { }

export interface AuctionItemUpdate {
  title?: string;
  description?: string;
  auction_type?: AuctionType;
  starting_bid?: number;
  donor_value?: number | null;
  cost?: number | null;
  buy_now_price?: number | null;
  buy_now_enabled?: boolean;
  quantity_available?: number;
  donated_by?: string | null;
  sponsor_id?: string | null;
  item_webpage?: string | null;
  display_priority?: number | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AuctionItemListResponse {
  items: AuctionItem[];
  pagination: PaginationInfo;
}
