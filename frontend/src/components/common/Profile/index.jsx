import Avatar from "@mui/material/Avatar"
import useAppTheme from "hooks/useAppTheme"
import PropTypes from "prop-types"
import { memo } from "react"
import "./styles.scss"


function Profile(props) {

    const { variant, profileName, profileMeta, avatarText, avatarUrl, onClick } = props

    const { theme } = useAppTheme()

    const hasAvatar = Boolean(avatarUrl)
    const textBackgroundClass = `gradient-background-${avatarText.charCodeAt(0) % 7}`

    return (
        <section className={`profile ${variant} theme-${theme}`} onClick={onClick}>
            {hasAvatar ? (
                <Avatar src={avatarUrl} className="profile__avatar" />
            ) : (
                <Avatar className={`profile__avatar ${textBackgroundClass}`}>{avatarText}</Avatar>
            )}
            <div className="main-container">
                <div className="profile__name">{profileName}</div>
                <div className="profile__meta">{profileMeta}</div>
            </div>
        </section>
    )
}

Profile.propTypes = {
    variant: PropTypes.string.isRequired,  // => "banner","list-item"
    profileName: PropTypes.string.isRequired,
    profileMeta: PropTypes.string,
    avatarText: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequired
}

export default memo(Profile)