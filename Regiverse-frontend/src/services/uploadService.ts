export interface Participant {
    id: string;
    eventId: string;
    name: string;
    email: string;
    company: string;
    phone?: string | null;
    status: 'pending' | 'attended' | 'absent';
    qrCode?: string | null;
    avatarUrl?: string | null;
    registrationDate: Date;
    checkInTime?: Date | null;
    foodAccessStatus?: 'pending' | 'collected';
    foodAccessTime?: Date | null;
    foodHistory?: {
        [sessionType: string]: {
            timestamp: Date;
            scannedBy?: string;
        }
    };
    notes?: string | null;
}

export interface ParticipantInput {
    eventId: string;
    name: string;
    email: string;
    company: string;
    phone?: string | null;
    status?: 'pending' | 'attended' | 'absent';
    notes?: string | null;
}

// 🧠 TEMP STORAGE
let participants: Participant[] = [];

// 🔁 Get all participants
export const getParticipants = async (eventId?: string): Promise<Participant[]> => {
    return eventId
        ? participants.filter(p => p.eventId === eventId)
        : participants;
};

// ❌ No realtime
export const subscribeToParticipants = (callback: (participants: Participant[]) => void) => {
    callback(participants);
    return () => {};
};

// 🔍 Get by ID
export const getParticipantById = async (id: string): Promise<Participant | null> => {
    return participants.find(p => p.id === id) || null;
};

// 🔍 Get by QR
export const getParticipantByQRCode = async (qrCode: string): Promise<Participant | null> => {
    return participants.find(p => p.qrCode === qrCode) || null;
};

// ➕ Add participant
export const addParticipant = async (data: ParticipantInput): Promise<string> => {
    const exists = participants.find(
        p => p.eventId === data.eventId && p.email === data.email
    );

    if (exists) {
        throw new Error('This email is already registered for this event.');
    }

    const id = Date.now().toString() + Math.random().toString(36).substring(2);

    const newParticipant: Participant = {
        id,
        ...data,
        status: data.status || 'pending',
        qrCode: `REG-${Date.now()}`,
        registrationDate: new Date(),
        checkInTime: null,
        foodAccessStatus: 'pending',
        foodAccessTime: null,
        foodHistory: {}, // ✅ always initialized
    };

    participants.push(newParticipant);
    return newParticipant.id;
};

// ✏️ Update
export const updateParticipant = async (
    id: string,
    data: Partial<ParticipantInput>
): Promise<void> => {
    participants = participants.map(p =>
        p.id === id ? { ...p, ...data } : p
    );
};

// 🗑 Delete
export const deleteParticipant = async (id: string): Promise<void> => {
    participants = participants.filter(p => p.id !== id);
};

// ✅ Check-in
export const checkInParticipant = async (id: string): Promise<void> => {
    participants = participants.map(p =>
        p.id === id
            ? { ...p, status: 'attended', checkInTime: new Date() }
            : p
    );
};

// ↩ Undo check-in
export const undoCheckIn = async (id: string): Promise<void> => {
    participants = participants.map(p =>
        p.id === id
            ? { ...p, status: 'pending', checkInTime: null }
            : p
    );
};

// 📦 Bulk add
export const bulkAddParticipants = async (
    list: ParticipantInput[]
): Promise<string[]> => {
    const ids: string[] = [];

    list.forEach(data => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2);

        participants.push({
            id,
            ...data,
            status: data.status || 'pending',
            qrCode: `REG-${Date.now()}`,
            registrationDate: new Date(),
            checkInTime: null,
            foodAccessStatus: 'pending',
            foodAccessTime: null,
            foodHistory: {}, // ✅ safe
        });

        ids.push(id);
    });

    return ids;
};

// 🔄 Bulk status update
export const bulkUpdateStatus = async (
    ids: string[],
    status: 'pending' | 'attended' | 'absent'
): Promise<void> => {
    participants = participants.map(p =>
        ids.includes(p.id)
            ? {
                  ...p,
                  status,
                  checkInTime: status === 'attended' ? new Date() : null,
              }
            : p
    );
};

// 🗑 Bulk delete
export const bulkDeleteParticipants = async (ids: string[]): Promise<void> => {
    participants = participants.filter(p => !ids.includes(p.id));
};

// 🍽 Food access
export const recordFoodAccess = async (
    id: string,
    sessionType: string = 'default'
): Promise<void> => {
    participants = participants.map(p =>
        p.id === id
            ? {
                  ...p,
                  foodAccessStatus: 'collected',
                  foodAccessTime: new Date(),
                  foodHistory: {
                      ...(p.foodHistory || {}), // ✅ FIX
                      [sessionType]: {
                          timestamp: new Date(),
                          scannedBy: 'staff',
                      },
                  },
              }
            : p
    );
};

// ↩ Undo food access
export const undoFoodAccess = async (
    id: string,
    sessionType: string = 'default'
): Promise<void> => {
    participants = participants.map(p => {
        if (p.id !== id) return p;

        const newHistory = { ...(p.foodHistory || {}) }; // ✅ FIX
        delete newHistory[sessionType];

        return {
            ...p,
            foodHistory: newHistory,
            foodAccessStatus: 'pending',
            foodAccessTime: null,
        };
    });
};