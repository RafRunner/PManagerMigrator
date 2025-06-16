import parseCsv from "csv-simple-parser";

export class CsvFile {
  private fileContent: Record<string, string>[] | null = null;

  constructor(private readonly file: Bun.BunFile) {}

  public async getFileContent(): Promise<Record<string, string>[]> {
    if (this.fileContent) {
      return this.fileContent;
    }

    const content = await this.file.text();
    const parsed = parseCsv(content, {
      header: true,
      infer: false,
    });

    this.fileContent = parsed.map((row) => {
      if (Array.isArray(row)) {
        throw new Error("CSV row is an array, expected an object with headers.");
      } else {
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key, String(value || "")])
        );
      }
    });

    return this.fileContent;
  }
}
