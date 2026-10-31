import React from 'react';

export interface AuctionFactItem {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

interface AuctionFactsProps {
  items: AuctionFactItem[];
}

export const AuctionFacts: React.FC<AuctionFactsProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-1 text-xs">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-slate-500 font-normal">{item.label}:</span>
          <span className={`font-bold text-slate-900 ${item.valueClassName || ''}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};
