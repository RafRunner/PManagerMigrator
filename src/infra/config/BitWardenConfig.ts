export interface BitWardenConfig {
  apiBaseUrl: string;
  password: string;
}

export class BitWardenConfigBuilder {
  private config: Partial<BitWardenConfig> = {};

  static fromEnvironment(): BitWardenConfig {
    const apiBaseUrl = process.env.BITWARDEN_API_BASE_URL || "http://localhost:8087";
    const password = process.env.BITWARDEN_PASSWORD;

    if (!password) {
      throw new Error("BITWARDEN_PASSWORD environment variable is required");
    }

    return {
      apiBaseUrl,
      password,
    };
  }

  withApiBaseUrl(apiBaseUrl: string): BitWardenConfigBuilder {
    this.config.apiBaseUrl = apiBaseUrl;
    return this;
  }

  withPassword(password: string): BitWardenConfigBuilder {
    this.config.password = password;
    return this;
  }

  build(): BitWardenConfig {
    if (!this.config.apiBaseUrl) {
      throw new Error("apiBaseUrl is required");
    }
    if (!this.config.password) {
      throw new Error("password is required");
    }

    return {
      apiBaseUrl: this.config.apiBaseUrl,
      password: this.config.password,
    };
  }
}
