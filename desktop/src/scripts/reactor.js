class Event {
    constructor(name) {
        this.name = name
        this.callbacks = []
    }
    
    registerCallback(callback) {
        this.callbacks.push(callback)
    }
}

class Reactor {
    constructor() {
        this.events = {}
    }
    
    registerEvent(eventName) {
        const event = new Event(eventName)
        this.events[eventName] = event
    }
    
    dispatchEvent(eventName, eventArgs) {
        this.events[eventName].callbacks.forEach( callback => {
            callback(eventArgs)
        })
    }
    
    on(eventName, callback) {
        this.events[eventName].registerCallback(callback)
    }
}

module.exports = function() {
    return new Reactor()
}