import Home from './Home/Home'
import AccountProfile from './account-profile/AccountProfile'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/accounts/:id" element={<AccountProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
