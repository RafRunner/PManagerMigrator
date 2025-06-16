export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = props;
    this.validate(props);
  }

  protected abstract validate(props: T): void;

  public equals(vo?: any): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (this.constructor.name !== vo.constructor.name) {
      return false;
    }

    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  public get value(): T {
    return this.props;
  }

  public toJSON(): any {
    return this.props;
  }
}
