import { describe, it, expect, beforeEach, vi } from 'vitest';
import type PartySocket from 'partysocket';
import { useAuctionStore } from './useAuctionStore';
import { showToast } from '@/shared';

// 1. Mock toast notifications
vi.mock('@/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared')>();
  return {
    ...actual,
    showToast: vi.fn(),
  };
});

// 2. Mock PartySocket instance methods
const mockSocketSend = vi.fn();
const mockSocketClose = vi.fn();
const mockAddEventListener = vi.fn();

const fakeSocket = {
  readyState: 1, // WebSocket.OPEN
  send: mockSocketSend,
  close: mockSocketClose,
  addEventListener: mockAddEventListener,
};

vi.mock('@/shared/api/partySocket', () => ({
  createAuctionSocket: vi.fn(() => fakeSocket),
}));

describe('useAuctionStore - Actions & WebSocket interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeSocket.readyState = 1; // Reset to OPEN before each test

    useAuctionStore.setState({
      currentState: 'ACTIVE',
      auctionData: {},
      isMember: true,
      socket: fakeSocket as unknown as PartySocket,
      config: { productId: 'prod-101', host: 'localhost' },
      lastRejectedAt: null,
    });
  });

  it('sends bidPlace message with stringified amount when placeBid is called', () => {
    const { placeBid } = useAuctionStore.getState();

    placeBid(75);

    expect(mockSocketSend).toHaveBeenCalledTimes(1);
    expect(mockSocketSend).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'bidPlace',
        payload: { amount: '75' },
      })
    );
  });

  it('shows error toast and prevents sending when WebSocket connection is closed', () => {
    fakeSocket.readyState = 3; // WebSocket.CLOSED
    const { placeBid } = useAuctionStore.getState();

    placeBid(50);

    expect(mockSocketSend).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      expect.stringContaining('Reconnecting to the auction service'),
      'error'
    );
  });

  it('sends bidWithdraw payload when withdrawBid is executed', () => {
    const { withdrawBid } = useAuctionStore.getState();

    withdrawBid();

    expect(mockSocketSend).toHaveBeenCalledTimes(1);
    expect(mockSocketSend).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'bidWithdraw',
        payload: {},
      })
    );
  });

  it('closes WebSocket connection and cleans store state on closeSocket', () => {
    const { closeSocket } = useAuctionStore.getState();

    closeSocket();

    expect(mockSocketClose).toHaveBeenCalled();
    expect(useAuctionStore.getState().socket).toBeNull();
    expect(useAuctionStore.getState().currentState).toBe('LOADING');
  });
});
