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

export const addNewMemberRequest = z.object({
  groupId: z.string(),
  invitedUsername: z.array(z.string()).default([])
});
