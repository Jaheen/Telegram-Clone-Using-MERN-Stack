import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { memo, useContext, useRef, useState } from 'react'
import { MessageItemContext } from '..'
import useAppTheme from 'hooks/useAppTheme'
import "./styles.scss"

/**
 * Audio message component to render a player along with audio url
 */
function AudioMessage() {

    const { theme } = useAppTheme()
    const { message, messageClass } = useContext(MessageItemContext)
    const [player, setPlayer] = useState({ isPlaying: false })
    const audioRef = useRef(null)

    /**
     * Play or Pause the media playback when controlbutton is clicked
     */
    const controlButtonClicked = () => {
        if (audioRef.current.paused) {
            audioRef.current.play()
            setPlayer({ isPlaying: true })
        } else {
            audioRef.current.pause()
            setPlayer({ isPlaying: false })
        }
    }

    /**
     * Restore former state when audio playback ends
     */
    const onPlayEnd = () => setPlayer({ isPlaying: false })

    return (
        <section className={`audio-message theme-${theme} ${messageClass}`}>
            <audio src={message.content.url} hidden ref={audioRef} onEnded={onPlayEnd} />
            <div className="control-button" onClick={controlButtonClicked}>
                {player.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </div>
        </section>
    )
}

export default memo(AudioMessage)
