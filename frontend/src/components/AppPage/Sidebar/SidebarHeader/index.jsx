import { Link } from "react-router-dom"
import Divider from "@mui/material/Divider"
import MenuIcon from "@mui/icons-material/Menu"
import SearchIcon from "@mui/icons-material/Search"
import ContactsIcon from "@mui/icons-material/PersonOutline"
import SettingsIcon from "@mui/icons-material/SettingsOutlined"
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined"
import LogoutIcon from '@mui/icons-material/Logout'
import ArchiveIcon from "@mui/icons-material/ArchiveOutlined"
import IconButton from "@mui/material/IconButton"
import Popover from "@mui/material/Popover"
import MenuItem from "@mui/material/MenuItem"
import Switch from "@mui/material/Switch"
import { memo, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import useAppTheme, { Themes } from "hooks/useAppTheme"
import { openDrawer, DRAWERS } from "store/app-reducer"
import "./styles.scss"

/**
 * Sidebar header contains search bar and menu button
 */
function SidebarHeader() {

    const dispatch = useDispatch()
    const menuButtonRef = useRef(null)
    const { theme, setAppTheme } = useAppTheme()
    const [menuOpen, toggleMenu] = useState(false)

    const toggleTheme = () => {
        if (theme === Themes.THEME_LIGHT)
            setAppTheme(Themes.THEME_DARK)
        else
            setAppTheme(Themes.THEME_LIGHT)
    }

    // Event handler and utlity functions

    const archivedChatsMenuItemClicked = () => {
        toggleMenu(false)
        dispatch(openDrawer(DRAWERS.archivedChatsDrawer))
    }
    // When contacts menu item is clicked in the popover
    const contactsMenuItemClicked = () => {
        toggleMenu(false)
        dispatch(openDrawer(DRAWERS.contactsDrawer))
    }
    // When settings menu item is clicked in the popover
    const settingsMenuItemClicked = () => {
        toggleMenu(false)
        dispatch(openDrawer(DRAWERS.settingsDrawer))
    }
    // Open search drawer when search button clicked
    const openSearchDrawer = () => dispatch(openDrawer(DRAWERS.searchDrawer))

    const logout = () => {
        localStorage.removeItem("server-auth-token")
        window.location.reload()
    }

    return (
        <section id="sidebar-header" className={`theme-${theme}`}>
            <IconButton ref={menuButtonRef} className={`theme-${theme}`}
                onClick={_ => toggleMenu(true)}>
                <MenuIcon />
            </IconButton>

            <h1 className="header__title">Telegram Clone</h1>

            <IconButton className={`theme-${theme}`} onClick={openSearchDrawer}>
                <SearchIcon />
            </IconButton>

            {/* Popover to contain menu */}
            <Popover id="sidebar-menu" className={`theme-${theme}`} open={menuOpen}
                anchorEl={menuButtonRef.current}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                onClose={_ => toggleMenu(false)}>

                {/* Menu Items */}
                <MenuItem className={`theme-${theme}`} onClick={archivedChatsMenuItemClicked}>
                    <ArchiveIcon />
                    <span className="menu-item__text">Archived Chats</span>
                </MenuItem>
                <MenuItem className={`theme-${theme}`} onClick={contactsMenuItemClicked}>
                    <ContactsIcon />
                    <span className="menu-item__text">Contacts</span>
                </MenuItem>
                <MenuItem className={`theme-${theme}`} onClick={settingsMenuItemClicked}>
                    <SettingsIcon />
                    <span className="menu-item__text">Settings</span>
                </MenuItem>
                <MenuItem className={`theme-${theme}`} onClick={toggleTheme}>
                    <DarkModeIcon />
                    <span className="menu-item__text">Dark Mode</span>
                    <Switch className={`theme-${theme}`} checked={theme === Themes.THEME_DARK} />
                </MenuItem>
                <MenuItem className={`theme-${theme}`} onClick={logout}>
                    <LogoutIcon />
                    <span className="menu-item__text">Logout</span>
                </MenuItem>

                <Divider />

                <Link to="/about-telegram-clone" className="about-project-link">
                    About Telegram Clone
                </Link>
            </Popover>
        </section>
    )
}

export default memo(SidebarHeader)