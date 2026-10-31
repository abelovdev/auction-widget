import React from 'react';
import { AuctionFacts, useAuctionStore } from '@/entities/auction';
import { Button } from '@/shared';

export const UnavailableState: React.FC = () => {
  const config = useAuctionStore((state) => state.config);

  return (
    <div className="flex flex-col gap-2.5">
      <AuctionFacts
        items={[
          {
            label: 'Status',
            value: 'Unavailable',
            valueClassName: 'text-amber-600',
          },
        ]}
      />
      <p className="text-[10.5px] leading-relaxed text-slate-600 m-0">
        {config?.auctionNotAvailableHtml || 'Auction details are not available yet.'}
      </p>
      <div className="flex gap-2 mt-1">
        <a href="/collections/auction-house" className="w-full">
          <Button variant="secondary" className="w-full">
            Back to Auction House
          </Button>
        </a>
      </div>
    </div>
  );
};
