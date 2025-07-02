import type { VaultEntryId } from "../valueObjects/VaultEntryId";
import type { VaultFolderId } from "../valueObjects/VoultFolderId";
import type { PasswordEntryCreateProps } from "../types/VaultEntryTypes";
import { VaultEntry } from "./VaultEntry";

export class PasswordEntry extends VaultEntry {
  readonly url?: string;

  constructor(
    id: VaultEntryId,
    name: string,
    folderId: VaultFolderId | null,
    extraFields: Record<string, string>,
    readonly username: string,
    readonly password: string,
    url?: string,
  ) {
    super(id, name, folderId, extraFields);

    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      this.url = url;
    }
  }

  public override toJSONExtended(): Record<string, any> {
    return {
      username: this.username,
      password: this.password,
      url: this.url ?? undefined,
    };
  }

  public toCreateProps(): PasswordEntryCreateProps {
    return {
      name: this.name,
      folderId: this.folderId,
      extraFields: this.extraFields,
      username: this.username,
      password: this.password,
      url: this.url,
    };
  }
}
