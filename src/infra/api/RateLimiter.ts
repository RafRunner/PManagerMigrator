// Rate limiter class using token bucket algorithm
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(maxRequestsPerMinute: number) {
    this.maxTokens = maxRequestsPerMinute;
    this.tokens = maxRequestsPerMinute;
    this.lastRefill = Date.now();
    // Refill tokens at a rate to reach maxTokens over 60 seconds
    this.refillRate = maxRequestsPerMinute / (60 * 1000);
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async waitForToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculate how long to wait for the next token
    const timeToWait = Math.ceil((1 - this.tokens) / this.refillRate);
    console.log(`Rate limit exceeded, waiting for ${timeToWait} ms`);
    await new Promise((resolve) => setTimeout(resolve, timeToWait));

    // Try again after waiting
    return this.waitForToken();
  }
}
