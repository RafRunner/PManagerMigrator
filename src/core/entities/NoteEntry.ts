import { VaultEntryId } from "../valueObjects/VaultEntryId";
import { VaultFolderId } from "../valueObjects/VoultFolderId";
import type { NoteEntryCreateProps } from "../types/VaultEntryTypes";
import { VaultEntry } from "./VaultEntry";

export class NoteEntry extends VaultEntry {
  constructor(
    id: VaultEntryId,
    name: string,
    folderId: VaultFolderId | null,
    extraFields: Record<string, string>,
    readonly content: string
  ) {
    super(id, name, folderId, extraFields);
  }

  protected override toJSONExtended(): Record<string, any> {
    return {
      content: this.content,
    };
  }

  public toCreateProps(): NoteEntryCreateProps {
    return {
      name: this.name,
      folderId: this.folderId,
      extraFields: this.extraFields,
      content: this.content,
    };
  }
}
