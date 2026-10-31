import React from 'react';
import { AuctionFacts, useAuctionStore } from '@/entities/auction';

export const ViewOnlyState: React.FC = () => {
  const config = useAuctionStore((state) => state.config);

  return (
    <div className="flex flex-col gap-2.5">
      <AuctionFacts
        items={[
          {
            label: 'Status',
            value: 'Coming Soon',
            valueClassName: 'text-amber-600',
          },
          {
            label: 'Bid Window',
            value: config?.viewOnlyWindow || 'Sun, Jun 28 - 8 a.m. ET',
          },
        ]}
      />
      <p className="text-xs font-extrabold text-black m-0 leading-tight">
        {config?.viewOnlyTitle || 'Bidding opens June 28 at 8:00 a.m. ET'}
      </p>
      <p className="text-[10.5px] leading-relaxed text-slate-600 m-0">
        {config?.viewOnlyBody ||
          'You can inspect the card now. Bidding stays closed until launch so the team starts together.'}
      </p>
    </div>
  );
};
