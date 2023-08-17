import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "../Home/Home"
import AccountProfile from "../account-profile/AccountProfile"
import TransferReceipt from "../transfer-receipt/TransferReceipt"
import { useContext } from "react"
import { ThemeProvider } from "../theme-context/ThemeContext"

type ThemeDispatcher = {
  state: {
    darkMode: boolean
  },
  dispatch: (action: { type: string }) => void
}

const Router = () => {
  const bgTheme = useContext(ThemeProvider) as unknown as ThemeDispatcher
  const dark = bgTheme.state.darkMode
  return (
    <div style={ localStorage.getItem("theme") ? 
    { backgroundColor: localStorage.getItem("theme") ?? "white", color: localStorage.getItem("theme") === "black" ? "white" : "black", width: '85em', height: '40em' } : 
    { backgroundColor: dark ? 'black' : 'white', color: dark ? 'white' : 'black', width: '85em', height: '40em' }}
    >
      <button style={{ 
        marginTop: "5rem", 
        backgroundColor: localStorage.getItem("theme") ? (localStorage.getItem("theme") === "black" ? "white" : "black") : (dark ? "white" : "black"),
        color: localStorage.getItem("theme") ? (localStorage.getItem("theme") === "black" ? "black" : "white") : (dark ? "black" : "white")
      }} 
      onClick={() => {
        if (dark || (localStorage.getItem("theme") && localStorage.getItem("theme") === "black")) {
          bgTheme.dispatch({
            type: "select_light"
          })
          localStorage.setItem("theme", "white")
          return
        }
        bgTheme.dispatch({
          type: "select_dark"
        })
        localStorage.setItem("theme", "black")
      }}>
        {localStorage.getItem("theme") ? (localStorage.getItem("theme") === "black" ? "LIGHT" : "DARK") : dark ? "LIGHT" : "DARK"}
      </button>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Home />} />
          <Route path="/accounts/:id" element={<AccountProfile />} />
          <Route path="/transfers/:id/:type" element={<TransferReceipt />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default Router
