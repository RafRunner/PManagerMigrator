import { CreditCardEntry } from "../../core/entities/CreditCardEntry";
import { NoteEntry } from "../../core/entities/NoteEntry";
import { PasswordEntry } from "../../core/entities/PasswordEntry";
import type { VaultEntry } from "../../core/entities/VaultEntry";
import type { VaultEntryRepository } from "../../core/interfaces/repositories/VaultEntryRepository";
import type {
  VaultEntryCreateProps,
  PasswordEntryCreateProps,
  NoteEntryCreateProps,
  CreditCardEntryCreateProps,
} from "../../core/types/VaultEntryTypes";
import { VaultEntryId } from "../../core/valueObjects/VaultEntryId";
import { VaultFolderId } from "../../core/valueObjects/VoultFolderId";
import {
  BitWardenApiClient,
  BITWARDEN_ITEM_TYPE,
  type BitWardenItem,
  type BitWardenField,
} from "../api/BitWardenApiClient";
import { BitWardenResourceNotFoundError } from "../api/BitWardenErrors";

export class BitWardenVaultEntryRepository implements VaultEntryRepository {
  constructor(private readonly apiClient: BitWardenApiClient) {}

  async findById(id: VaultEntryId): Promise<VaultEntry | null> {
    try {
      const bitwardenItem = await this.apiClient.getItem(id.value);
      return this.mapBitWardenItemToVaultEntry(bitwardenItem);
    } catch (error) {
      // If item not found, return null
      if (error instanceof BitWardenResourceNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async findByFolderId(folderId: VaultFolderId): Promise<VaultEntry[]> {
    const bitwardenItems = await this.apiClient.getItemsByFolder(folderId.value);
    return bitwardenItems.map((item) => this.mapBitWardenItemToVaultEntry(item));
  }

  async create(entryProps: VaultEntryCreateProps): Promise<VaultEntry> {
    const bitwardenItem = this.mapVaultEntryCreatePropsToBitWardenItem(entryProps);
    const createdItem = await this.apiClient.createItem(bitwardenItem);
    return this.mapBitWardenItemToVaultEntry(createdItem);
  }

  async delete(id: VaultEntryId): Promise<void> {
    await this.apiClient.deleteItem(id.value);
  }

  private mapBitWardenItemToVaultEntry(item: BitWardenItem): VaultEntry {
    const id = new VaultEntryId(item.id);
    const name = item.name.trim();
    const folderId = item.folderId ? new VaultFolderId(item.folderId) : null;
    const extraFields = this.extractExtraFields(item.fields);

    switch (item.type) {
      case BITWARDEN_ITEM_TYPE.LOGIN:
        return new PasswordEntry(
          id,
          name,
          folderId,
          extraFields,
          item.login?.username || "",
          item.login?.password || "",
          item.login?.uris?.[0]?.uri
        );

      case BITWARDEN_ITEM_TYPE.SECURE_NOTE:
        return new NoteEntry(id, name, folderId, extraFields, item.notes || "");

      case BITWARDEN_ITEM_TYPE.CARD:
        return new CreditCardEntry(
          id,
          name,
          folderId,
          extraFields,
          item.card?.brand || "",
          item.card?.number || "",
          item.card?.cardholderName || "",
          this.parseCardExpirationDate(item.card?.expMonth, item.card?.expYear),
          null, // BitWarden doesn't have validFrom for cards
          item.card?.code || ""
        );

      case BITWARDEN_ITEM_TYPE.IDENTITY:
        // Treat identity items as password entries with extra information
        return new PasswordEntry(
          id,
          name,
          folderId,
          {
            ...extraFields,
            firstName: item.identity?.firstName || "",
            lastName: item.identity?.lastName || "",
            email: item.identity?.email || "",
            phone: item.identity?.phone || "",
            company: item.identity?.company || "",
          },
          item.identity?.username || "",
          "", // Identity items don't have passwords in BitWarden
          ""
        );

      default:
        // Fallback to password entry for unknown types
        return new PasswordEntry(id, name, folderId, extraFields, "", "", "");
    }
  }

  private extractExtraFields(fields: BitWardenField[] | null): Record<string, string> {
    if (!fields) {
      return {};
    }

    return fields.reduce(
      (acc, field) => {
        if (field.name && field.value) {
          acc[field.name] = field.value;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }

  private parseCardExpirationDate(
    expMonth: string | null | undefined,
    expYear: string | null | undefined
  ): Date | null {
    if (!expMonth || !expYear) {
      return null;
    }

    const month = parseInt(expMonth, 10);
    const year = parseInt(expYear, 10);

    if (month < 1 || month > 12 || year < 1000) {
      return null;
    }

    return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  }

  private mapVaultEntryCreatePropsToBitWardenItem(
    props: VaultEntryCreateProps
  ): Partial<BitWardenItem> {
    const baseItem: Partial<BitWardenItem> = {
      name: props.name,
      folderId: props.folderId?.value || null,
      fields: props.extraFields
        ? Object.entries(props.extraFields).map(([name, value]) => ({
            name,
            value,
            type: 0, // Text field
            linkedId: null,
          }))
        : null,
    };

    if ("password" in props && "username" in props) {
      // PasswordEntry
      const passwordProps = props as PasswordEntryCreateProps;
      return {
        ...baseItem,
        type: BITWARDEN_ITEM_TYPE.LOGIN,
        login: {
          username: passwordProps.username,
          password: passwordProps.password,
          totp: null,
          passwordRevisionDate: null,
          uris: passwordProps.url
            ? [
                {
                  uri: passwordProps.url,
                  match: null,
                },
              ]
            : null,
        },
        secureNote: null,
        card: null,
        identity: null,
      };
    } else if ("content" in props) {
      // NoteEntry
      const noteProps = props as NoteEntryCreateProps;
      return {
        ...baseItem,
        type: BITWARDEN_ITEM_TYPE.SECURE_NOTE,
        notes: noteProps.content || "",
        login: null,
        secureNote: {
          type: 0, // Generic note
        },
        card: null,
        identity: null,
      };
    } else if (
      "cardNumber" in props &&
      "cardCompany" in props &&
      "cardHolderName" in props &&
      "cvv" in props
    ) {
      // CreditCardEntry
      const cardProps = props as CreditCardEntryCreateProps;
      return {
        ...baseItem,
        type: BITWARDEN_ITEM_TYPE.CARD,
        login: null,
        secureNote: null,
        card: {
          cardholderName: cardProps.cardHolderName,
          brand: cardProps.cardCompany,
          number: cardProps.cardNumber,
          expMonth: cardProps.expirationDate
            ? (cardProps.expirationDate.getUTCMonth() + 1).toString().padStart(2, "0")
            : null,
          expYear: cardProps.expirationDate
            ? cardProps.expirationDate.getUTCFullYear().toString()
            : null,
          code: cardProps.cvv,
        },
        identity: null,
      };
    }

    throw new Error(`Unsupported entry type for creation: ${JSON.stringify(props)}`);
  }
}
