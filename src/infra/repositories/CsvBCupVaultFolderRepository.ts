import { VaultFolder } from "../../core/entities/VaultFolder";
import type { VaultEntryRepository } from "../../core/interfaces/repositories/VaultEntryRepository";
import type { VaultFolderRepository } from "../../core/interfaces/repositories/VaultFolderRepository";
import type { RecordProvider } from "../../core/interfaces/services/RecordReader";
import type { VaultFolderCreateProps } from "../../core/types/VaultFolderTypes";
import { VaultFolderId } from "../../core/valueObjects/VoultFolderId";
import type { CsvFile } from "../files/CsvFile";

export class CsvBCupVaultFolderRepository implements VaultFolderRepository {
  constructor(
    private readonly file: RecordProvider,
    private readonly entryRepository: VaultEntryRepository
  ) {}

  async findAll(): Promise<VaultFolder[]> {
    const content = await this.file.getRecords();

    const folders = content.filter(
      (row) => row["!type"] === "group" && row["!group_name"] !== "Trash"
    );

    return (
      await Promise.all(
        folders.map(async (row) => {
          const folder = this.mapRowToFolder(row);

          folder.addEntrys(await this.entryRepository.findByFolderId(folder.id));

          return folder;
        })
      )
    ).filter((folder) => folder.entries.length > 0);
  }

  async findById(id: VaultFolderId): Promise<VaultFolder | null> {
    const content = await this.file.getRecords();

    const row = content.find((row) => row["!type"] === "group" && row["!group_id"] === id.value);
    if (!row) {
      return null;
    }

    const folder = this.mapRowToFolder(row);
    const entries = await this.entryRepository.findByFolderId(folder.id);
    folder.addEntrys(entries);
    return folder;
  }

  create(entry: VaultFolderCreateProps): Promise<VaultFolder> {
    throw new Error("Method not implemented.");
  }
  delete(id: VaultFolderId): Promise<void> {
    throw new Error("Method not implemented.");
  }

  private mapRowToFolder(row: Record<string, string>): VaultFolder {
    const { "!group_id": groupId, "!group_name": name, "!group_parent": parentId } = row;
    if (!groupId) {
      throw new Error("Row does not have a group id field.");
    }
    if (!name) {
      throw new Error("Row does not have a name field.");
    }

    let parentFolderId: VaultFolderId | null = null;
    if (parentId && parentId !== "0") {
      parentFolderId = new VaultFolderId(parentId);
    }

    return new VaultFolder(new VaultFolderId(groupId), name.trim(), parentFolderId, []);
  }
}
