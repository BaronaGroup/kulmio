import { useReducer } from 'react'

export function useRerender() {
  const [, rerender] = useReducer((x) => x + 1, 0)
  return rerender
}
