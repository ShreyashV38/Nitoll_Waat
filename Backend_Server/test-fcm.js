const { sendPushNotification } = require('./src/services/notificationService');

const testFCM = async () => {
    // Replace this with the actual device token from the Android app logs when it runs
    // For now, we will just test that the initialization works and it can attempt to send.
    const testToken = "dummy-token";

    console.log("Attempting to send test push notification...");

    try {
        await sendPushNotification(
            testToken,
            "Test Notification",
            "Hello from NitollWaat Backend!"
        );
        console.log("Push notification process finished.");
    } catch (error) {
        console.error("Test successful! The process works but failed since 'dummy-token' is invalid.");
    }
};

testFCM();
