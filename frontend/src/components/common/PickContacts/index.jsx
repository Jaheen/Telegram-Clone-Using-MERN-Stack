import Chip from '@mui/material/Chip'
import AddIcon from "@mui/icons-material/Add"
import Avatar from "@mui/material/Avatar"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Fab from '@mui/material/Fab'
import ContactItem from '../ContactItem'
import Checkbox from '@mui/material/Checkbox'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import { memo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from "prop-types"
import useAppTheme from 'hooks/useAppTheme'
import "./styles.scss"


function PickContacts(props) {

    const { reset, excludeUsers, onProceed, onBackPressed } = props

    const { theme } = useAppTheme()
    const contacts = useSelector(rootState => rootState.contacts.contacts)
    const [selectedContacts, setSelectedContacts] = useState([])
    const [searchText, setSearchText] = useState("")

    useEffect(() => {
        setTimeout(() => {
            setSelectedContacts([])
            setSearchText("")
        }, 1000);
    }, [reset])

    const fabClass = selectedContacts.length !== 0 ? "slide-up" : null

    return (
        <section className={`pick-contacts theme-${theme}`}>

            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={onBackPressed}>
                    <ArrowBackIcon />
                </IconButton>
                <h1 className="header__title">Add Members</h1>
            </div>

            <div className="selected-list">
                {selectedContacts.map(selectedContact => {
                    const { contactId, firstName, lastName, targetUser, avatarText } = selectedContact
                    const { avatarUrl } = targetUser
                    const hasAvatar = Boolean(avatarUrl)

                    const deselectContact = () => {
                        const ctsAfterDeselection = selectedContacts.filter(contact => contact.contactId !== contactId)
                        setSelectedContacts(ctsAfterDeselection)
                    }

                    return (
                        <div key={contactId} className="selected-item">
                            {hasAvatar ? (
                                <Chip onClick={deselectContact}
                                    onDelete={deselectContact}
                                    deleteIcon={<AddIcon />}
                                    avatar={<Avatar src={avatarUrl} />}
                                    label={`${firstName} ${lastName}`} />
                            ) : (
                                <Chip onClick={deselectContact}
                                    onDelete={deselectContact}
                                    deleteIcon={<AddIcon />}
                                    avatar={<Avatar>{avatarText}</Avatar>}
                                    label={`${firstName} ${lastName}`} />
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="search-bar">
                <input type="text" className="search-bar__search-box" placeholder="Add people..."
                    value={searchText} onChange={(ev) => setSearchText(ev.target.value)} />
            </div>

            <div className="selection-list">
                {contacts
                    .filter(contact => {
                        const { targetUser: { userId } } = contact
                        if (excludeUsers.includes(userId))
                            return false
                        return true
                    })
                    .filter(contact => {
                        const { firstName, lastName } = contact
                        return `${firstName} ${lastName}`.toLowerCase().includes(searchText.toLowerCase())
                    })
                    .map(contact => {

                        const selectedIndex = selectedContacts.findIndex(selectedContact => selectedContact.contactId === contact.contactId)
                        const checked = selectedIndex !== -1

                        const selectionItemClicked = () => {
                            if (checked) {
                                const filteredSelectedContacts = selectedContacts.filter(selectedContact => selectedContact.contactId !== contact.contactId)
                                setSelectedContacts(filteredSelectedContacts)
                            } else {
                                const newSelectedContacts = [...selectedContacts, contact]
                                setSelectedContacts(newSelectedContacts)
                            }
                        }

                        return (
                            <div className="selection-item" key={contact.contactId} onClick={selectionItemClicked}>
                                <Checkbox checked={checked} />
                                <ContactItem contact={contact} />
                            </div>
                        )
                    })}
            </div>

            <Fab className={`fab-bottom-right ${fabClass} theme-${theme}`} onClick={() => onProceed(selectedContacts)}>
                <ArrowForwardIcon />
            </Fab>

        </section>
    )
}

PickContacts.defaultProps = {
    excludeUsers: []
}

PickContacts.propTypes = {
    excludeUsers: PropTypes.array.isRequired,
    reset: PropTypes.bool.isRequired,
    onProceed: PropTypes.func.isRequired,
    onBackPressed: PropTypes.func.isRequired
}

export default memo(PickContacts)
