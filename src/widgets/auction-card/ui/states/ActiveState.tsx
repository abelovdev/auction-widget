import React from 'react';
import { AuctionFacts, AuctionTimer, useAuctionStore } from '@/entities/auction';
import { PlaceBidForm } from '@/features/place-bid';

export const ActiveState: React.FC = () => {
  const { auctionData, config } = useAuctionStore();

  const defaultNote =
    'Any bid placed must be backed by funds already deposited in your Wallet. All bids are blind. If you win the auction with the highest bid, the price of the second-highest bid will be deducted from your Wallet balance and the card will automatically be added to your Vault in the Team Member Portal.';

  return (
    <div className="flex flex-col gap-2.5">
      <AuctionFacts
        items={[
          {
            label: 'Status',
            value: 'Open',
            valueClassName: 'text-emerald-600',
          },
          {
            label: 'Time Left',
            value: <AuctionTimer biddingEndsAt={auctionData.biddingEndsAt} />,
          },
          {
            label: '# of Bidders',
            value: auctionData.bidderCount ?? '--',
          },
        ]}
      />

      <span className="text-xs font-bold text-slate-700 tracking-wide">Your Maximum Bid</span>

      <PlaceBidForm />

      <p className="text-[10.5px] leading-relaxed text-slate-600 m-0 max-lg:hidden">
        {config?.bidNote || defaultNote}
      </p>
    </div>
  );
};
