export enum EventType {
    TabClicked = 0,
    TabsClosed = 1,

    StartTrackingGraph = 2,
    EndTrackingGraph = 3,
    
    CommentCodeClicked = 4,
    RunQueryClicked = 5,
    SaveClicked = 6,
    SaveAllClicked = 7,
    OpenClicked = 8
}
export class Event {
    constructor(type: EventType, args: any = null) {
        this.eventType = type;
        this.args = args;
    }
    public eventType: EventType;
    public args: any = null;
}

export class Subscription {
	constructor(o: any, m: string, e: EventType) {
		this.object = o;
		this.method = m;
		this.event = e;
	}
	public object: any;
	public method: string;
	public event: EventType;
}

export class EventHub {
    private static subscribers: Array<Subscription> = []

    public static subscribe(subscriber: any, method: string, event: EventType) {
        EventHub.subscribers.push(new Subscription(subscriber, method, event));
    }

    public static emit(event: Event) {
        for (let subscriber of EventHub.subscribers) {
            if (subscriber.event === event.eventType) {
                if (event.args == null) {
                    subscriber.object[subscriber.method]();
                }
                else {
                    subscriber.object[subscriber.method](event.args);
                }
            }
        }
    }
}
