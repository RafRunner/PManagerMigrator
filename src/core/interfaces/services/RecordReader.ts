export interface RecordProvider {
  getRecords(): Promise<Record<string, string>[]>;
}
