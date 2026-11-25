import "dotenv/config";
import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId) {
	throw new Error("Falta configurar FIREBASE_PROJECT_ID");
}

if (Boolean(clientEmail) !== Boolean(privateKey)) {
	throw new Error("Debes configurar tanto FIREBASE_CLIENT_EMAIL como FIREBASE_PRIVATE_KEY");
}

const credential =
	clientEmail && privateKey
		? cert({
				projectId,
				clientEmail,
				privateKey: privateKey.replace(/\\n/g, "\n"),
			})
		: applicationDefault();

const firebaseApp = getApps().length ? getApp() : initializeApp({ credential, projectId });

export const db = getFirestore(firebaseApp);
