import SpeakerIcon from '@mui/icons-material/VolumeUp'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FastRewindIcon from '@mui/icons-material/FastRewind'
import FastForwardIcon from '@mui/icons-material/FastForward'
import IconButton from '@mui/material/IconButton'
import { useSelector } from 'react-redux'
import { memo } from 'react'
import "./styles.scss"

function MediaPlayerControls() {

    const theme = useSelector(rootState => rootState.app.theme)

    return (
        <section id="media-player-controls" className={`theme-${theme}`}>
            <div className="control-buttons">
                <IconButton className="control-button">
                    <FastRewindIcon />
                </IconButton>
                <IconButton className="control-button">
                    <PlayArrowIcon />
                </IconButton>
                <IconButton className="control-button">
                    <FastForwardIcon />
                </IconButton>
            </div>

            <div className="media-message-data">
                <p className="sender-name">James Bond</p>
                <p className="meta-content">Dec 21 at 6:34 PM</p>
            </div>

            <div className="control-buttons">
                <IconButton className="control-button">
                    <SpeakerIcon />
                </IconButton>
                <IconButton className="control-button">
                    2x
                </IconButton>
                <IconButton className="control-button">
                    <CloseIcon />
                </IconButton>
            </div>
            <div className="seekbar"></div>
        </section>
    )
}

export default memo(MediaPlayerControls)