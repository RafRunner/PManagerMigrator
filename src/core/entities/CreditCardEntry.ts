import type { VaultEntryId } from "../valueObjects/VaultEntryId";
import type { VaultFolderId } from "../valueObjects/VoultFolderId";
import { VaultEntry } from "./VaultEntry";

export class CreditCardEntry extends VaultEntry {
  constructor(
    id: VaultEntryId,
    name: string,
    folderId: VaultFolderId | null,
    extraFields: Record<string, string>,
    public readonly cardCompany: string,
    public readonly cardNumber: string,
    public readonly cardHolderName: string,
    public readonly expirationDate: Date | null,
    public readonly validFrom: Date | null,
    public readonly cvv: string,
  ) {
    super(id, name, folderId, extraFields);
  }

  public override toJSON(): Record<string, any> {
    return {
      ...this.toJSONCore(),
      cardCompany: this.cardCompany,
      cardNumber: this.cardNumber,
      cardHolderName: this.cardHolderName,
      expirationDate: this.formatDateToMMYYYY(this.expirationDate),
      validFrom: this.formatDateToMMYYYY(this.validFrom),
      cvv: this.cvv,
    };
  }

  private formatDateToMMYYYY(date: Date | null): string | null {
    if (!date) {
      return null;
    }

    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear().toString();

    return `${month}/${year}`;
  }
}
