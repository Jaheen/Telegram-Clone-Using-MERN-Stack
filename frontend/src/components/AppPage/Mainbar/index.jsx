import useBackStack from 'hooks/useBackStack'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatsReducerThunks } from 'store/chats-reducer'
import { MessagesReducerThunks } from 'store/messages-reducer'
import Actionbar from './Actionbar'
import { parseActiveChat } from './helper'
import MainbarHeader from './MainbarHeader'
import MessagesList from './MessagesList'


export default function Mainbar() {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { chatType, targetId } = useParams()
    const backstack = useBackStack()
    const activeChat = useSelector(rootState => rootState.chats.activeChat)
    const { shouldRenderActionBar } = parseActiveChat(activeChat)

    useEffect(() => {
        dispatch(ChatsReducerThunks.setActiveChat({ chatType, targetId })).unwrap().then(activeChat => {
            const { lastViewedMessage } = activeChat
            if (lastViewedMessage) {

            } else {
                dispatch(MessagesReducerThunks.fetchMessages({ chatType, targetId }))
            }
        }).catch(err => {
            console.log("Error while fetching chat => " + err)
        })

        return () => {
            dispatch(ChatsReducerThunks.setActiveChat({}))
            dispatch(MessagesReducerThunks.fetchMessages({}))
        }
        // eslint-disable-next-line
    }, [chatType, targetId])

    useEffect(() => {
        backstack.push("mainbar", () => navigate("/app", { replace: true }))
        // eslint-disable-next-line
    }, [])

    return (
        <>
            {activeChat ? (
                <>
                    <MainbarHeader />
                    <MessagesList />
                    {shouldRenderActionBar ? <Actionbar /> : null}
                </>
            ) : null}
        </>
    )
}