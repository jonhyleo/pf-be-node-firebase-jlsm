import bcrypt from "bcryptjs";
import { db } from "../config/firebase.js";

const args = process.argv.slice(2);
const shouldClean = args.includes("--clean");

const SEED_USERS = [
	{
		email: "admin@example.com",
		password: "AdminPassword123!",
		role: "admin",
	},
	{
		email: "editor@example.com",
		password: "EditorPassword123!",
		role: "editor",
	},
	{
		email: "user1@example.com",
		password: "UserPassword123!",
		role: "user",
	},
];

const buildUsers = async (total = 10) => {
	const users = [];
	const saltRounds = 10;

	for (let i = 0; i < total; i++) {
		const base = SEED_USERS[i % SEED_USERS.length];
		const email = i < SEED_USERS.length ? base.email : `usuario${i + 1}@example.com`;
		const role = i < SEED_USERS.length ? base.role : "user";
		const passwordHash = await bcrypt.hash(base.password, saltRounds);

		users.push({
			email,
			passwordHash,
			role,
			isSeed: true,
		});
	}

	return users;
};

const cleanSeedUsers = async (collectionRef) => {
	const snapshot = await collectionRef.where("isSeed", "==", true).get();
	if (snapshot.empty) {
		console.log("No hay usuarios de seed previos para limpiar.");
		return;
	}

	const writer = db.bulkWriter();
	let deleted = 0;

	writer.onWriteResult(() => {
		deleted++;
	});

	for (const doc of snapshot.docs) {
		writer.delete(doc.ref);
	}

	await writer.close();
	console.log(`Usuarios de seed eliminados: ${deleted}`);
};

const seedUsers = async () => {
	const collectionRef = db.collection("users");

	if (shouldClean) {
		await cleanSeedUsers(collectionRef);
	}

	const users = await buildUsers(10);
	const writer = db.bulkWriter();

	let successCount = 0;
	let errorCount = 0;

	writer.onWriteResult(() => {
		successCount++;
	});

	writer.onWriteError((err) => {
		errorCount++;
		console.error(`Error escribiendo usuario ${err.documentRef.id}:`, err.message);
		return err.failedAttempts < 3;
	});

	for (const user of users) {
		const docRef = collectionRef.doc(user.email);
		writer.set(docRef, user);
	}

	await writer.close();
	console.log(`Seed de usuarios finalizado. Insertados: ${successCount} | Errores: ${errorCount}`);
};

seedUsers().catch((error) => {
	console.error("Error fatal en seed-usuarios:", error);
	process.exit(1);
});
