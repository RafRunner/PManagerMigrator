export interface BitWardenConfig {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  organizationId?: string;
}

export class BitWardenConfigBuilder {
  private config: Partial<BitWardenConfig> = {};

  static fromEnvironment(): BitWardenConfig {
    const apiBaseUrl = process.env.BITWARDEN_API_BASE_URL || "https://api.bitwarden.com";
    const clientId = process.env.BITWARDEN_CLIENT_ID;
    const clientSecret = process.env.BITWARDEN_CLIENT_SECRET;
    const organizationId = process.env.BITWARDEN_ORGANIZATION_ID;

    if (!clientId) {
      throw new Error("BITWARDEN_CLIENT_ID environment variable is required");
    }

    if (!clientSecret) {
      throw new Error("BITWARDEN_CLIENT_SECRET environment variable is required");
    }

    return {
      apiBaseUrl,
      clientId,
      clientSecret,
      organizationId,
    };
  }

  withApiBaseUrl(apiBaseUrl: string): BitWardenConfigBuilder {
    this.config.apiBaseUrl = apiBaseUrl;
    return this;
  }

  withClientId(clientId: string): BitWardenConfigBuilder {
    this.config.clientId = clientId;
    return this;
  }

  withClientSecret(clientSecret: string): BitWardenConfigBuilder {
    this.config.clientSecret = clientSecret;
    return this;
  }

  withOrganizationId(organizationId: string): BitWardenConfigBuilder {
    this.config.organizationId = organizationId;
    return this;
  }

  build(): BitWardenConfig {
    if (!this.config.apiBaseUrl) {
      throw new Error("apiBaseUrl is required");
    }
    if (!this.config.clientId) {
      throw new Error("clientId is required");
    }
    if (!this.config.clientSecret) {
      throw new Error("clientSecret is required");
    }

    return {
      apiBaseUrl: this.config.apiBaseUrl,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      organizationId: this.config.organizationId,
    };
  }
}
