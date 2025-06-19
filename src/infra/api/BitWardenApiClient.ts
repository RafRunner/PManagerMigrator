import { request } from "undici";
import { z } from "zod";
import {
  BitWardenApiError,
  BitWardenAuthenticationError,
  BitWardenResourceNotFoundError,
  BitWardenSchemaValidationError,
} from "./BitWardenErrors";
import {
  BitWardenAuthResponseSchema,
  BitWardenFolderSchema,
  BitWardenItemSchema,
  BitWardenListResponseSchema,
  type BitWardenAuthResponse,
  type BitWardenField,
  type BitWardenFolder,
  type BitWardenItem,
} from "./BitWardenSchemas";

export interface BitWardenConfig {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  organizationId?: string;
}

// BitWarden item types
export const BITWARDEN_ITEM_TYPE = {
  LOGIN: 1,
  SECURE_NOTE: 2,
  CARD: 3,
  IDENTITY: 4,
} as const;

export type { BitWardenField, BitWardenItem, BitWardenFolder };

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  query?: Record<string, string>;
};

export class BitWardenApiClient {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly config: BitWardenConfig) {}

  private async ensureAuthenticated(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }

    await this.authenticate();
  }

  private async authenticate(): Promise<void> {
    const response = await request(`${this.config.apiBaseUrl}/identity/connect/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "api",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }).toString(),
    });

    const responseText = await response.body.text();

    if (response.statusCode !== 200) {
      throw new BitWardenAuthenticationError(response.statusCode, responseText);
    }

    let authData: BitWardenAuthResponse;
    try {
      const parsedData = JSON.parse(responseText);
      authData = BitWardenAuthResponseSchema.parse(parsedData);
    } catch (error) {
      throw new BitWardenSchemaValidationError(
        "Invalid authentication response format",
        "/identity/connect/token",
        error
      );
    }

    this.accessToken = authData.access_token;
    this.tokenExpiry = new Date(Date.now() + authData.expires_in * 1000);
  }

  private async makeApiRequest<T>(
    endpoint: string,
    options: RequestOptions = {},
    schema?: z.ZodType<T>
  ): Promise<T> {
    await this.ensureAuthenticated();

    let url = `${this.config.apiBaseUrl}/api${endpoint}`;

    const response = await request(url, {
      method: options.method || "GET",
      query: options.query,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body,
    });

    const responseText = await response.body.text();

    // Handle different status codes
    if (response.statusCode === 404) {
      throw new BitWardenResourceNotFoundError(endpoint, "");
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new BitWardenApiError(
        responseText || `HTTP ${response.statusCode} error`,
        response.statusCode,
        endpoint
      );
    }

    // Parse and validate response if schema is provided
    if (schema) {
      try {
        const parsedData = JSON.parse(responseText);
        return schema.parse(parsedData);
      } catch (error) {
        throw new BitWardenSchemaValidationError("Invalid API response format", endpoint, error);
      }
    }

    // For requests without validation (like DELETE), return parsed JSON or empty object
    try {
      return JSON.parse(responseText);
    } catch {
      return {} as T;
    }
  }

  async getFolders(): Promise<BitWardenFolder[]> {
    const response = await this.makeApiRequest(
      "/folders",
      {},
      BitWardenListResponseSchema(BitWardenFolderSchema)
    );
    return response.data;
  }

  async getFolder(id: string): Promise<BitWardenFolder> {
    return await this.makeApiRequest(`/folders/${id}`, {}, BitWardenFolderSchema);
  }

  async createFolder(name: string): Promise<BitWardenFolder> {
    return await this.makeApiRequest(
      "/folders",
      {
        method: "POST",
        body: JSON.stringify({ name }),
      },
      BitWardenFolderSchema
    );
  }

  async deleteFolder(id: string): Promise<void> {
    await this.makeApiRequest(`/folders/${id}`, {
      method: "DELETE",
    });
  }

  async getItems(): Promise<BitWardenItem[]> {
    const response = await this.makeApiRequest(
      "/items",
      {},
      BitWardenListResponseSchema(BitWardenItemSchema)
    );
    return response.data;
  }

  async getItem(id: string): Promise<BitWardenItem> {
    return await this.makeApiRequest(`/items/${id}`, {}, BitWardenItemSchema);
  }

  async getItemsByFolder(folderId: string): Promise<BitWardenItem[]> {
    const response = await this.makeApiRequest(
      "/items",
      {
        query: {
          folderid: folderId,
        },
      },
      BitWardenListResponseSchema(BitWardenItemSchema)
    );
    return response.data;
  }

  async createItem(item: Partial<BitWardenItem>): Promise<BitWardenItem> {
    return await this.makeApiRequest(
      "/items",
      {
        method: "POST",
        body: JSON.stringify(item),
      },
      BitWardenItemSchema
    );
  }

  async deleteItem(id: string): Promise<void> {
    await this.makeApiRequest(`/items/${id}`, {
      method: "DELETE",
    });
  }
}
