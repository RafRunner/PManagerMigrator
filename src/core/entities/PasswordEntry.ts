import { VaultEntryId } from "../valueObjects/VaultEntryId";
import { VaultFolderId } from "../valueObjects/VoultFolderId";
import { VaultEntry } from "./VaultEntry";

export class PasswordEntry extends VaultEntry {
  readonly url?: string;

  constructor(
    id: VaultEntryId,
    name: string,
    folderId: VaultFolderId | null = null,
    extraFields: Record<string, string> = {},
    readonly username: string,
    readonly password: string,
    url?: string
  ) {
    super(id, name, folderId, extraFields);

    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      this.url = url;
    }
  }

  public override toJSON() {
    return {
      ...this.toJSONCore(),
      username: this.username,
      password: this.password,
      url: this.url ?? undefined,
    };
  }
}
