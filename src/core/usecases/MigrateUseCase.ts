import type { VaultEntry } from "../entities/VaultEntry";
import type { VaultFolder } from "../entities/VaultFolder";
import type { VaultEntryRepository } from "../interfaces/repositories/VaultEntryRepository";
import type { VaultFolderRepository } from "../interfaces/repositories/VaultFolderRepository";
import { Vault } from "../model/Vault";
import type { VaultFolderId } from "../valueObjects/VoultFolderId";
import { AbstractUseCase } from "./AbstractUseCase";

interface MigrateUseCaseInput {
  sourceFolderRepository: VaultFolderRepository;
  sourceEntryRepository: VaultEntryRepository;

  targetFolderRepository: VaultFolderRepository;
  targetEntryRepository: VaultEntryRepository;

  clearTarget: boolean;
}

export class MigrateUseCase extends AbstractUseCase<MigrateUseCaseInput, void> {
  protected override async executeCore(input: MigrateUseCaseInput): Promise<void> {
    console.log("Starting migration...");

    const [sourceFolders, targetFolders] = await Promise.all([
      input.sourceFolderRepository.findAll(),
      input.targetFolderRepository.findAll(),
    ]);

    const [sourceRootEntries, targetRootEntries] = await Promise.all([
      input.sourceEntryRepository.findByFolderId(null),
      input.targetEntryRepository.findByFolderId(null),
    ]);

    let targetVault = new Vault();

    if (input.clearTarget) {
      await this.clearTargetVault(targetFolders, input, targetRootEntries);
    } else {
      targetVault.addFolders(targetFolders);
      targetVault.addEntries(targetRootEntries);
      console.log("Target vault initialized with existing folders and entries.");
    }

    const sourceVault = new Vault();
    sourceVault.addFolders(sourceFolders);
    sourceVault.addEntries(sourceRootEntries);

    for (const folder of sourceVault.getRootFolders()) {
      await this.migrateFolder(folder, null, sourceVault, targetVault, input);
    }

    console.log("Migrating root entries...");
    await this.migrateEntries(sourceRootEntries, null, targetVault, input);

    console.log("Migration completed successfully.");
  }

  private async clearTargetVault(
    targetFolders: VaultFolder[],
    input: MigrateUseCaseInput,
    targetRootEntries: VaultEntry[]
  ) {
    console.log("Clearing target folders and entries...");

    for (const folder of targetFolders) {
      for (const entry of folder.entries) {
        console.log(`Deleting entry: ${entry.name} from folder: ${folder.name}`);
        await input.targetEntryRepository.delete(entry.id);
      }
      console.log(`Deleting folder: ${folder.name}`);
      await input.targetFolderRepository.delete(folder.id);
    }

    for (const entry of targetRootEntries) {
      console.log(`Deleting root entry: ${entry.name}`);
      await input.targetEntryRepository.delete(entry.id);
    }
  }

  private async migrateFolder(
    sourceFolder: VaultFolder,
    parentFolderId: VaultFolderId | null,
    sourceVault: Vault,
    targetVault: Vault,
    input: MigrateUseCaseInput
  ): Promise<void> {
    console.log(`Migrating folder: ${sourceFolder.name}`);

    let newFolder: VaultFolder | null = null;

    if (!input.clearTarget) {
      const existingFolder = targetVault.findFolderByName(sourceFolder.name);
      const sourceParentFolder = sourceVault.getParentFolder(sourceFolder);

      // Check if the folder already exists in the target vault (needs to match both name and parent folder)
      if (existingFolder && existingFolder.parentName === sourceParentFolder?.name) {
        console.log(`Folder already exists: ${existingFolder.folder.name}`);
        newFolder = existingFolder.folder;
      }
    }

    if (!newFolder) {
      newFolder = await input.targetFolderRepository.create({
        name: sourceFolder.name,
        parentId: parentFolderId,
      });
    }

    await this.migrateEntries(sourceFolder.entries, newFolder, targetVault, input);

    for (const subFolder of sourceVault.getChildFolders(sourceFolder.id)) {
      await this.migrateFolder(subFolder, newFolder.id, sourceVault, targetVault, input);
    }
  }

  private async migrateEntries(
    entries: VaultEntry[],
    newFolder: VaultFolder | null,
    targetVault: Vault,
    input: MigrateUseCaseInput
  ) {
    for (const entry of entries) {
      console.log(`Migrating entry: ${entry.name} to folder: ${newFolder?.name}`);

      if (!input.clearTarget) {
        const existingEntry = targetVault.findEntryByName(entry.name);

        // Check if the entry already exists in the target vault (needs to match both name and folder)
        if (existingEntry && existingEntry.folderName === newFolder?.name) {
          console.log(`Entry already exists: ${existingEntry.entry.name}, skipping.`);
          continue;
        }
      }

      await input.targetEntryRepository.create({
        ...entry.toCreateProps(),
        folderId: newFolder?.id ?? null,
      });
    }
  }
}
