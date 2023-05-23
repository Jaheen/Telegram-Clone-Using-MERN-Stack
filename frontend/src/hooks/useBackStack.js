/**
 * @type {Array<{identifier:string,callback:Function}>} backstack
 */
let stack = []


export default function useBackStack() {

    /**
     * Pushes an identifier and a popCallback into backstack
     * @param {string} identifier identifier to be pushed into backstack
     * @param {Function} popCallback callback called when this identifier is popped due to popstate back event
     */
    const push = (identifier, popCallback) => {
        if (typeof identifier === "string") {
            stack.push({
                identifier,
                callback: popCallback
            })
            window.history.pushState(null, null)
        }
    }

    /**
     * Pops last state from backstack and call its respective callback,
     * returns undefined if the stack is already empty
     * @returns identifier of the state popped from backstack
     */
    const pop = () => {
        const popped = stack.pop()
        if (popped) {
            if (popped.callback instanceof Function)
                popped.callback()
            return popped.identifier
        } else
            return undefined
    }

    /**
     * Removes all states with the provided identifier from the backstack
     * @param {string} identifier identifier of the state
     */
    const remove = (identifier) => {
        stack = stack.filter(state => state.identifier !== identifier)
    }

    /**
     * Empties the backstack
     */
    const clear = () => {
        stack = []
    }

    return { push, pop, remove, clear }
}
