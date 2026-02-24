const admin = require('../config/firebase');

/**
 * Send a push notification to specific device tokens.
 * 
 * @param {string|string[]} tokens - A single FCM device token or an array of tokens.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body/message of the notification.
 * @param {object} data - Optional extra data payload to send with the notification.
 */
const sendPushNotification = async (tokens, title, body, data = {}) => {
    try {
        const payload = {
            notification: {
                title: title,
                body: body,
            },
            data: data, // Custom data key-value pairs
        };

        let response;

        // Check if it's a single token or an array
        if (Array.isArray(tokens)) {
            if (tokens.length === 0) return;
            response = await admin.messaging().sendMulticast({
                ...payload,
                tokens: tokens, // sendMulticast takes an array of tokens
            });
            console.log(`Successfully sent multicast message. Success count: ${response.successCount}, Failure count: ${response.failureCount}`);
        } else {
            response = await admin.messaging().send({
                ...payload,
                token: tokens, // send takes a single token
            });
            console.log('Successfully sent message:', response);
        }

        return response;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};

module.exports = {
    sendPushNotification,
};
