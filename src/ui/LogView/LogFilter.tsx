export const LogFilter: React.FC = () => {
  return (
    <div className="bg-slate-800 p-2 text-blue-200 flex space-x-2">
      <div>Filter</div>
      <input className="grow bg-slate-500 px-2" />
      <div>
        <select value="text" className="bg-slate-800">
          <option value="text">Text</option>
          <option value="regex">Regex</option>
        </select>
      </div>
    </div>
  )
}
