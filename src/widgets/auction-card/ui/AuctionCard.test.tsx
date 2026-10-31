import { render, screen } from '@testing-library/preact';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuctionCard } from './AuctionCard';
import { useAuctionStore } from '@/entities/auction';

describe('AuctionCard UI States', () => {
  beforeEach(() => {
    useAuctionStore.setState({
      currentState: 'LOADING',
      auctionData: {},
      isMember: true,
      config: { productId: 'test-product', host: 'localhost' },
      initSocket: vi.fn(),
      closeSocket: vi.fn(),
    });
  });

  it('renders LoadingState spinner when currentState is LOADING', () => {
    render(<AuctionCard productId="p1" host="localhost" />);
    // LoadingState displays Status: Checking…
    expect(screen.getByText(/checking/i)).toBeInTheDocument();
  });

  it('renders ActiveState with form when currentState is ACTIVE', () => {
    useAuctionStore.setState({
      currentState: 'ACTIVE',
      auctionData: { bidderCount: 3, biddingEndsAt: new Date().toISOString() },
    });

    render(<AuctionCard productId="p1" host="localhost" />);
    expect(screen.getByText(/auction status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place bid/i })).toBeInTheDocument();
  });

  it('renders CompletedState when currentState is COMPLETED', () => {
    useAuctionStore.setState({
      currentState: 'COMPLETED',
      auctionData: { winnerBidAmount: 120, priceBidAmount: 100 },
    });

    render(<AuctionCard productId="p1" host="localhost" />);
    // CompletedState displays Status: Completed and Winning Bid
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByText(/winning bid/i)).toBeInTheDocument();
  });
});
