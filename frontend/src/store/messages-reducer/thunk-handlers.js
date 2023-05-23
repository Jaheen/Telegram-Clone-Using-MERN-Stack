export const fetchMessagesPendingHandler = (state) => { state.isMessagesBeingLoaded = true }

export const fetchMessagesFulfilledHandler = (state, action) => {
    const { messages, before, after } = action.payload

    if (messages instanceof Array && messages.length !== 0) {
        if (!before && !after)
            state.messages = messages
        else if (before)
            state.messages.push(...messages)
        else if (after)
            state.messages = [...messages, ...state.messages]
    }

    state.isMessagesBeingLoaded = false
    state.selectedMessagesCount = 0
    state.isSelectionModeOn = false
}

export const sendMessageFulfilledHandler = (state, action) => {
    const message = action.payload
    if (message)
        state.messages = [message, ...state.messages]
}

export const deleteMessagesFulfilledHandler = (state, action) => {
    const { messageIds } = action.payload
    if (messageIds instanceof Array)
        state.messages = state.messages.filter(message => !messageIds.includes(message.messageId))
}