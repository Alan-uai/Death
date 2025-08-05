import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;

function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    if (!db) {
        db = admin.firestore();
    }
    return;
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountString) {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'death-3a297' // Fallback project ID
      });
      console.log('Firebase Admin SDK initialized successfully.');
      db = admin.firestore();
    } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin SDK not initialized.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

// Call the initialization function so it runs when the module is imported.
initializeFirebaseAdmin();

export { admin, db };
