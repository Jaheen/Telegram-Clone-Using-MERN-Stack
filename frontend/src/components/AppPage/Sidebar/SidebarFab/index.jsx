import PersonIcon from "@mui/icons-material/PersonOutline";
import GroupIcon from '@mui/icons-material/PeopleOutlined';
import ChannelIcon from '@mui/icons-material/CampaignOutlined';
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Fab from "@mui/material/Fab";
import { DRAWERS, openDrawer } from "store/app-reducer";
import { memo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import useAppTheme from "hooks/useAppTheme";
import "./styles.scss"


/**
 * Sidebar Floating Action Button for action
 */
function SidebarFab() {

    const dispatch = useDispatch()
    const fabRef = useRef(null)
    const { theme } = useAppTheme()
    const [fabMenuOpen, toggleFabMenu] = useState(false)

    const openFabMenu = () => toggleFabMenu(true)
    const closeFabMenu = () => toggleFabMenu(false)

    const openNewChannelDrawer = () => dispatch(openDrawer(DRAWERS.newChannelDrawer))
    const openNewGroupDrawer = () => dispatch(openDrawer(DRAWERS.newGroupDrawer))
    const openContactsDrawer = () => dispatch(openDrawer(DRAWERS.contactsDrawer))


    return (
        <>
            <Fab id="sidebar-fab" className={`fab-bottom-right theme-${theme}`} ref={fabRef} onClick={openFabMenu}>
                {fabMenuOpen ? <CloseIcon /> : <EditIcon />}
            </Fab>

            <Popover open={fabMenuOpen} id="sidebar-fab__menu" className={`theme-${theme}`} onClick={closeFabMenu} onClose={_ => toggleFabMenu(false)}
                anchorEl={fabRef.current}
                anchorOrigin={{ horizontal: "right", vertical: "top" }}
                transformOrigin={{ horizontal: "right", vertical: "bottom" }}>

                <MenuItem className={`theme-${theme}`} onClick={openNewChannelDrawer}>
                    <ChannelIcon />
                    <span className="menu-item__text">New Channel</span>
                </MenuItem>

                <MenuItem className={`theme-${theme}`} onClick={openNewGroupDrawer}>
                    <GroupIcon />
                    <span className="menu-item__text">New Group</span>
                </MenuItem>

                <MenuItem className={`theme-${theme}`} onClick={openContactsDrawer}>
                    <PersonIcon />
                    <span className="menu-item__text">New Private Chat</span>
                </MenuItem>
            </Popover>
        </>
    )
}

export default memo(SidebarFab)