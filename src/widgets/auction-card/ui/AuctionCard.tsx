import React, { useEffect } from 'react';
import { useAuctionStore, AuctionConfig, AuctionStatusState } from '@/entities/auction';
import { LoadingState } from './states/LoadingState';
import { UnavailableState } from './states/UnavailableState';
import { NonMemberState } from './states/NonMemberState';
import { ViewOnlyState } from './states/ViewOnlyState';
import { ActiveState } from './states/ActiveState';
import { CompletedState } from './states/CompletedState';

// Component registry map for auction states
const STATE_COMPONENTS: Record<AuctionStatusState, React.ComponentType> = {
  LOADING: LoadingState,
  UNAVAILABLE: UnavailableState,
  NONMEMBER: NonMemberState,
  VIEW_ONLY: ViewOnlyState,
  ACTIVE: ActiveState,
  COMPLETED: CompletedState,
};

export const AuctionCard: React.FC<AuctionConfig> = (props) => {
  const { currentState, initSocket, closeSocket } = useAuctionStore();

  useEffect(() => {
    initSocket(props);
    return () => closeSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StateComponent = STATE_COMPONENTS[currentState] || LoadingState;

  return (
    <div className="border border-slate-200 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 max-lg:hidden">
        Auction Status
      </p>

      <StateComponent />
    </div>
  );
};
