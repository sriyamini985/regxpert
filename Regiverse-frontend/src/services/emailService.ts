import emailjs from '@emailjs/browser';

// Env config
const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// ✅ Initialize only if key exists
if (EMAIL_PUBLIC_KEY) {
    emailjs.init(EMAIL_PUBLIC_KEY);
}

interface QREmailData {
    recipientEmail: string;
    recipientName: string;
    eventTitle: string;
    registrationId: string;
    qrCodeDataUrl: string;
}

interface EmailResult {
    success: boolean;
    message: string;
}

// ✅ Check config
export const isEmailConfigured = (): boolean => {
    return !!(EMAIL_SERVICE_ID && EMAIL_TEMPLATE_ID && EMAIL_PUBLIC_KEY);
};

// 📩 Send QR email
export const sendQRCodeEmail = async (data: QREmailData): Promise<EmailResult> => {

    // ❌ Not configured → don't crash
    if (!isEmailConfigured()) {
        console.warn("EmailJS not configured");

        return {
            success: true, // ✅ pretend success (important for UX flow)
            message: `Email skipped (not configured). QR ready for ${data.recipientEmail}`,
        };
    }

    try {
        const templateParams = {
            to_email: data.recipientEmail,
            to_name: data.recipientName,
            event_title: data.eventTitle,
            registration_id: data.registrationId,
            qr_code_image: data.qrCodeDataUrl,
        };

        const response = await emailjs.send(
            EMAIL_SERVICE_ID,
            EMAIL_TEMPLATE_ID,
            templateParams,
            EMAIL_PUBLIC_KEY
        );

        if (response.status === 200) {
            return {
                success: true,
                message: `QR code sent successfully to ${data.recipientEmail}`,
            };
        }

        return {
            success: false,
            message: 'Failed to send email. Please try again.',
        };

    } catch (error: any) {
        console.error('Email sending error:', error);

        return {
            success: false,
            message: error?.text || 'Failed to send email.',
        };
    }
};

// 📩 Registration confirmation
export const sendRegistrationConfirmation = async (
    email: string,
    name: string,
    eventTitle: string,
    registrationId: string,
    qrCodeDataUrl: string
): Promise<EmailResult> => {
    return sendQRCodeEmail({
        recipientEmail: email,
        recipientName: name,
        eventTitle,
        registrationId,
        qrCodeDataUrl,
    });
};