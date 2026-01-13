export async function scheduleSmsReminder(phoneNumber: string, message: string, sendAt: Date) {
    console.log(`[SMS MOCK] Scheduled for ${phoneNumber} at ${sendAt.toISOString()}: "${message}"`);
    return true;
}
