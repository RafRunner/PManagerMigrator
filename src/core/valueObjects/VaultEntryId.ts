import { ValueObject } from "./ValueObject";

export class VaultEntryId extends ValueObject<string> {
  constructor(id: string) {
    super(id);
  }

  override validate(id: string): void {
    if (id.trim() === "") {
      throw new Error("Invalid VaultEntryId: must be a non-empty string.");
    }
  }
}
