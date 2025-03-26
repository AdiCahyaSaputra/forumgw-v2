import { authenticated } from '../middleware/authenticated';
import { logger } from '../middleware/logger';
import {
  acceptInvitationRequest,
  addNewMemberRequest,
  createGroupRequest,
  createNewPostGroupRequst,
  declineInvitationRequest,
  deleteGroupRequest,
  editGroupRequest,
  getAllGroupsRequest,
  getAllGroupTagRequest,
  getAvailableGroupsRequest,
  reportPostGroupRequest
} from '../schema/groupSchema';
import {
  acceptInvitation,
  addNewMember,
  createGroup,
  createNewPostGroup,
  declineInvitation,
  deleteGroup,
  editGroup,
  getAllGroups,
  getAllGroupTags,
  getAvailableGroups,
  getAvailableInvitation,
  reportPostGroup
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
    .mutation(({ input, ctx }) => addNewMember(input, ctx.user)),
  getAvailableInvitation: t.procedure
    .use(logger)
    .use(authenticated)
    .query(({ ctx }) => getAvailableInvitation(ctx.user)),
  acceptInvitation: t.procedure
    .use(logger)
    .use(authenticated)
    .input(acceptInvitationRequest)
    .mutation(({ input, ctx }) => acceptInvitation(input, ctx.user)),
  declineInvitation: t.procedure
    .use(logger)
    .use(authenticated)
    .input(declineInvitationRequest)
    .mutation(({ input, ctx }) => declineInvitation(input, ctx.user)),
  getAllGroupTags: t.procedure
    .use(logger)
    .use(authenticated)
    .input(getAllGroupTagRequest)
    .query(({ input, ctx }) => getAllGroupTags(input, ctx.user)),
  createNewPostGroup: t.procedure
    .use(logger)
    .use(authenticated)
    .input(createNewPostGroupRequst())
    .query(({ input, ctx }) => createNewPostGroup(input, ctx.user)),
  reportPostGroup: t.procedure
    .use(logger)
    .use(authenticated)
    .input(reportPostGroupRequest)
    .mutation(({ input }) => reportPostGroup(input))
});
