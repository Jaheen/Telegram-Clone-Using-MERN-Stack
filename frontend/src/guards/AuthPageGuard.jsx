import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Page guard component to pages that are specific for authentication.
 * This guard will render the children only if not authenticated, otherwise will redirect to '/app'
 */
export default function AuthPageGuard(props) {

    const isAuthenticated = useSelector(rootState => rootState.app.isAuthenticated)

    if (!isAuthenticated)
        return props.children
    else
        return <Navigate to="/app" />
}