export const messageSentHandler = (state, action) => {
    const { payload } = action
    let targetMessage = state.messages.find(message => message.messageId === payload.tempMessageId)
    if (targetMessage) {
        targetMessage.messageId = payload.createdMessage.messageId
        targetMessage.isSent = true
        targetMessage.timestamp = payload.createdMessage.timestamp
        targetMessage.isIdTemporary = false
    }
}

export const addNewMessageHandler = (state, action) => {
    const newMessage = action.payload
    if (newMessage)
        state.messages = [newMessage, ...state.messages]
}

export const selectMessageHandler = (state, action) => {
    const message = state.messages.find(message => message.messageId === action.payload)
    if (message) {
        message.isSelected = true
        state.selectedMessagesCount++
    }

    if (!state.isSelectionModeOn)
        state.isSelectionModeOn = true
}

export const deselectMessageHandler = (state, action) => {
    const message = state.messages.find(message => message.messageId === action.payload)
    if (message) {
        message.isSelected = false
        state.selectedMessagesCount--
    }

    if (state.selectedMessagesCount === 0)
        state.isSelectionModeOn = false
}

export const turnOnSelectionModeHandler = (state) => { state.isSelectionModeOn = true }

export const turnOffSelectionModeHandler = (state) => {
    state.isSelectionModeOn = false
    state.messages.forEach(message => {
        if (message.isSelected)
            message.isSelected = false
    })
    state.selectedMessagesCount = 0
}

export const updateTargetReceivedHandler = (state, action) => {
    const { messageIds } = action.payload
    if (messageIds instanceof Array) {
        state.messages.forEach(message => {
            if (messageIds.includes(message.messageId))
                message.isReceived = true
        })
    }
}

export const updateTargetSeenHandler = (state, action) => {
    const { messageIds } = action.payload
    state.messages.forEach(message => {
        if (messageIds.includes(message.messageId))
            message.isSeen = true
    })
}

export const deleteMessagesHandler = (state, action) => {
    const { messageIds } = action.payload

    if (messageIds instanceof Array)
        state.messages = state.messages.filter(message => !messageIds.includes(message.messageId))
}