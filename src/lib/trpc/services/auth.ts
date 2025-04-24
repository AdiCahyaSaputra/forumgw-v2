import { db } from '$lib/server/db';
import { jwts, roles, users } from '$lib/server/db/schema';
import { jwtVerify, SignJWT } from 'jose';
import type { UserPayload } from './user';
import { nanoid } from 'nanoid';
import { env } from '$env/dynamic/private';
import { eq } from 'drizzle-orm';

type JWTPayload = Omit<typeof jwts.$inferSelect, 'userId'>;

export const createAuthSession = async (userId: string): Promise<string> => {
	const [createdJwt] = await db
		.insert(jwts)
		.values({
			userId,
			expiredIn: new Date(Date.now() + 10 * (24 * 60 * 60 * 1000))
		})
		.returning({ id: jwts.id, expiredIn: jwts.expiredIn });

	const token = await new SignJWT({
		id: createdJwt.id,
		expiredIn: createdJwt.expiredIn
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setJti(nanoid())
		.setIssuedAt()
		// .setExpirationTime('10d')
		.sign(new TextEncoder().encode(env.JWT_SECRET));

	return token;
};

export const validateAuthSession = async (token?: string): Promise<UserPayload | null> => {
	if (!token) return null;

	const decodedPayload = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET))
		.then((decoded) => decoded.payload as JWTPayload)
		.catch(() => null);

	if (decodedPayload) {
		

		// More than 10 days didn't scroll forumgw
		if (Date.now() >= (new Date(decodedPayload.expiredIn)).getTime()) {
			await db.delete(jwts).where(eq(jwts.id, decodedPayload.id));

			return null;
		}

		const thresholdDay = 5 * 24 * 60 * 60 * 1000; // 1/2 from 10 days

		if (Date.now() >= (new Date(decodedPayload.expiredIn)).getTime() - thresholdDay) {
      // Update the expiration token when the user come back after 1/2 from 10 days off
			await db
				.update(jwts)
				.set({
					expiredIn: new Date(Date.now() + 10 * (24 * 60 * 60 * 1000))
				})
				.where(eq(jwts.id, decodedPayload.id));
		}

		const usersFromToken = await db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				image: users.image,
				bio: users.bio,
				role: roles.name
			})
			.from(jwts)
			.innerJoin(users, eq(jwts.userId, users.id))
			.leftJoin(roles, eq(users.roleId, roles.id))
			.where(eq(jwts.id, decodedPayload.id))
			.limit(1);

		if (usersFromToken.length > 0) {
			return usersFromToken[0] as UserPayload;
		}
	}

	return null;
};

export const invalidateAuthSession = async (jwtId: string): Promise<void> => {
	await db.delete(jwts).where(eq(jwts.id, jwtId));
};

export const invalidateAllAuthSession = async (userId: string): Promise<void> => {
	await db.delete(jwts).where(eq(jwts.userId, userId));
};
