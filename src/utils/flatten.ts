export default function flatten<T>(toFlatten: T[][]): T[] {
  return ([] as T[]).concat(...toFlatten)
}
