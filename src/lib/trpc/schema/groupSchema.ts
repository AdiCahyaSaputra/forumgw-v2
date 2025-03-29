import { z } from 'zod';
import * as m from '$lib/paraglide/messages';

export const getAvailableGroupsRequest = z.object({
	cursor: z.string().optional()
});

export const getAllGroupsRequest = z.object({
	cursor: z.string().optional(),
	search: z.string().optional()
});

export const createGroupRequest = () =>
	z.object({
		name: z
			.string()
			.min(3, m.validation_min({ field: 'name', length: 3 }))
			.max(100, m.validation_max({ field: 'name', length: 100 })),
		description: z
			.string()
			.min(3, m.validation_min({ field: 'description', length: 3 }))
			.max(100, m.validation_max({ field: 'description', length: 100 })),
		invitedUsername: z.array(z.string()).default([])
	});

export const editGroupRequest = () =>
	z.object({
		groupId: z.string(),
		name: z
			.string()
			.min(3, m.validation_min({ field: 'name', length: 3 }))
			.max(100, m.validation_max({ field: 'name', length: 100 })),
		description: z
			.string()
			.min(3, m.validation_min({ field: 'description', length: 3 }))
			.max(100, m.validation_max({ field: 'description', length: 100 }))
	});

export const deleteGroupRequest = z.object({
	groupId: z.string()
});

export const getAllGroupPostsRequest = z.object({
	groupId: z.string(),
	tagIds: z.array(z.number()).default([]),
	cursor: z.string().optional()
});

export const addNewMemberRequest = z.object({
	groupId: z.string(),
	invitedUsername: z.array(z.string()).default([])
});

export const acceptInvitationRequest = z.object({
	groupId: z.string()
});

export const declineInvitationRequest = z.object({
	groupId: z.string()
});

export const getAllGroupTagRequest = z.object({
	cursor: z.number().optional(),
	name: z.string().optional(),
	groupId: z.string()
});

export const createNewPostGroupRequst = () =>
	z.object({
		groupId: z.string(),
		tags: z.array(z.string()).default([]),
		isAnonymous: z.boolean().default(false),
		content: z
			.string()
			.min(1, m.validation_min({ length: 1, field: 'content' }))
			.max(255, m.validation_max({ length: 20, field: 'content' }))
	});

export const reportPostGroupRequest = z.object({
	groupId: z.string(),
	reason: z.string().optional().default('-'),
	id: z.string()
});

export const getGroupMembersRequest = z.object({
	groupId: z.string(),
	cursor: z.number().optional() // groupMemberId
});
