import { z } from 'zod';
import * as m from '$lib/paraglide/messages.js';

export const getUserForMentioningRequest = z.object({
	username: z.string(),
	groupId: z.string().optional()
});

export const getUserForInviteRequest = z.object({
	username: z.string().optional()
});

export const editUserRequest = (
	user: { name: string; username: string; bio: string | null; avatar: string | null } | null
) =>
	z.object({
		name: z
			.string()
			.min(5, m.validation_min({ length: 5, field: 'name' }))
			.max(20, m.validation_max({ length: 20, field: 'name' }))
			.default(user ? user.name : ''),
		username: z
			.string()
			.min(5, m.validation_min({ length: 5, field: 'username' }))
			.max(20, m.validation_max({ length: 20, field: 'username' }))
			.default(user ? user.username : ''),
		bio: z
			.string()
			.nullable()
			.optional()
			.default(user ? (user.bio ?? '') : ''),
		avatar: z
			.string()
			.nullable()
			.optional()
			.default(user ? (user.avatar ?? '') : '')
	});

export const changePasswordRequest = z
	.object({
		oldPassword: z
			.string()
			.min(1, m.validation_min({ length: 1, field: m.account_password_old() }))
			.max(255, m.validation_max({ length: 255, field: m.account_password_old() }))
			.default(''),
		newPassword: z
			.string()
			.min(8, m.validation_min({ length: 8, field: m.account_password_new() }))
			.max(255, m.validation_max({ length: 255, field: m.account_password_new() }))
			.default(''),
		confirmNewPassword: z
			.string()
			.min(1, m.validation_min({ length: 1, field: m.account_password_confirm() }))
			.max(255, m.validation_max({ length: 255, field: m.account_password_confirm() }))
			.default('')
	})
	.refine(({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword, {
		message: m.account_password_mismatch(),
		path: ['confirmNewPassword']
	});

export type ChangePasswordInput = z.infer<typeof changePasswordRequest>;

export const getUserProfileRequest = z.object({
	username: z.string()
});
