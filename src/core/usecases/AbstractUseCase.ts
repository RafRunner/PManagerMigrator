export abstract class AbstractUseCase<Input, Output> {
  async execute(input: Input): Promise<Output> {
    try {
      return await this.executeCore(input);
    } catch (error) {
      this.handleError(error);
    }
  }

  protected abstract executeCore(input: Input): Promise<Output>;

  protected handleError(error: any): never {
    // Default error handling logic
    throw error;
  }
}
