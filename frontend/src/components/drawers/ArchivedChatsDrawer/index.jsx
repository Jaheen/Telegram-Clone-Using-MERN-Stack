import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatItem from "components/AppPage/Sidebar/ChatItem";
import { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeDrawer, DRAWERS } from "store/app-reducer";
import useAppTheme from "hooks/useAppTheme";
import { useNavigate } from "react-router-dom";
import useBackStack from "hooks/useBackStack";
import "./styles.scss"


function ArchivedChatsDrawer() {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const archivedChatsDrawer = useSelector(rootState => rootState.app.drawers[DRAWERS.archivedChatsDrawer])
    const chats = useSelector(rootState => rootState.chats.chats)
    const archivedChats = chats.filter(chat => chat.isArchived === true)

    useEffect(() => {
        if (archivedChatsDrawer.open) {
            backstack.push("edit-contact-drawer", () => dispatch(closeDrawer(DRAWERS.archivedChatsDrawer)))
        }

        // eslint-disable-next-line
    }, [archivedChatsDrawer.open])

    const openClass = archivedChatsDrawer.open ? "open" : "close"

    return (
        <section id="archived-chats-drawer" className={`sidebar-drawer theme-${theme} ${openClass}`}>

            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <h1 className="header__title">Archived Chats</h1>
            </div>

            <div className="archived-chats-list">
                {archivedChats.map(chat => {
                    const key = chat.chatId
                    return (
                        <ChatItem key={key} chat={chat} />
                    )
                })}
            </div>
        </section>
    )
}

export default memo(ArchivedChatsDrawer)