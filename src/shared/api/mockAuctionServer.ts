interface MockServerOptions {
  isAuthenticated?: boolean;
  initialBidderCount?: number;
  initialBidAmount?: number;
  walletBalance?: number;
}

// Auction duration for testing (1 minute)
const AUCTION_DURATION_MS = 60 * 1000;

export const startMockAuctionServer = (
  _host: string,
  _productId: string,
  options: MockServerOptions = {}
) => {
  const {
    isAuthenticated = true,
    initialBidderCount = 4,
    initialBidAmount = 0,
    walletBalance = 100,
  } = options;

  let bidderCount = initialBidderCount;
  let currentMemberBid = isAuthenticated ? initialBidAmount : undefined;

  // Calculate fresh end time inside factory initialization
  const biddingEndsAtDate = new Date(Date.now() + AUCTION_DURATION_MS);
  const biddingEndsAt = biddingEndsAtDate.toISOString();
  let isAuctionCompleted = false;

  // 1. Mock HTTP fetch for /a/account/access-token
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';

    if (url.includes('/a/account/access-token')) {
      if (!isAuthenticated) {
        return new Response(
          JSON.stringify({
            error: 'unauthorized',
            message: 'Your membership lapsed.',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store',
            },
          }
        );
      }

      return new Response(JSON.stringify({ accessToken: 'mock-valid-jwt-token-member-101' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(input, init);
  };

  // 2. Native WebSocket Mock
  const OriginalWebSocket = window.WebSocket;

  class MockWebSocket extends EventTarget {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;

    readyState = MockWebSocket.CONNECTING;
    url: string;

    onopen: ((ev: Event) => void) | null = null;
    onmessage: ((ev: MessageEvent) => void) | null = null;
    onerror: ((ev: Event) => void) | null = null;
    onclose: ((ev: CloseEvent) => void) | null = null;

    private authenticatedMemberId: number | undefined;
    private timerId: ReturnType<typeof setTimeout> | null = null;

    constructor(url: string | URL, _protocols?: string | string[]) {
      super();
      this.url = url.toString();

      const searchParams = new URLSearchParams(this.url.split('?')[1] || '');
      const token = searchParams.get('token');
      this.authenticatedMemberId = token ? 101 : undefined;

      setTimeout(() => {
        this.readyState = MockWebSocket.OPEN;
        const openEvent = new Event('open');
        this.dispatchEvent(openEvent);
        if (this.onopen) this.onopen(openEvent);

        if (isAuctionCompleted) {
          this.emitFinishedEvent();
        } else {
          // Send active state with fresh ISO timestamp
          this.emitMessage({
            type: 'auctionPublicActive',
            payload: {
              auction: {
                bidderCount,
                biddingEndsAt,
                ...(this.authenticatedMemberId ? { memberBidAmount: currentMemberBid } : {}),
              },
            },
          });

          // Schedule auction completion when timer expires
          const remainingMs = Math.max(0, biddingEndsAtDate.getTime() - Date.now());
          this.timerId = setTimeout(() => {
            isAuctionCompleted = true;
            this.emitFinishedEvent();
          }, remainingMs);
        }
      }, 100);
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
      if (isAuctionCompleted) {
        this.emitMessage({
          type: 'bidRejected',
          payload: { reason: 'Auction has already finished.' },
        });
        return;
      }

      if (!this.authenticatedMemberId) {
        this.emitMessage({
          type: 'error',
          payload: { message: 'Authentication required to perform this action.' },
        });
        return;
      }

      try {
        const payloadStr = typeof data === 'string' ? data : data.toString();
        const requestData = JSON.parse(payloadStr);

        switch (requestData.type) {
          case 'bidPlace': {
            const amount = parseFloat(parseFloat(requestData.payload.amount).toFixed(2));

            if (amount <= 0 || isNaN(amount)) {
              this.emitMessage({
                type: 'bidRejected',
                payload: { reason: 'Enter a bid of at least $1.' },
              });
              return;
            }

            if (amount > walletBalance) {
              this.emitMessage({
                type: 'bidRejected',
                payload: {
                  reason: `Insufficient Wallet balance. Your available balance is $${walletBalance}.00.`,
                },
              });
              return;
            }

            setTimeout(() => {
              if (!currentMemberBid || currentMemberBid === 0) {
                bidderCount += 1;
              }
              currentMemberBid = amount;

              this.emitMessage({
                type: 'bidAccepted',
                payload: {
                  bid: {
                    amount,
                    createdAt: new Date().toISOString(),
                  },
                },
              });

              this.emitMessage({
                type: 'auctionDetailsUpdate',
                payload: {
                  bidderCount,
                  biddingEndsAt,
                },
              });
            }, 300);

            break;
          }

          case 'bidWithdraw': {
            setTimeout(() => {
              if (currentMemberBid && currentMemberBid > 0) {
                bidderCount = Math.max(0, bidderCount - 1);
              }
              currentMemberBid = 0;

              this.emitMessage({
                type: 'bidWithdrawn',
                payload: {},
              });

              this.emitMessage({
                type: 'auctionDetailsUpdate',
                payload: {
                  bidderCount,
                  biddingEndsAt,
                },
              });
            }, 300);
            break;
          }

          default:
            break;
        }
      } catch {
        this.emitMessage({
          type: 'bidRejected',
          payload: { reason: 'Invalid payload format.' },
        });
      }
    }

    close(code?: number, reason?: string) {
      if (this.timerId) clearTimeout(this.timerId);
      this.readyState = MockWebSocket.CLOSED;
      const closeEvent = new CloseEvent('close', { code, reason });
      this.dispatchEvent(closeEvent);
      if (this.onclose) this.onclose(closeEvent);
    }

    private emitFinishedEvent() {
      this.emitMessage({
        type: 'auctionPublicFinished',
        payload: {
          auction: {
            winnerBidAmount: (currentMemberBid || 50) + 20,
            priceBidAmount: currentMemberBid || 50,
          },
          isWinner: true,
        },
      });
    }

    private emitMessage(data: unknown) {
      const msgEvent = new MessageEvent('message', {
        data: JSON.stringify(data),
      });
      this.dispatchEvent(msgEvent);
      if (this.onmessage) this.onmessage(msgEvent);
    }
  }

  (window as unknown as { WebSocket: typeof WebSocket }).WebSocket =
    MockWebSocket as unknown as typeof WebSocket;

  return () => {
    window.fetch = originalFetch;
    window.WebSocket = OriginalWebSocket;
  };
};
