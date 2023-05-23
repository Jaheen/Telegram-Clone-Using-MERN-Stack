import { memo, useContext } from "react"
import { MessageItemContext } from ".."
import Grid from "@mui/material/Grid";
import FileIcon from '@mui/icons-material/InsertDriveFile';
import useAppTheme from "hooks/useAppTheme"
import "./styles.scss"

function FileMessage() {

    const { theme } = useAppTheme()
    const { message, messageClass } = useContext(MessageItemContext)

    const rootElemClicked = () => {
        const anchor = document.createElement("a")
        anchor.setAttribute("href", message.content.url)
        anchor.setAttribute("target", "_blank")
        anchor.click()
    }

    return (
        <section className={`file-message theme-${theme} ${messageClass}`} onClick={rootElemClicked}>
            <Grid className="container" container alignItems="center" wrap="nowrap">
                <Grid className="icon-container" item xs={2.5}>
                    <FileIcon className="icon" fontSize="large" />
                </Grid>
                <Grid className="file-details" xs>
                    <p className="file-name">{message.content.name}</p>
                    <p className="file-size">{message.content.size / 1000} bytes</p>
                </Grid>
            </Grid>
        </section>
    )
}

export default memo(FileMessage)
