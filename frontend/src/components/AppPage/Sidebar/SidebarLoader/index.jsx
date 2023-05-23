import CircularProgress from '@mui/material/CircularProgress'
import { memo } from 'react'
import "./styles.scss"

function SidebarLoader(props) {

    const { open } = props

    const openClass = open ? "open" : "close"

    return (
        <section id="sidebar-loader" className={`${openClass}`}>
            <div className="container">
                <CircularProgress />
                <p className="loader__text">Loading...</p>
            </div>
        </section>
    )
}

export default memo(SidebarLoader)