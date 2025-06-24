import type { VaultEntry } from "../entities/VaultEntry";
import type { VaultFolder } from "../entities/VaultFolder";
import type { VaultFolderId } from "../valueObjects/VoultFolderId";
import type { VaultEntryId } from "../valueObjects/VaultEntryId";

export class Vault {
  private folders: Map<string, VaultFolder> = new Map();
  private entries: Map<string, VaultEntry> = new Map();
  private rootFolders: VaultFolder[] = [];
  private rootEntries: VaultEntry[] = [];

  public addFolder(folder: VaultFolder): void {
    this.folders.set(folder.id.value, folder);
    this.updateHierarchy();
  }

  public addEntry(entry: VaultEntry): void {
    this.entries.set(entry.id.value, entry);
    this.updateHierarchy();
  }

  public addFolders(folders: VaultFolder[]): void {
    folders.forEach((folder) => this.folders.set(folder.id.value, folder));
    this.updateHierarchy();
  }

  public addEntries(entries: VaultEntry[]): void {
    entries.forEach((entry) => this.entries.set(entry.id.value, entry));
    this.updateHierarchy();
  }

  public findFolder(id: VaultFolderId): VaultFolder | undefined {
    return this.folders.get(id.value);
  }

  public findEntry(id: VaultEntryId): VaultEntry | undefined {
    return this.entries.get(id.value);
  }

  public getRootFolders(): readonly VaultFolder[] {
    return this.rootFolders;
  }

  public getRootEntries(): readonly VaultEntry[] {
    return this.rootEntries;
  }

  public getAllFolders(): readonly VaultFolder[] {
    return Array.from(this.folders.values());
  }

  public getAllEntries(): readonly VaultEntry[] {
    return Array.from(this.entries.values());
  }

  public getChildFolders(parentId: VaultFolderId): VaultFolder[] {
    return Array.from(this.folders.values()).filter((folder) => parentId.equals(folder.parentId));
  }

  public toJSON(): any {
    return {
      rootFolders: this.rootFolders.map((folder) => this.buildFolderHierarchy(folder)),
      rootEntries: this.rootEntries.map((entry) => entry.toJSON()),
    };
  }

  private updateHierarchy(): void {
    this.rootFolders = [];
    this.rootEntries = [];

    // Identify root folders (folders with no parent)
    for (const folder of this.folders.values()) {
      if (folder.parentId === null) {
        this.rootFolders.push(folder);
      }
    }

    // Identify root entries (entries not in any folder)
    for (const entry of this.entries.values()) {
      if (entry.folderId === null) {
        this.rootEntries.push(entry);
      }
    }
  }

  private buildFolderHierarchy(folder: VaultFolder): any {
    const childFolders = this.getChildFolders(folder.id);
    const folderEntries = folder.entries;

    return {
      ...folder.toJSON(),
      childFolders: childFolders.map((child) => this.buildFolderHierarchy(child)),
      entries: folderEntries.map((entry) => entry.toJSON()),
    };
  }
}
