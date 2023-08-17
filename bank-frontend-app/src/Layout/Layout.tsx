import Router from "../router/Router"
import ThemeContext from "../theme-context/ThemeContext"

const Layout = () => {
    return (
        <ThemeContext>
            <Router />
        </ThemeContext>
    )
}

export default Layout
