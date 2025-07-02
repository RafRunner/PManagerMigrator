import type { VaultEntryId } from "../valueObjects/VaultEntryId";
import type { VaultFolderId } from "../valueObjects/VoultFolderId";
import type { VaultEntryCreateProps } from "../types/VaultEntryTypes";
import { Entity } from "./Entity";

export abstract class VaultEntry extends Entity<VaultEntryId> {
  constructor(
    id: VaultEntryId,
    readonly name: string,
    readonly folderId: VaultFolderId | null,
    readonly extraFields: Record<string, string>,
  ) {
    super(id);
  }

  public override toJSON(): Record<string, any> {
    return {
      id: this.id.toJSON(),
      name: this.name,
      folderId: this.folderId,
      extraFields: this.extraFields,
      ...this.toJSONExtended(),
    };
  }

  protected abstract toJSONExtended(): Record<string, any>;

  public abstract toCreateProps(): VaultEntryCreateProps;
}
