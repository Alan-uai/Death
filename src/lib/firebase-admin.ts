import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccountString && !admin.apps.length) {
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'death-3a297'
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
}

// Only initialize db if the app was initialized
if (admin.apps.length) {
    db = admin.firestore();
}

export { admin, db };
