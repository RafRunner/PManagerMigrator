import { VaultEntryId } from "../valueObjects/VaultEntryId";
import { VaultFolderId } from "../valueObjects/VoultFolderId";
import { VaultEntry } from "./VaultEntry";

export class NoteEntry extends VaultEntry {
  constructor(
    id: VaultEntryId,
    name: string,
    folderId: VaultFolderId | null = null,
    extraFields: Record<string, string> = {},
    readonly content: string = ""
  ) {
    super(id, name, folderId, extraFields);
  }

  public override toJSON() {
    return {
      ...this.toJSONCore(),
      content: this.content,
    };
  }
}
