import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { roles } from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function seedRoles() {
	// const roleData = [{}]; // TODO: For my future self, update this!

	console.log('🌱 Starting role seeding...');

	try {
		// Check if roles already exist
		const existingRoles = await db.select().from(roles);

		if (existingRoles.length > 0) {
			console.log('⚠️  Roles already exist in the database. Skipping seed.');
			console.log(
				'Existing roles:',
				existingRoles.map((role) => role.name)
			);
			return;
		}

		// Insert roles
		// await db.insert(roles).values(roleData).returning();

		console.log('✅ Successfully seeded roles:');
	} catch (error) {
		console.error('❌ Error seeding roles:', error);
		throw error;
	} finally {
		await client.end();
	}
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedRoles()
		.then(() => {
			console.log('Seed script completed successfully');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Seed script failed:', error);
			process.exit(1);
		});
}

export { seedRoles };
