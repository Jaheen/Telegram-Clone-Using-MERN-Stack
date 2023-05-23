export function parseActiveChat(activeChat) {

    const data = {
        shouldRenderActionBar: true
    }

    if (activeChat !== null) {

        const { chatType, targetGroup, targetChannel } = activeChat

        switch (chatType) {
            case "private":
                break
            case "group":
                if (!Boolean(targetGroup.membership))
                    data.shouldRenderActionBar = false
                break
            case "channel":
                const isSubscriber = Boolean(targetChannel.subscription)
                if (isSubscriber && !targetChannel.subscription.isAdmin)
                    data.shouldRenderActionBar = false
                break
            default:
                break
        }
    }

    return data
}