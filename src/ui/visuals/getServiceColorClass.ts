const availableColors = [
  'text-stone-200',
  'text-orange-200',
  'text-amber-200',
  'text-lime-200',
  'text-red-200',
  'text-green-200',
  'text-cyan-200',
  'text-teal-200',
  'text-sky-200',
  'text-violet-200',
  'text-fuchsia-200',
]

const mapping = new Map<string, string>()

export function getServiceColorClass(serviceName: string) {
  const assigned = mapping.get(serviceName)
  if (assigned) return assigned

  const newColor = availableColors[mapping.size % availableColors.length]
  mapping.set(serviceName, newColor)
  return newColor
}
