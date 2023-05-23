import { BrowserRouter, Route, Routes } from "react-router-dom";
import Mainbar from "components/AppPage/Mainbar";
import { useLayoutEffect, useRef, useState } from "react";
import { AboutPage, AppPage, LoginPage, NotFoundPage, SplashScreenPage } from "pages";
import "scss/global-styles.scss"

/**
 * Top most component that contains router
 */
export default function App() {

    const rootRef = useRef(null)
    const [isSplashScreenOpen, setSplashScreenOpen] = useState(true)

    // set max height to fix 100vh problem on mobile browsers
    const setPageHeight = () => {
        const rootElem = rootRef.current
        if (rootElem instanceof HTMLElement)
            rootElem.style.height = `${window.innerHeight}px`
    }

    useLayoutEffect(() => {
        setPageHeight()

        // window.screen.orientation.onchange = () => setPageHeight()
        // when screen rotates or goes full screen update height accordingly
        window.onresize = () => setPageHeight()
    }, [])

    return (
        <div id="application-root" ref={rootRef}>
            <BrowserRouter>
                {isSplashScreenOpen ? (
                    <SplashScreenPage onClose={() => setSplashScreenOpen(false)} />
                ) : (
                    <Routes>
                        <Route path="/" element={<LoginPage />} />

                        <Route path="/app" element={<AppPage />}>
                            <Route path=":chatType/:targetId" element={<Mainbar />} />
                        </Route>

                        <Route path="/about" element={<AboutPage />} />

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                )}
            </BrowserRouter>
        </div>
    )
}