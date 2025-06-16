import { VaultFolderId } from "../valueObjects/VoultFolderId";
import { Entity } from "./Entity";
import { VaultEntry } from "./VaultEntry";

export class VaultFolder extends Entity<VaultFolderId> {
  constructor(
    id: VaultFolderId,
    readonly name: string,
    readonly children: VaultFolder[] = [],
    readonly entries: VaultEntry[] = []
  ) {
    super(id);
  }

  public override toJSON(): any {
    return {
      id: this.id.toString(),
      name: this.name,
      children: this.children.map(child => child.toJSON()),
      entries: this.entries.map(entry => entry.toJSON())
    };
  }
}
