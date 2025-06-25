export class RateLimiter {
  private readonly maxTokens: number;
  private readonly requestTimeline: number[] = [];

  constructor(maxRequestsPerMinute: number) {
    this.maxTokens = maxRequestsPerMinute;
  }

  async waitForToken(): Promise<void> {
    const now = Date.now();

    if (this.requestTimeline.length < this.maxTokens) {
      this.requestTimeline.push(now);
      return;
    }

    const oldestRequest = this.requestTimeline[0];
    const elapsed = now - oldestRequest!;

    if (elapsed < 60000) {
      const timeToWait = 60000 - elapsed;
      console.log(`Rate limit exceeded, waiting for ${timeToWait} ms`);
      await new Promise((resolve) => setTimeout(resolve, timeToWait));
    }

    this.requestTimeline.shift();
    this.requestTimeline.push(Date.now());
  }
}
