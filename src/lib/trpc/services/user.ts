import { env } from '$env/dynamic/private';
import { JWT_SECRET } from '$env/static/private';
import * as m from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import { groupMembers, jwts, roles, users } from '$lib/server/db/schema';
import type { LoginSchema } from '$lib/trpc/schema/loginSchema.js';
import type { RegisterSchema } from '$lib/trpc/schema/registerSchema.js';
import { sendTRPCResponse } from '$lib/utils.js';
import type { RequestEvent } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { and, eq, gt, ilike, not, sql } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import type {
  editUserRequest,
  getUserForInviteRequest,
  getUserForMentioningRequest,
  getUserProfileRequest
} from '../schema/userSchema';
import type { CtxType } from '$lib/constant';

type User = typeof users.$inferSelect;
type Role = typeof roles.$inferSelect;

export type UserPayload = {
  id: User['id'];
  name: User['name'];
  username: User['username'];
  image: User['image'];
  bio: User['bio'];
  role: Role['name'];
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
        image: users.image,
        bio: users.bio,
        role: roles.name
      })
      .from(jwts)
      .innerJoin(users, eq(jwts.userId, users.id))
      .innerJoin(roles, eq(users.roleId, roles.id))
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
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
            path: '/'
          });

          event.cookies.set('REFRESH_TOKEN', newRefreshToken, {
            httpOnly: true,
            secure: true,
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
        image: users.image,
        bio: users.bio,
        role: roles.name
      })
      .from(jwts)
      .innerJoin(users, eq(jwts.userId, users.id))
      .leftJoin(roles, eq(users.roleId, roles.id))
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

export const authenticateUser = async (formData: z.infer<LoginSchema>, ctx: CtxType) => {
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

  ctx.event.cookies.set('TOKEN', token, {
    expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
    path: '/'
  });

  ctx.event.cookies.set('REFRESH_TOKEN', refreshToken, {
    expires: new Date(Date.now() + 24 * (60 * 60 * 1000)),
    path: '/'
  });

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
      password: hashedPassword,
      roleId: 2
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

export const getUserForInvite = async (
  input: z.infer<typeof getUserForInviteRequest>,
  user: UserPayload
) => {
  const { username } = input;
  const conditions = [not(eq(users.id, user.id))];

  if (username) {
    conditions.push(ilike(users.username, `%${username}%`));
  }

  const usersResult = await db
    .select({
      username: users.username
    })
    .from(users)
    .where(and(...conditions))
    .limit(10);

  return sendTRPCResponse(
    {
      status: usersResult.length > 0 ? 200 : 404,
      message: 'ok'
    },
    {
      users: usersResult
    }
  );
};

export const getUserForMentioning = async (
  input: z.infer<typeof getUserForMentioningRequest>,
  user: UserPayload
) => {
  const { username, groupId } = input;

  const usernameString = username?.slice(1); // Ignore the '@' on username string

  const conditions = [ilike(users.username, `%${usernameString}%`), not(eq(users.id, user.id))];

  if (groupId) {
    conditions.push(eq(groupMembers.groupId, groupId));

    const usersResult = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        image: users.image
      })
      .from(groupMembers)
      .innerJoin(users, eq(users.id, groupMembers.userId))
      .where(and(...conditions))
      .limit(5);

    return sendTRPCResponse(
      {
        status: usersResult.length > 0 ? 200 : 404,
        message: 'ok'
      },
      usersResult
    );
  }

  const usersResult = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      image: users.image
    })
    .from(users)
    .where(and(...conditions))
    .limit(5);

  return sendTRPCResponse(
    {
      status: usersResult.length > 0 ? 200 : 404,
      message: 'ok'
    },
    usersResult
  );
};

export const editUser = async (
  input: z.infer<ReturnType<typeof editUserRequest>>,
  user: UserPayload
) => {
  const { name, username, bio, avatar } = input;

  const response = await db
    .update(users)
    .set({
      name,
      username,
      bio,
      image: avatar
    })
    .where(eq(users.id, user.id))
    .then(() => sendTRPCResponse({ status: 200, message: 'ok' }))
    .catch(() => sendTRPCResponse({ status: 500, message: 'Error edit user' }));

  return response;
};

export const getUserProfile = async (
  input: z.infer<typeof getUserProfileRequest>
) => {
  const { username } = input;

  const response = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      image: users.image
    })
    .from(users)
    .where(eq(users.username, username))
    .then(([user]) => sendTRPCResponse({ status: 200, message: 'ok' }, user || null ))
    .catch(() => sendTRPCResponse({ status: 400, message: 'Error get user' }, null));

  return response;
};
 
