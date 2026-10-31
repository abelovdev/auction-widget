import React from 'react';
import { formatCurrency } from '@/shared';

interface StandingBidNoticeProps {
  amount?: number;
  templateHtml?: string;
}

export const StandingBidNotice: React.FC<StandingBidNoticeProps> = ({
  amount,
  templateHtml = "You've already placed a bid of {amount}.",
}) => {
  if (!amount || amount <= 0) return null;

  const formattedAmount = formatCurrency(amount);
  const text = templateHtml.replace('{amount}', formattedAmount);

  return (
    <div className="p-2.5 rounded bg-indigo-50 text-slate-900 text-xs font-bold leading-tight">
      {text}
    </div>
  );
};
