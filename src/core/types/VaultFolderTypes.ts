import type { VaultFolderId } from "../valueObjects/VoultFolderId";

export interface VaultFolderCreateProps {
  name: string;
  parentId?: VaultFolderId | null;
}
