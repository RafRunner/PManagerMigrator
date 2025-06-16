import { VaultFolderId } from "../valueObjects/VoultFolderId";
import { Entity } from "./Entity";
import { VaultEntry } from "./VaultEntry";

export class VaultFolder extends Entity<VaultFolderId> {
  constructor(
    id: VaultFolderId,
    readonly name: string,
    readonly parentId: VaultFolderId | null = null,
    readonly entries: VaultEntry[] = []
  ) {
    super(id);
  }

  public addEntrys(entries: VaultEntry[]): void {
    this.entries.push(...entries);
  }

  public override toJSON(): any {
    return {
      id: this.id.toJSON(),
      name: this.name,
      parentId: this.parentId?.toJSON(),
      entries: this.entries.map((entry) => entry.toJSON()),
    };
  }
}
