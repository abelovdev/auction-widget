import React from 'react';
import { AuctionFacts, useAuctionStore } from '@/entities/auction';

export const LoadingState: React.FC = () => {
  const config = useAuctionStore((state) => state.config);

  return (
    <div className="flex flex-col gap-2.5">
      <AuctionFacts items={[{ label: 'Status', value: 'Checking…' }]} />
      <p className="text-[10.5px] leading-relaxed text-slate-600 m-0">
        {config?.auctionNotAvailableHtml || 'Connecting to the auction service.'}
      </p>
    </div>
  );
};
