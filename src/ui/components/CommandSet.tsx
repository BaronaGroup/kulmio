export const CommandSet: React.FC = () => {
  return (
    <>
      <ActionButton>▶</ActionButton>
      <ActionButton>■</ActionButton>
      <ActionButton>⟳</ActionButton>
      <ActionButton>☰</ActionButton>
    </>
  )
}

export const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button {...props} className={`${props.className} hover:text-blue-500 mx-0.5`} />
)
