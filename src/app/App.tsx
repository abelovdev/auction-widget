import React from 'react';
import { AuctionCard } from '@/widgets/auction-card';
import { AuctionConfig } from '@/entities/auction';

interface AppProps {
  config: AuctionConfig;
}

export const App: React.FC<AppProps> = ({ config }) => {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md">
        <AuctionCard {...config} />
      </div>
    </main>
  );
};

export default App;
