import './App.css'

import { AppStateProvider } from './appState'
import { ConnectionStatusBanner } from './components/ConnectionStatusBanner'
import { DataProvider } from './data/DataContext'
import { SelectionProvider } from './selection/SelectionContext'
import { Views } from './Views'

function App() {
  return (
    <AppStateProvider>
      <DataProvider>
        <SelectionProvider>
          <ConnectionStatusBanner />
          <div className="container mx-auto">
            <Views />
          </div>
        </SelectionProvider>
      </DataProvider>
    </AppStateProvider>
  )
}

export default App
