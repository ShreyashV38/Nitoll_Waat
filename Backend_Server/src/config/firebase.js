const admin = require('firebase-admin');

// Load the service account key JSON file.
// IMPORTANT: In production, you might want to load this from environment variables
// instead of a hardcoded file path for security reasons, but for this setup we will
// use the downloaded file.
const serviceAccount = require('../../nitollwaat-ca903-firebase-adminsdk-fbsvc-40e2d76aec.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized Successfully');
} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
}

module.exports = admin;
