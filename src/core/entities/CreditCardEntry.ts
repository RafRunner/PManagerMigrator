import type { VaultEntryId } from "../valueObjects/VaultEntryId";
import type { VaultFolderId } from "../valueObjects/VoultFolderId";
import type { CreditCardEntryCreateProps } from "../types/VaultEntryTypes";
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
    public readonly cvv: string
  ) {
    super(id, name, folderId, extraFields);
  }

  protected override toJSONExtended(): Record<string, any> {
    return {
      cardCompany: this.cardCompany,
      cardNumber: this.cardNumber,
      cardHolderName: this.cardHolderName,
      expirationDate: CreditCardEntry.formatDateToMMYYYY(this.expirationDate),
      validFrom: CreditCardEntry.formatDateToMMYYYY(this.validFrom),
      cvv: this.cvv,
    };
  }

  public toCreateProps(): CreditCardEntryCreateProps {
    return {
      name: this.name,
      folderId: this.folderId,
      extraFields: this.extraFields,
      cardCompany: this.cardCompany,
      cardNumber: this.cardNumber,
      cardHolderName: this.cardHolderName,
      expirationDate: this.expirationDate,
      validFrom: this.validFrom,
      cvv: this.cvv,
    };
  }

  public static parseMMYYYYDate(dateString: string | undefined): Date | null {
    if (!dateString) {
      return null;
    }

    const [month, year] = dateString.split("/").map((p) => parseInt(p, 10));
    if (!month || !year) {
      return null;
    }

    if (month < 1 || month > 12 || year < 1000) {
      return null;
    }

    return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  }

  public static formatDateToMMYYYY(date: Date | null): string | null {
    if (!date) {
      return null;
    }

    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear().toString();

    return `${month}/${year}`;
  }
}
