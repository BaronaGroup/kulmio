export type TypeByPath<TObj, TPath> = TPath extends keyof TObj
  ? TObj[TPath]
  : TPath extends `${infer TFirst}.${infer TRest}`
  ? TFirst extends keyof TObj
    ? TypeByPath<TObj[TFirst], TRest>
    : never
  : never

export type PathOf<T> =
  | Exclude<keyof T, symbol>
  | (T extends Record<string, unknown>
      ? {
          [K in Exclude<keyof T, symbol>]: symbol extends K
            ? never
            : T[K] extends string | Date | number | boolean | null | undefined | any[]
            ? never
            : `${K}.${PathOf<T[K]>}`
        }[Exclude<keyof T, symbol>]
      : never)
