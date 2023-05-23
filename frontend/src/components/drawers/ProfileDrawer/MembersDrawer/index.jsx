import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import GrantAdminIcon from '@mui/icons-material/SecurityOutlined';
import RevokeAdminIcon from '@mui/icons-material/RemoveModeratorOutlined';
import AddMemberIcon from '@mui/icons-material/PersonAddAlt1';
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import useAppTheme from "hooks/useAppTheme";
import useBackStack from "hooks/useBackStack";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "components/common/Profile";
import Fab from "@mui/material/Fab";
import PickContacts from "components/common/PickContacts";
import { useDispatch, useSelector } from "react-redux";
import { ChatsReducerActions, ChatsReducerThunks } from "store/chats-reducer";
import "./styles.scss"


function MembersDrawer(props) {

    const { open, targetGroup, onClose } = props

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const lastItemObserverRef = useRef(null)
    const searchTimeoutRef = useRef(null)
    const searchTextRef = useRef("")
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const contactsInGroup = useSelector(rootState => rootState.chats.activeChat.contactsInGroup)
    const members = useSelector(rootState => rootState.chats.activeChat.members)
    const loggedUser = useSelector(rootState => rootState.app.loggedUser)
    const [pickContactsDrawerOpen, setPickContactsDrawerOpen] = useState(false)
    const [profileItemContextMenu, setProfileItemContextMenu] = useState({ open: false, position: { X: 0, Y: 0 }, member: null })
    const [query, setQuery] = useState("")

    const addContactsAsMembers = (selectedContacts) => {
        const userIds = selectedContacts.map(selectedContact => selectedContact.targetUser.userId)
        dispatch(ChatsReducerThunks.addMembersToGroup({ userIds })).then(_ => setPickContactsDrawerOpen(false))
    }

    /**
     * Update query in state and search members after timeout
     * @param {React.ChangeEvent} ev event
     */
    const searchInputChangeHandler = (ev) => {
        clearTimeout(searchTimeoutRef.current)
        setQuery(ev.target.value)
        searchTextRef.current = ev.target.value
        dispatch(ChatsReducerActions.clearMembers())

        searchTimeoutRef.current = setTimeout(() => {
            dispatch(ChatsReducerThunks.fetchMembersOfGroup({ query: ev.target.value, replace: true }))
        }, 500);
    }

    /**
     * Effect to load initial member data
     */
    useEffect(() => {
        dispatch(ChatsReducerThunks.fetchContactsInGroup())
        dispatch(ChatsReducerThunks.fetchMembersOfGroup({ query: searchTextRef.current, replace: true }))

        // eslint-disable-next-line
    }, [targetGroup.membersCount])

    /**
     * LayoutEffect to add last profile item from DOM to intersection observer after memberslist is updated
     */
    useLayoutEffect(() => {
        const target = document.querySelector("#group-members-drawer .members-list .profile-item-container.member:last-child")
        if (lastItemObserverRef.current instanceof IntersectionObserver && target) {
            lastItemObserverRef.current.observe(target)
        }
    }, [members])

    /**
     * Effect to handle backstack and back navigation
     */
    useEffect(() => {
        if (open) {
            backstack.push("group-members-drawer", () => onClose())
        } else {
            setPickContactsDrawerOpen(false)
        }
        // eslint-disable-next-line
    }, [open])

    /**
     * Effect to initialize intersection observer on component mount and disconnect on component unmount 
     */
    useEffect(() => {
        lastItemObserverRef.current = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // when last item is visible unobserve that
                    observer.unobserve(entry.target)
                    // load next set of member when last member is visible
                    dispatch(ChatsReducerThunks.fetchMembersOfGroup({ query: searchTextRef.current }))
                }
            })
        })

        return () => {
            lastItemObserverRef.current.disconnect()
        }
        // eslint-disable-next-line
    }, [])

    return (
        <Drawer id="group-members-drawer" className={`mainbar-drawer theme-${theme}`} open={open} anchor="right" onClose={() => navigate(-1)} keepMounted>
            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <CloseIcon />
                </IconButton>
                <h1 className="header__title">Group Members</h1>
                <div className="members-searchbar">
                    <input type="text" className="members-searchbox" placeholder="Search group members..."
                        value={query} onChange={searchInputChangeHandler} />
                </div>
            </div>

            <div className="scrollable-content">
                <div className="members-list">
                    {/* first render contacts in group */}
                    {Object.values(contactsInGroup)
                        .filter(contactMember => {
                            const { contact: { firstName, lastName } } = contactMember
                            return `${firstName} ${lastName}`.toLowerCase().includes(query.toLowerCase())
                        })
                        .map(contactMember => {
                            const { userId, isAdmin, contact: { firstName, lastName }, targetUser: { avatarUrl } } = contactMember
                            let fullName = firstName
                            let avatarText = firstName.substring(0, 1)
                            let profileMeta = Boolean(isAdmin) ? "admin" : null

                            if (Boolean(lastName)) {
                                fullName += " " + lastName
                                avatarText += lastName.substring(0, 1)
                            }

                            const navlink = `/app/private/${userId}`

                            const contextMenuHandler = (event) => {
                                event.preventDefault()
                                const X = event.pageX
                                const Y = event.pageY
                                setProfileItemContextMenu({ open: true, position: { X, Y }, member: contactMember })
                            }

                            return (
                                <div key={userId} className="profile-item-container" onClick={() => navigate(navlink, { replace: true })} onContextMenu={contextMenuHandler}>
                                    <Profile variant="list-item" profileName={fullName} profileMeta={profileMeta} avatarUrl={avatarUrl || ""} avatarText={avatarText} />
                                </div>
                            )
                        })}

                    {/* render all other members */}
                    {members.map(member => {
                        const { userId, isAdmin, targetUser: { firstName, lastName, avatarUrl } } = member

                        // if member is already rendered as contact don't render it
                        if (contactsInGroup[userId])
                            return null

                        let fullName = firstName
                        let avatarText = firstName.substring(0, 1)
                        let profileMeta = Boolean(isAdmin) ? "admin" : null

                        if (Boolean(lastName)) {
                            fullName += " " + lastName
                            avatarText += lastName.substring(0, 1)
                        }

                        if (loggedUser.userId === userId)
                            fullName = "You"

                        const navlink = `/app/private/${userId}`

                        const contextMenuHandler = (event) => {
                            event.preventDefault()
                            const X = event.pageX
                            const Y = event.pageY
                            if (loggedUser.userId !== userId)
                                setProfileItemContextMenu({ open: true, position: { X, Y }, member })
                        }

                        return (
                            <div key={userId} className="member profile-item-container" onClick={() => navigate(navlink, { replace: true })} onContextMenu={contextMenuHandler}>
                                <Profile variant="list-item" profileName={fullName} profileMeta={profileMeta} avatarUrl={avatarUrl || ""} avatarText={avatarText} />
                            </div>
                        )
                    })}
                </div>
            </div>

            {targetGroup.membership && targetGroup.membership.isAdmin ? (
                <>
                    <Popover open={profileItemContextMenu.open} className={`theme-${theme}`}
                        onClick={() => setProfileItemContextMenu({ ...profileItemContextMenu, open: false })}
                        onClose={() => setProfileItemContextMenu({ ...profileItemContextMenu, open: false })}
                        anchorReference="anchorPosition" anchorPosition={{ top: profileItemContextMenu.position.Y, left: profileItemContextMenu.position.X }}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>

                        {profileItemContextMenu.member && profileItemContextMenu.member.isAdmin ? (
                            <MenuItem className={`theme-${theme}`} onClick={() => dispatch(ChatsReducerThunks.revokeGroupAdminPrivileges({ userIds: [profileItemContextMenu.member.userId] }))}>
                                <RevokeAdminIcon />
                                <p className="menu-item__text">Revoke Admin Privileges</p>
                            </MenuItem>
                        ) : (
                            <MenuItem className={`theme-${theme}`} onClick={() => dispatch(ChatsReducerThunks.grantGroupAdminPrivileges({ userIds: [profileItemContextMenu.member.userId] }))}>
                                <GrantAdminIcon />
                                <p className="menu-item__text">Grant Admin Privileges</p>
                            </MenuItem>
                        )}
                        <MenuItem className={`theme-${theme} item-red`} onClick={() => dispatch(ChatsReducerThunks.removeMembersFromGroup({ userIds: [profileItemContextMenu.member.userId] }))}>
                            <DeleteIcon />
                            <p className="menu-item__text">Remove from group</p>
                        </MenuItem>
                    </Popover>
                    <Fab id="add-members-fab" className={`fab-bottom-right theme-${theme}`} onClick={() => setPickContactsDrawerOpen(true)}>
                        <AddMemberIcon />
                    </Fab>

                    <Drawer className={`mainbar-drawer theme-${theme}`} open={pickContactsDrawerOpen} anchor="right" onClose={() => setPickContactsDrawerOpen(false)}>
                        <PickContacts excludeUsers={Object.keys(contactsInGroup)}
                            reset={!pickContactsDrawerOpen} onProceed={addContactsAsMembers} onBackPressed={() => setPickContactsDrawerOpen(false)} />
                    </Drawer>
                </>
            ) : null}
        </Drawer>
    )
}

export default memo(MembersDrawer)