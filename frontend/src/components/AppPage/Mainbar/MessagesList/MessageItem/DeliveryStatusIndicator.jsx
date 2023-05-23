import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useContext } from "react";
import { MessageItemContext } from ".";

/**
 * Component to render clock, single tick, double tick etc
 */
export default function DeliveryStatusIndicator() {
    const { message } = useContext(MessageItemContext)

    let statusValue = 0
    if (message.isSent) {
        statusValue++
        if (message.isReceived && message.isSeen) {
            statusValue++
        }
    }
    switch (statusValue) {
        case 0:
            return <AccessTimeIcon className="delivery-status-indicator" />
        case 1:
            return <DoneIcon className="delivery-status-indicator" />
        case 2:
            return <DoneAllIcon className="delivery-status-indicator" />
        default:
            return null
    }
}