import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Page guard component for pages that require authentication.
 * This guard will render the children only if authenticated, otherwise will redirect to '/'
 */
export default function ProtectedPageGuard(props) {

    const isAuthenticated = useSelector(rootState => rootState.app.isAuthenticated)

    if (isAuthenticated)
        return props.children
    else
        return <Navigate to="/" />
}