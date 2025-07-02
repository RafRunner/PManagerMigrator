import type { VaultEntryRepository } from "../interfaces/repositories/VaultEntryRepository";
import type { VaultFolderRepository } from "../interfaces/repositories/VaultFolderRepository";
import { Vault } from "../model/Vault";
import { AbstractUseCase } from "./AbstractUseCase";

export class GetVaultUseCase extends AbstractUseCase<void, Vault> {
  constructor(
    private readonly entryRepository: VaultEntryRepository,
    private readonly folderRepository: VaultFolderRepository,
  ) {
    super();
  }

  protected override async executeCore(): Promise<Vault> {
    const [folders, entries] = await Promise.all([
      this.folderRepository.findAll(),
      this.entryRepository.findByFolderId(null),
    ]);

    const vault = new Vault();
    vault.addFolders(folders);
    vault.addEntries(entries);

    return vault;
  }
}
