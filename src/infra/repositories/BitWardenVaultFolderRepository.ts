import { VaultFolder } from "../../core/entities/VaultFolder";
import type { VaultEntryRepository } from "../../core/interfaces/repositories/VaultEntryRepository";
import type { VaultFolderRepository } from "../../core/interfaces/repositories/VaultFolderRepository";
import type { VaultFolderCreateProps } from "../../core/types/VaultFolderTypes";
import { VaultFolderId } from "../../core/valueObjects/VoultFolderId";
import type { BitWardenApiClient, BitWardenFolder } from "../api/BitWardenApiClient";

export class BitWardenVaultFolderRepository implements VaultFolderRepository {
  constructor(
    private readonly apiClient: BitWardenApiClient,
    private readonly entryRepository: VaultEntryRepository
  ) {}

  async findAll(): Promise<VaultFolder[]> {
    const bitwardenFolders = await this.apiClient.getFolders();

    // Filter out any folders that might be considered "trash" or deleted
    const activeFolders = bitwardenFolders.filter(
      (folder) => folder.name.toLowerCase() !== "trash" && folder.name.toLowerCase() !== "deleted"
    );

    const folders = await Promise.all(
      activeFolders.map(async (bitwardenFolder) => {
        const folder = this.mapBitWardenFolderToVaultFolder(bitwardenFolder);
        const entries = await this.entryRepository.findByFolderId(folder.id);
        folder.addEntrys(entries);
        return folder;
      })
    );

    // Only return folders that have entries
    return folders.filter((folder) => folder.entries.length > 0);
  }

  async findById(id: VaultFolderId): Promise<VaultFolder | null> {
    try {
      const bitwardenFolder = await this.apiClient.getFolder(id.value);
      const folder = this.mapBitWardenFolderToVaultFolder(bitwardenFolder);
      const entries = await this.entryRepository.findByFolderId(folder.id);
      folder.addEntrys(entries);
      return folder;
    } catch (error) {
      // If folder not found, return null
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  async create(folderProps: VaultFolderCreateProps): Promise<VaultFolder> {
    const bitwardenFolder = await this.apiClient.createFolder(folderProps.name);
    return this.mapBitWardenFolderToVaultFolder(bitwardenFolder);
  }

  async delete(id: VaultFolderId): Promise<void> {
    await this.apiClient.deleteFolder(id.value);
  }

  private mapBitWardenFolderToVaultFolder(bitwardenFolder: BitWardenFolder): VaultFolder {
    // BitWarden folders don't have explicit parent-child relationships in the API
    // They use a flat structure, so parentId will always be null
    return new VaultFolder(
      new VaultFolderId(bitwardenFolder.id),
      bitwardenFolder.name.trim(),
      null, // BitWarden API doesn't support folder hierarchy in the same way
      []
    );
  }
}
