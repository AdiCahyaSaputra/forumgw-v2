import { pgTable, uuid, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { posts } from './posts';
import { comments } from './comments';

// Notification table
export const notifications = pgTable('notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull(), // report, comment, mention, reply
  isRead: boolean('is_read').notNull().default(false),
  toUser: varchar('to_user').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').references(() => comments.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

