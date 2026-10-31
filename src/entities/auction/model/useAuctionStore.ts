import { create } from 'zustand';
import throttle from 'lodash.throttle';
import PartySocket from 'partysocket';
import { AuctionStatusState, AuctionDetails, AuctionConfig } from './types';
import { showToast } from '@/shared';
import { createAuctionSocket } from '@/shared/api/partySocket';

interface AuctionStore {
  currentState: AuctionStatusState;
  auctionData: AuctionDetails;
  isMember: boolean;
  socket: PartySocket | null;
  config: AuctionConfig | null;
  lastRejectedAt: number | null;

  initSocket: (config: AuctionConfig) => void;
  closeSocket: () => void;
  placeBid: (amount: number) => void;
  withdrawBid: () => void;
}

// Create throttled method outside of the store
const throttledAuctionDetailsUpdate = throttle(
  (set: (fn: (state: AuctionStore) => Partial<AuctionStore>) => void, payload) => {
    set((state) => ({
      auctionData: {
        ...state.auctionData,
        bidderCount: payload.bidderCount,
        biddingEndsAt: payload.biddingEndsAt,
      },
    }));
  },
  500,
  { leading: true, trailing: true }
);

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  currentState: 'LOADING',
  auctionData: {},
  isMember: false,
  socket: null,
  config: null,
  lastRejectedAt: null,

  initSocket: (config) => {
    set({ config });

    if (config.viewOnlyEnabled) {
      set({ currentState: 'VIEW_ONLY' });
      return;
    }

    const socket = createAuctionSocket({
      host: config.host,
      room: config.productId,
      queryResolver: async () => {
        try {
          const response = await fetch('/a/account/access-token', { redirect: 'manual' });

          if ([0, 307, 401].includes(response.status)) {
            set({ isMember: false, currentState: 'NONMEMBER' });
            return {};
          }

          if (response.status === 500) {
            set({ currentState: 'UNAVAILABLE' });
            return {};
          }

          const data = await response.json();
          set({ isMember: true });
          return { token: data.accessToken };
        } catch (e) {
          console.error('Network error fetching token', e);
          set({ currentState: 'UNAVAILABLE' });
          return {};
        }
      },
    });

    socket.addEventListener('message', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const { isMember, config: cfg } = get();

        switch (data.type) {
          case 'auctionPublicActive': {
            const auction = data.payload.auction;
            set({
              auctionData: {
                bidderCount: auction.bidderCount,
                biddingEndsAt: auction.biddingEndsAt,
                memberBidAmount: auction.memberBidAmount,
              },
              currentState: isMember ? 'ACTIVE' : 'NONMEMBER',
            });
            break;
          }

          case 'auctionPublicFinished': {
            const auction = data.payload.auction;
            set({
              auctionData: {
                winnerBidAmount: Number(auction.winnerBidAmount || 0),
                priceBidAmount: Number(auction.priceBidAmount || 0),
              },
              currentState: 'COMPLETED',
            });
            break;
          }

          // Throttling for potential high-freq event
          case 'auctionDetailsUpdate': {
            throttledAuctionDetailsUpdate(set, data.payload);
            break;
          }

          // No throttling for critical UI
          case 'bidAccepted': {
            const newAmount = data.payload?.bid?.amount;
            set((state) => ({
              auctionData: {
                ...state.auctionData,
                memberBidAmount: newAmount ?? state.auctionData.memberBidAmount,
              },
            }));
            showToast(cfg?.bidAcceptedHtml || 'Your blind bid has been accepted.', 'success');
            break;
          }

          case 'bidRejected': {
            set({ lastRejectedAt: Date.now() });
            showToast(
              data.payload?.reason || cfg?.bidNotAcceptedHtml || 'Your bid was not accepted.',
              'error'
            );
            break;
          }

          case 'bidWithdrawn': {
            set((state) => ({
              auctionData: {
                ...state.auctionData,
                memberBidAmount: 0,
              },
            }));
            showToast(cfg?.bidWithdrawnHtml || 'Your bid has been withdrawn.', 'info');
            break;
          }

          case 'error':
            showToast(data.payload?.message || 'An error occurred.', 'error');
            break;

          default:
            break;
        }
      } catch {
        console.warn('Received non-JSON message:', e.data);
      }
    });

    socket.addEventListener('error', (err) => {
      console.error('Auction Socket Error:', err);
      if (!get().config?.viewOnlyEnabled) {
        set({ currentState: 'UNAVAILABLE' });
      }
    });

    set({ socket });
  },

  closeSocket: () => {
    // Cancel delayed calls on socket close
    throttledAuctionDetailsUpdate.cancel();
    get().socket?.close();
    set({ socket: null, currentState: 'LOADING' });
  },

  placeBid: (amount) => {
    const { socket, config } = get();
    const OPEN = typeof WebSocket !== 'undefined' ? WebSocket.OPEN : 1;

    if (!socket || socket.readyState !== OPEN) {
      showToast(
        config?.bidConnectionLostHtml ||
          'Reconnecting to the auction service. Try again in a moment.',
        'error'
      );
      return;
    }

    try {
      socket.send(
        JSON.stringify({
          type: 'bidPlace',
          payload: { amount: amount.toString() },
        })
      );
    } catch (e: unknown) {
      console.error('Bid send failed', e);
      showToast(
        config?.bidConnectionLostHtml ||
          'Reconnecting to the auction service. Try again in a moment.',
        'error'
      );
    }
  },

  withdrawBid: () => {
    get().socket?.send(
      JSON.stringify({
        type: 'bidWithdraw',
        payload: {},
      })
    );
  },
}));
