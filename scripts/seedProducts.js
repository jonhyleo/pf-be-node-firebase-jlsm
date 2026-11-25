import { db } from "../config/firebase.js";

const args = process.argv.slice(2);
const shouldClean = args.includes("--clean");

const CATEGORIES = ["Electronics", "Accessories", "Audio", "Monitors", "Storage", "Networking"];

const ADJECTIVES = ["Pro", "Ultra", "Slim", "Wireless", "Mechanical", "Smart"];
const NOUNS = ["Laptop", "Keyboard", "Mouse", "Monitor", "Headset", "SSD Drive", "Webcam", "Docking Station", "Router", "Power Bank"];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const buildProducts = (total = 100) => {
	const products = [];

	for (let i = 1; i <= total; i++) {
		const adj = ADJECTIVES[i % ADJECTIVES.length];
		const noun = NOUNS[i % NOUNS.length];
		const category = CATEGORIES[i % CATEGORIES.length];

		products.push({
			name: `${noun} ${adj} #${i}`,
			description: `Producto de prueba ${i} (${noun.toLowerCase()} ${adj.toLowerCase()}) para desarrollo y pruebas`,
			price: randomInt(15000, 1200000),
			stock: randomInt(0, 50),
			category,
			isSeed: true,
		});
	}

	return products;
};

const cleanSeedProducts = async (collectionRef) => {
	const snapshot = await collectionRef.where("isSeed", "==", true).get();
	if (snapshot.empty) {
		console.log("No hay productos de seed previos para limpiar.");
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
	console.log(`Productos de seed eliminados: ${deleted}`);
};

const seedProducts = async () => {
	const collectionRef = db.collection("products");

	if (shouldClean) {
		await cleanSeedProducts(collectionRef);
	}

	const products = buildProducts(100);
	const writer = db.bulkWriter();

	let successCount = 0;
	let errorCount = 0;

	writer.onWriteResult(() => {
		successCount++;
	});

	writer.onWriteError((err) => {
		errorCount++;
		console.error(`Error escribiendo producto ${err.documentRef.id}:`, err.message);
		return err.failedAttempts < 3;
	});

	for (const product of products) {
		const docRef = collectionRef.doc();
		writer.set(docRef, product);
	}

	await writer.close();
	console.log(`Seed de productos finalizado. Insertados: ${successCount} | Errores: ${errorCount}`);
};

seedProducts().catch((error) => {
	console.error("Error fatal en seed-productos:", error);
	process.exit(1);
});
