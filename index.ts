import { CsvFile } from "./src/infra/files/CsvFile.ts";
import { BitWardenConfigBuilder } from "./src/infra/config/BitWardenConfig.ts";
import { BitWardenRepositoryFactory } from "./src/infra/factories/BitWardenRepositoryFactory.ts";
import { MigrateUseCase } from "./src/core/usecases/MigrateUseCase.ts";
import { CsvBCupRepositoryFactory } from "./src/infra/factories/CsvBCupRepositoryFactory.ts";

const [filePath] = Bun.argv.slice(2);

if (!filePath) {
  console.error("Usage: bun run index.ts <csv-file-path>");
  process.exit(1);
}

const file = Bun.file(filePath);
const csvFile = new CsvFile(file);

const bCupFactory = new CsvBCupRepositoryFactory(csvFile);
const bCupEntryRepository = bCupFactory.getEntryRepository();
const bCupFolderRepository = bCupFactory.getFolderRepository();

const config = BitWardenConfigBuilder.fromEnvironment();

const bitFactory = new BitWardenRepositoryFactory(config);
const bitWardenFolderRepository = bitFactory.getFolderRepository();
const bitWardenEntryRepository = bitFactory.getEntryRepository();

const migrateUseCase = new MigrateUseCase(
  bCupFolderRepository,
  bCupEntryRepository,
  bitWardenFolderRepository,
  bitWardenEntryRepository,
);

try {
  await migrateUseCase.execute({
    clearTarget: false,
  });
} catch (error) {
  console.error("Migration failed:\n", error);
}
