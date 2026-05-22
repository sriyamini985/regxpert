import { checkInParticipant, getParticipantByQRCode } from './participantService';

export interface CheckIn {
    id: string;
    participantId: string;
    participantName: string;
    eventId: string;
    timestamp: Date;
    method: 'qr' | 'manual';
}

export interface CheckInResult {
    success: boolean;
    message: string;
    participant?: {
        id: string;
        name: string;
        email: string;
        company: string;
    };
}

// 🧠 TEMP STORAGE (check-in logs)
let checkIns: CheckIn[] = [];


// 📷 QR Check-in
export const processQRCheckIn = async (qrCode: string): Promise<CheckInResult> => {
    try {
        const participant = await getParticipantByQRCode(qrCode);

        if (!participant) {
            return {
                success: false,
                message: 'Invalid QR code. Participant not found.',
            };
        }

        if (participant.status === 'attended') {
            return {
                success: false,
                message: `${participant.name} has already checked in.`,
                participant: {
                    id: participant.id,
                    name: participant.name,
                    email: participant.email,
                    company: participant.company,
                },
            };
        }

        // ✅ Update participant
        await checkInParticipant(participant.id);

        // 🧾 Log check-in
        checkIns.unshift({
            id: Date.now().toString() + Math.random(),
            participantId: participant.id,
            participantName: participant.name,
            eventId: participant.eventId,
            timestamp: new Date(),
            method: 'qr',
        });

        return {
            success: true,
            message: `Welcome, ${participant.name}! Check-in successful.`,
            participant: {
                id: participant.id,
                name: participant.name,
                email: participant.email,
                company: participant.company,
            },
        };

    } catch (error) {
        console.error('Check-in error:', error);

        return {
            success: false,
            message: 'An error occurred during check-in. Please try again.',
        };
    }
};


// ✍️ Manual check-in
export const processManualCheckIn = async (
    participantId: string,
    participantName: string,
    eventId: string
): Promise<CheckInResult> => {
    try {
        await checkInParticipant(participantId);

        // 🧾 Log
        checkIns.unshift({
            id: Date.now().toString() + Math.random(),
            participantId,
            participantName,
            eventId,
            timestamp: new Date(),
            method: 'manual',
        });

        return {
            success: true,
            message: `${participantName} checked in successfully.`,
        };

    } catch (error) {
        console.error('Manual check-in error:', error);

        return {
            success: false,
            message: 'An error occurred during check-in.',
        };
    }
};


// 📊 Get recent check-ins
export const getRecentCheckIns = async (
    eventId?: string,
    limitCount: number = 10
): Promise<CheckIn[]> => {

    let data = eventId
        ? checkIns.filter(c => c.eventId === eventId)
        : checkIns;

    return data
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limitCount);
};


// ❌ No realtime
export const subscribeToRecentCheckIns = (
    callback: (checkIns: CheckIn[]) => void,
    eventId?: string,
    limitCount: number = 10
) => {
    getRecentCheckIns(eventId, limitCount).then(callback);
    return () => {};
};