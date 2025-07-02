import { VaultFolder } from "../../core/entities/VaultFolder";
import type { VaultEntryRepository } from "../../core/interfaces/repositories/VaultEntryRepository";
import type { VaultFolderRepository } from "../../core/interfaces/repositories/VaultFolderRepository";
import type { VaultFolderCreateProps } from "../../core/types/VaultFolderTypes";
import { VaultFolderId } from "../../core/valueObjects/VoultFolderId";
import type { BitWardenApiClient, BitWardenFolder } from "../api/BitWardenApiClient";
import { BitWardenResourceNotFoundError } from "../api/BitWardenErrors";

export class BitWardenVaultFolderRepository implements VaultFolderRepository {
  constructor(
    private readonly apiClient: BitWardenApiClient,
    private readonly entryRepository: VaultEntryRepository,
  ) {}

  async findAll(): Promise<VaultFolder[]> {
    const bitwardenFolders = await this.apiClient.getFolders();

    // Filter out any folders that might be considered "trash" or deleted
    const activeFolders = bitwardenFolders.filter(
      (folder) =>
        folder.name.toLowerCase() !== "trash" &&
        folder.name.toLowerCase() !== "deleted" &&
        !!folder.id,
    );

    const idByName = new Map<string, VaultFolderId>();

    const folders = await Promise.all(
      activeFolders.map(async (bitwardenFolder) => {
        const entries = await this.entryRepository.findByFolderId(
          new VaultFolderId(bitwardenFolder.id!),
        );

        idByName.set(bitwardenFolder.name, new VaultFolderId(bitwardenFolder.id!));

        return { bitwardenFolder, entries };
      }),
    );

    return folders.map(({ bitwardenFolder, entries }) => {
      const path = bitwardenFolder.name;

      const parts = path.split("/");
      let parentId: VaultFolderId | null = null;

      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join("/");
        const parent = idByName.get(parentPath);

        if (parent) {
          parentId = parent;
        }
      }

      const folder = this.mapBitWardenFolderToVaultFolder(bitwardenFolder, parentId);
      folder.addEntrys(entries);

      return folder;
    });
  }

  async findById(id: VaultFolderId): Promise<VaultFolder | null> {
    try {
      const bitwardenFolder = await this.apiClient.getFolder(id.value);

      const parentName = bitwardenFolder.name.split("/").at(-2);
      let parentId: VaultFolderId | null = null;

      if (parentName) {
        const parent = await this.apiClient.getFolderByName(parentName);
        if (parent?.id) {
          parentId = new VaultFolderId(parent.id);
        }
      }

      const folder = this.mapBitWardenFolderToVaultFolder(bitwardenFolder, parentId);
      const entries = await this.entryRepository.findByFolderId(folder.id);
      folder.addEntrys(entries);
      return folder;
    } catch (error) {
      // If folder not found, return null
      if (error instanceof BitWardenResourceNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async create(folderProps: VaultFolderCreateProps): Promise<VaultFolder> {
    let fullName = folderProps.name;
    let parentId: VaultFolderId | null = null;

    if (folderProps.parentId) {
      const parentFolder = await this.findById(folderProps.parentId);
      if (parentFolder) {
        fullName = `${parentFolder.name}/${fullName}`;
        parentId = parentFolder.id;
      }
    }
    const bitwardenFolder = await this.apiClient.createFolder(fullName);
    return this.mapBitWardenFolderToVaultFolder(bitwardenFolder, parentId);
  }

  async delete(id: VaultFolderId): Promise<void> {
    await this.apiClient.deleteFolder(id.value);
  }

  private mapBitWardenFolderToVaultFolder(
    bitwardenFolder: BitWardenFolder,
    parentId: VaultFolderId | null,
  ): VaultFolder {
    const folderId = bitwardenFolder.id;
    if (!folderId) {
      // Bitwarden has a special "folder" to represent no folder
      throw new Error("Bitwarden 'No Folder' should not be mapped.");
    }

    const parts = bitwardenFolder.name.trim().split("/");
    const name = parts.pop() as string;

    return new VaultFolder(new VaultFolderId(folderId), name, parentId, []);
  }
}
