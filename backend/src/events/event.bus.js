import EventEmitter from "events";

class EventBus extends EventEmitter { }

export const event_bus = new EventBus();