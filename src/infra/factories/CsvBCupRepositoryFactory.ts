import type { RepositoryFactory } from "../../core/interfaces/factories/RepositoryFactory";
import type { RecordProvider } from "../../core/interfaces/services/RecordReader";
import { CsvBCupVaultEntryRepository } from "../repositories/CsvBCupVaultEntryRepository";
import { CsvBCupVaultFolderRepository } from "../repositories/CsvBCupVaultFolderRepository";

export class CsvBCupRepositoryFactory implements RepositoryFactory {
  private readonly entryRepository: CsvBCupVaultEntryRepository;
  private readonly folderRepository: CsvBCupVaultFolderRepository;

  constructor(recordProvider: RecordProvider) {
    this.entryRepository = new CsvBCupVaultEntryRepository(recordProvider);
    this.folderRepository = new CsvBCupVaultFolderRepository(recordProvider, this.entryRepository);
  }

  getFolderRepository(): CsvBCupVaultFolderRepository {
    return this.folderRepository;
  }

  getEntryRepository(): CsvBCupVaultEntryRepository {
    return this.entryRepository;
  }
}
