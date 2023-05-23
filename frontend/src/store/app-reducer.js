import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ProfileService } from "api/rest/services";

export const fetchLoggedUser = createAsyncThunk("app-reducer/fetchLoggedUser", () => {
    return ProfileService.getMyProfile()
})

export const updateLoggedUser = createAsyncThunk("app-reducer/updateLoggedUser", async ({ firstName, lastName, bio, username, avatarUrl }) => {
    const user = await ProfileService.updateProfile(firstName, lastName, bio, username, avatarUrl)
    return user
})

export const DRAWERS = {
    searchDrawer: "search-drawer",
    contactsDrawer: "contacts-drawer",
    settingsDrawer: "settings-drawer",
    newChannelDrawer: "new-channel-drawer",
    newGroupDrawer: "new-group-drawer",
    archivedChatsDrawer: "archived-chats-drawer"
}

/**
 * Reducer to handle app preferences
 */
const AppReducer = createSlice({
    name: "app-reducer",
    initialState: {
        theme: localStorage.getItem("app-theme") || "light",
        drawers: {
            "search-drawer": { open: false },
            "contacts-drawer": { open: false },
            "settings-drawer": { open: false },
            "new-channel-drawer": { open: false },
            "new-group-drawer": { open: false },
            "archived-chats-drawer": { open: false }
        },
        isAuthenticated: false,
        loggedUser: {}
    },
    reducers: {
        setTheme: (state, action) => { state.theme = action.payload },
        setAuth: (state, action) => { state.isAuthenticated = action.payload.isAuthenticated },
        openDrawer: (state, action) => {
            if (typeof action.payload === "string") {
                const drawer = state.drawers[action.payload]
                if (drawer) {
                    drawer.open = true
                }
            }
        },
        closeDrawer: (state, action) => {
            if (typeof action.payload === "string") {
                const drawer = state.drawers[action.payload]
                if (drawer) {
                    drawer.open = false
                }
            }
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchLoggedUser.fulfilled, (state, action) => {
            state.loggedUser = action.payload
        })

        builder.addCase(updateLoggedUser.fulfilled, (state, action) => {
            state.loggedUser = action.payload
        })
    }
})

export const {
    setTheme,
    setAuth,
    openDrawer,
    closeDrawer,
    toggleContactsDrawer,
    toggleArchivedChatsDrawer
} = AppReducer.actions

export default AppReducer.reducer
