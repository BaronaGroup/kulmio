import React, { useCallback, useMemo } from 'react'

export interface SelectOption<T> {
  label: string
  value: T
}

interface Props<TValue> {
  value: TValue
  onChange(value: TValue): void
  options: Array<SelectOption<TValue>>
}

export function Select<T>({ value, options, onChange }: Props<T>) {
  const selectValue = useMemo(() => options.findIndex((opt) => opt.value === value), [options, value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(options[+e.target.value].value)
    },
    [onChange, options]
  )

  return (
    <select value={selectValue} onChange={handleChange}>
      {options.map((opt, i) => (
        <option key={i} value={i}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
