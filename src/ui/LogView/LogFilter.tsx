export const LogFilter: React.FC = () => {
  return (
    <div className="bg-slate-200 p-2  flex space-x-2">
      <div>Filter</div>
      <input className="grow px-2" />
      <div>
        <select value="text" className="bg-slate-200">
          <option value="text">Text</option>
          <option value="regex">Regex</option>
        </select>
      </div>
    </div>
  )
}
