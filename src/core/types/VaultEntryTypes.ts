import type { VaultFolderId } from "../valueObjects/VoultFolderId";

export type AbstractVaultEntryCreateProps = {
  name: string;
  folderId?: VaultFolderId | null;
  extraFields?: Record<string, string>;
};

export type PasswordEntryCreateProps = AbstractVaultEntryCreateProps & {
  username: string;
  password: string;
  url?: string;
};

export type NoteEntryCreateProps = AbstractVaultEntryCreateProps & {
  content?: string;
};

export type VaultEntryCreateProps = PasswordEntryCreateProps | NoteEntryCreateProps;
