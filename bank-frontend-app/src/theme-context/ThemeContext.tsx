import { ReactNode, createContext, useReducer } from "react"

export const ThemeProvider = createContext<unknown>({})

const themeReducer = (state: { darkMode: boolean }, action: { type: string }): { darkMode: boolean } => {
    switch (action.type) {
        case "select_light":
            return {
                darkMode: false
            }
        case "select_dark":
            return {
                darkMode: true
            }
        default:
            return state
    }
}

const ThemeContext = (props: { children: ReactNode }) => {
    const [colorState, colorDispatch] = useReducer(themeReducer, { darkMode: false })
    const { children } = props
    return (
        <ThemeProvider.Provider value={{ state: colorState, dispatch: colorDispatch }}>
            {children}
        </ThemeProvider.Provider>
    )
}

export default ThemeContext
