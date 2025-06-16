import { VaultFolderId } from "./src/core/valueObjects/VoultFolderId";
import { CsvBCupVaultEntryRepository } from "./src/infra/repositories/CsvBCupVaultEntryRepository";
import { CsvFile } from "./src/infra/files/CsvFile.ts";
import { CsvBCupVaultFolderRepository } from "./src/infra/repositories/CsvBCupVaultFolderRepository.ts";

const [filePath] = Bun.argv.slice(2);

if (!filePath) {
  console.error("Usage: bun run index.ts <csv-file-path>");
  process.exit(1);
}

const file = Bun.file(filePath);
const csvFile = new CsvFile(file);
const repository = new CsvBCupVaultFolderRepository(
  csvFile,
  new CsvBCupVaultEntryRepository(csvFile)
);

const folders = await repository.findAll();

console.log(
  JSON.stringify(
    folders.map((entry) => entry.toJSON()),
    null,
    2
  )
);
