import { Routes, Route } from 'react-router-dom'
import Home from './views/Home'

function App() {
  return <Routes>{Route && <Route path="/" element={<Home />} />}</Routes>
}

export default App
