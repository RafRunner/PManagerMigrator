import { ValueObject } from "./ValueObject";

export class VaultFolderId extends ValueObject<string> {
  constructor(id: string) {
    super(id);
  }

  override validate(id: string): void {
    if (id.trim() === "") {
      throw new Error("Invalid VaultFolderId: must be a non-empty string.");
    }
  }
}
