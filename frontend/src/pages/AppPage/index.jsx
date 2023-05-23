import ChatItem from "components/AppPage/Sidebar/ChatItem"
import SidebarFab from "components/AppPage/Sidebar/SidebarFab"
import SidebarHeader from "components/AppPage/Sidebar/SidebarHeader"
import SidebarLoader from "components/AppPage/Sidebar/SidebarLoader"
import ArchivedChatsDrawer from "components/drawers/ArchivedChatsDrawer"
import ContactsDrawer from "components/drawers/ContactsDrawer"
import NewChannelDrawer from "components/drawers/NewChannelDrawer"
import NewGroupDrawer from "components/drawers/NewGroupDrawer"
import SearchDrawer from "components/drawers/SearchDrawer"
import SettingsDrawer from "components/drawers/SettingsDrawer"
import { ProtectedPageGuard } from "guards"
import useAppTheme from "hooks/useAppTheme"
import useBackStack from "hooks/useBackStack"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"
import { ChatsReducerThunks } from "store/chats-reducer"
import "./styles.scss"

/**
 * Page to contain the main app ui
 */
export default function AppPage() {

    // local and global states, refs
    const dispatch = useDispatch()
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const { targetId } = useParams()
    const isLoading = useSelector(rootState => rootState.chats.isLoading)
    const chats = useSelector(rootState => rootState.chats.chats)
    const unarchivedChats = chats.filter(chat => !chat.isArchived)
    const pinnedChats = unarchivedChats.filter(chat => chat.isPinned)
    const unpinnedChats = unarchivedChats.filter(chat => !chat.isPinned)

    useEffect(() => {
        // fetch from server and update store
        dispatch(ChatsReducerThunks.fetchRecentChats())

        // listener for popstate event back navigation
        const popBackListener = () => backstack.pop()

        window.addEventListener("back", popBackListener)

        return () => {
            window.removeEventListener("back", popBackListener)
            backstack.clear()
        }

        // eslint-disable-next-line
    }, [])

    return (
        <ProtectedPageGuard>
            <div id="app-page" className={`page theme-${theme}`}>

                <section id="sidebar">
                    {/* Header for sidebar component */}
                    <SidebarHeader />

                    <SidebarLoader open={isLoading} />

                    {/* Chats List to list all recent chats */}
                    <div id="sidebar__chatslist">
                        {pinnedChats.map(chat => {
                            const key = chat.chatId
                            return (
                                <ChatItem key={key} chat={chat} />
                            )
                        })}

                        {unpinnedChats.map(chat => {
                            const key = chat.chatId
                            return (
                                <ChatItem key={key} chat={chat} />
                            )
                        })}
                    </div>

                    <SidebarFab />

                    <SearchDrawer />
                    <ArchivedChatsDrawer />
                    <NewChannelDrawer />
                    <NewGroupDrawer />
                    <ContactsDrawer />
                    <SettingsDrawer />
                </section>

                <section id="mainbar" className={`${targetId ? "slide-in" : ""}`}>
                    <Outlet />
                </section>
            </div>
        </ProtectedPageGuard>
    )
}