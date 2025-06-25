import type { RepositoryFactory } from "../../core/interfaces/factories/RepositoryFactory";
import type { CsvFile } from "../files/CsvFile";
import { CsvBCupVaultEntryRepository } from "../repositories/CsvBCupVaultEntryRepository";
import { CsvBCupVaultFolderRepository } from "../repositories/CsvBCupVaultFolderRepository";

export class CsvBCupRepositoryFactory implements RepositoryFactory {
  private readonly entryRepository: CsvBCupVaultEntryRepository;
  private readonly folderRepository: CsvBCupVaultFolderRepository;

  constructor(private readonly csvFile: CsvFile) {
    this.entryRepository = new CsvBCupVaultEntryRepository(this.csvFile);
    this.folderRepository = new CsvBCupVaultFolderRepository(this.csvFile, this.entryRepository);
  }

  getFolderRepository(): CsvBCupVaultFolderRepository {
    return this.folderRepository;
  }

  getEntryRepository(): CsvBCupVaultEntryRepository {
    return this.entryRepository;
  }
}
