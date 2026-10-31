import PartySocket from 'partysocket';

export interface CreatePartySocketOptions {
  host: string;
  room: string;
  queryResolver: () => Promise<Record<string, string | undefined>>;
}

/**
 * Factory for creating configured PartySocket instances
 */
export const createAuctionSocket = ({
  host,
  room,
  queryResolver,
}: CreatePartySocketOptions): PartySocket => {
  return new PartySocket({
    host,
    prefix: 'ws',
    party: 'auctions',
    room,
    query: queryResolver,
  });
};
