import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuctionConfig } from '@/entities/auction';
import { startMockAuctionServer } from '@/shared/api/mockAuctionServer';
import 'toastify-js/src/toastify.css';
import './index.css';

const rootElement = document.getElementById('auction-widget');

if (!rootElement) {
  throw new Error('[Auction Widget] Root element #auction-widget not found in DOM.');
}

const productId = rootElement.dataset.productId;
const host = rootElement.dataset.host;

if (!productId || !host) {
  throw new Error(
    `[Auction Widget] Missing required dataset attributes on #auction-widget. ` +
      `Expected data-product-id and data-host. Received: productId="${productId}", host="${host}"`
  );
}

// Enable mock server for local development & E2E tests
if (import.meta.env.DEV || rootElement.dataset.mockBackend === 'true') {
  startMockAuctionServer(host, productId);
}

// Helper to filter out empty strings from dataset
const getAttr = (key: string): string | undefined => {
  const value = rootElement.dataset[key];
  return value && value.trim() !== '' ? value : undefined;
};

const config: AuctionConfig = {
  productId,
  host,
  viewOnlyEnabled: rootElement.dataset.viewOnly === 'true',
  viewOnlyToastHtml: getAttr('viewOnlyToast'),
  auctionNotAvailableHtml: getAttr('auctionNotAvailable'),
  unauthorizedHtml: getAttr('unauthorized'),
  notLoggedInHtml: getAttr('notLoggedIn'),
  bidAcceptedHtml: getAttr('bidAccepted'),
  bidNotAcceptedHtml: getAttr('bidNotAccepted'),
  incorrectBidValueHtml: getAttr('incorrectBidValue'),
  bidWithdrawnHtml: getAttr('bidWithdrawn'),
  bidConnectionLostHtml: getAttr('bidConnectionLost'),
  alreadyBidHtml: getAttr('alreadyBid'),
  placeAdditionalBidHtml: getAttr('placeAdditionalBid'),
  bidNote: getAttr('bidNote'),
  viewOnlyWindow: getAttr('viewOnlyWindow'),
  viewOnlyTitle: getAttr('viewOnlyTitle'),
  viewOnlyBody: getAttr('viewOnlyBody'),
};

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>
);
