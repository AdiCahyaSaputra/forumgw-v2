import { db } from '$lib/server/db';
import { jwts, users } from '$lib/server/db/schema';
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import { env } from '$env/dynamic/private';
import type { LoginSchema } from '$lib/trpc/schema/loginSchema.js';
import type { RegisterSchema } from '$lib/trpc/schema/registerSchema.js';
import { z } from 'zod';
import { and, eq, gt, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as m from '$lib/paraglide/messages.js';
import { sendTRPCResponse } from '$lib/utils.js';
import type { RequestEvent } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';

type User = typeof users.$inferSelect;
export type UserPayload = {
  id: User['id'];
  name: User['name'];
  username: User['username'];
  image: User['image'];
};
type JWTPayload = Omit<typeof jwts.$inferSelect, 'userId'>;

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

export const refreshJWT = async (refreshToken: string) => {
  const decodedPayload = await jwtVerify(refreshToken, new TextEncoder().encode(JWT_SECRET))
    .then((decoded) => decoded.payload as JWTPayload)
    .catch(() => null);

  if (decodedPayload) {
    const usersFromToken = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        image: users.image
      })
      .from(jwts)
      .leftJoin(users, eq(jwts.userId, users.id))
      .where(and(eq(jwts.id, decodedPayload.id), gt(jwts.expiredIn, sql`NOW()`)))
      .limit(1);

    if (usersFromToken.length > 0) {
      return {
        user: usersFromToken[0] as UserPayload
      };
    }
  }

  return { user: null }; // When decodedPayload are null and usersFromToken.length is < 1
};

export const verifyUserToken = async (
  event: RequestEvent
): Promise<{ user: UserPayload | null }> => {
  let token = event.cookies.get('TOKEN');
  let refreshToken = event.cookies.get('REFRESH_TOKEN');

  if (!token) {
    if (refreshToken) {
      const payload = await refreshJWT(refreshToken);

      if (payload.user) {
        const { token: newToken, refreshToken: newRefreshToken } = await createJWT(payload.user.id);

        if (newToken && newRefreshToken) {
          event.cookies.set('TOKEN', newToken, {
            expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
            path: '/'
          });

          event.cookies.set('REFRESH_TOKEN', newRefreshToken, {
            expires: new Date(Date.now() + 24 * (60 * 60 * 1000)),
            path: '/'
          });

          token = newToken;
          refreshToken = newRefreshToken;
        }
      }
    }

    return { user: null }; // When refreshToken, payload.user, newToken, newRefreshToken are undefined or null
  }

  const decodedPayload = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    .then((decoded) => decoded.payload as JWTPayload)
    .catch(() => null);

  if (decodedPayload) {
    const usersFromToken = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        image: users.image
      })
      .from(jwts)
      .leftJoin(users, eq(jwts.userId, users.id))
      .where(and(eq(jwts.id, decodedPayload.id), gt(jwts.expiredIn, sql`NOW()`)))
      .limit(1);

    if (usersFromToken.length > 0) {
      return {
        user: usersFromToken[0] as UserPayload
      };
    }
  }

  return { user: null }; // When decodedPayload are null and usersFromToken.length is < 1
};

export const authenticateUser = async (formData: z.infer<LoginSchema>) => {
  const { username, password } = formData;
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

  if (!user) {
    return sendTRPCResponse({
      status: 401,
      message: m.login_message_user_not_exists()
    });
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);

  if (!isCorrectPassword) {
    return sendTRPCResponse({
      status: 401,
      message: m.login_message_mismatch_credentials()
    });
  }

  const { token, refreshToken } = await createJWT(user.id);

  if (!token && !refreshToken) {
    return sendTRPCResponse({
      status: 401,
      message: m.login_message_session_error()
    });
  }

  return sendTRPCResponse(
    {
      status: 200,
      message: 'ok'
    },
    {
      token,
      refreshToken
    }
  );
};

export const registeringNewUser = async (formData: z.infer<RegisterSchema>) => {
  const { name, username, password } = formData;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.insert(users)
    .values({
      name,
      username,
      password: hashedPassword
    })
    .catch(() =>
      sendTRPCResponse({
        status: 400,
        message: m.global_error_message()
      })
    );

  return sendTRPCResponse({
    status: 201,
    message: 'ok'
  });
};
