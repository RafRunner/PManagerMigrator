import { VaultFolderId } from "./src/core/valueObjects/VoultFolderId";
import { CsvBCupVaultEntryRepository } from "./src/infra/repositories/CsvBCupVaultEntryRepository";
import { CsvFile } from "./src/infra/util/CsvFile.ts";

const [filePath, folderID] = Bun.argv.slice(2);

if (!filePath || !folderID) {
  console.error("Usage: bun run index.ts <csv-file-path> <folder-id>");
  process.exit(1);
}

const file = Bun.file(filePath);
const csvFile = new CsvFile(file);
const repository = new CsvBCupVaultEntryRepository(csvFile);

const fromFolder = await repository.findByFolderId(new VaultFolderId(folderID));

console.log(
  JSON.stringify(
    fromFolder.map((entry) => entry.toJSON()),
    null,
    2
  )
);
