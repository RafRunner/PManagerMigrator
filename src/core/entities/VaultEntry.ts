import { VaultEntryId } from "../valueObjects/VaultEntryId";
import { VaultFolderId } from "../valueObjects/VoultFolderId";
import type { VaultEntryCreateProps } from "../types/VaultEntryTypes";
import { Entity } from "./Entity";

export abstract class VaultEntry extends Entity<VaultEntryId> {
  constructor(
    id: VaultEntryId,
    readonly name: string,
    readonly folderId: VaultFolderId | null,
    readonly extraFields: Record<string, string>
  ) {
    super(id);
  }

  protected toJSONCore(): any {
    return {
      id: this.id,
      name: this.name,
      folderId: this.folderId,
      extraFields: this.extraFields,
    };
  }

  public abstract toCreateProps(): VaultEntryCreateProps;
}
