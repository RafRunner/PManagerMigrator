import type { VaultFolder } from "../../entities/VaultFolder";
import type { VaultFolderCreateProps } from "../../types/VaultFolderTypes";
import type { VaultFolderId } from "../../valueObjects/VoultFolderId";

export interface VaultFolderRepository {
  findAll(): Promise<VaultFolder[]>;
  findById(id: VaultFolderId): Promise<VaultFolder | null>;
  create(entry: VaultFolderCreateProps): Promise<VaultFolder>;
  delete(id: VaultFolderId): Promise<void>;
}
