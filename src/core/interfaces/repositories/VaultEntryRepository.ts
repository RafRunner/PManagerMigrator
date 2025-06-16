import type { VaultEntry } from "../../entities/VaultEntry";
import type { VaultEntryCreateProps } from "../../types/VaultEntryTypes";
import type { VaultEntryId } from "../../valueObjects/VaultEntryId";
import type { VaultFolderId } from "../../valueObjects/VoultFolderId";

export interface VaultEntryRepository {
  findById(id: VaultEntryId): Promise<VaultEntry | null>;
  findByFolderId(folderId: VaultFolderId): Promise<VaultEntry[]>;
  create(entry: VaultEntryCreateProps): Promise<VaultEntry>;
  delete(id: VaultEntryId): Promise<void>;
}
