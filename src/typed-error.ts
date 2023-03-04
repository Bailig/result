export type StringLiteral<T> = T extends string
  ? string extends T
    ? "Type must be a string literal, add 'as const' to the end of the string"
    : T
  : never;

export type TypedErrorOptions<TType, TData> = {
  type: TType;
  message?: string;
  data?: TData;
};

export class TypedError<
  TOptions extends TypedErrorOptions<
    StringLiteral<TOptions["type"]>,
    any
  > = never
> extends Error {
  type: StringLiteral<TOptions["type"]>;
  data: TOptions["data"];
  constructor(options: TOptions) {
    super(options.message);
    this.type = options.type;
    this.data = options.data;
  }
}

export const Err = TypedError;
