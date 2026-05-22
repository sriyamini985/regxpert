export interface Event {
    id: string;
    name: string;
    date: Date;
    location: string;
    capacity: number;
    description?: string | null;
    imageUrl?: string | null;
    createdBy: string;
    createdAt: Date;
}

export interface EventInput {
    name: string;
    date: Date;
    location: string;
    capacity: number;
    description?: string | null;
    imageUrl?: string | null;
    createdBy: string;
}

// 🧠 TEMP STORAGE
let events: Event[] = [];


// 🔁 Get all events
export const getEvents = async (): Promise<Event[]> => {
    // sort by date DESC (same as Firestore orderBy)
    return [...events].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
    );
};


// ❌ No realtime
export const subscribeToEvents = (callback: (events: Event[]) => void) => {
    callback(events);
    return () => {};
};


// 🔍 Get by ID
export const getEventById = async (id: string): Promise<Event | null> => {
    return events.find(e => e.id === id) || null;
};


// ➕ Add event
export const addEvent = async (data: EventInput): Promise<string> => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);

    const newEvent: Event = {
        id,
        ...data,
        date: new Date(data.date),
        createdAt: new Date(),
    };

    events.push(newEvent);
    return id;
};


// ✏️ Update event
export const updateEvent = async (
    id: string,
    data: Partial<EventInput>
): Promise<void> => {
    events = events.map(e =>
        e.id === id
            ? {
                  ...e,
                  ...data,
                  date: data.date ? new Date(data.date) : e.date,
              }
            : e
    );
};


// 🗑 Delete event
export const deleteEvent = async (id: string): Promise<void> => {
    events = events.filter(e => e.id !== id);
};