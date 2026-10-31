import { render, screen, act } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlaceBidForm } from './PlaceBidForm';
import { useAuctionStore } from '@/entities/auction';

vi.mock('@/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared')>();
  return {
    ...actual,
    showToast: vi.fn(),
  };
});

describe('PlaceBidForm', () => {
  const placeBidMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuctionStore.setState({
      auctionData: { memberBidAmount: 50 },
      placeBid: placeBidMock,
      config: null,
      lastRejectedAt: null,
    });
  });

  it('renders with confirmed bid amount pre-filled', () => {
    render(<PlaceBidForm />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('50');
  });

  it('submits bid amount when valid number is entered', async () => {
    const user = userEvent.setup();
    render(<PlaceBidForm />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '75');

    const submitBtn = screen.getByRole('button', { name: /place additional bid/i });
    await user.click(submitBtn);

    expect(placeBidMock).toHaveBeenCalledWith(75);
  });

  it('rolls back input value to confirmed bid when server rejects bid via lastRejectedAt', async () => {
    const user = userEvent.setup();
    render(<PlaceBidForm />);

    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '150');
    expect(input.value).toBe('150');

    // Wrap state change in act() so React flushes the useEffect rollback
    act(() => {
      useAuctionStore.setState({ lastRejectedAt: Date.now() });
    });

    expect(input.value).toBe('50');
  });

  it('clears input to empty string on rejection if no previous bid exists', async () => {
    useAuctionStore.setState({
      auctionData: { memberBidAmount: 0 },
      lastRejectedAt: null,
    });

    const user = userEvent.setup();
    render(<PlaceBidForm />);

    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    await user.type(input, '200');

    // Wrap state change in act()
    act(() => {
      useAuctionStore.setState({ lastRejectedAt: Date.now() });
    });

    expect(input.value).toBe('');
  });
});
