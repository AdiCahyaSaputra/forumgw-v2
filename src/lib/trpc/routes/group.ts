import { authenticated } from '../middleware/authenticated';
import { logger } from '../middleware/logger';
import {
  addNewMemberRequest,
  createGroupRequest,
  deleteGroupRequest,
  editGroupRequest,
  getAllGroupsRequest,
  getAvailableGroupsRequest
} from '../schema/groupSchema';
import {
  addNewMember,
  createGroup,
  deleteGroup,
  editGroup,
  getAllGroups,
  getAvailableGroups
} from '../services/group';
import { t } from '../t';

export const group = t.router({
  getAvailableGroups: t.procedure
    .use(logger)
    .use(authenticated)
    .input(getAvailableGroupsRequest)
    .query(({ input, ctx }) => getAvailableGroups(input, ctx.user)),
  getAllGroups: t.procedure
    .use(logger)
    .use(authenticated)
    .input(getAllGroupsRequest)
    .query(({ input, ctx }) => getAllGroups(input, ctx.user)),
  createGroup: t.procedure
    .use(logger)
    .use(authenticated)
    .input(createGroupRequest())
    .mutation(({ input, ctx }) => createGroup(input, ctx.user)),
  editGroup: t.procedure
    .use(logger)
    .use(authenticated)
    .input(editGroupRequest())
    .mutation(({ input, ctx }) => editGroup(input, ctx.user)),
  deleteGroup: t.procedure
    .use(logger)
    .use(authenticated)
    .input(deleteGroupRequest)
    .mutation(({ input, ctx }) => deleteGroup(input, ctx.user)),
  addNewMember: t.procedure
    .use(logger)
    .use(authenticated)
    .input(addNewMemberRequest)
    .mutation(({ input, ctx }) => addNewMember(input, ctx.user))
});
