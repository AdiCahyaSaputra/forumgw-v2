import { db } from '$lib/server/db';
import { jwts, type users } from '$lib/server/db/schema';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { env } from '$env/dynamic/private';

type User = typeof users.$inferSelect;

export const createJWT = async (userId: User['id']) => {
  try {
    const [createdJwt] = await db
      .insert(jwts)
      .values({
        userId,
        expiredIn: new Date(Date.now() + 2 * (60 * 60 * 1000))
      })
      .returning({ id: jwts.id, expiredIn: jwts.expiredIn });

    const token = await new SignJWT({
      id: createdJwt.id,
      expiredIn: createdJwt.expiredIn
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(env.JWT_SECRET));

    const refreshToken = await new SignJWT({
      id: createdJwt.id,
      expiredIn: new Date(Date.now() + 24 * (60 * 60 * 1000)) // 1 day
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(new TextEncoder().encode(env.JWT_SECRET));

    return {
      token,
      refreshToken
    };
  } catch (err) {
    console.error(err);

    return {
      token: null,
      refreshToken: null
    };
  }
};
