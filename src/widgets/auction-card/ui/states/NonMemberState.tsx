import React from 'react';
import { AuctionFacts, useAuctionStore, AuctionTimer } from '@/entities/auction';
import { Button } from '@/shared';

export const NonMemberState: React.FC = () => {
  const { auctionData, config } = useAuctionStore();

  const defaultNote =
    'Any bid placed must be backed by funds already deposited in your Wallet. All bids are blind. If you win the auction with the highest bid, the price of the second-highest bid will be deducted from your Wallet balance and the card will automatically be added to your Vault in the Team Member Portal.';

  return (
    <div className="flex flex-col gap-2.5">
      <AuctionFacts
        items={[
          { label: 'Status', value: '--' },
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
      <p className="text-xs font-extrabold text-black m-0 leading-tight">
        Want this card? Any active team member can bid on any live auction.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a href="/products/membership" className="flex-1">
          <Button variant="primary" className="w-full">
            Join the Team to Bid
          </Button>
        </a>
        <a href="/a/account/" className="flex-1">
          <Button variant="secondary" className="w-full">
            Member log in
          </Button>
        </a>
      </div>
      <p className="text-[10.5px] leading-relaxed text-slate-600 m-0">
        Blind second-price auction — you never pay more than your own max bid, and usually pay less.
        And 90% of every auction's revenue flows back to the Team Bank to fund the team's next
        break.
      </p>
      <p className="text-[10.5px] leading-relaxed text-slate-600 m-0 max-lg:hidden">
        {config?.bidNote || defaultNote}
      </p>
    </div>
  );
};
