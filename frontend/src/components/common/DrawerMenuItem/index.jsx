import MenuItem from "@mui/material/MenuItem"
import useAppTheme from "hooks/useAppTheme"
import { memo } from "react"
import "./styles.scss"

function DrawerMenuItem(props) {

    const { startAdornment, endAdornment, title, subtitle, onClick, danger, className } = props
    const { theme } = useAppTheme()

    const dangerClass = danger ? "item-danger" : "item-normal"

    return (
        <MenuItem className={`drawer-menu-item theme-${theme} ${dangerClass} ${className}`} onClick={onClick}>
            {startAdornment ? (
                <div className="start-adornment">{startAdornment}</div>
            ) : null}
            <div className="content">
                <div className="title">{title}</div>
                {subtitle ? (
                    <div className="subtitle">{subtitle}</div>
                ) : null}
            </div>
            {endAdornment ? (
                <div className="end-adornment">{endAdornment}</div>
            ) : null}
        </MenuItem>
    )
}

export default memo(DrawerMenuItem)