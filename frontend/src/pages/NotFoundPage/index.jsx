import Grid from "@mui/material/Grid"
import Image404 from "assets/images/404-image.avif"
import "./styles.scss"

/**
 * 404 Page for rendering not found message
 */
export default function NotFoundPage() {
    return (
        <Grid id="page-404" className="page" container justifyContent="center" alignItems="center">
            <Grid item xs={8} md={6} lg={4} xl={3} container justifyContent="center" alignItems="center">
                <Grid component="img" className="image-404" src={Image404} alt="page-not-found" item xs />
                <h2 className="message-404">
                    Sorry, The page you're looking doesn't exist
                </h2>
            </Grid>
        </Grid>
    )
}
