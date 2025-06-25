import { CsvBCupVaultEntryRepository } from "./src/infra/repositories/CsvBCupVaultEntryRepository";
import { CsvFile } from "./src/infra/files/CsvFile.ts";
import { CsvBCupVaultFolderRepository } from "./src/infra/repositories/CsvBCupVaultFolderRepository.ts";
import { BitWardenConfigBuilder } from "./src/infra/config/BitWardenConfig.ts";
import { BitWardenRepositoryFactory } from "./src/infra/factories/BitWardenRepositoryFactory.ts";
import { MigrateUseCase } from "./src/core/usecases/MigrateUseCase.ts";

const [filePath] = Bun.argv.slice(2);

if (!filePath) {
  console.error("Usage: bun run index.ts <csv-file-path>");
  process.exit(1);
}

const file = Bun.file(filePath);
const csvFile = new CsvFile(file);
const bCupEntryRepository = new CsvBCupVaultEntryRepository(csvFile);
const bCupFolderRepository = new CsvBCupVaultFolderRepository(csvFile, bCupEntryRepository);

const config = BitWardenConfigBuilder.fromEnvironment();

const factory = new BitWardenRepositoryFactory(config);
const bitWardenFolderRepository = factory.getFolderRepository();
const bitWardenEntryRepository = factory.getEntryRepository();

const migrateUseCase = new MigrateUseCase();

try {
  await migrateUseCase.execute({
    sourceFolderRepository: bCupFolderRepository,
    sourceEntryRepository: bCupEntryRepository,

    targetFolderRepository: bitWardenFolderRepository,
    targetEntryRepository: bitWardenEntryRepository,

    clearTarget: false,
  });
} catch (error) {
  console.error("Migration failed:\n", error);
}
