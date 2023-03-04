export type Success<TValue> = {
  success: true;
  fail: false;
  value: TValue;
  unwrap: () => TValue;
  unwrapOr: () => TValue;
  unwrapOrElse: () => TValue;
  expect: () => TValue;
};

export type Fail<TError> = {
  success: false;
  fail: true;
  error: TError;
  unwrap: () => never;
  unwrapOr: <TDefault>(defaultValue: TDefault) => TDefault;
  unwrapOrElse: <TReturn>(onError: (error: TError) => TReturn) => TReturn;
  expect: (message: string) => never;
};

export type ResultMethods<TValue, TError> = {
  unwrap: () => TValue;
  unwrapOr: <TDefault>(defaultValue: TDefault) => TValue | TDefault;
  unwrapOrElse: <TReturn>(
    onError: (error: TError) => TReturn
  ) => TValue | TReturn;
  expect: (message: string) => TValue;
};

export type Result<TValue, TError> = (
  | Pick<Success<TValue>, "success" | "fail" | "value">
  | Pick<Fail<TError>, "error" | "fail" | "success">
) &
  ResultMethods<TValue, TError>;

export const success = <TValue>(value: TValue): Success<TValue> => {
  return {
    success: true,
    fail: false,
    value,
    unwrap: () => value,
    unwrapOr: () => value,
    unwrapOrElse: () => value,
    expect: () => value,
  };
};

export const fail = <TError extends Error>(error: TError): Fail<TError> => {
  return {
    success: false,
    fail: true,
    error,
    unwrap: () => {
      throw error;
    },
    unwrapOr: <TDefault>(defaultValue: TDefault) => defaultValue,
    unwrapOrElse: <TReturn>(onError: (error: TError) => TReturn) =>
      onError(error),
    expect: (message: string) => {
      error.message = message;
      throw error;
    },
  };
};
