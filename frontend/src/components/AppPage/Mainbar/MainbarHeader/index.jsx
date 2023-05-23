import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVert from "@mui/icons-material/MoreVert";
import { memo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileDrawer from "components/drawers/ProfileDrawer";
import MainbarHeaderOptionsMenu from './MainbarHeaderOptionsMenu';
import { parseActiveChat } from './helper';
import { ChannelsService, GroupsService } from "api/socket/services";
import useAppTheme from "hooks/useAppTheme";
import "./styles.scss"


/**
 * Header to contain details and action buttons of active chat
 */
function MainbarHeader() {

    const navigate = useNavigate()
    // global theme state
    const { theme } = useAppTheme()
    // get active chat
    const activeChat = useSelector(rootState => rootState.chats.activeChat)
    // local state for options menu opened or closed
    const [optionsMenuOpen, toggleOptionsMenu] = useState(false)
    // local state to control profile drawer
    const [profileDrawerOpen, toggleProfileDrawer] = useState(false)
    // ref to options button to serve as anchor element for the options menu popover
    const optionsButtonRef = useRef(null)


    const parsedChat = parseActiveChat(activeChat)
    const { chatName, metaData, avatarUrl, avatarText, targetId, chatType, isChatCreated } = parsedChat

    // event handler for arrow back icon button is clicked in mobile ui
    const onBackButtonClicked = (event) => {
        event.stopPropagation()
        navigate(-1)
    }

    // event handlers to open and close options menu popovers
    const openOptionsMenu = (event) => {
        event.stopPropagation()
        toggleOptionsMenu(true)
    }
    const closeOptionsMenu = () => toggleOptionsMenu(false)

    const subscribeButtonClicked = (event) => {
        event.stopPropagation()
        ChannelsService.subscribeToChannel(targetId)
    }
    const joinButtonClicked = (event) => {
        event.stopPropagation()
        GroupsService.joinGroup(targetId)
    }

    const textBackgroundClass = `gradient-background-${avatarText.charCodeAt(0) % 7}`

    return (
        <>
            <section id="mainbar-header" className={`theme-${theme}`} onClick={() => toggleProfileDrawer(true)}>

                <IconButton className={`mainbar-header__back-button theme-${theme}`} onClick={onBackButtonClicked}>
                    <ArrowBackIcon />
                </IconButton>

                {parsedChat.hasAvatar ? (
                    <Avatar src={avatarUrl} className="header__chat-avatar" />
                ) : (
                    <Avatar className={`header__chat-avatar ${textBackgroundClass}`}>{avatarText}</Avatar>
                )}

                <div className="header__chat-details">
                    <p className="chat__name">{chatName}</p>
                    <p className="chat__meta">{metaData}</p>
                </div>

                {(chatType === "group" && !isChatCreated) ? (
                    <Button id="group-join-button" onClick={joinButtonClicked}>Join</Button>
                ) : null}

                {(chatType === "channel" && !isChatCreated) ? (
                    <Button id="channel-subscribe-button" onClick={subscribeButtonClicked}>Subscribe</Button>
                ) : null}

                <div className="header__actions">
                    <IconButton ref={optionsButtonRef} className={`theme-${theme}`} onClick={openOptionsMenu}>
                        <MoreVert />
                    </IconButton>
                </div>
            </section>

            <MainbarHeaderOptionsMenu open={optionsMenuOpen} onClose={closeOptionsMenu} anchorEl={optionsButtonRef.current}
                parsedChat={parsedChat} />

            <ProfileDrawer open={profileDrawerOpen} onClose={() => toggleProfileDrawer(false)} />
        </>
    )
}

export default memo(MainbarHeader)