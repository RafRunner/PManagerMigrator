export class BitWardenApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    cause?: any,
  ) {
    super(message, { cause });
    this.name = "BitWardenApiError";
  }
}

export class BitWardenAuthenticationError extends BitWardenApiError {
  constructor(statusCode: number, message?: string) {
    super(
      `BitWarden authentication failed: ${message ?? "Unknown authentication error"}`,
      statusCode,
      "/identity/connect/token",
    );
    this.name = "BitWardenAuthenticationError";
  }
}

export class BitWardenResourceNotFoundError extends BitWardenApiError {
  constructor(endpoint: string, resourceId: string) {
    super(`Resource not found: ${resourceId}`, 404, endpoint);
    this.name = "BitWardenResourceNotFoundError";
  }
}

export class BitWardenSchemaValidationError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly zodError: any,
    public readonly inputData?: any,
  ) {
    super(`${message} - Input: ${JSON.stringify(inputData)}`, { cause: zodError });
    this.name = "BitWardenSchemaValidationError";
  }
}
