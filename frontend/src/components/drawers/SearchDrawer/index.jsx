import ArrowBack from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import ContactItem from 'components/common/ContactItem'
import Searchbar from 'components/common/Searchbar'
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { memo, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { DRAWERS, closeDrawer } from 'store/app-reducer'
import { SearchService } from 'api/rest/services'
import useAppTheme from 'hooks/useAppTheme'
import useBackStack from 'hooks/useBackStack'
import "./styles.scss"
import Profile from 'components/common/Profile'


function SearchDrawer() {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const timeoutRef = useRef(null)
    const listsRef = useRef(null)
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const searchDrawer = useSelector(rootState => rootState.app.drawers[DRAWERS.searchDrawer])
    const contacts = useSelector(rootState => rootState.contacts.contacts)
    const chats = useSelector(rootState => rootState.chats.chats)
    const [tabIndex, setTabIndex] = useState(0)
    const [searchText, setSearchText] = useState("")

    const filteredContacts = contacts.filter(contact => true)
    const filteredChats = chats.filter(chat => true)

    const tabChange = (ev, newIndex) => {
        setTabIndex(newIndex)
        listsRef.current.scroll({ left: ((listsRef.current.scrollWidth / 2) * newIndex) })
    }

    const onSearchChange = (ev) => {
        setSearchText(ev.target.value)
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => SearchService.search(ev.target.value), 1000);
    }

    useEffect(() => {
        if (searchDrawer.open) {
            backstack.push("search-drawer", () => dispatch(closeDrawer(DRAWERS.searchDrawer)))
        } else {
            backstack.remove("search-drawer")
            setTimeout(() => {
                setSearchText("")
            }, 1000);
        }
        // eslint-disable-next-line
    }, [searchDrawer.open])

    const openClass = searchDrawer.open ? "open" : "close"

    return (
        <section id="search-drawer" className={`sidebar-drawer theme-${theme} ${openClass}`}>
            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <ArrowBack />
                </IconButton>
                <Searchbar value={searchText} onChange={onSearchChange} />
            </div>

            <Tabs value={tabIndex} onChange={tabChange}>
                <Tab label="My Chats" />
                <Tab label="Public" />
            </Tabs>

            <div className="search-lists" ref={listsRef}>
                <div className="search-list private-list">
                    <div className="search-list__section">
                    </div>

                    <div className="search-list__section">
                        {contacts.filter(contact => {
                            const { firstName, lastName } = contact
                            return `${firstName} ${lastName}`.toLowerCase().includes(searchText.toLowerCase())
                        }).map(contact => {
                            const { firstName, lastName } = contact

                            // return <Profile variant="list-item" key={contact.contactId} profileName={`${firstName} ${lastName}`} />
                            return ""
                        })}
                    </div>
                </div>
                <div className="search-list public-list">
                </div>
            </div>
        </section>
    )
}

export default memo(SearchDrawer)