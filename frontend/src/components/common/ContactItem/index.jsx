import Avatar from '@mui/material/Avatar'
import useAppTheme from 'hooks/useAppTheme'
import { memo } from 'react'
import "./styles.scss"

function ContactItem(props) {

    const { contact, onClick } = props

    const { firstName, lastName, targetUser, avatarText } = contact
    const { avatarUrl } = targetUser
    const { theme } = useAppTheme()

    const hasAvatar = Boolean(avatarUrl)
    const textBackgroundClass = `gradient-background-${avatarText.charCodeAt(0) % 7}`

    return (
        <div className={`contact-item theme-${theme}`} onClick={onClick}>
            {hasAvatar ? (
                <Avatar src={avatarUrl} className="contact-item__avatar" />
            ) : (
                <Avatar className={`contact-item__avatar ${textBackgroundClass}`}>{avatarText}</Avatar>
            )}
            <div className="contact-item__details">
                <p className="detail__name">
                    {`${firstName} ${lastName ? lastName : ""}`}
                </p>
                <p className="detail__last-active">
                    last seen {"some time"}
                </p>
            </div>
        </div>
    )
}

export default memo(ContactItem)