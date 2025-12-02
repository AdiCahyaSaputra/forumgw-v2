import { pgTable, serial, text, integer, uuid, timestamp } from 'drizzle-orm/pg-core';
import { comments } from './comments';
import { users } from './users';

// Reply Comment table
export const replyComments = pgTable('reply_comment', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  commentId: integer('comment_id')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

