import { request } from "undici";
import { z } from "zod";
import {
  BitWardenApiError,
  BitWardenAuthenticationError,
  BitWardenResourceNotFoundError,
  BitWardenSchemaValidationError,
} from "./BitWardenErrors";
import {
  BitWardenFolderSchema,
  BitWardenItemSchema,
  BitWardenListResponseSchema,
  type BitWardenField,
  type BitWardenFolder,
  type BitWardenItem,
} from "./BitWardenSchemas";

export interface BitWardenConfig {
  apiBaseUrl: string;
  password: string;
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

interface DefaultBitwardenResponse {
  success: boolean;
  data?: any;
  message?: any;
}

function isDefaultBitwardenResponse(obj: unknown): obj is DefaultBitwardenResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "success" in obj &&
    typeof (obj as DefaultBitwardenResponse).success === "boolean" &&
    ("data" in obj || "message" in obj)
  );
}

export class BitWardenApiClient {
  private unlocked = false;

  constructor(private readonly config: BitWardenConfig) {}

  private async ensureAuthenticated(): Promise<void> {
    if (this.unlocked) {
      return;
    }

    await this.unlock();
  }

  private async unlock(): Promise<void> {
    const response = await request(`${this.config.apiBaseUrl}/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: this.config.password,
      }),
    });

    const responseText = await response.body.text();

    if (response.statusCode !== 200) {
      throw new BitWardenAuthenticationError(response.statusCode, responseText);
    }

    this.unlocked = true;
  }

  private async makeApiRequest<T>(
    endpoint: string,
    options: RequestOptions = {},
    schema?: z.ZodType<T>
  ): Promise<T> {
    await this.ensureAuthenticated();

    const url = `${this.config.apiBaseUrl}/${endpoint}`;
    const method = options.method || "GET";

    const response = await request(url, {
      method,
      query: options.query,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body,
    });

    const responseData = await response.body.json();
    const responseText = JSON.stringify(responseData, null, 2);
    const methodAndEndpoint = `${method} ${endpoint};`;
    // console.log(`Response from ${method} ${url}:`, responseText);

    // Handle different status codes
    if (response.statusCode === 404) {
      throw new BitWardenResourceNotFoundError(methodAndEndpoint, "");
    }

    if (isDefaultBitwardenResponse(responseData) && responseData.success === false) {
      if (responseData.message === "Not found.") {
        throw new BitWardenResourceNotFoundError(methodAndEndpoint, "");
      }

      throw new BitWardenApiError(
        responseText || `HTTP ${response.statusCode} error`,
        response.statusCode,
        methodAndEndpoint
      );
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new BitWardenApiError(
        responseText || `HTTP ${response.statusCode} error`,
        response.statusCode,
        methodAndEndpoint
      );
    }

    // Parse and validate response if schema is provided
    if (schema) {
      try {
        if (isDefaultBitwardenResponse(responseData)) {
          return schema.parse(responseData.data);
        }
        return schema.parse(responseData);
      } catch (error) {
        throw new BitWardenSchemaValidationError(
          "Invalid API response format",
          methodAndEndpoint,
          error,
          responseData
        );
      }
    }

    // For requests without validation (like DELETE), return parsed JSON or empty object
    return (responseData || {}) as T;
  }

  async getFolders(): Promise<BitWardenFolder[]> {
    const response = await this.makeApiRequest(
      "list/object/folders",
      {},
      BitWardenListResponseSchema(BitWardenFolderSchema)
    );
    return response.data;
  }

  async getFolder(id: string): Promise<BitWardenFolder> {
    return await this.makeApiRequest(`object/folder/${id}`, {}, BitWardenFolderSchema);
  }

  async getFolderByName(name: string): Promise<BitWardenFolder | null> {
    const response = await this.makeApiRequest(
      "list/object/folders",
      {
        query: {
          search: name,
        },
      },
      BitWardenListResponseSchema(BitWardenFolderSchema)
    );

    const folder = response.data[0];
    return folder || null;
  }

  async createFolder(name: string): Promise<BitWardenFolder> {
    return await this.makeApiRequest(
      "object/folder",
      {
        method: "POST",
        body: JSON.stringify({ name }),
      },
      BitWardenFolderSchema
    );
  }

  async deleteFolder(id: string): Promise<void> {
    await this.makeApiRequest(`object/folder/${id}`, {
      method: "DELETE",
    });
  }

  async getItems(): Promise<BitWardenItem[]> {
    const response = await this.makeApiRequest(
      "list/object/item",
      {},
      BitWardenListResponseSchema(BitWardenItemSchema)
    );
    return response.data;
  }

  async getItem(id: string): Promise<BitWardenItem> {
    return await this.makeApiRequest(`object/item/${id}`, {}, BitWardenItemSchema);
  }

  async getItemsByFolder(folderId: string | null): Promise<BitWardenItem[]> {
    const response = await this.makeApiRequest(
      "list/object/items",
      {
        query: {
          folderid: String(folderId),
        },
      },
      BitWardenListResponseSchema(BitWardenItemSchema)
    );
    return response.data;
  }

  async createItem(item: Partial<BitWardenItem>): Promise<BitWardenItem> {
    return await this.makeApiRequest(
      "object/item",
      {
        method: "POST",
        body: JSON.stringify(item),
      },
      BitWardenItemSchema
    );
  }

  async deleteItem(id: string): Promise<void> {
    await this.makeApiRequest(`object/item/${id}`, {
      method: "DELETE",
    });
  }
}
