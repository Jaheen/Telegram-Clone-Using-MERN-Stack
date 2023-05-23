import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import "./styles.scss"


function AlertDialog(props) {

    const { open, onClose, title, message, actions } = props
    const theme = useSelector(rootState => rootState.app.theme)

    return (
        <Dialog open={open} onClose={onClose} className={`alert-dialog theme-${theme}`}>
            <div className="header">
                <div className="header__title">{title}</div>
            </div>
            <div className="alert-content">
                <p className="content-text">{message}</p>
            </div>
            <div className="alert-actions">
                {actions instanceof Array ? (
                    actions.map((action, index) => {

                        return (
                            <Button key={index} onClick={action.handler} className={`alert-action theme-${theme} btn-${action.variant}`}>
                                {action.name}
                            </Button>
                        )
                    })
                ) : null}
            </div>
        </Dialog>
    )
}

AlertDialog.defaultProps = {
    title: "Alert Dialog",
    message: "please provide message prop",
    actions: []
}

AlertDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    actions: PropTypes.array.isRequired
}

export default AlertDialog
