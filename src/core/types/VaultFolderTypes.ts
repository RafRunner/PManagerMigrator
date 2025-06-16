import { VaultFolderId } from "../valueObjects/VoultFolderId";

export type VaultFolderCreateProps = {
  name: string;
  parentId?: VaultFolderId | null;
};
