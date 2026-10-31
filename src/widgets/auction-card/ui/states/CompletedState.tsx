import React from 'react';
import { AuctionFacts, useAuctionStore } from '@/entities/auction';
import { formatCurrency } from '@/shared';

export const CompletedState: React.FC = () => {
  const auctionData = useAuctionStore((state) => state.auctionData);

  const winnerAmount = auctionData.winnerBidAmount || 0;
  const priceAmount = auctionData.priceBidAmount || 0;

  const savingsPercent =
    winnerAmount > 0
      ? Math.max(0, Math.floor(((winnerAmount - priceAmount) / winnerAmount) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-2.5">
      <AuctionFacts
        items={[
          {
            label: 'Status',
            value: 'Completed',
            valueClassName: 'text-slate-500',
          },
          {
            label: 'Winning Bid',
            value: formatCurrency(winnerAmount),
          },
          {
            label: 'Sold For',
            value: formatCurrency(priceAmount),
            valueClassName: 'text-emerald-600',
          },
          {
            label: 'Vickrey Savings',
            value: `${savingsPercent}%`,
          },
        ]}
      />
      <p className="text-[10.5px] leading-relaxed text-slate-600 m-0">
        The sold-for price is the second-price amount charged to the winner's Wallet.
      </p>
    </div>
  );
};
