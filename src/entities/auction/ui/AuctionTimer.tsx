import React, { useEffect, useState } from 'react';
import { formatCountdown } from '@/shared';

interface AuctionTimerProps {
  biddingEndsAt?: string;
}

export const AuctionTimer: React.FC<AuctionTimerProps> = ({ biddingEndsAt }) => {
  const [timeLeft, setTimeLeft] = useState<string>('--');

  useEffect(() => {
    if (!biddingEndsAt) return;

    const updateTimer = () => {
      setTimeLeft(formatCountdown(biddingEndsAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [biddingEndsAt]);

  return <span>{timeLeft}</span>;
};
