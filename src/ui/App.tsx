import './App.css'



import { DataProvider } from './data/DataContext'
import { SelectionProvider } from './selection/SelectionContext'
import { Views } from './Views'

function App() {
  return (
    <DataProvider>
      <SelectionProvider>
        <div className="container mx-auto">
          <Views />
        </div>
      </SelectionProvider>
    </DataProvider>
  )
}

export default App
