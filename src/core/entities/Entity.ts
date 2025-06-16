import { ValueObject } from "../valueObjects/ValueObject";

export abstract class Entity<T> {
  constructor(public readonly id: T) {}

  public equals(entity?: any): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this.constructor.name !== entity.constructor?.name) {
      return false;
    }

    if (this.id instanceof ValueObject) {
      return this.id.equals(entity.id);
    }

    return JSON.stringify(this.id) === JSON.stringify(entity.id);
  }

  public abstract toJSON(): any;
}
