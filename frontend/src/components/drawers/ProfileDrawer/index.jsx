import CallIcon from "@mui/icons-material/CallOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import InfoIcon from '@mui/icons-material/InfoOutlined';
import EmailAtIcon from '@mui/icons-material/AlternateEmailOutlined';
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DrawerMenuItem from "components/common/DrawerMenuItem";
import EditContactDrawer from "./EditContactDrawer";
import EditGroupDrawer from "./EditGroupDrawer";
import EditChannelDrawer from "./EditChannelDrawer";
import { parseActiveChat } from "./helper";
import Profile from "components/common/Profile";
import useAppTheme from "hooks/useAppTheme";
import useBackStack from "hooks/useBackStack";
import { useNavigate } from "react-router-dom";
import MembersDrawer from "./MembersDrawer";
import SubscribersDrawer from "./SubscribersDrawer";
import { ChatsReducerThunks } from "store/chats-reducer";
import "./styles.scss"


function ProfileDrawer(props) {

    const { open, onClose } = props

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const activeChat = useSelector(rootState => rootState.chats.activeChat)
    const [editContactDrawerOpen, setEditContactDrawerOpen] = useState(false)
    const [editGroupDrawerOpen, setEditGroupDrawerOpen] = useState(false)
    const [editChannelDrawerOpen, setEditChannelDrawerOpen] = useState(false)
    const [membersDrawerOpen, setMembersDrawerOpen] = useState(false)
    const [subscribersDrawerOpen, setSubscribersDrawerOpen] = useState(false)
    const parsedChat = parseActiveChat(activeChat)

    const toggleMute = () => {
        if (parsedChat.isChatMuted)
            dispatch(ChatsReducerThunks.setChatFlag({ chatId: parsedChat.chatId, flagToBeModified: "mute", value: false }))
        else
            dispatch(ChatsReducerThunks.setChatFlag({ chatId: parsedChat.chatId, flagToBeModified: "mute", value: true }))
    }

    const editProfile = () => {
        switch (activeChat.chatType) {
            case "private":
                setEditContactDrawerOpen(true)
                break
            case "group":
                setEditGroupDrawerOpen(true)
                break
            case "channel":
                setEditChannelDrawerOpen(true)
                break
            default:
                break
        }
    }

    useEffect(() => {
        if (open) {
            backstack.push("chat-profile-drawer", () => onClose())
        }
        // eslint-disable-next-line
    }, [open])

    return (
        <Drawer id="profile-drawer" className={`mainbar-drawer theme-${theme}`} open={open} anchor="right" onClose={() => navigate(-1)} keepMounted>

            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <CloseIcon />
                </IconButton>
                <h1 className="header__title">Profile</h1>
                {parsedChat.canRenderEditButton ? (
                    <IconButton className={`theme-${theme}`} onClick={editProfile}>
                        <EditIcon />
                    </IconButton>
                ) : null}
            </div>

            <div className="scrollable-content">
                <Profile variant="banner"
                    avatarUrl={parsedChat.profileData.avatarUrl || ""}
                    avatarText={parsedChat.profileData.avatarText}
                    profileName={parsedChat.profileData.profileName}
                    profileMeta={parsedChat.profileData.profileMeta} />

                <div className="data-container">
                    {activeChat.chatType === "private" ? (
                        <>
                            <DrawerMenuItem startAdornment={<CallIcon />} title={activeChat.targetUser.phoneNumber} subtitle="Phone" />

                            {activeChat.targetUser.bio && activeChat.targetUser.bio.trim() !== "" ? (
                                <DrawerMenuItem startAdornment={<InfoIcon />} title={activeChat.targetUser.bio} subtitle="Bio" />
                            ) : null}

                            {activeChat.targetUser.username && activeChat.targetUser.username.trim() !== "" ? (
                                <DrawerMenuItem startAdornment={<EmailAtIcon />} title={activeChat.targetUser.username} subtitle="Username" />
                            ) : null}

                            {activeChat.contact ? (
                                <EditContactDrawer open={editContactDrawerOpen} onClose={() => setEditContactDrawerOpen(false)}
                                    targetUser={activeChat.targetUser} contact={activeChat.contact} profile={parsedChat.profileData} />
                            ) : null}
                        </>
                    ) : null}

                    {activeChat.chatType === "group" ? (
                        <EditGroupDrawer open={editGroupDrawerOpen} onClose={() => setEditGroupDrawerOpen(false)}
                            targetGroup={activeChat.targetGroup} profile={parsedChat.profileData} />
                    ) : null}

                    {activeChat.chatType === "channel" ? (
                        <EditChannelDrawer open={editChannelDrawerOpen} onClose={() => setEditChannelDrawerOpen(false)}
                            targetChannel={activeChat.targetChannel} profile={parsedChat.profileData} />
                    ) : null}

                    {parsedChat.canRenderNotificationsMenuItem ? (
                        <DrawerMenuItem startAdornment={<NotificationsIcon />} title="Notifications"
                            endAdornment={<Switch checked={!parsedChat.isChatMuted} className={`theme-${theme}`} />} onClick={toggleMute} />
                    ) : null}

                    <Divider />

                    {activeChat.chatType === "group" ? (
                        <>
                            <DrawerMenuItem startAdornment={<PeopleIcon />} title="Members" subtitle="View all members of this group"
                                onClick={() => setMembersDrawerOpen(true)} />
                            <MembersDrawer open={membersDrawerOpen} targetGroup={activeChat.targetGroup} onClose={() => setMembersDrawerOpen(false)} />
                        </>
                    ) : null}

                    {activeChat.chatType === "channel" ? (
                        <>
                            <DrawerMenuItem startAdornment={<PeopleIcon />} title="Subscribers" subtitle="View all subscribers of this channel"
                                onClick={() => setSubscribersDrawerOpen(true)} />
                            <SubscribersDrawer open={subscribersDrawerOpen} targetChannel={activeChat.targetChannel} onClose={() => setSubscribersDrawerOpen(false)} />
                        </>
                    ) : null}
                </div>
            </div>
        </Drawer>
    )
}

export default memo(ProfileDrawer)