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

    if (input.clearTarget) {
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

    const sourceVault = new Vault();

    sourceVault.addFolders(sourceFolders);
    sourceVault.addEntries(sourceRootEntries);

    for (const folder of sourceVault.getRootFolders()) {
      await this.migrateFolder(folder, null, sourceVault, input);
    }

    console.log("Migrating root entries...");
    for (const entry of sourceRootEntries) {
      console.log(`Migrating root entry: ${entry.name}`);
      await input.targetEntryRepository.create(entry.toCreateProps());
    }

    console.log("Migration completed successfully.");
  }

  private async migrateFolder(
    sourceFolder: VaultFolder,
    parentFolderId: VaultFolderId | null,
    sourceVault: Vault,
    input: MigrateUseCaseInput
  ): Promise<void> {
    console.log(`Migrating folder: ${sourceFolder.name}`);

    const newFolder = await input.targetFolderRepository.create({
      name: sourceFolder.name,
      parentId: parentFolderId,
    });

    for (const entry of sourceFolder.entries) {
      console.log(`Migrating entry: ${entry.name} to folder: ${newFolder.name}`);

      await input.targetEntryRepository.create({
        ...entry.toCreateProps(),
        folderId: newFolder.id,
      });
    }

    for (const subFolder of sourceVault.getChildFolders(sourceFolder.id)) {
      await this.migrateFolder(subFolder, newFolder.id, sourceVault, input);
    }
  }
}
