import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "store/app-reducer";

export const Themes = {
    THEME_LIGHT: "light",
    THEME_DARK: "dark"
}

/**
 * A custom hook to manage application theme state
 */
export default function useAppTheme() {

    const dispatch = useDispatch()
    const theme = useSelector(rootState => rootState.app.theme)

    const setAppTheme = (theme) => {
        dispatch(setTheme(theme))
        localStorage.setItem("app-theme", theme)
    }

    return { theme, setAppTheme }
}