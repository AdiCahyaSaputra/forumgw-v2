import { db } from '$lib/server/db';
import { jwts, users } from '$lib/server/db/schema';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { env } from '$env/dynamic/private';
import type { LoginSchema } from '../../../routes/login/schema.ts';
import type { RegisterSchema } from '../../../routes/register/schema.ts';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as m from '$lib/paraglide/messages.js';
import { sendTRPCResponse } from '$lib/utils.js';

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
