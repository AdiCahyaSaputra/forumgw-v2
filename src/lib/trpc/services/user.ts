import * as m from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import { groupMembers, roles, users } from '$lib/server/db/schema';
import type { LoginSchema } from '$lib/trpc/schema/loginSchema.js';
import type { RegisterSchema } from '$lib/trpc/schema/registerSchema.js';
import { sendTRPCResponse } from '$lib/utils.js';
import type { RequestEvent } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { and, eq, ilike, not } from 'drizzle-orm';
import { z } from 'zod';
import type {
	editUserRequest,
	getUserForInviteRequest,
	getUserForMentioningRequest,
	getUserProfileRequest
} from '../schema/userSchema';
import type { CtxType } from '$lib/constant';
import { createAuthSession, validateAuthSession } from './auth';

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

export const verifyUserToken = async (
	event: RequestEvent
): Promise<{ user: UserPayload | null }> => {
	const user = await validateAuthSession(event.cookies.get('TOKEN'));

	return { user }; 
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

	const token = await createAuthSession(user.id);

	ctx.event.cookies.set('TOKEN', token, {
		path: '/'
	});

	return sendTRPCResponse(
		{
			status: 200,
			message: 'ok'
		},
		{
			token,
		}
	);
};

export const registeringNewUser = async (formData: z.infer<RegisterSchema>) => {
	const { name, username, password } = formData;

	const isAlreadyRegistered = await db
		.select({
			username: users.username
		})
		.from(users)
		.where(eq(users.username, username))
		.limit(1);

  if (isAlreadyRegistered.length > 0) {
    return sendTRPCResponse({
      status: 400,
      message: m.register_already_exists()
    });
  }

	const hashedPassword = await bcrypt.hash(password, 10);

	const response = await db
		.insert(users)
		.values({
			name,
			username,
			password: hashedPassword,
			roleId: 2
		})
		.then(() =>
			sendTRPCResponse({
				status: 201,
				message: 'ok'
			})
		)
		.catch((error) =>
			sendTRPCResponse(
				{
					status: 400,
					message: m.global_error_message()
				},
				error
			)
		);

	return response;
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

export const getUserProfile = async (input: z.infer<typeof getUserProfileRequest>) => {
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
		.then(([user]) => sendTRPCResponse({ status: 200, message: 'ok' }, user || null))
		.catch(() => sendTRPCResponse({ status: 400, message: 'Error get user' }, null));

	return response;
};
