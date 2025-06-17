import { request } from "undici";

export interface BitWardenConfig {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  organizationId?: string;
}

export interface BitWardenAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface BitWardenFolder {
  id: string;
  name: string;
  object: "folder";
  revisionDate: string;
}

export interface BitWardenItem {
  id: string;
  organizationId: string | null;
  folderId: string | null;
  type: 1 | 2 | 3 | 4; // 1=login, 2=secureNote, 3=card, 4=identity
  name: string;
  notes: string | null;
  favorite: boolean;
  fields: BitWardenField[] | null;
  login: BitWardenLogin | null;
  secureNote: BitWardenSecureNote | null;
  card: BitWardenCard | null;
  identity: BitWardenIdentity | null;
  attachments: any[] | null;
  organizationUseTotp: boolean;
  revisionDate: string;
  creationDate: string;
  deletedDate: string | null;
  object: "item";
}

export interface BitWardenField {
  name: string;
  value: string;
  type: number; // 0=text, 1=hidden, 2=boolean
  linkedId: number | null;
}

export interface BitWardenLogin {
  username: string | null;
  password: string | null;
  totp: string | null;
  passwordRevisionDate: string | null;
  uris: BitWardenUri[] | null;
}

export interface BitWardenUri {
  uri: string;
  match: number | null;
}

export interface BitWardenSecureNote {
  type: number;
}

export interface BitWardenCard {
  cardholderName: string | null;
  brand: string | null;
  number: string | null;
  expMonth: string | null;
  expYear: string | null;
  code: string | null;
}

export interface BitWardenIdentity {
  title: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  ssn: string | null;
  username: string | null;
  passportNumber: string | null;
  licenseNumber: string | null;
}

export interface BitWardenListResponse<T> {
  data: T[];
  object: "list";
  continuationToken: string | null;
}

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

    if (response.statusCode !== 200) {
      const error = await response.body.text();
      throw new Error(`BitWarden authentication failed: ${response.statusCode} - ${error}`);
    }

    const authData = (await response.body.json()) as BitWardenAuthResponse;
    this.accessToken = authData.access_token;
    this.tokenExpiry = new Date(Date.now() + authData.expires_in * 1000);
  }

  private async makeApiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    await this.ensureAuthenticated();

    const response = await request(`${this.config.apiBaseUrl}/api${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.statusCode >= 400) {
      const error = await response.body.text();
      throw new Error(`BitWarden API error: ${response.statusCode} - ${error}`);
    }

    return (await response.body.json()) as T;
  }

  async getFolders(): Promise<BitWardenFolder[]> {
    const response = await this.makeApiRequest<BitWardenListResponse<BitWardenFolder>>("/folders");
    return response.data;
  }

  async getFolder(id: string): Promise<BitWardenFolder> {
    return await this.makeApiRequest<BitWardenFolder>(`/folders/${id}`);
  }

  async createFolder(name: string): Promise<BitWardenFolder> {
    return await this.makeApiRequest<BitWardenFolder>("/folders", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async deleteFolder(id: string): Promise<void> {
    await this.makeApiRequest(`/folders/${id}`, {
      method: "DELETE",
    });
  }

  async getItems(): Promise<BitWardenItem[]> {
    const response = await this.makeApiRequest<BitWardenListResponse<BitWardenItem>>("/items");
    return response.data;
  }

  async getItem(id: string): Promise<BitWardenItem> {
    return await this.makeApiRequest<BitWardenItem>(`/items/${id}`);
  }

  async getItemsByFolder(folderId: string): Promise<BitWardenItem[]> {
    const response = await this.makeApiRequest<BitWardenListResponse<BitWardenItem>>("/items", {
      query: {
        folderid: folderId,
      },
    });
    return response.data;
  }

  async createItem(item: Partial<BitWardenItem>): Promise<BitWardenItem> {
    return await this.makeApiRequest<BitWardenItem>("/items", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async deleteItem(id: string): Promise<void> {
    await this.makeApiRequest(`/items/${id}`, {
      method: "DELETE",
    });
  }
}
