import { CreditCardEntry } from "../../core/entities/CreditCardEntry.ts";
import { NoteEntry } from "../../core/entities/NoteEntry";
import { PasswordEntry } from "../../core/entities/PasswordEntry";
import type { VaultEntry } from "../../core/entities/VaultEntry";
import type { VaultEntryRepository } from "../../core/interfaces/repositories/VaultEntryRepository";
import type { RecordProvider } from "../../core/interfaces/services/RecordReader.ts";
import type { VaultEntryCreateProps } from "../../core/types/VaultEntryTypes";
import { VaultEntryId } from "../../core/valueObjects/VaultEntryId";
import { VaultFolderId } from "../../core/valueObjects/VoultFolderId";

export class CsvBCupVaultEntryRepository implements VaultEntryRepository {
  constructor(private readonly file: RecordProvider) {}

  async findById(id: VaultEntryId): Promise<VaultEntry | null> {
    const content = await this.file.getRecords();

    const row = content.find((row) => row.id === id.value);
    if (!row) {
      return null;
    }
    return this.mapRowToEntry(row);
  }

  async findByFolderId(folderId: VaultFolderId | null): Promise<VaultEntry[]> {
    const rows = await this.file.getRecords();

    return rows
      .filter((row) => {
        if (row["!type"] !== "entry") {
          return false;
        }
        if (folderId) {
          return row["!group_id"] === folderId.value;
        }
        return !row["!group_id"];
      })
      .map((row) => this.mapRowToEntry(row));
  }

  create(_entry: VaultEntryCreateProps): Promise<VaultEntry> {
    throw new Error("Method not implemented.");
  }

  delete(_id: VaultEntryId): Promise<void> {
    throw new Error("Method not implemented.");
  }

  private mapRowToEntry(row: Record<string, string>): VaultEntry {
    const { "!group_id": groupId, id: rowId, title, ...rest } = row;

    if (!rowId) {
      throw new Error("Row does not have an id field.");
    }

    let nonEmptyTitle = title?.trim();
    if (!nonEmptyTitle) {
      console.warn("Row does not have a title field.");
      nonEmptyTitle = `Untitled Entry ${rowId}`;
    }

    if (rest.note) {
      const { note, ...extraFields } = rest;

      return new NoteEntry(
        new VaultEntryId(rowId),
        nonEmptyTitle,
        groupId ? new VaultFolderId(groupId) : null,
        this.removeUnnecessaryFields(extraFields),
        note
      );
    }

    if (rest.cvv) {
      const {
        cvv,
        type: cardCompany,
        password: cardNumber,
        username: cardHolderName,
        expiry: expirationDate,
        valid_from: validFrom,
        ...extraFields
      } = rest;

      return new CreditCardEntry(
        new VaultEntryId(rowId),
        nonEmptyTitle,
        groupId ? new VaultFolderId(groupId) : null,
        this.removeUnnecessaryFields(extraFields),
        cardCompany || "",
        cardNumber || "",
        cardHolderName || "",
        this.parseMMYYYYDate(expirationDate),
        this.parseMMYYYYDate(validFrom),
        cvv
      );
    }

    const { username, password, url, ...extraFields } = rest;
    const actualUrl = url || extraFields.url || extraFields.URL;

    return new PasswordEntry(
      new VaultEntryId(rowId),
      nonEmptyTitle,
      groupId ? new VaultFolderId(groupId) : null,
      this.removeUnnecessaryFields(extraFields),
      username || "",
      password || "",
      actualUrl
    );
  }

  private parseMMYYYYDate(dateString: string | undefined): Date | null {
    if (!dateString || dateString.length !== 6) {
      return null;
    }

    const month = parseInt(dateString.substring(0, 2), 10);
    const year = parseInt(dateString.substring(2, 6), 10);

    if (month < 1 || month > 12 || year < 1000) {
      return null;
    }

    return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  }

  private removeUnnecessaryFields(row: Record<string, string>): Record<string, string> {
    const unnecessaryFields = ["!type", "!group_id", "!group_name", "!group_parent", "url", "URL"];

    return Object.fromEntries(
      Object.entries(row).filter(([key, value]) => !unnecessaryFields.includes(key) && value !== "")
    );
  }
}
