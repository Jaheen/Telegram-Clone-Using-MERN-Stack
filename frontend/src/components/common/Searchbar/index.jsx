import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import "./styles.scss";

/**
 * Searchbar component
 */
export default function Searchbar(props) {

    const { value, onChange } = props

    const theme = useSelector(rootState => rootState.app.theme)

    return (
        <div className={`searchbar theme-${theme}`}>
            <div className="searchbar__searchbox">
                <SearchIcon />
                <input type="text" placeholder="Search" value={value} onChange={onChange} className="searchbar__input" />
            </div>
        </div>
    )
}