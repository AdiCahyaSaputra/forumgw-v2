import { commentRequest, deleteCommentRequest, deleteReplyCommentRequest, replyCommentRequest } from '$lib/trpc/schema/commentSchema';
import { createComment, deleteComment, deleteReplyComment, editComment, editReplyComment, replyComment } from '$lib/trpc/services/comment';
import { verifyUserToken } from '$lib/trpc/services/user';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  return {
    formComment: await superValidate(zod(commentRequest())),
    formEditComment: await superValidate(zod(commentRequest())),
    formDeleteComment: await superValidate(zod(deleteCommentRequest)),

    formReplyComment: await superValidate(zod(replyCommentRequest())),
    formEditReplyComment: await superValidate(zod(replyCommentRequest())),
    formDeleteReplyComment: await superValidate(zod(deleteReplyCommentRequest)),

    params: event.params,
    user: (await event.parent()).user
  };
};

export const actions: Actions = {
  createComment: async (event) => {
    const form = await superValidate(event, zod(commentRequest()));

    if (!form.valid) {
      console.log(form.errors);

      return fail(400, {
        form
      });
    }

    const { user } = await verifyUserToken(event);

    if (!user) {
      return fail(401, {
        form,
        message: 'Unauthorized'
      });
    }

    const response = await createComment(form.data, user);

    if (response.status !== 201) {
      const { status, message } = response;

      return fail(status, {
        form,
        message
      });
    }

    return {
      form
    };
  },
  editComment: async (event) => {
    const form = await superValidate(event, zod(commentRequest()));

    if (!form.valid) {
      console.log(form.errors);

      return fail(400, {
        form
      });
    }

    if (!form.data.commentId) {
      return fail(404, {
        form,
        message: 'Not Found'
      });
    }

    const { user } = await verifyUserToken(event);

    if(!user) {
      return fail(401, {
        form,
        message: 'Unauthorized'
      });
    }

    const response = await editComment(form.data, user);

    if (response.status !== 200) {
      const { status, message } = response;

      return fail(status, {
        form,
        message
      });
    }

    return {
      form
    }
  },
  deleteComment: async (event) => {
    const form = await superValidate(event, zod(deleteCommentRequest));

    if (!form.valid) {
      console.log(form.errors);

      return fail(400, {
        form
      });
    }

    const { user } = await verifyUserToken(event);

    if(!user) {
      return fail(401, {
        form,
        message: 'Unauthorized'
      });
    }

    const response = await deleteComment(form.data, user);

    if (response.status !== 200) {
      const { status, message } = response;

      return fail(status, {
        form,
        message
      });
    }

    return {
      form
    }
  },

  replyComment: async (event) => {
    const form = await superValidate(event, zod(replyCommentRequest()));

    if (!form.valid) {
      console.log(form.errors);

      return fail(400, {
        form
      });
    }

    const { user } = await verifyUserToken(event);

    if (!user) {
      return fail(401, {
        form,
        message: 'Unauthorized'
      });
    }

    const response = await replyComment(form.data, user);

    if (response.status !== 201) {
      const { status, message } = response;

      return fail(status, {
        form,
        message
      });
    }

    return {
      form
    };
  },
  editReplyComment: async (event) => {
    const form = await superValidate(event, zod(replyCommentRequest()));

    if (!form.valid) {
      console.log(form.errors);

      return fail(400, {
        form
      });
    }

    if(!form.data.replyCommentId) {
      return fail(404, {
        form,
        message: 'Not Found'
      });
    }

    const { user } = await verifyUserToken(event);

    if (!user) {
      return fail(401, {
        form,
        message: 'Unauthorized'
      });
    }

    const response = await editReplyComment(form.data, user);

    if (response.status !== 200) {
      const { status, message } = response;

      return fail(status, {
        form,
        message
      });
    }

    return {
      form
    };
  },
  deleteReplyComment: async (event) => {
    const form = await superValidate(event, zod(deleteReplyCommentRequest));

    if (!form.valid) {
      console.log(form.errors);

      return fail(400, {
        form
      });
    }

    const { user } = await verifyUserToken(event);

    if (!user) {
      return fail(401, {
        form,
        message: 'Unauthorized'
      });
    }

    const response = await deleteReplyComment(form.data, user);

    if (response.status !== 200) {
      const { status, message } = response;

      return fail(status, {
        form,
        message
      });
    }

    return {
      form
    };
  },
};
