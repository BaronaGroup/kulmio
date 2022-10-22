const availableColors = [
  'text-stone-600',
  'text-orange-600',
  'text-amber-600',
  'text-lime-600',
  'text-red-600',
  'text-green-600',
  'text-cyan-600',
  'text-teal-600',
  'text-sky-600',
  'text-violet-600',
  'text-fuchsia-600',
]

const mapping = new Map<string, string>()

export function getServiceColorClass(serviceName: string) {
  const assigned = mapping.get(serviceName)
  if (assigned) return assigned

  const newColor = availableColors[mapping.size % availableColors.length]
  mapping.set(serviceName, newColor)
  return newColor
}
