import { db } from '$lib/server/db';
import { groupInvitations, groupMembers, groups, users } from '$lib/server/db/schema';
import { and, eq, ilike, inArray, lt, not, sql } from 'drizzle-orm';
import type { UserPayload } from './user';
import { z } from 'zod';
import type {
	acceptInvitationRequest,
	addNewMemberRequest,
	createGroupRequest,
	declineInvitationRequest,
	deleteGroupRequest,
	editGroupRequest,
	getAllGroupsRequest,
	getAvailableGroupsRequest,
	getGroupMembersRequest
} from '../schema/groupSchema';
import { sendTRPCResponse } from '$lib/utils';

export const getAvailableGroups = async (
	input: z.infer<typeof getAvailableGroupsRequest>,
	user: UserPayload
) => {
	const conditions = [eq(groupMembers.userId, user.id)];

	if (input.cursor) {
		conditions.push(lt(groups.id, input.cursor));
	}

	const limit = 10;

	const userGroups = await db
		.select({
			id: groups.id,
			name: groups.name,
			logo: groups.logo,
			description: groups.description,
			leader: {
				name: users.name,
				username: users.username,
				image: users.image
			},
			_count: {
				members: sql<number>`
						(
							SELECT COUNT(*) 
							FROM ${groupMembers} 
							WHERE ${groupMembers.groupId} = ${groups.id}
						)
					`.as('member_count')
			}
		})
		.from(groupMembers)
		.innerJoin(groups, eq(groups.id, groupMembers.groupId))
		.innerJoin(users, eq(users.id, groups.leaderId))
		.where(and(...conditions))
		.limit(limit + 1);

	const hasNextPage = userGroups.length > limit;
	const paginatedResults = userGroups.slice(0, limit);
	const nextCursor = hasNextPage ? paginatedResults[limit - 1].id : null;

	return sendTRPCResponse(
		{
			status: userGroups.length > 0 ? 200 : 404,
			message: 'ok'
		},
		{
			groups: userGroups,
			nextCursor,
			hasNextPage
		}
	);
};

export const getAllGroups = async (
	input: z.infer<typeof getAllGroupsRequest>,
	user: UserPayload
) => {
	const conditions = [];

	if (input.cursor) {
		conditions.push(lt(groups.id, input.cursor));
	}

	if (input.search) {
		conditions.push(ilike(groups.name, `%${input.search}%`));
	}

	const limit = 10;

	const groupResults = await db
		.select({
			id: groups.id,
			name: groups.name,
			logo: groups.logo,
			description: groups.description,
			leader: {
				name: users.name,
				username: users.username,
				image: users.image
			},
			_count: {
				members: sql<number>`
					(
						SELECT COUNT(*) 
						FROM ${groupMembers} 
						WHERE ${groupMembers.groupId} = ${groups.id}
					)
					`.as('members')
			},
			alreadyMember: sql<boolean>`
					(
					SELECT EXISTS 
					(
						SELECT 1 
						FROM ${groupMembers} 
						WHERE ${groupMembers.userId} = ${user.id} 
						AND ${groupMembers.groupId} = ${groups.id}
					)
					)
				`.as('alreadyMember')
		})
		.from(groups)
		.innerJoin(users, eq(users.id, groups.leaderId))
		.where(and(...conditions))
		.limit(limit + 1);

	const hasNextPage = groupResults.length > limit;
	const paginatedResults = groupResults.slice(0, limit);
	const nextCursor = hasNextPage ? paginatedResults[limit - 1].id : null;

	return sendTRPCResponse(
		{
			status: groupResults.length > 0 ? 200 : 404,
			message: 'ok'
		},
		{
			groups: groupResults,
			nextCursor,
			hasNextPage
		}
	);
};

export const createGroup = async (
	input: z.infer<ReturnType<typeof createGroupRequest>>,
	user: UserPayload
) => {
	const { name, description, invitedUsername } = input;

	try {
		const trpcResponse = await db.transaction(async (tx) => {
			const [{ id }] = await tx
				.insert(groups)
				.values({
					name,
					description,
					leaderId: user.id
				})
				.returning({ id: groups.id });

			await tx.insert(groupMembers).values({
				groupId: id,
				userId: user.id
			});

			if (invitedUsername.length > 0) {
				const userIds = await tx
					.select({ id: users.id })
					.from(users)
					.where(inArray(users.username, invitedUsername));

				const groupMemberData = userIds.map(({ id: userId }) => ({ groupId: id, userId }));

				await tx.insert(groupInvitations).values(groupMemberData);
			}
		});

		return sendTRPCResponse({ status: 201, message: 'ok' }, trpcResponse);
	} catch (err) {
		return sendTRPCResponse({ status: 500, message: 'Error create group' }, err);
	}
};

export const editGroup = async (
	input: z.infer<ReturnType<typeof editGroupRequest>>,
	user: UserPayload
) => {
	const { name, description } = input;

	const response = await db
		.update(groups)
		.set({
			name,
			description
		})
		.where(and(eq(groups.leaderId, user.id), eq(groups.id, input.groupId)))
		.then(() =>
			sendTRPCResponse({
				status: 200,
				message: 'ok'
			})
		)
		.catch(() =>
			sendTRPCResponse({
				status: 500,
				message: 'Error edit group'
			})
		);

	return response;
};

export const deleteGroup = async (input: z.infer<typeof deleteGroupRequest>, user: UserPayload) => {
	const response = await db
		.delete(groups)
		.where(and(eq(groups.id, input.groupId), eq(groups.leaderId, user.id)))
		.then(() => sendTRPCResponse({ status: 200, message: 'ok' }))
		.catch(() => sendTRPCResponse({ status: 500, message: 'Error delete group' }));

	return response;
};

export const addNewMember = async (
	input: z.infer<typeof addNewMemberRequest>,
	user: UserPayload
) => {
	const { groupId, invitedUsername } = input;

	if (invitedUsername.length < 0) {
		return sendTRPCResponse({
			status: 403,
			message: 'Need at least one username'
		});
	}

	const authorizedLeader = await db
		.select()
		.from(groups)
		.where(and(eq(groups.id, groupId), eq(groups.leaderId, user.id)));

	if (!authorizedLeader[0]?.leaderId) {
		return sendTRPCResponse({
			status: 403,
			message: 'You are not leader'
		});
	}

	const data = invitedUsername.map((username) => ({
		groupId,
		userId: username
	}));

	const response = await db
		.insert(groupInvitations)
		.values(data)
		.then(() => sendTRPCResponse({ status: 201, message: 'ok' }))
		.catch(() => sendTRPCResponse({ status: 500, message: 'Error add new member' }));

	return response;
};

export const getAvailableInvitation = async (user: UserPayload) => {
	const availableInvitation = await db
		.select({
			id: groups.id,
			name: groups.name,
			description: groups.description
		})
		.from(groupInvitations)
		.innerJoin(groups, eq(groups.id, groupInvitations.groupId))
		.where(eq(groupInvitations.userId, user.id));

	return sendTRPCResponse(
		{
			status: availableInvitation.length > 0 ? 200 : 404,
			message: 'ok'
		},
		availableInvitation
	);
};

export const acceptInvitation = async (
	input: z.infer<typeof acceptInvitationRequest>,
	user: UserPayload
) => {
	const { groupId } = input;
	const isInvitationValid = await db
		.select()
		.from(groupInvitations)
		.where(and(eq(groupInvitations.groupId, groupId), eq(groupInvitations.userId, user.id)))
		.limit(1);

	if (!isInvitationValid[0]?.groupId) {
		return sendTRPCResponse({
			status: 404,
			message: 'Invitation not found'
		});
	}

	const response = await db
		.insert(groupMembers)
		.values({ groupId, userId: user.id })
		.then(() => sendTRPCResponse({ status: 201, message: 'ok' }))
		.catch(() => sendTRPCResponse({ status: 500, message: 'Error accept invitation' }));

	return response;
};

export const declineInvitation = async (
	input: z.infer<typeof declineInvitationRequest>,
	user: UserPayload
) => {
	const { groupId } = input;

	const isInvitationValid = await db
		.select()
		.from(groupInvitations)
		.where(and(eq(groupInvitations.groupId, groupId), eq(groupInvitations.userId, user.id)))
		.limit(1);

	if (!isInvitationValid[0]?.groupId) {
		return sendTRPCResponse({
			status: 404,
			message: 'Invitation not found'
		});
	}

	const response = await db
		.delete(groupInvitations)
		.where(and(eq(groupInvitations.groupId, groupId), eq(groupInvitations.userId, user.id)))
		.then(() => sendTRPCResponse({ status: 200, message: 'ok' }))
		.catch(() => sendTRPCResponse({ status: 500, message: 'Error decline invitation' }));

	return response;
};

export const getGroupMembers = async (input: z.infer<typeof getGroupMembersRequest>) => {
	const { groupId, cursor } = input;

	const limit = 10;
	const conditions = [
		eq(groupMembers.groupId, groupId),
		not(eq(groupMembers.userId, groups.leaderId))
	];

	if (cursor) {
		conditions.push(lt(groupMembers.id, cursor));
	}

	const groupMembersData = await db
		.select({
			groupMemberId: groupMembers.id,
			name: users.name,
			username: users.username,
			image: users.image
		})
		.from(groupMembers)
		.innerJoin(groups, eq(groupMembers.groupId, groups.id))
		.innerJoin(users, eq(groupMembers.userId, users.id))
		.where(and(...conditions))
		.limit(limit + 1);

	const hasNextPage = groupMembersData.length > limit;
	const paginatedResults = groupMembersData.slice(0, limit);
	const nextCursor = hasNextPage ? paginatedResults[limit - 1].groupMemberId : null;

	return sendTRPCResponse(
		{
			status: groupMembersData.length > 0 ? 200 : 404,
			message: 'ok'
		},
		{
			groupMembers: groupMembersData,
			nextCursor,
			hasNextPage
		}
	);
};

export const isGroupMemberCheck = async (groupId: string, user: UserPayload) => {
	const isGroupMember = await db
		.select()
		.from(groupMembers)
		.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)))
		.limit(1);

	return !!isGroupMember[0]?.groupId;
};
