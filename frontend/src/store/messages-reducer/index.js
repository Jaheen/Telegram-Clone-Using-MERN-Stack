import MessagesSlice from "./slice";
import * as Thunks from "./thunks"

/**
 * Export Async thunks for global access
 */
export const MessagesReducerThunks = Thunks

/**
 * Export actions for global access
 */
export const MessagesReducerActions = MessagesSlice.actions

export default MessagesSlice.reducer