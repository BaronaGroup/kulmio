export type PromisedType<T> = T extends Promise<infer U> ? U : T
export type Existing<T> = T extends undefined | null ? never : T
