import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import ContactItem from 'components/common/ContactItem'
import Searchbar from 'components/common/Searchbar'
import CreateContactDialog from 'components/dialogs/CreateContactDialog'
import useAppTheme from 'hooks/useAppTheme'
import useBackStack from 'hooks/useBackStack'
import { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { DRAWERS, closeDrawer } from 'store/app-reducer'
import { fetchContacts } from 'store/contacts-reducer'
import "./styles.scss"

function ContactsDrawer() {

    // states, refs and vars
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const backstack = useBackStack()
    const { theme } = useAppTheme()
    const { chatType, targetId } = useParams()
    const contactsDrawer = useSelector(rootState => rootState.app.drawers[DRAWERS.contactsDrawer])
    const contacts = useSelector(rootState => rootState.contacts.contacts)
    const [searchText, setSearchText] = useState("")
    const [createContactDialogOpen, toggleCreateContactDialog] = useState(false)
    const filteredContacts = contacts.filter(contact => {
        const { firstName, lastName } = contact
        return `${firstName} ${lastName}`.toLowerCase().includes(searchText)
    })

    useEffect(() => {
        if (contactsDrawer.open) {
            backstack.push("contacts-drawer", () => dispatch(closeDrawer(DRAWERS.contactsDrawer)))
        } else {
            backstack.remove("contacts-drawer")
        }
        // eslint-disable-next-line
    }, [contactsDrawer.open])

    useEffect(() => {
        dispatch(fetchContacts())
        // eslint-disable-next-line
    }, [])

    const openClass = contactsDrawer.open ? "open" : "close"

    return (
        <section id="contacts-drawer" className={`sidebar-drawer theme-${theme} ${openClass}`}>

            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Searchbar value={searchText} onChange={ev => setSearchText(ev.target.value)} />
            </div>

            <div className="contacts-drawer__contacts-list">
                {filteredContacts.map(contact => {
                    const key = contact.contactId
                    const user = contact.targetUser
                    const userId = user.userId

                    const onContactClicked = () => {
                        const currentLink = `${chatType}/${targetId}`
                        const navLink = `private/${userId}`
                        if (navLink !== currentLink)
                            navigate(navLink, { replace: true })

                        dispatch(closeDrawer(DRAWERS.contactsDrawer))
                    }
                    return (
                        <ContactItem key={key} contact={contact} onClick={onContactClicked} />
                    )
                })}
            </div>

            <Fab id="create-contact-fab" className={`fab-bottom-right theme-${theme}`} onClick={() => toggleCreateContactDialog(true)}>
                <AddIcon />
            </Fab>

            <CreateContactDialog open={createContactDialogOpen} onClose={() => toggleCreateContactDialog(false)} />
        </section>
    )
}

export default memo(ContactsDrawer)