import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/EditOutlined'
import CallIcon from '@mui/icons-material/CallOutlined'
import SettingsIcon from '@mui/icons-material/SettingsOutlined'
import StorageIcon from '@mui/icons-material/StorageOutlined'
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined'
import DevicesIcon from '@mui/icons-material/DevicesOutlined'
import LockIcon from '@mui/icons-material/LockOutlined'
import IconButton from '@mui/material/IconButton'
import { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DRAWERS, closeDrawer } from 'store/app-reducer'
import DrawerMenuItem from 'components/common/DrawerMenuItem'
import EditProfileDrawer from './EditProfileDrawer'
import Profile from 'components/common/Profile'
import useAppTheme from 'hooks/useAppTheme'
import useBackStack from 'hooks/useBackStack'
import { useNavigate } from 'react-router-dom'
import "./styles.scss"


function SettingsDrawer() {

    // states, refs and vars
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const loggedUser = useSelector(rootState => rootState.app.loggedUser)
    const settingsDrawer = useSelector(rootState => rootState.app.drawers[DRAWERS.settingsDrawer])
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)

    /**
     * use effect for adding entry and callback to history stack if opened
     */
    useEffect(() => {
        if (settingsDrawer.open) {
            backstack.push("settings-drawer", () => dispatch(closeDrawer(DRAWERS.settingsDrawer)))
        }
        // eslint-disable-next-line
    }, [settingsDrawer.open])

    const openClass = settingsDrawer.open ? "open" : "close"

    return (
        <section id="settings-drawer" className={`sidebar-drawer theme-${theme} ${openClass}`}>

            <div className="header-container">
                <div className="header">
                    <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>

                    <h1 className="header__title">Settings</h1>

                    <IconButton className={`theme-${theme}`} onClick={() => setProfileDrawerOpen(true)}>
                        <EditIcon />
                    </IconButton>
                </div>

                <Profile variant="banner"
                    profileName={`${loggedUser.firstName} ${loggedUser.lastName}`}
                    avatarUrl={loggedUser.avatarUrl || ""}
                    avatarText={loggedUser.avatarText || ""} />

                <DrawerMenuItem startAdornment={<CallIcon />}
                    title={loggedUser.phoneNumber} subtitle="Phone" />
            </div>

            <div className="settings-menu-list">
                <DrawerMenuItem startAdornment={<NotificationsIcon />} title="Notifications and Sounds" />
                <DrawerMenuItem startAdornment={<StorageIcon />} title="Data and Storage" />
                <DrawerMenuItem startAdornment={<LockIcon />} title="Privacy and Security" />
                <DrawerMenuItem startAdornment={<SettingsIcon />} title="General Settings" />
                <DrawerMenuItem startAdornment={<DevicesIcon />} title="Devices" />
            </div>

            <EditProfileDrawer open={profileDrawerOpen} onClose={() => setProfileDrawerOpen(false)} />
        </section>
    )
}

export default memo(SettingsDrawer)