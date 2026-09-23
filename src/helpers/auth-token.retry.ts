export class AuthTokenRetry {
  private token: string;

  constructor(
    token: string,
    private readonly refreshFn: () => Promise<string>,
  ) {
    this.token = token;
  }

  get value(): string {
    return this.token;
  }

  async refresh(): Promise<string> {
    this.token = await this.refreshFn();
    return this.token;
  }
}
