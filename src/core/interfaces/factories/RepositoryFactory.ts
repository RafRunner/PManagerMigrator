import type { VaultEntryRepository } from "../repositories/VaultEntryRepository";
import type { VaultFolderRepository } from "../repositories/VaultFolderRepository";

export interface RepositoryFactory {
  getEntryRepository(): VaultEntryRepository;
  getFolderRepository(): VaultFolderRepository;
}
