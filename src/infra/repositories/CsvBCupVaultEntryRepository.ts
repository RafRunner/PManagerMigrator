import { NoteEntry } from "../../core/entities/NoteEntry";
import { PasswordEntry } from "../../core/entities/PasswordEntry";
import type { VaultEntry } from "../../core/entities/VaultEntry";
import type { VaultEntryRepository } from "../../core/interfaces/repositories/VaultEntryRepository";
import type { VaultEntryCreateProps } from "../../core/types/VaultEntryTypes";
import { VaultEntryId } from "../../core/valueObjects/VaultEntryId";
import { VaultFolderId } from "../../core/valueObjects/VoultFolderId";
import type { CsvFile } from "../files/CsvFile.ts";

export class CsvBCupVaultEntryRepository implements VaultEntryRepository {
  constructor(private readonly file: CsvFile) {}

  async findById(id: VaultEntryId): Promise<VaultEntry | null> {
    const content = await this.file.getFileContent();

    const row = content.find((row) => row.id === id.value);
    if (!row) {
      return null;
    }
    return this.mapRowToEntry(row);
  }

  async findByFolderId(folderId: VaultFolderId): Promise<VaultEntry[]> {
    const rows = await this.file.getFileContent();

    return rows
      .filter((row) => row["!type"] === "entry" && row["!group_id"] === folderId.value)
      .map((row) => this.mapRowToEntry(row));
  }

  create(_entry: VaultEntryCreateProps): Promise<VaultEntry> {
    throw new Error("Method not implemented.");
  }

  delete(_id: VaultEntryId): Promise<void> {
    throw new Error("Method not implemented.");
  }

  private mapRowToEntry(row: Record<string, string>): VaultEntry {
    let { "!group_id": groupId, id: rowId, title, ...rest } = row;

    if (!rowId) {
      throw new Error("Row does not have an id field.");
    }
    if (!title) {
      console.warn("Row does not have a title field.");
      title = "Untitled Entry " + rowId;
    }

    if (rest.note) {
      const { note, ...extraFields } = rest;

      return new NoteEntry(
        new VaultEntryId(rowId),
        title.trim(),
        groupId ? new VaultFolderId(groupId) : null,
        this.removeUnnecessaryFields(extraFields),
        note
      );
    }

    const { username, password, url, ...extraFields } = rest;
    const actualUrl = url || extraFields.url || extraFields.URL;

    return new PasswordEntry(
      new VaultEntryId(rowId),
      title.trim(),
      groupId ? new VaultFolderId(groupId) : null,
      this.removeUnnecessaryFields(extraFields),
      username || "",
      password || "",
      actualUrl
    );
  }

  private removeUnnecessaryFields(row: Record<string, string>): Record<string, string> {
    const unnecessaryFields = ["!type", "!group_id", "!group_name", "!group_parent", "url", "URL"];

    return Object.fromEntries(
      Object.entries(row).filter(([key, value]) => !unnecessaryFields.includes(key) && value !== "")
    );
  }
}
