import React, { useState } from 'react';
import { useAuctionStore } from '@/entities/auction';
import { showToast, Button, Input } from '@/shared';

export const PlaceBidForm: React.FC = () => {
  const { auctionData, placeBid, config, lastRejectedAt } = useAuctionStore();
  const confirmedBid = auctionData.memberBidAmount;

  const [amount, setAmount] = useState<string>(() =>
    confirmedBid && confirmedBid > 0 ? String(confirmedBid) : ''
  );
  const [prevConfirmedBid, setPrevConfirmedBid] = useState(confirmedBid);
  const [prevLastRejectedAt, setPrevLastRejectedAt] = useState(lastRejectedAt);

  if (confirmedBid !== prevConfirmedBid || lastRejectedAt !== prevLastRejectedAt) {
    setPrevConfirmedBid(confirmedBid);
    setPrevLastRejectedAt(lastRejectedAt);
    setAmount(confirmedBid && confirmedBid > 0 ? String(confirmedBid) : '');
  }

  const hasBid = Boolean(confirmedBid && Number(confirmedBid) > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (config?.viewOnlyEnabled) {
      showToast(config.viewOnlyToastHtml || 'Bidding is not open yet.', 'info');
      return;
    }

    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount < 1) {
      showToast(config?.incorrectBidValueHtml || 'Enter a bid of at least $1.', 'error');
      setAmount(confirmedBid && confirmedBid > 0 ? String(confirmedBid) : '');
      return;
    }

    placeBid(numericAmount);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 items-stretch">
      <div className="relative flex-1 min-w-0">
        <span className="sr-only">Your maximum bid amount</span>
        <span
          className="absolute top-1/2 left-3.5 -translate-y-1/2 font-extrabold text-slate-700 pointer-events-none"
          aria-hidden="true"
        >
          $
        </span>
        <Input
          type="number"
          min="1"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => ['-'].includes(e.key) && e.preventDefault()}
        />
      </div>
      <Button type="submit" variant="primary" className="whitespace-nowrap">
        {hasBid ? config?.placeAdditionalBidHtml || 'Place Additional Bid' : 'Place Bid'}
      </Button>
    </form>
  );
};
