import ChatsSlice from "./slice";
import * as Thunks from "./thunks"

/**
 * Export Async thunks for global access
 */
export const ChatsReducerThunks = Thunks

/**
 * Export actions for global access
 */
export const ChatsReducerActions = ChatsSlice.actions

export default ChatsSlice.reducer