import type { RepositoryFactory } from "../../core/interfaces/factories/RepositoryFactory";
import { BitWardenApiClient } from "../api/BitWardenApiClient";
import type { BitWardenConfig } from "../config/BitWardenConfig";
import { BitWardenVaultEntryRepository } from "../repositories/BitWardenVaultEntryRepository";
import { BitWardenVaultFolderRepository } from "../repositories/BitWardenVaultFolderRepository";

export class BitWardenRepositoryFactory implements RepositoryFactory {
  private apiClient: BitWardenApiClient;
  private entryRepository: BitWardenVaultEntryRepository;
  private folderRepository: BitWardenVaultFolderRepository;

  constructor(config: BitWardenConfig) {
    this.apiClient = new BitWardenApiClient(config);
    this.entryRepository = new BitWardenVaultEntryRepository(this.apiClient);
    this.folderRepository = new BitWardenVaultFolderRepository(
      this.apiClient,
      this.entryRepository
    );
  }

  getEntryRepository(): BitWardenVaultEntryRepository {
    return this.entryRepository;
  }

  getFolderRepository(): BitWardenVaultFolderRepository {
    return this.folderRepository;
  }

  getApiClient(): BitWardenApiClient {
    return this.apiClient;
  }
}
